package com.pawforward.mcp.controller.dto;

import java.util.List;

/**
 * Inbound chat request from the frontend.
 */
public record ChatRequest(
        String message,
        List<ChatMessage> conversationHistory
) {}
