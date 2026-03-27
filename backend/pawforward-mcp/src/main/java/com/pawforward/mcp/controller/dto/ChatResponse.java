package com.pawforward.mcp.controller.dto;

import java.util.List;

/**
 * Outbound chat response including the message, which tools were invoked, and any data payload.
 */
public record ChatResponse(
        String message,
        List<String> toolsUsed,
        Object data
) {}
