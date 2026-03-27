package com.pawforward.mcp.controller.dto;

/**
 * A single message in the conversation history.
 */
public record ChatMessage(
        String role,
        String content
) {}
