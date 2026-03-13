package com.pawforward.api.security;

import com.pawforward.api.auth.AuthService;
import com.pawforward.api.auth.dto.AuthResponse;
import com.pawforward.api.user.User;
import com.pawforward.api.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final String frontendUrl;

    public OAuth2AuthenticationSuccessHandler(
            AuthService authService,
            UserRepository userRepository,
            @Value("${app.cors.allowed-origins}") String frontendUrl) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.frontendUrl = frontendUrl;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("OAuth user not found after authentication"));

        AuthResponse authResponse = authService.generateAuthResponse(user);

        String redirectUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/auth/oauth-callback")
                .queryParam("token", authResponse.getAccessToken())
                .queryParam("refreshToken", authResponse.getRefreshToken())
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
