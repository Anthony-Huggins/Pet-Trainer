package com.pawforward.api.dog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DogRequest {

    @NotBlank(message = "Dog name is required")
    @Size(max = 100)
    private String name;

    @Size(max = 100)
    private String breed;

    private LocalDate dateOfBirth;
    private BigDecimal weightLbs;
    private String gender;
    private Boolean spayedNeutered;
    private String microchipId;
    private String veterinarianName;
    private String veterinarianPhone;
    private String specialNeeds;
}
