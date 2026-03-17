package com.pawforward.api.scheduling.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassSeriesRequest {

    @NotNull(message = "Service type is required")
    private UUID serviceTypeId;

    @NotNull(message = "Trainer is required")
    private UUID trainerId;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotNull(message = "Day of week is required")
    private Short dayOfWeek;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    private String location;

    @NotNull(message = "Max participants is required")
    @Min(value = 1, message = "Max participants must be at least 1")
    private Integer maxParticipants;
}
