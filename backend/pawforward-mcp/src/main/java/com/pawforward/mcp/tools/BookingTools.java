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
 * MCP tools for managing bookings and enrollments.
 * All tools in this class require authentication.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class BookingTools {

    private final ToolRegistry registry;
    private final PawForwardApiClient apiClient;

    @PostConstruct
    public void register() {
        // create_booking
        Map<String, ToolParameter> bookingParams = new LinkedHashMap<>();
        bookingParams.put("sessionId", new ToolParameter("string", "The ID of the available session/slot to book."));
        bookingParams.put("dogId", new ToolParameter("string", "The ID of the dog for this booking."));
        registry.register(
                new ToolDefinition(
                        "create_booking",
                        "Creates a booking for a private training session. Requires authentication.",
                        bookingParams,
                        List.of("sessionId", "dogId")
                ),
                (args, token) -> {
                    try {
                        if (token == null || token.isBlank()) {
                            return errorResult("Authentication required. Please log in first.");
                        }
                        String sessionId = args.get("sessionId");
                        String dogId = args.get("dogId");
                        if (sessionId == null || dogId == null) {
                            return errorResult("sessionId and dogId are required.");
                        }
                        return apiClient.createBooking(token, Map.of("sessionId", sessionId, "dogId", dogId));
                    } catch (Exception e) {
                        log.error("create_booking failed", e);
                        return errorResult("Failed to create booking: " + e.getMessage());
                    }
                }
        );

        // enroll_in_class
        Map<String, ToolParameter> enrollParams = new LinkedHashMap<>();
        enrollParams.put("classSeriesId", new ToolParameter("string", "The ID of the class series to enroll in."));
        enrollParams.put("dogId", new ToolParameter("string", "The ID of the dog to enroll."));
        registry.register(
                new ToolDefinition(
                        "enroll_in_class",
                        "Enrolls a dog in a group class series. Requires authentication.",
                        enrollParams,
                        List.of("classSeriesId", "dogId")
                ),
                (args, token) -> {
                    try {
                        if (token == null || token.isBlank()) {
                            return errorResult("Authentication required. Please log in first.");
                        }
                        String classSeriesId = args.get("classSeriesId");
                        String dogId = args.get("dogId");
                        if (classSeriesId == null || dogId == null) {
                            return errorResult("classSeriesId and dogId are required.");
                        }
                        return apiClient.enrollInClass(token, Map.of("classSeriesId", classSeriesId, "dogId", dogId));
                    } catch (Exception e) {
                        log.error("enroll_in_class failed", e);
                        return errorResult("Failed to enroll in class: " + e.getMessage());
                    }
                }
        );

        // cancel_booking
        Map<String, ToolParameter> cancelParams = new LinkedHashMap<>();
        cancelParams.put("bookingId", new ToolParameter("string", "The ID of the booking to cancel."));
        cancelParams.put("reason", new ToolParameter("string", "Reason for cancellation (optional)."));
        registry.register(
                new ToolDefinition(
                        "cancel_booking",
                        "Cancels an existing booking. Requires authentication.",
                        cancelParams,
                        List.of("bookingId")
                ),
                (args, token) -> {
                    try {
                        if (token == null || token.isBlank()) {
                            return errorResult("Authentication required. Please log in first.");
                        }
                        String bookingId = args.get("bookingId");
                        if (bookingId == null || bookingId.isBlank()) {
                            return errorResult("bookingId is required.");
                        }
                        String reason = args.get("reason");
                        return apiClient.cancelBooking(token, bookingId, reason);
                    } catch (Exception e) {
                        log.error("cancel_booking failed", e);
                        return errorResult("Failed to cancel booking: " + e.getMessage());
                    }
                }
        );

        // get_client_bookings
        registry.register(
                new ToolDefinition(
                        "get_client_bookings",
                        "Gets all bookings for the authenticated user. Requires authentication.",
                        Map.of(),
                        List.of()
                ),
                (args, token) -> {
                    try {
                        if (token == null || token.isBlank()) {
                            return errorResult("Authentication required. Please log in first.");
                        }
                        return apiClient.getClientBookings(token);
                    } catch (Exception e) {
                        log.error("get_client_bookings failed", e);
                        return errorResult("Failed to retrieve bookings: " + e.getMessage());
                    }
                }
        );
    }

    private Map<String, Object> errorResult(String message) {
        return Map.of("error", true, "message", message);
    }
}
