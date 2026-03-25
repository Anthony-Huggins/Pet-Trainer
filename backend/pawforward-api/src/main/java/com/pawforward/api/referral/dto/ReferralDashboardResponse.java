package com.pawforward.api.referral.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@AllArgsConstructor
@Builder
public class ReferralDashboardResponse {

    private ReferralCodeResponse code;
    private List<ReferralRedemptionResponse> redemptions;
    private BigDecimal totalSavingsGenerated;
}
