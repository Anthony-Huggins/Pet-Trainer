package com.pawforward.api.auth.dto;

import com.pawforward.api.user.dto.UserResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    private long expiresIn;
    private UserResponse user;
}
