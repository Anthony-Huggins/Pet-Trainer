package com.pawforward.api.payment.dto;

import com.pawforward.api.payment.Payment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@AllArgsConstructor
@Builder
public class PaymentResponse {

    private UUID id;
    private BigDecimal amount;
    private String currency;
    private String paymentType;
    private String status;
    private String description;
    private Instant createdAt;
    private String stripeCheckoutSessionId;

    public static PaymentResponse from(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .paymentType(payment.getPaymentType())
                .status(payment.getStatus())
                .description(payment.getDescription())
                .createdAt(payment.getCreatedAt())
                .stripeCheckoutSessionId(payment.getStripeCheckoutSessionId())
                .build();
    }
}
