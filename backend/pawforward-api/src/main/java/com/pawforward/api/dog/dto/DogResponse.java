package com.pawforward.api.dog.dto;

import com.pawforward.api.dog.Dog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@AllArgsConstructor
@Builder
public class DogResponse {

    private UUID id;
    private UUID ownerId;
    private String name;
    private String breed;
    private LocalDate dateOfBirth;
    private BigDecimal weightLbs;
    private String gender;
    private Boolean spayedNeutered;
    private String microchipId;
    private String veterinarianName;
    private String veterinarianPhone;
    private String specialNeeds;
    private String profilePhotoUrl;
    private Instant createdAt;
    private Instant updatedAt;

    public static DogResponse from(Dog dog) {
        return DogResponse.builder()
                .id(dog.getId())
                .ownerId(dog.getOwner().getId())
                .name(dog.getName())
                .breed(dog.getBreed())
                .dateOfBirth(dog.getDateOfBirth())
                .weightLbs(dog.getWeightLbs())
                .gender(dog.getGender())
                .spayedNeutered(dog.getSpayedNeutered())
                .microchipId(dog.getMicrochipId())
                .veterinarianName(dog.getVeterinarianName())
                .veterinarianPhone(dog.getVeterinarianPhone())
                .specialNeeds(dog.getSpecialNeeds())
                .profilePhotoUrl(dog.getProfilePhotoUrl())
                .createdAt(dog.getCreatedAt())
                .updatedAt(dog.getUpdatedAt())
                .build();
    }
}
