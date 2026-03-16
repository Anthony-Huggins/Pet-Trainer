package com.pawforward.api.dog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DogVaccinationRequest {

    @NotBlank(message = "Vaccination name is required")
    @Size(max = 100)
    private String vaccinationName;

    @NotNull(message = "Administered date is required")
    private LocalDate administeredDate;

    private LocalDate expirationDate;

    private String documentUrl;
}
