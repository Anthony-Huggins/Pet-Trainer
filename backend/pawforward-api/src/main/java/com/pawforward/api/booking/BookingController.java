package com.pawforward.api.booking;

import com.pawforward.api.booking.dto.BookingRequest;
import com.pawforward.api.booking.dto.BookingResponse;
import com.pawforward.api.booking.dto.ClassEnrollmentRequest;
import com.pawforward.api.booking.dto.ClassEnrollmentResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // --- Private session bookings ---

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getMyBookings() {
        return ResponseEntity.ok(bookingService.getMyBookings());
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<BookingResponse> getBooking(@PathVariable UUID bookingId) {
        return ResponseEntity.ok(bookingService.getBooking(bookingId));
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody BookingRequest request) {
        BookingResponse booking = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(booking);
    }

    @PostMapping("/{bookingId}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable UUID bookingId,
            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(bookingService.cancelBooking(bookingId, reason));
    }

    // --- Class enrollments ---

    @GetMapping("/enrollments")
    public ResponseEntity<List<ClassEnrollmentResponse>> getMyEnrollments() {
        return ResponseEntity.ok(bookingService.getMyEnrollments());
    }

    @PostMapping("/enrollments")
    public ResponseEntity<ClassEnrollmentResponse> enrollInClass(
            @Valid @RequestBody ClassEnrollmentRequest request) {
        ClassEnrollmentResponse enrollment = bookingService.enrollInClass(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(enrollment);
    }

    @DeleteMapping("/enrollments/{enrollmentId}")
    public ResponseEntity<ClassEnrollmentResponse> dropEnrollment(@PathVariable UUID enrollmentId) {
        return ResponseEntity.ok(bookingService.dropEnrollment(enrollmentId));
    }
}
