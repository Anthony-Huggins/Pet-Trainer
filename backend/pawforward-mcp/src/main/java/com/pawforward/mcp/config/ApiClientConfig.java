package com.pawforward.mcp.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Configures a WebClient bean for calling the main PawForward API.
 */
@Configuration
public class ApiClientConfig {

    @Value("${pawforward.api.base-url}")
    private String baseUrl;

    @Value("${pawforward.api.service-key}")
    private String serviceKey;

    @Bean
    public WebClient pawForwardWebClient(WebClient.Builder builder) {
        return builder
                .baseUrl(baseUrl)
                .defaultHeader("X-Service-Key", serviceKey)
                .build();
    }
}
