package com.pawforward.api.dog.dto;

import com.pawforward.api.dog.DogVaccination;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@AllArgsConstructor
@Builder
public class DogVaccinationResponse {

    private UUID id;
    private UUID dogId;
    private String vaccinationName;
    private LocalDate administeredDate;
    private LocalDate expirationDate;
    private String documentUrl;

    public static DogVaccinationResponse from(DogVaccination v) {
        return DogVaccinationResponse.builder()
                .id(v.getId())
                .dogId(v.getDog().getId())
                .vaccinationName(v.getVaccinationName())
                .administeredDate(v.getAdministeredDate())
                .expirationDate(v.getExpirationDate())
                .documentUrl(v.getDocumentUrl())
                .build();
    }
}
