package com.pawforward.mcp.tools;

import com.pawforward.mcp.client.PawForwardApiClient;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * MCP tools for dog profiles and training progress.
 * All tools in this class require authentication.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DogTools {

    private final ToolRegistry registry;
    private final PawForwardApiClient apiClient;

    @PostConstruct
    public void register() {
        // get_dog_profile
        Map<String, ToolParameter> profileParams = new LinkedHashMap<>();
        profileParams.put("dogId", new ToolParameter("string", "The ID of the dog."));
        registry.register(
                new ToolDefinition(
                        "get_dog_profile",
                        "Gets a dog's profile including breed, age, and notes. Requires authentication.",
                        profileParams,
                        List.of("dogId")
                ),
                (args, token) -> {
                    try {
                        if (token == null || token.isBlank()) {
                            return errorResult("Authentication required. Please log in first.");
                        }
                        String dogId = args.get("dogId");
                        if (dogId == null || dogId.isBlank()) {
                            return errorResult("dogId is required.");
                        }
                        return apiClient.getDogProfile(token, dogId);
                    } catch (Exception e) {
                        log.error("get_dog_profile failed", e);
                        return errorResult("Failed to retrieve dog profile: " + e.getMessage());
                    }
                }
        );

        // get_training_progress
        Map<String, ToolParameter> progressParams = new LinkedHashMap<>();
        progressParams.put("dogId", new ToolParameter("string", "The ID of the dog."));
        registry.register(
                new ToolDefinition(
                        "get_training_progress",
                        "Gets a dog's training progress with skill assessments. Requires authentication.",
                        progressParams,
                        List.of("dogId")
                ),
                (args, token) -> {
                    try {
                        if (token == null || token.isBlank()) {
                            return errorResult("Authentication required. Please log in first.");
                        }
                        String dogId = args.get("dogId");
                        if (dogId == null || dogId.isBlank()) {
                            return errorResult("dogId is required.");
                        }
                        return apiClient.getDogProgress(token, dogId);
                    } catch (Exception e) {
                        log.error("get_training_progress failed", e);
                        return errorResult("Failed to retrieve training progress: " + e.getMessage());
                    }
                }
        );

        // get_training_logs
        Map<String, ToolParameter> logParams = new LinkedHashMap<>();
        logParams.put("dogId", new ToolParameter("string", "The ID of the dog."));
        registry.register(
                new ToolDefinition(
                        "get_training_logs",
                        "Gets training session logs for a dog. Requires authentication.",
                        logParams,
                        List.of("dogId")
                ),
                (args, token) -> {
                    try {
                        if (token == null || token.isBlank()) {
                            return errorResult("Authentication required. Please log in first.");
                        }
                        String dogId = args.get("dogId");
                        if (dogId == null || dogId.isBlank()) {
                            return errorResult("dogId is required.");
                        }
                        return apiClient.getTrainingLogs(token, dogId);
                    } catch (Exception e) {
                        log.error("get_training_logs failed", e);
                        return errorResult("Failed to retrieve training logs: " + e.getMessage());
                    }
                }
        );
    }

    private Map<String, Object> errorResult(String message) {
        return Map.of("error", true, "message", message);
    }
}
