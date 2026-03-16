package com.pawforward.api.booking.dto;

import com.pawforward.api.booking.ClassEnrollment;
import com.pawforward.api.booking.EnrollmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@AllArgsConstructor
@Builder
public class ClassEnrollmentResponse {

    private UUID id;
    private UUID classSeriesId;
    private String classSeriesTitle;
    private UUID clientId;
    private String clientName;
    private UUID dogId;
    private String dogName;
    private EnrollmentStatus status;
    private Integer waitlistPosition;
    private Instant enrolledAt;
    private Instant createdAt;

    public static ClassEnrollmentResponse from(ClassEnrollment enrollment) {
        return ClassEnrollmentResponse.builder()
                .id(enrollment.getId())
                .classSeriesId(enrollment.getClassSeries().getId())
                .classSeriesTitle(enrollment.getClassSeries().getTitle())
                .clientId(enrollment.getClient().getId())
                .clientName(enrollment.getClient().getFullName())
                .dogId(enrollment.getDog().getId())
                .dogName(enrollment.getDog().getName())
                .status(enrollment.getStatus())
                .waitlistPosition(enrollment.getWaitlistPosition())
                .enrolledAt(enrollment.getEnrolledAt())
                .createdAt(enrollment.getCreatedAt())
                .build();
    }
}
