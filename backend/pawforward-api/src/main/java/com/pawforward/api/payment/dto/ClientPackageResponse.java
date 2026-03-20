package com.pawforward.api.payment.dto;

import com.pawforward.api.payment.ClientPackage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@AllArgsConstructor
@Builder
public class ClientPackageResponse {

    private UUID id;
    private String packageName;
    private int sessionsRemaining;
    private Instant purchasedAt;
    private Instant expiresAt;
    private String status;

    public static ClientPackageResponse from(ClientPackage cp) {
        return ClientPackageResponse.builder()
                .id(cp.getId())
                .packageName(cp.getTrainingPackage().getName())
                .sessionsRemaining(cp.getSessionsRemaining())
                .purchasedAt(cp.getPurchasedAt())
                .expiresAt(cp.getExpiresAt())
                .status(cp.getStatus())
                .build();
    }
}
