package com.pawforward.api.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class CheckoutResponse {

    private String checkoutUrl;
    private String sessionId;
}
