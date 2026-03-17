package com.pawforward.api.scheduling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Getter
@AllArgsConstructor
@Builder
public class AvailableSlotResponse {

    private UUID trainerId;
    private String trainerName;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private int durationMinutes;
}
