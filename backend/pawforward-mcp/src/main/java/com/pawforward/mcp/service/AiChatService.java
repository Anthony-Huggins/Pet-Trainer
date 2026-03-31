package com.pawforward.mcp.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.pawforward.mcp.controller.dto.ChatMessage;
import com.pawforward.mcp.controller.dto.ChatResponse;
import com.pawforward.mcp.resources.BusinessResources;
import com.pawforward.mcp.tools.ToolDefinition;
import com.pawforward.mcp.tools.ToolParameter;
import com.pawforward.mcp.tools.ToolRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;

/**
 * AI-powered chat service that sends user messages to Claude along with
 * all available tool definitions. Claude decides which tools to call
 * and formulates intelligent responses.
 */
@Service
@Slf4j
public class AiChatService {

    private final ToolRegistry toolRegistry;
    private final BusinessResources businessResources;
    private final WebClient anthropicClient;
    private final ObjectMapper objectMapper;
    private final String model;

    private static final int MAX_TOOL_ROUNDS = 5;

    private static final String SYSTEM_PROMPT = """
            You are the PawForward Academy assistant — a friendly, knowledgeable customer service \
            representative for a professional dog training business. You help clients with booking \
            sessions, learning about services, checking training progress, and answering questions.

            Guidelines:
            - Be warm, professional, and concise.
            - Use the tools available to you to look up real data. Never make up services, prices, \
            schedules, or trainer information.
            - If a user asks about their bookings, dog profile, or training progress, they must be \
            authenticated. If no auth token is available, politely ask them to sign in first.
            - When showing data from tools, summarize it in a natural, conversational way. The raw \
            data will also be sent to the frontend for structured rendering.
            - You can call multiple tools in a single turn if needed to fully answer a question.
            - For questions about business hours, policies, FAQs, or general info, use the \
            get_business_resource tool.
            - If you don't know something and have no tool to look it up, say so honestly.
            """;

    public AiChatService(
            ToolRegistry toolRegistry,
            BusinessResources businessResources,
            ObjectMapper objectMapper,
            @Value("${anthropic.api-key}") String apiKey,
            @Value("${anthropic.model}") String model
    ) {
        this.toolRegistry = toolRegistry;
        this.businessResources = businessResources;
        this.objectMapper = objectMapper;
        this.model = model;
        this.anthropicClient = WebClient.builder()
                .baseUrl("https://api.anthropic.com")
                .defaultHeader("x-api-key", apiKey)
                .defaultHeader("anthropic-version", "2023-06-01")
                .codecs(config -> config.defaultCodecs().maxInMemorySize(2 * 1024 * 1024))
                .build();
    }

    /**
     * Process a chat message by sending it to Claude with all available tools.
     * Claude decides which tools to call; we execute them and loop until Claude
     * produces a final text response.
     */
    public ChatResponse chat(String userMessage, List<ChatMessage> conversationHistory, String authToken) {
        List<String> toolsUsed = new ArrayList<>();
        Object lastToolData = null;

        try {
            // Build the messages array from conversation history + new message
            ArrayNode messages = buildMessages(conversationHistory, userMessage);

            // Build tool definitions for Claude
            ArrayNode tools = buildToolDefinitions();

            // Agentic loop: send to Claude, handle tool calls, repeat
            for (int round = 0; round < MAX_TOOL_ROUNDS; round++) {
                JsonNode response = callClaude(messages, tools);

                String stopReason = response.path("stop_reason").asText();
                ArrayNode content = (ArrayNode) response.path("content");

                if ("end_turn".equals(stopReason) || !"tool_use".equals(stopReason)) {
                    // Claude is done — extract the text response
                    String textResponse = extractText(content);
                    return new ChatResponse(textResponse, toolsUsed, lastToolData);
                }

                // Claude wants to use tools — add assistant message with tool_use blocks
                ObjectNode assistantMsg = objectMapper.createObjectNode();
                assistantMsg.put("role", "assistant");
                assistantMsg.set("content", content);
                messages.add(assistantMsg);

                // Execute each tool call and collect results
                ArrayNode toolResults = objectMapper.createArrayNode();
                for (JsonNode block : content) {
                    if ("tool_use".equals(block.path("type").asText())) {
                        String toolId = block.path("id").asText();
                        String toolName = block.path("name").asText();
                        JsonNode inputNode = block.path("input");

                        log.info("Claude requested tool: {} with input: {}", toolName, inputNode);
                        toolsUsed.add(toolName);

                        Object result = executeTool(toolName, inputNode, authToken);
                        lastToolData = result;

                        ObjectNode toolResultBlock = objectMapper.createObjectNode();
                        toolResultBlock.put("type", "tool_result");
                        toolResultBlock.put("tool_use_id", toolId);
                        toolResultBlock.set("content", objectMapper.valueToTree(
                                List.of(Map.of("type", "text", "text", objectMapper.writeValueAsString(result)))
                        ));
                        toolResults.add(toolResultBlock);
                    }
                }

                // Add tool results as a user message
                ObjectNode toolResultMsg = objectMapper.createObjectNode();
                toolResultMsg.put("role", "user");
                toolResultMsg.set("content", toolResults);
                messages.add(toolResultMsg);
            }

            // If we exhausted rounds, return what we have
            return new ChatResponse(
                    "I found some information for you. Is there anything else I can help with?",
                    toolsUsed, lastToolData);

        } catch (Exception e) {
            log.error("AI chat processing error", e);
            return new ChatResponse(
                    "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.",
                    toolsUsed, lastToolData);
        }
    }

