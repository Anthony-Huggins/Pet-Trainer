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
 * MCP tools for browsing trainer profiles and specialties.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class TrainerTools {

    private final ToolRegistry registry;
    private final PawForwardApiClient apiClient;

    @PostConstruct
    public void register() {
        // list_trainers
        registry.register(
                new ToolDefinition(
                        "list_trainers",
                        "Lists all trainers with their specialties and bios.",
                        Map.of(),
                        List.of()
                ),
                (args, token) -> {
                    try {
                        return apiClient.listTrainers();
                    } catch (Exception e) {
                        log.error("list_trainers failed", e);
                        return errorResult("Failed to retrieve trainers: " + e.getMessage());
                    }
                }
        );

        // get_trainer_profile
        Map<String, ToolParameter> params = new LinkedHashMap<>();
        params.put("trainerId", new ToolParameter("string", "The ID of the trainer to look up."));
        registry.register(
                new ToolDefinition(
                        "get_trainer_profile",
                        "Gets detailed profile information for a specific trainer.",
                        params,
                        List.of("trainerId")
                ),
                (args, token) -> {
                    try {
                        String id = args.get("trainerId");
                        if (id == null || id.isBlank()) {
                            return errorResult("trainerId is required.");
                        }
                        return apiClient.getTrainerProfile(id);
                    } catch (Exception e) {
                        log.error("get_trainer_profile failed", e);
                        return errorResult("Failed to retrieve trainer profile: " + e.getMessage());
                    }
                }
        );
    }

    private Map<String, Object> errorResult(String message) {
        return Map.of("error", true, "message", message);
    }
}
