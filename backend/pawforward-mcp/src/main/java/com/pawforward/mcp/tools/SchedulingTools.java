package com.pawforward.mcp.tools;

import com.pawforward.mcp.client.PawForwardApiClient;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * MCP tools for checking schedules, available slots, and class information.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SchedulingTools {

    private final ToolRegistry registry;
    private final PawForwardApiClient apiClient;

    @PostConstruct
    public void register() {
        // list_upcoming_classes
        registry.register(
                new ToolDefinition(
                        "list_upcoming_classes",
                        "Lists upcoming group class series with schedule and availability.",
                        Map.of(),
                        List.of()
                ),
                (args, token) -> {
                    try {
                        return apiClient.listUpcomingClasses();
                    } catch (Exception e) {
                        log.error("list_upcoming_classes failed", e);
                        return errorResult("Failed to retrieve upcoming classes: " + e.getMessage());
                    }
                }
        );

        // get_available_slots
        Map<String, ToolParameter> slotParams = new LinkedHashMap<>();
        slotParams.put("trainerId", new ToolParameter("string", "Filter by trainer ID (optional)."));
        slotParams.put("serviceTypeId", new ToolParameter("string", "Filter by service type ID (optional)."));
        slotParams.put("fromDate", new ToolParameter("string", "Start date in YYYY-MM-DD format (default: today)."));
        slotParams.put("toDate", new ToolParameter("string", "End date in YYYY-MM-DD format (default: 2 weeks from today)."));
        registry.register(
                new ToolDefinition(
                        "get_available_slots",
                        "Gets available booking time slots, optionally filtered by trainer and service type.",
                        slotParams,
                        List.of()
                ),
                (args, token) -> {
                    try {
                        String trainerId = args.get("trainerId");
                        String serviceTypeId = args.get("serviceTypeId");
                        String from = args.getOrDefault("fromDate", LocalDate.now().toString());
                        String to = args.getOrDefault("toDate", LocalDate.now().plusWeeks(2).toString());
                        return apiClient.getAvailableSlots(trainerId, serviceTypeId, from, to);
                    } catch (Exception e) {
                        log.error("get_available_slots failed", e);
                        return errorResult("Failed to retrieve available slots: " + e.getMessage());
                    }
                }
        );

        // check_class_availability
        Map<String, ToolParameter> classParams = new LinkedHashMap<>();
        classParams.put("classSeriesId", new ToolParameter("string", "The ID of the class series to check."));
        registry.register(
                new ToolDefinition(
                        "check_class_availability",
                        "Gets details and availability for a specific group class series.",
                        classParams,
                        List.of("classSeriesId")
                ),
                (args, token) -> {
                    try {
                        String id = args.get("classSeriesId");
                        if (id == null || id.isBlank()) {
                            return errorResult("classSeriesId is required.");
                        }
                        return apiClient.getClassDetails(id);
                    } catch (Exception e) {
                        log.error("check_class_availability failed", e);
                        return errorResult("Failed to retrieve class details: " + e.getMessage());
                    }
                }
        );
    }

    private Map<String, Object> errorResult(String message) {
        return Map.of("error", true, "message", message);
    }
}
