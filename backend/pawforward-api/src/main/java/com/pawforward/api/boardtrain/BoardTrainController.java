package com.pawforward.api.boardtrain;

import com.pawforward.api.boardtrain.dto.BoardTrainRequest;
import com.pawforward.api.boardtrain.dto.BoardTrainResponse;
import com.pawforward.api.boardtrain.dto.DailyNoteRequest;
import com.pawforward.api.boardtrain.dto.DailyNoteResponse;
import com.pawforward.api.trainer.TrainerProfile;
import com.pawforward.api.trainer.TrainerProfileRepository;
import com.pawforward.api.user.User;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/board-train")
public class BoardTrainController {

    private final BoardTrainService boardTrainService;
    private final TrainerProfileRepository trainerProfileRepository;

    public BoardTrainController(BoardTrainService boardTrainService,
                                TrainerProfileRepository trainerProfileRepository) {
        this.boardTrainService = boardTrainService;
        this.trainerProfileRepository = trainerProfileRepository;
    }

    @PostMapping
    public ResponseEntity<BoardTrainResponse> createRequest(@Valid @RequestBody BoardTrainRequest request) {
        User currentUser = boardTrainService.getCurrentUser();
        BoardTrainResponse response = boardTrainService.createRequest(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my-programs")
    public ResponseEntity<List<BoardTrainResponse>> getMyPrograms() {
        User currentUser = boardTrainService.getCurrentUser();
        return ResponseEntity.ok(boardTrainService.getMyPrograms(currentUser.getId()));
    }

    @GetMapping("/trainer-programs")
    @PreAuthorize("hasAnyRole('TRAINER', 'ADMIN')")
    public ResponseEntity<List<BoardTrainResponse>> getTrainerPrograms() {
        User currentUser = boardTrainService.getCurrentUser();
        TrainerProfile trainer = trainerProfileRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new EntityNotFoundException("Trainer profile not found"));
        return ResponseEntity.ok(boardTrainService.getTrainerPrograms(trainer.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BoardTrainResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(boardTrainService.getById(id));
    }

    @PutMapping("/{id}/assign-trainer")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<BoardTrainResponse> assignTrainer(
            @PathVariable UUID id,
            @RequestBody Map<String, UUID> body) {
        UUID trainerId = body.get("trainerId");
        return ResponseEntity.ok(boardTrainService.assignTrainer(id, trainerId));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<BoardTrainResponse> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(boardTrainService.updateStatus(id, status));
    }

    @PostMapping("/{id}/daily-notes")
    @PreAuthorize("hasAnyRole('TRAINER', 'ADMIN')")
    public ResponseEntity<DailyNoteResponse> addDailyNote(
            @PathVariable UUID id,
            @Valid @RequestBody DailyNoteRequest noteRequest) {
        User currentUser = boardTrainService.getCurrentUser();
        TrainerProfile trainer = trainerProfileRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new EntityNotFoundException("Trainer profile not found"));
        DailyNoteResponse response = boardTrainService.addDailyNote(id, noteRequest, trainer.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}/daily-notes")
    public ResponseEntity<List<DailyNoteResponse>> getDailyNotes(@PathVariable UUID id) {
        return ResponseEntity.ok(boardTrainService.getDailyNotes(id));
    }
}
