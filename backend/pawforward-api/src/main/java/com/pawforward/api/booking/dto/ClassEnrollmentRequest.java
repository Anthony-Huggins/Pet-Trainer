package com.pawforward.api.booking.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassEnrollmentRequest {

    @NotNull(message = "Class series ID is required")
    private UUID classSeriesId;

    @NotNull(message = "Dog ID is required")
    private UUID dogId;
}
