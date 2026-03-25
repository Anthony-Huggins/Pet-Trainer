package com.pawforward.api.referral.dto;

import com.pawforward.api.referral.ReferralCode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@AllArgsConstructor
@Builder
public class ReferralCodeResponse {

    private UUID id;
    private String code;
    private int discountPercent;
    private Integer maxUses;
    private int timesUsed;
    private boolean isActive;
    private Instant createdAt;

    public static ReferralCodeResponse from(ReferralCode referralCode) {
        return ReferralCodeResponse.builder()
                .id(referralCode.getId())
                .code(referralCode.getCode())
                .discountPercent(referralCode.getDiscountPercent())
                .maxUses(referralCode.getMaxUses())
                .timesUsed(referralCode.getTimesUsed())
                .isActive(referralCode.isActive())
                .createdAt(referralCode.getCreatedAt())
                .build();
    }
}
