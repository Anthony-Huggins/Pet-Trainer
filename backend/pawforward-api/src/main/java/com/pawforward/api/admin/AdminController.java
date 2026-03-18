package com.pawforward.api.admin;

import com.pawforward.api.admin.dto.CreateTrainerRequest;
import com.pawforward.api.trainer.dto.TrainerProfileResponse;
import com.pawforward.api.user.dto.UserResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PostMapping("/trainers")
    public ResponseEntity<TrainerProfileResponse> createTrainer(
            @Valid @RequestBody CreateTrainerRequest request) {
        TrainerProfileResponse trainer = adminService.createTrainer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(trainer);
    }

    @GetMapping("/trainers")
    public ResponseEntity<List<TrainerProfileResponse>> getAllTrainers() {
        return ResponseEntity.ok(adminService.getAllTrainers());
    }
}
