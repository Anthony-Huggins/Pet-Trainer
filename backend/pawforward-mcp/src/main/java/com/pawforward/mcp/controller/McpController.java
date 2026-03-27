package com.pawforward.mcp.controller;

import com.pawforward.mcp.resources.BusinessResources;
import com.pawforward.mcp.tools.ToolDefinition;
import com.pawforward.mcp.tools.ToolRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST endpoints implementing the MCP protocol for AI agent tool discovery and execution.
 */
@RestController
@RequestMapping("/mcp")
@RequiredArgsConstructor
@Slf4j
public class McpController {

    private final ToolRegistry toolRegistry;
    private final BusinessResources businessResources;

    /**
     * Lists all available MCP tools with their parameter schemas.
     */
    @GetMapping("/tools")
    public List<ToolDefinition> listTools() {
        return toolRegistry.getTools();
    }

    /**
     * Executes a specific tool by name with the provided arguments.
     * The Authorization header is forwarded to tools that require authentication.
     */
    @PostMapping("/tools/{toolName}")
    public ResponseEntity<Object> executeTool(
            @PathVariable String toolName,
            @RequestBody(required = false) Map<String, String> arguments,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        if (!toolRegistry.hasTool(toolName)) {
            return ResponseEntity.notFound().build();
        }

        try {
            String token = extractToken(authHeader);
            Object result = toolRegistry.executeTool(toolName, arguments, token);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", true, "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Tool execution failed: {}", toolName, e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", true, "message", "Tool execution failed: " + e.getMessage()));
        }
    }

    /**
     * Lists all available MCP resources.
     */
    @GetMapping("/resources")
    public List<Map<String, String>> listResources() {
        return businessResources.listResources();
    }

    /**
     * Retrieves a specific MCP resource by its URI path.
     */
    @GetMapping("/resources/{resourceUri}")
    public ResponseEntity<Object> getResource(@PathVariable String resourceUri) {
        Object resource = businessResources.getResource(resourceUri);
        if (resource instanceof Map<?, ?> map && Boolean.TRUE.equals(map.get("error"))) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(resource);
    }

    private String extractToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}
