package com.pawforward.mcp.tools;

/**
 * Describes a single parameter for an MCP tool.
 */
public record ToolParameter(
        String type,
        String description
) {}
