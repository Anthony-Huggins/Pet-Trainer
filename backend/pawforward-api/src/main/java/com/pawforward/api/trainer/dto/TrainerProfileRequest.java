package com.pawforward.api.trainer.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainerProfileRequest {

    @Size(max = 2000)
    private String bio;

    private List<String> specializations;
    private List<String> certifications;
    private Integer yearsExperience;
    private BigDecimal hourlyRate;
    private Boolean acceptingClients;
}
