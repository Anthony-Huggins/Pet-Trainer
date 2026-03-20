package com.pawforward.api.boardtrain.dto;

import com.pawforward.api.boardtrain.BoardTrainProgram;
import com.pawforward.api.boardtrain.BoardTrainStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@AllArgsConstructor
@Builder
public class BoardTrainResponse {

    private UUID id;
    private UUID serviceTypeId;
    private String serviceTypeName;
    private UUID clientId;
    private String clientName;
    private UUID dogId;
    private String dogName;
    private UUID trainerId;
    private String trainerName;
    private LocalDate startDate;
    private LocalDate endDate;
    private BoardTrainStatus status;
    private String pickupInstructions;
    private String dropoffInstructions;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private Instant createdAt;
    private Instant updatedAt;

    public static BoardTrainResponse from(BoardTrainProgram program) {
        return BoardTrainResponse.builder()
                .id(program.getId())
                .serviceTypeId(program.getServiceType().getId())
                .serviceTypeName(program.getServiceType().getName())
                .clientId(program.getClient().getId())
                .clientName(program.getClient().getFullName())
                .dogId(program.getDog().getId())
                .dogName(program.getDog().getName())
                .trainerId(program.getTrainer() != null ? program.getTrainer().getId() : null)
                .trainerName(program.getTrainer() != null ? program.getTrainer().getUser().getFullName() : null)
                .startDate(program.getStartDate())
                .endDate(program.getEndDate())
                .status(program.getStatus())
                .pickupInstructions(program.getPickupInstructions())
                .dropoffInstructions(program.getDropoffInstructions())
                .emergencyContactName(program.getEmergencyContactName())
                .emergencyContactPhone(program.getEmergencyContactPhone())
                .createdAt(program.getCreatedAt())
                .updatedAt(program.getUpdatedAt())
                .build();
    }
}
