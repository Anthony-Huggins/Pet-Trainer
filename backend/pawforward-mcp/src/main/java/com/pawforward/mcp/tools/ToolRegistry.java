package com.pawforward.mcp.tools;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.function.BiFunction;

/**
 * Central registry for all MCP tools. Tool handler classes register themselves here.
 * Each tool has a definition (name, description, params) and a handler function.
 *
 * Handlers accept (arguments map, auth token) and return a serializable result.
 */
@Component
@Slf4j
public class ToolRegistry {

    private final Map<String, ToolDefinition> definitions = new LinkedHashMap<>();
    private final Map<String, BiFunction<Map<String, String>, String, Object>> handlers = new HashMap<>();

    /**
     * Register a tool with its definition and handler.
     *
     * @param definition tool metadata
     * @param handler    function taking (args, authToken) and returning a result
     */
    public void register(ToolDefinition definition,
                         BiFunction<Map<String, String>, String, Object> handler) {
        definitions.put(definition.name(), definition);
        handlers.put(definition.name(), handler);
        log.info("Registered MCP tool: {}", definition.name());
    }

    /**
     * @return all registered tool definitions
     */
    public List<ToolDefinition> getTools() {
        return List.copyOf(definitions.values());
    }

    /**
     * @return the definition for a single tool, or null if not found
     */
    public ToolDefinition getToolDefinition(String name) {
        return definitions.get(name);
    }

    /**
     * Execute a tool by name.
     *
     * @param name      tool name
     * @param arguments tool arguments
     * @param authToken JWT token (may be null for public tools)
     * @return the tool's result object
     * @throws IllegalArgumentException if the tool is not found
     */
    public Object executeTool(String name, Map<String, String> arguments, String authToken) {
        BiFunction<Map<String, String>, String, Object> handler = handlers.get(name);
        if (handler == null) {
            throw new IllegalArgumentException("Unknown tool: " + name);
        }
        log.info("Executing tool: {} with args: {}", name, arguments);
        return handler.apply(arguments != null ? arguments : Map.of(), authToken);
    }

    public boolean hasTool(String name) {
        return definitions.containsKey(name);
    }
}
