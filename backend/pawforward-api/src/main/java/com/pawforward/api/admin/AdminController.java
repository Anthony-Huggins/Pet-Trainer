package com.pawforward.api.admin;

import com.pawforward.api.admin.dto.CreateTrainerRequest;
import com.pawforward.api.admin.dto.DashboardStatsResponse;
import com.pawforward.api.admin.dto.RevenueReportResponse;
import com.pawforward.api.admin.dto.UpdateBookingStatusRequest;
import com.pawforward.api.admin.dto.UpdateRoleRequest;
import com.pawforward.api.admin.dto.UpdateStatusRequest;
import com.pawforward.api.booking.BookingStatus;
import com.pawforward.api.booking.dto.BookingResponse;
import com.pawforward.api.contact.dto.ContactInquiryResponse;
import com.pawforward.api.contact.dto.InquiryRespondRequest;
import com.pawforward.api.review.dto.ReviewResponse;
import com.pawforward.api.scheduling.dto.ClassSeriesResponse;
import com.pawforward.api.trainer.dto.TrainerProfileResponse;
import com.pawforward.api.user.dto.UserResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // --- Dashboard ---

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // --- Users ---

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<UserResponse> updateUserRole(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateRoleRequest request) {
        return ResponseEntity.ok(adminService.updateUserRole(id, request.getRole()));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<UserResponse> updateUserStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateStatusRequest request) {
        return ResponseEntity.ok(adminService.updateUserStatus(id, request.getEnabled()));
    }

    // --- Trainers ---

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

    // --- Bookings ---

    @GetMapping("/bookings")
    public ResponseEntity<Page<BookingResponse>> getAllBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(adminService.getAllBookings(status, pageable));
    }

    @PutMapping("/bookings/{id}/status")
    public ResponseEntity<BookingResponse> updateBookingStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateBookingStatusRequest request) {
        return ResponseEntity.ok(adminService.updateBookingStatus(id, request.getStatus()));
    }

    // --- Classes ---

    @GetMapping("/classes")
    public ResponseEntity<List<ClassSeriesResponse>> getAllClassSeries() {
        return ResponseEntity.ok(adminService.getAllClassSeries());
    }

    // --- Reviews ---

    @GetMapping("/reviews")
    public ResponseEntity<List<ReviewResponse>> getAllReviews() {
        return ResponseEntity.ok(adminService.getAllReviews());
    }

    @PutMapping("/reviews/{id}/approve")
    public ResponseEntity<ReviewResponse> approveReview(@PathVariable UUID id) {
        return ResponseEntity.ok(adminService.approveReview(id));
    }

    @PutMapping("/reviews/{id}/reject")
    public ResponseEntity<ReviewResponse> rejectReview(@PathVariable UUID id) {
        return ResponseEntity.ok(adminService.rejectReview(id));
    }

    @PutMapping("/reviews/{id}/feature")
    public ResponseEntity<ReviewResponse> toggleFeaturedReview(@PathVariable UUID id) {
        return ResponseEntity.ok(adminService.toggleFeaturedReview(id));
    }

    // --- Inquiries ---

    @GetMapping("/inquiries")
    public ResponseEntity<List<ContactInquiryResponse>> getAllInquiries() {
        return ResponseEntity.ok(adminService.getAllInquiries());
    }

    @PutMapping("/inquiries/{id}/respond")
    public ResponseEntity<ContactInquiryResponse> respondToInquiry(
            @PathVariable UUID id,
            @Valid @RequestBody InquiryRespondRequest request) {
        return ResponseEntity.ok(adminService.respondToInquiry(id, request.getResponse()));
    }

    @PutMapping("/inquiries/{id}/archive")
    public ResponseEntity<ContactInquiryResponse> archiveInquiry(@PathVariable UUID id) {
        return ResponseEntity.ok(adminService.archiveInquiry(id));
    }

    // --- Revenue ---

    @GetMapping("/revenue")
    public ResponseEntity<RevenueReportResponse> getRevenueReport() {
        return ResponseEntity.ok(adminService.getRevenueReport());
    }
}
