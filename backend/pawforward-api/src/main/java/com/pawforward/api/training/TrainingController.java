package com.pawforward.api.training;

import com.pawforward.api.trainer.TrainerProfile;
import com.pawforward.api.trainer.TrainerProfileRepository;
import com.pawforward.api.training.dto.DogProgressResponse;
import com.pawforward.api.training.dto.TrainingGoalRequest;
import com.pawforward.api.training.dto.TrainingGoalResponse;
import com.pawforward.api.training.dto.TrainingLogRequest;
import com.pawforward.api.training.dto.TrainingLogResponse;
import com.pawforward.api.user.User;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/training")
public class TrainingController {

    private final TrainingService trainingService;
    private final TrainerProfileRepository trainerProfileRepository;

    public TrainingController(TrainingService trainingService,
                              TrainerProfileRepository trainerProfileRepository) {
        this.trainingService = trainingService;
        this.trainerProfileRepository = trainerProfileRepository;
    }

    // --- Goals ---

    @PostMapping("/goals")
    @PreAuthorize("hasAnyRole('TRAINER', 'ADMIN')")
    public ResponseEntity<TrainingGoalResponse> createGoal(@Valid @RequestBody TrainingGoalRequest request) {
        User currentUser = trainingService.getCurrentUser();
        TrainingGoalResponse response = trainingService.createGoal(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/goals/dog/{dogId}")
    public ResponseEntity<List<TrainingGoalResponse>> getGoalsForDog(@PathVariable UUID dogId) {
        return ResponseEntity.ok(trainingService.getGoalsForDog(dogId));
    }

    @PutMapping("/goals/{id}")
    @PreAuthorize("hasAnyRole('TRAINER', 'ADMIN')")
    public ResponseEntity<TrainingGoalResponse> updateGoal(
            @PathVariable UUID id,
            @Valid @RequestBody TrainingGoalRequest request) {
        return ResponseEntity.ok(trainingService.updateGoal(id, request));
    }

    @DeleteMapping("/goals/{id}")
    @PreAuthorize("hasAnyRole('TRAINER', 'ADMIN')")
    public ResponseEntity<Void> deleteGoal(@PathVariable UUID id) {
        trainingService.deleteGoal(id);
        return ResponseEntity.noContent().build();
    }

    // --- Logs ---

    @PostMapping("/logs")
    @PreAuthorize("hasAnyRole('TRAINER', 'ADMIN')")
    public ResponseEntity<TrainingLogResponse> createLog(@Valid @RequestBody TrainingLogRequest request) {
        User currentUser = trainingService.getCurrentUser();
        TrainingLogResponse response = trainingService.createLog(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/logs/dog/{dogId}")
    public ResponseEntity<List<TrainingLogResponse>> getLogsForDog(
            @PathVariable UUID dogId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        if (from != null && to != null) {
            return ResponseEntity.ok(trainingService.getLogsForDogBetweenDates(dogId, from, to));
        }
        return ResponseEntity.ok(trainingService.getLogsForDog(dogId));
    }

    @GetMapping("/logs/trainer")
    @PreAuthorize("hasRole('TRAINER')")
    public ResponseEntity<List<TrainingLogResponse>> getTrainerLogs() {
        User currentUser = trainingService.getCurrentUser();
        return ResponseEntity.ok(trainingService.getLogsForTrainer(currentUser.getId()));
    }

    @GetMapping("/logs/{id}")
    public ResponseEntity<TrainingLogResponse> getLog(@PathVariable UUID id) {
        return ResponseEntity.ok(trainingService.getLogById(id));
    }

    // --- Progress ---

    @GetMapping("/progress/dog/{dogId}")
    public ResponseEntity<DogProgressResponse> getDogProgress(@PathVariable UUID dogId) {
        return ResponseEntity.ok(trainingService.getDogProgress(dogId));
    }
}
