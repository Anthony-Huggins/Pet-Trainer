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
 * MCP tools for browsing training services and packages.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ServiceTools {

    private final ToolRegistry registry;
    private final PawForwardApiClient apiClient;

    @PostConstruct
    public void register() {
        // list_services
        registry.register(
                new ToolDefinition(
                        "list_services",
                        "Lists all available training services with descriptions and prices.",
                        Map.of(),
                        List.of()
                ),
                (args, token) -> {
                    try {
                        return apiClient.listServices();
                    } catch (Exception e) {
                        log.error("list_services failed", e);
                        return errorResult("Failed to retrieve services: " + e.getMessage());
                    }
                }
        );

        // get_service_details
        Map<String, ToolParameter> serviceDetailParams = new LinkedHashMap<>();
        serviceDetailParams.put("serviceId", new ToolParameter("string", "The ID of the service to look up."));
        registry.register(
                new ToolDefinition(
                        "get_service_details",
                        "Gets detailed information about a specific training service.",
                        serviceDetailParams,
                        List.of("serviceId")
                ),
                (args, token) -> {
                    try {
                        String id = args.get("serviceId");
                        if (id == null || id.isBlank()) {
                            return errorResult("serviceId is required.");
                        }
                        return apiClient.getServiceDetails(id);
                    } catch (Exception e) {
                        log.error("get_service_details failed", e);
                        return errorResult("Failed to retrieve service details: " + e.getMessage());
                    }
                }
        );

        // list_packages
        registry.register(
                new ToolDefinition(
                        "list_packages",
                        "Lists available session packages with pricing.",
                        Map.of(),
                        List.of()
                ),
                (args, token) -> {
                    try {
                        return apiClient.listPackages();
                    } catch (Exception e) {
                        log.error("list_packages failed", e);
                        return errorResult("Failed to retrieve packages: " + e.getMessage());
                    }
                }
        );
    }

    private Map<String, Object> errorResult(String message) {
        return Map.of("error", true, "message", message);
    }
}
