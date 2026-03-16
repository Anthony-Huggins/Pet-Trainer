package com.pawforward.api.trainer;

import com.pawforward.api.trainer.dto.TrainerAvailabilityRequest;
import com.pawforward.api.trainer.dto.TrainerAvailabilityResponse;
import com.pawforward.api.trainer.dto.TrainerProfileRequest;
import com.pawforward.api.trainer.dto.TrainerProfileResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/trainers")
public class TrainerProfileController {

    private final TrainerProfileService trainerProfileService;

    public TrainerProfileController(TrainerProfileService trainerProfileService) {
        this.trainerProfileService = trainerProfileService;
    }

    // --- Public endpoints (GET /api/v1/trainers/** is permitAll in SecurityConfig) ---

    @GetMapping
    public ResponseEntity<List<TrainerProfileResponse>> getAllTrainers() {
        return ResponseEntity.ok(trainerProfileService.getAllActiveTrainers());
    }

    @GetMapping("/{trainerId}")
    public ResponseEntity<TrainerProfileResponse> getTrainer(@PathVariable UUID trainerId) {
        return ResponseEntity.ok(trainerProfileService.getTrainer(trainerId));
    }

    @GetMapping("/{trainerId}/availability")
    public ResponseEntity<List<TrainerAvailabilityResponse>> getTrainerAvailability(
            @PathVariable UUID trainerId) {
        return ResponseEntity.ok(trainerProfileService.getTrainerAvailability(trainerId));
    }

    // --- Trainer self-management (requires TRAINER role) ---

    @GetMapping("/me/profile")
    @PreAuthorize("hasRole('TRAINER')")
    public ResponseEntity<TrainerProfileResponse> getMyProfile() {
        return ResponseEntity.ok(trainerProfileService.getMyProfile());
    }

    @PutMapping("/me/profile")
    @PreAuthorize("hasRole('TRAINER')")
    public ResponseEntity<TrainerProfileResponse> updateMyProfile(
            @Valid @RequestBody TrainerProfileRequest request) {
        return ResponseEntity.ok(trainerProfileService.updateMyProfile(request));
    }

    @GetMapping("/me/availability")
    @PreAuthorize("hasRole('TRAINER')")
    public ResponseEntity<List<TrainerAvailabilityResponse>> getMyAvailability() {
        return ResponseEntity.ok(trainerProfileService.getMyAvailability());
    }

    @PostMapping("/me/availability")
    @PreAuthorize("hasRole('TRAINER')")
    public ResponseEntity<TrainerAvailabilityResponse> addAvailability(
            @Valid @RequestBody TrainerAvailabilityRequest request) {
        TrainerAvailabilityResponse availability = trainerProfileService.addAvailability(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(availability);
    }

    @DeleteMapping("/me/availability/{availabilityId}")
    @PreAuthorize("hasRole('TRAINER')")
    public ResponseEntity<Void> deleteAvailability(@PathVariable UUID availabilityId) {
        trainerProfileService.deleteAvailability(availabilityId);
        return ResponseEntity.noContent().build();
    }

    // --- Admin: create trainer profile ---

    @PostMapping("/{userId}/profile")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TrainerProfileResponse> createTrainerProfile(
            @PathVariable UUID userId,
            @Valid @RequestBody TrainerProfileRequest request) {
        TrainerProfileResponse profile = trainerProfileService.createTrainerProfile(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(profile);
    }
}
