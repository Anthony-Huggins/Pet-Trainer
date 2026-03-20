package com.pawforward.api.training.dto;

import com.pawforward.api.training.GoalStatus;
import com.pawforward.api.training.TrainingGoal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@AllArgsConstructor
@Builder
public class TrainingGoalResponse {

    private UUID id;
    private UUID dogId;
    private String dogName;
    private UUID trainerId;
    private String trainerName;
    private String title;
    private String description;
    private LocalDate targetDate;
    private GoalStatus status;
    private Integer progressPercent;
    private Instant createdAt;
    private Instant updatedAt;

    public static TrainingGoalResponse from(TrainingGoal goal) {
        return TrainingGoalResponse.builder()
                .id(goal.getId())
                .dogId(goal.getDog().getId())
                .dogName(goal.getDog().getName())
                .trainerId(goal.getTrainer() != null ? goal.getTrainer().getId() : null)
                .trainerName(goal.getTrainer() != null ? goal.getTrainer().getUser().getFullName() : null)
                .title(goal.getTitle())
                .description(goal.getDescription())
                .targetDate(goal.getTargetDate())
                .status(goal.getStatus())
                .progressPercent(goal.getProgressPercent())
                .createdAt(goal.getCreatedAt())
                .updatedAt(goal.getUpdatedAt())
                .build();
    }
}
