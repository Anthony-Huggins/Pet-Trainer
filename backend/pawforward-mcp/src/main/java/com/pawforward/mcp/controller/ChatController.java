package com.pawforward.mcp.controller;

import com.pawforward.mcp.controller.dto.ChatRequest;
import com.pawforward.mcp.controller.dto.ChatResponse;
import com.pawforward.mcp.service.AiChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Chat endpoint that delegates to Claude AI for intelligent tool selection
 * and natural language responses.
 */
@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final AiChatService aiChatService;

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

        log.info("Chat request: {}", request.message());
        ChatResponse response = aiChatService.chat(
                request.message(),
                request.conversationHistory(),
                token
        );

        return ResponseEntity.ok(response);
    }

    private String extractToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}
