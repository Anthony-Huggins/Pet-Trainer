package com.pawforward.api.referral.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RedeemReferralRequest {

    @NotBlank(message = "Referral code is required")
    private String code;

    private UUID paymentId;

    private BigDecimal discountApplied;
}
