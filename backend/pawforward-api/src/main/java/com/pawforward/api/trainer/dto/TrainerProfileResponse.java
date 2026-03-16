package com.pawforward.api.trainer.dto;

import com.pawforward.api.trainer.TrainerProfile;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@AllArgsConstructor
@Builder
public class TrainerProfileResponse {

    private UUID id;
    private UUID userId;
    private String name;
    private String email;
    private String bio;
    private List<String> specializations;
    private List<String> certifications;
    private Integer yearsExperience;
    private BigDecimal hourlyRate;
    private String profilePhotoUrl;
    private boolean acceptingClients;
    private Instant createdAt;

    public static TrainerProfileResponse from(TrainerProfile profile) {
        return TrainerProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .name(profile.getUser().getFullName())
                .email(profile.getUser().getEmail())
                .bio(profile.getBio())
                .specializations(profile.getSpecializations() != null
                        ? List.of(profile.getSpecializations()) : List.of())
                .certifications(profile.getCertifications() != null
                        ? List.of(profile.getCertifications()) : List.of())
                .yearsExperience(profile.getYearsExperience())
                .hourlyRate(profile.getHourlyRate())
                .profilePhotoUrl(profile.getProfilePhotoUrl())
                .acceptingClients(profile.isAcceptingClients())
                .createdAt(profile.getCreatedAt())
                .build();
    }
}
