package com.pawforward.api.training.dto;

import com.pawforward.api.training.TrainingLog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Getter
@AllArgsConstructor
@Builder
public class TrainingLogResponse {

    private UUID id;
    private UUID sessionId;
    private UUID dogId;
    private String dogName;
    private UUID trainerId;
    private String trainerName;
    private LocalDate logDate;
    private String summary;
    private List<String> skillsWorked;
    private String behaviorNotes;
    private String homework;
    private Integer rating;
    private Instant createdAt;
    private List<TrainingMediaResponse> media;

    public static TrainingLogResponse from(TrainingLog log) {
        return TrainingLogResponse.builder()
                .id(log.getId())
                .sessionId(log.getSession() != null ? log.getSession().getId() : null)
                .dogId(log.getDog().getId())
                .dogName(log.getDog().getName())
                .trainerId(log.getTrainer().getId())
                .trainerName(log.getTrainer().getUser().getFullName())
                .logDate(log.getLogDate())
                .summary(log.getSummary())
                .skillsWorked(log.getSkillsWorked() != null ? Arrays.asList(log.getSkillsWorked()) : List.of())
                .behaviorNotes(log.getBehaviorNotes())
                .homework(log.getHomework())
                .rating(log.getRating() != null ? log.getRating().intValue() : null)
                .createdAt(log.getCreatedAt())
                .media(log.getMedia() != null
                        ? log.getMedia().stream().map(TrainingMediaResponse::from).toList()
                        : List.of())
                .build();
    }
}
