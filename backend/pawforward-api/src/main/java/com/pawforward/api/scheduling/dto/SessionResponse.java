package com.pawforward.api.scheduling.dto;

import com.pawforward.api.scheduling.Session;
import com.pawforward.api.scheduling.SessionStatus;
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
public class SessionResponse {

    private UUID id;
    private UUID serviceTypeId;
    private String serviceTypeName;
    private UUID classSeriesId;
    private UUID trainerId;
    private String trainerName;
    private LocalDate sessionDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String location;
    private SessionStatus status;
    private String notes;
    private Instant createdAt;

    public static SessionResponse from(Session session) {
        return SessionResponse.builder()
                .id(session.getId())
                .serviceTypeId(session.getServiceType() != null ? session.getServiceType().getId() : null)
                .serviceTypeName(session.getServiceType() != null ? session.getServiceType().getName() : null)
                .classSeriesId(session.getClassSeries() != null ? session.getClassSeries().getId() : null)
                .trainerId(session.getTrainer().getId())
                .trainerName(session.getTrainer().getUser().getFullName())
                .sessionDate(session.getSessionDate())
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .location(session.getLocation())
                .status(session.getStatus())
                .notes(session.getNotes())
                .createdAt(session.getCreatedAt())
                .build();
    }
}
