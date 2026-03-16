package com.pawforward.api.scheduling.dto;

import com.pawforward.api.scheduling.ClassSeries;
import com.pawforward.api.scheduling.ClassSeriesStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Getter
@AllArgsConstructor
@Builder
public class ClassSeriesResponse {

    private UUID id;
    private UUID serviceTypeId;
    private String serviceTypeName;
    private UUID trainerId;
    private String trainerName;
    private String title;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private short dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private String location;
    private int maxParticipants;
    private int currentEnrollment;
    private int spotsAvailable;
    private ClassSeriesStatus status;
    private Instant createdAt;

    public static ClassSeriesResponse from(ClassSeries cs) {
        return ClassSeriesResponse.builder()
                .id(cs.getId())
                .serviceTypeId(cs.getServiceType().getId())
                .serviceTypeName(cs.getServiceType().getName())
                .trainerId(cs.getTrainer().getId())
                .trainerName(cs.getTrainer().getUser().getFullName())
                .title(cs.getTitle())
                .description(cs.getDescription())
                .startDate(cs.getStartDate())
                .endDate(cs.getEndDate())
                .dayOfWeek(cs.getDayOfWeek())
                .startTime(cs.getStartTime())
                .endTime(cs.getEndTime())
                .location(cs.getLocation())
                .maxParticipants(cs.getMaxParticipants())
                .currentEnrollment(cs.getCurrentEnrollment())
                .spotsAvailable(cs.getMaxParticipants() - cs.getCurrentEnrollment())
                .status(cs.getStatus())
                .createdAt(cs.getCreatedAt())
                .build();
    }
}
