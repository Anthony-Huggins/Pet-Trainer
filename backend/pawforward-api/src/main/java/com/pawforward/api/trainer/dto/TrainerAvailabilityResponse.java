package com.pawforward.api.trainer.dto;

import com.pawforward.api.trainer.TrainerAvailability;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Getter
@AllArgsConstructor
@Builder
public class TrainerAvailabilityResponse {

    private UUID id;
    private UUID trainerId;
    private short dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean recurring;
    private LocalDate specificDate;
    private boolean available;

    public static TrainerAvailabilityResponse from(TrainerAvailability avail) {
        return TrainerAvailabilityResponse.builder()
                .id(avail.getId())
                .trainerId(avail.getTrainer().getId())
                .dayOfWeek(avail.getDayOfWeek())
                .startTime(avail.getStartTime())
                .endTime(avail.getEndTime())
                .recurring(avail.isRecurring())
                .specificDate(avail.getSpecificDate())
                .available(avail.isAvailable())
                .build();
    }
}
