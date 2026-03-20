package com.pawforward.api.training.dto;

import com.pawforward.api.training.GoalStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TrainingGoalRequest {

    @NotNull
    private UUID dogId;

    @NotBlank
    @Size(max = 200)
    private String title;

    private String description;

    private LocalDate targetDate;

    private GoalStatus status;

    @Min(0)
    @Max(100)
    private Integer progressPercent;
}
