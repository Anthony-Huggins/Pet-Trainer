package com.pawforward.api.scheduling;

import com.pawforward.api.scheduling.dto.AvailableSlotResponse;
import com.pawforward.api.scheduling.dto.ClassSeriesRequest;
import com.pawforward.api.scheduling.dto.ClassSeriesResponse;
import com.pawforward.api.scheduling.dto.SessionRequest;
import com.pawforward.api.scheduling.dto.SessionResponse;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/scheduling")
public class SchedulingController {

    private final SchedulingService schedulingService;

    public SchedulingController(SchedulingService schedulingService) {
        this.schedulingService = schedulingService;
    }

    // --- Public: class series browsing ---

    @GetMapping("/class-series")
    public ResponseEntity<List<ClassSeriesResponse>> getUpcomingClasses() {
        return ResponseEntity.ok(schedulingService.getUpcomingClasses());
    }

    @GetMapping("/class-series/{classSeriesId}")
    public ResponseEntity<ClassSeriesResponse> getClassSeries(@PathVariable UUID classSeriesId) {
        return ResponseEntity.ok(schedulingService.getClassSeries(classSeriesId));
    }

    @GetMapping("/class-series/{classSeriesId}/sessions")
    public ResponseEntity<List<SessionResponse>> getClassSeriesSessions(
            @PathVariable UUID classSeriesId) {
        return ResponseEntity.ok(schedulingService.getClassSeriesSessions(classSeriesId));
    }

    // --- Public: available slots for booking ---

    @GetMapping("/available-slots")
    public ResponseEntity<List<AvailableSlotResponse>> getAvailableSlots(
            @RequestParam UUID trainerId,
            @RequestParam UUID serviceTypeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(schedulingService.getAvailableSlots(trainerId, serviceTypeId, from, to));
    }

    // --- Authenticated: session detail ---

    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<SessionResponse> getSession(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(schedulingService.getSession(sessionId));
    }

    // --- Trainer: view own sessions ---

    @GetMapping("/sessions")
    public ResponseEntity<List<SessionResponse>> getSessionsByTrainer(
            @RequestParam UUID trainerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(schedulingService.getSessionsByTrainer(trainerId, from, to));
    }

    // --- Admin/Trainer: create sessions and class series ---

    @PostMapping("/sessions")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<SessionResponse> createSession(
            @Valid @RequestBody SessionRequest request) {
        SessionResponse session = schedulingService.createSession(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(session);
    }

    @PostMapping("/sessions/{sessionId}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<SessionResponse> cancelSession(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(schedulingService.cancelSession(sessionId));
    }

    @PostMapping("/class-series")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<ClassSeriesResponse> createClassSeries(
            @Valid @RequestBody ClassSeriesRequest request) {
        ClassSeriesResponse classSeries = schedulingService.createClassSeries(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(classSeries);
    }
}