    private ArrayNode buildMessages(List<ChatMessage> history, String userMessage) {
        ArrayNode messages = objectMapper.createArrayNode();

        if (history != null) {
            for (ChatMessage msg : history) {
                // Only include user and assistant messages
                if ("user".equals(msg.role()) || "assistant".equals(msg.role())) {
                    ObjectNode m = objectMapper.createObjectNode();
                    m.put("role", msg.role());
                    m.put("content", msg.content());
                    messages.add(m);
                }
            }
        }

        // Add the current user message
        ObjectNode userMsg = objectMapper.createObjectNode();
        userMsg.put("role", "user");
        userMsg.put("content", userMessage);
        messages.add(userMsg);

        return messages;
    }

    /**
     * Convert ToolRegistry definitions into Claude API tool format,
     * plus add a synthetic tool for business resources.
     */
    private ArrayNode buildToolDefinitions() {
        ArrayNode tools = objectMapper.createArrayNode();

        // Add all tools from the registry
        for (ToolDefinition def : toolRegistry.getTools()) {
            ObjectNode tool = objectMapper.createObjectNode();
            tool.put("name", def.name());
            tool.put("description", def.description());

            ObjectNode inputSchema = objectMapper.createObjectNode();
            inputSchema.put("type", "object");

            ObjectNode properties = objectMapper.createObjectNode();
            ArrayNode required = objectMapper.createArrayNode();

            if (def.parameters() != null) {
                for (Map.Entry<String, ToolParameter> entry : def.parameters().entrySet()) {
                    ObjectNode prop = objectMapper.createObjectNode();
                    prop.put("type", entry.getValue().type());
                    prop.put("description", entry.getValue().description());
                    properties.set(entry.getKey(), prop);
                }
            }

            if (def.required() != null) {
                for (String req : def.required()) {
                    required.add(req);
                }
            }

            inputSchema.set("properties", properties);
            inputSchema.set("required", required);
            tool.set("input_schema", inputSchema);

            tools.add(tool);
        }

        // Add a business resource tool so Claude can look up policies, FAQs, etc.
        ObjectNode resourceTool = objectMapper.createObjectNode();
        resourceTool.put("name", "get_business_resource");
        resourceTool.put("description",
                "Retrieve business information, policies, FAQs, or service catalog. "
                + "Available resources: 'business-info' (company info, contact, hours), "
                + "'business-policies' (cancellation, vaccination, late arrival policies), "
                + "'business-faq' (frequently asked questions), "
                + "'services-catalog' (dynamic service catalog from the API).");

        ObjectNode resourceSchema = objectMapper.createObjectNode();
        resourceSchema.put("type", "object");
        ObjectNode resourceProps = objectMapper.createObjectNode();
        ObjectNode resourceUri = objectMapper.createObjectNode();
        resourceUri.put("type", "string");
        resourceUri.put("description",
                "Resource identifier. One of: 'business-info', 'business-policies', 'business-faq', 'services-catalog'");
        resourceProps.set("resource_id", resourceUri);
        resourceSchema.set("properties", resourceProps);
        resourceSchema.set("required", objectMapper.createArrayNode().add("resource_id"));
        resourceTool.set("input_schema", resourceSchema);

        tools.add(resourceTool);

        return tools;
    }

    private JsonNode callClaude(ArrayNode messages, ArrayNode tools) {
        ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.put("model", model);
        requestBody.put("max_tokens", 1024);
        requestBody.put("system", SYSTEM_PROMPT);
        requestBody.set("messages", messages);
        requestBody.set("tools", tools);

        log.debug("Calling Claude API with {} messages and {} tools", messages.size(), tools.size());

        String responseJson = anthropicClient.post()
                .uri("/v1/messages")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        try {
            return objectMapper.readTree(responseJson);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Claude API response", e);
        }
    }

    private Object executeTool(String toolName, JsonNode input, String authToken) {
        try {
            // Handle the synthetic business resource tool
            if ("get_business_resource".equals(toolName)) {
                String resourceId = input.path("resource_id").asText();
                return businessResources.getResource(resourceId);
            }

            // Convert JsonNode input to Map<String, String> for the registry
            Map<String, String> args = new HashMap<>();
            if (input != null && input.isObject()) {
                input.fields().forEachRemaining(entry -> {
                    if (entry.getValue().isTextual()) {
                        args.put(entry.getKey(), entry.getValue().asText());
                    } else {
                        args.put(entry.getKey(), entry.getValue().toString());
                    }
                });
            }

            return toolRegistry.executeTool(toolName, args, authToken);
        } catch (Exception e) {
            log.error("Tool execution failed: {} - {}", toolName, e.getMessage());
            return Map.of("error", true, "message", "Tool '" + toolName + "' failed: " + e.getMessage());
        }
    }

    private String extractText(ArrayNode content) {
        StringBuilder sb = new StringBuilder();
        for (JsonNode block : content) {
            if ("text".equals(block.path("type").asText())) {
                if (!sb.isEmpty()) sb.append("\n");
                sb.append(block.path("text").asText());
            }
        }
        return sb.isEmpty() ? "I'm here to help! What would you like to know about PawForward Academy?" : sb.toString();
    }
}
