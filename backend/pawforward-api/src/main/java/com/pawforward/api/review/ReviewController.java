package com.pawforward.api.review;

import com.pawforward.api.review.dto.ReviewRequest;
import com.pawforward.api.review.dto.ReviewResponse;
import com.pawforward.api.security.SecurityUtils;
import com.pawforward.api.user.User;
import com.pawforward.api.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reviews")
public class ReviewController {

    private final ReviewService reviewService;
    private final UserRepository userRepository;

    public ReviewController(ReviewService reviewService, UserRepository userRepository) {
        this.reviewService = reviewService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<ReviewResponse>> getApprovedReviews() {
        return ResponseEntity.ok(reviewService.getApprovedReviews());
    }

    @GetMapping("/trainer/{trainerId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsForTrainer(@PathVariable UUID trainerId) {
        return ResponseEntity.ok(reviewService.getReviewsForTrainer(trainerId));
    }

    @GetMapping("/service/{serviceTypeId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsForServiceType(@PathVariable UUID serviceTypeId) {
        return ResponseEntity.ok(reviewService.getReviewsForServiceType(serviceTypeId));
    }

    @PostMapping
    public ResponseEntity<ReviewResponse> submitReview(@Valid @RequestBody ReviewRequest request) {
        User user = getCurrentUser();
        ReviewResponse response = reviewService.submitReview(request, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReviewResponse> getReviewById(@PathVariable UUID id) {
        return ResponseEntity.ok(reviewService.getReviewById(id));
    }

    private User getCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail()
                .orElseThrow(() -> new IllegalStateException("Not authenticated"));
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }
}
