package com.pawforward.api.referral.dto;

import com.pawforward.api.referral.ReferralRedemption;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@AllArgsConstructor
@Builder
public class ReferralRedemptionResponse {

    private UUID id;
    private String referredUserName;
    private BigDecimal discountApplied;
    private Instant createdAt;

    public static ReferralRedemptionResponse from(ReferralRedemption redemption) {
        return ReferralRedemptionResponse.builder()
                .id(redemption.getId())
                .referredUserName(redemption.getReferredUser().getFullName())
                .discountApplied(redemption.getDiscountApplied())
                .createdAt(redemption.getCreatedAt())
                .build();
    }
}
