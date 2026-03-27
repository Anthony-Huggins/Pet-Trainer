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
 * MCP tool for submitting contact inquiries.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ContactTools {

    private final ToolRegistry registry;
    private final PawForwardApiClient apiClient;

    @PostConstruct
    public void register() {
        Map<String, ToolParameter> params = new LinkedHashMap<>();
        params.put("name", new ToolParameter("string", "Full name of the person submitting the inquiry."));
        params.put("email", new ToolParameter("string", "Email address for follow-up."));
        params.put("message", new ToolParameter("string", "The inquiry message."));
        params.put("phone", new ToolParameter("string", "Phone number (optional)."));
        params.put("serviceInterest", new ToolParameter("string", "Which service the person is interested in (optional)."));

        registry.register(
                new ToolDefinition(
                        "submit_inquiry",
                        "Submits a contact inquiry to PawForward Academy.",
                        params,
                        List.of("name", "email", "message")
                ),
                (args, token) -> {
                    try {
                        String name = args.get("name");
                        String email = args.get("email");
                        String message = args.get("message");
                        if (name == null || email == null || message == null) {
                            return errorResult("name, email, and message are required.");
                        }

                        Map<String, Object> data = new LinkedHashMap<>();
                        data.put("name", name);
                        data.put("email", email);
                        data.put("message", message);
                        if (args.get("phone") != null) data.put("phone", args.get("phone"));
                        if (args.get("serviceInterest") != null) data.put("serviceInterest", args.get("serviceInterest"));

                        return apiClient.submitInquiry(data);
                    } catch (Exception e) {
                        log.error("submit_inquiry failed", e);
                        return errorResult("Failed to submit inquiry: " + e.getMessage());
                    }
                }
        );
    }

    private Map<String, Object> errorResult(String message) {
        return Map.of("error", true, "message", message);
    }
}
