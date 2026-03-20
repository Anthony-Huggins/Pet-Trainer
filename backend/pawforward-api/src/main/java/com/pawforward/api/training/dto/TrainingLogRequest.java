package com.pawforward.api.training.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TrainingLogRequest {

    @NotNull
    private UUID dogId;

    private UUID sessionId;

    private LocalDate logDate;

    @NotBlank
    private String summary;

    private List<String> skillsWorked;

    private String behaviorNotes;

    private String homework;

    @Min(1)
    @Max(5)
    private Integer rating;
}
