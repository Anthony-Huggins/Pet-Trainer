package com.pawforward.api.payment.dto;

import com.pawforward.api.payment.TrainingPackage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@AllArgsConstructor
@Builder
public class PackageResponse {

    private UUID id;
    private String name;
    private String description;
    private int sessionCount;
    private BigDecimal price;
    private BigDecimal perSessionPrice;
    private Integer validDays;
    private boolean isActive;
    private String serviceTypeName;

    public static PackageResponse from(TrainingPackage pkg) {
        return PackageResponse.builder()
                .id(pkg.getId())
                .name(pkg.getName())
                .description(pkg.getDescription())
                .sessionCount(pkg.getSessionCount())
                .price(pkg.getPrice())
                .perSessionPrice(pkg.getPerSessionPrice())
                .validDays(pkg.getValidDays())
                .isActive(pkg.isActive())
                .serviceTypeName(pkg.getServiceType() != null ? pkg.getServiceType().getName() : null)
                .build();
    }
}
