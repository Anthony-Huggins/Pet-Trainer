package com.pawforward.mcp.tools;

import java.util.List;
import java.util.Map;

/**
 * Describes a single MCP tool that an AI agent can invoke.
 */
public record ToolDefinition(
        String name,
        String description,
        Map<String, ToolParameter> parameters,
        List<String> required
) {}
