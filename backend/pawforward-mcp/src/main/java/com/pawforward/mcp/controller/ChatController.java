package com.pawforward.mcp.controller;

import com.pawforward.mcp.controller.dto.ChatRequest;
import com.pawforward.mcp.controller.dto.ChatResponse;
import com.pawforward.mcp.resources.BusinessResources;
import com.pawforward.mcp.tools.ToolRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Simple chat relay endpoint that uses keyword matching to route user messages
 * to the appropriate MCP tools. Can be upgraded to use an LLM for intent detection.
 */
@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final ToolRegistry toolRegistry;
    private final BusinessResources businessResources;

    @PostMapping
    public ResponseEntity<ChatResponse> chat(
            @RequestBody ChatRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        if (request.message() == null || request.message().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(new ChatResponse("Please provide a message.", List.of(), null));
        }

        String token = extractToken(authHeader);
        String msg = request.message().toLowerCase().trim();
        List<String> toolsUsed = new ArrayList<>();
        Object data = null;
        String response;

        try {
            if (matchesAny(msg, "cancel booking", "cancel my", "cancel appointment")) {
                response = "To cancel a booking, I need the booking ID. You can use the cancel_booking tool with the bookingId parameter. "
                        + "Would you like to see your current bookings first?";
                if (token != null) {
                    data = toolRegistry.executeTool("get_client_bookings", Map.of(), token);
                    toolsUsed.add("get_client_bookings");
                }

            } else if (matchesAny(msg, "my booking", "my appointment", "my schedule", "my session")) {
                if (token == null) {
                    response = "You need to be logged in to view your bookings. Please sign in first.";
                } else {
                    data = toolRegistry.executeTool("get_client_bookings", Map.of(), token);
                    toolsUsed.add("get_client_bookings");
                    response = "Here are your current bookings:";
                }

            } else if (matchesAny(msg, "service", "offer", "program", "what do you", "what can")) {
                data = toolRegistry.executeTool("list_services", Map.of(), token);
                toolsUsed.add("list_services");
                response = "Here are the training services we offer at PawForward Academy:";

            } else if (matchesAny(msg, "price", "cost", "how much", "package", "pricing")) {
                data = toolRegistry.executeTool("list_packages", Map.of(), token);
                toolsUsed.add("list_packages");
                response = "Here are our available packages and pricing:";

            } else if (matchesAny(msg, "trainer", "staff", "instructor", "who teach")) {
                data = toolRegistry.executeTool("list_trainers", Map.of(), token);
                toolsUsed.add("list_trainers");
                response = "Here are our trainers:";

            } else if (matchesAny(msg, "available", "slot", "book", "schedule", "open time")) {
                data = toolRegistry.executeTool("get_available_slots", Map.of(), token);
                toolsUsed.add("get_available_slots");
                response = "Here are the available time slots for the next two weeks:";

            } else if (matchesAny(msg, "class", "group", "enroll")) {
                data = toolRegistry.executeTool("list_upcoming_classes", Map.of(), token);
                toolsUsed.add("list_upcoming_classes");
                response = "Here are our upcoming group classes:";

            } else if (matchesAny(msg, "review", "testimonial", "rating")) {
                data = toolRegistry.executeTool("list_services", Map.of(), token);
                toolsUsed.add("list_services");
                response = "Our clients love their experience at PawForward Academy! Check our website for the latest reviews.";

            } else if (matchesAny(msg, "dog", "my dog", "pet", "progress", "training log")) {
                if (token == null) {
                    response = "You need to be logged in to view your dog's information. Please sign in first.";
                } else {
                    response = "To view your dog's profile or training progress, I need the dog's ID. "
                            + "You can use the get_dog_profile, get_training_progress, or get_training_logs tools.";
                }

            } else if (matchesAny(msg, "contact", "reach", "question", "help", "support")) {
                data = businessResources.getResource("pawforward://business/info");
                response = "You can reach PawForward Academy through the following channels. "
                        + "You can also submit an inquiry using the submit_inquiry tool.";

            } else if (matchesAny(msg, "policy", "cancel policy", "vaccination", "late", "rules")) {
                data = businessResources.getResource("pawforward://business/policies");
                response = "Here are our business policies:";

            } else if (matchesAny(msg, "faq", "frequently asked", "common question")) {
                data = businessResources.getResource("pawforward://business/faq");
                response = "Here are some frequently asked questions:";

            } else if (matchesAny(msg, "hours", "when open", "open hours", "business hours")) {
                data = businessResources.getResource("pawforward://business/info");
                response = "Here are our business hours and contact information:";

            } else {
                response = "Welcome to PawForward Academy! I can help you with:\n"
                        + "- Browsing our training services and pricing\n"
                        + "- Finding available time slots and booking sessions\n"
                        + "- Viewing upcoming group classes\n"
                        + "- Learning about our trainers\n"
                        + "- Checking your bookings and dog's training progress\n"
                        + "- Business policies and FAQs\n"
                        + "- Contacting us with questions\n\n"
                        + "What would you like to know?";
            }

        } catch (Exception e) {
            log.error("Chat processing error", e);
            response = "Sorry, I encountered an issue processing your request. Please try again.";
        }

        return ResponseEntity.ok(new ChatResponse(response, toolsUsed, data));
    }

    private boolean matchesAny(String input, String... keywords) {
        for (String keyword : keywords) {
            if (input.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private String extractToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}
