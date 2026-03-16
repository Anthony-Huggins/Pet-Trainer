package com.pawforward.api.service.dto;

import com.pawforward.api.service.ServiceCategory;
import com.pawforward.api.service.ServiceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@AllArgsConstructor
@Builder
public class ServiceTypeResponse {

    private UUID id;
    private String name;
    private ServiceCategory category;
    private String description;
    private Integer durationMinutes;
    private Integer maxParticipants;
    private BigDecimal price;
    private BigDecimal depositAmount;
    private boolean active;
    private int sortOrder;
    private String imageUrl;
    private Instant createdAt;
    private Instant updatedAt;

    public static ServiceTypeResponse from(ServiceType service) {
        return ServiceTypeResponse.builder()
                .id(service.getId())
                .name(service.getName())
                .category(service.getCategory())
                .description(service.getDescription())
                .durationMinutes(service.getDurationMinutes())
                .maxParticipants(service.getMaxParticipants())
                .price(service.getPrice())
                .depositAmount(service.getDepositAmount())
                .active(service.isActive())
                .sortOrder(service.getSortOrder())
                .imageUrl(service.getImageUrl())
                .createdAt(service.getCreatedAt())
                .updatedAt(service.getUpdatedAt())
                .build();
    }
}
