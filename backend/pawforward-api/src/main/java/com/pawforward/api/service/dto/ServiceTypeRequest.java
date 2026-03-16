package com.pawforward.api.service.dto;

import com.pawforward.api.service.ServiceCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceTypeRequest {

    @NotBlank(message = "Service name is required")
    @Size(max = 200)
    private String name;

    @NotNull(message = "Service category is required")
    private ServiceCategory category;

    private String description;
    private Integer durationMinutes;
    private Integer maxParticipants;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal price;

    private BigDecimal depositAmount;
    private Boolean active;
    private Integer sortOrder;
    private String imageUrl;
}
