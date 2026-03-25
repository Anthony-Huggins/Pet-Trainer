package com.pawforward.api.review;

import com.pawforward.api.review.dto.ReviewRequest;
import com.pawforward.api.review.dto.ReviewResponse;
import com.pawforward.api.service.ServiceType;
import com.pawforward.api.service.ServiceTypeRepository;
import com.pawforward.api.trainer.TrainerProfile;
import com.pawforward.api.trainer.TrainerProfileRepository;
import com.pawforward.api.user.User;
import com.pawforward.api.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final TrainerProfileRepository trainerProfileRepository;
    private final ServiceTypeRepository serviceTypeRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         UserRepository userRepository,
                         TrainerProfileRepository trainerProfileRepository,
                         ServiceTypeRepository serviceTypeRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.trainerProfileRepository = trainerProfileRepository;
        this.serviceTypeRepository = serviceTypeRepository;
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getApprovedReviews() {
        return reviewRepository.findByApprovedTrueOrderByCreatedAtDesc().stream()
                .map(ReviewResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsForTrainer(UUID trainerId) {
        return reviewRepository.findByTrainerIdAndApprovedTrueOrderByCreatedAtDesc(trainerId).stream()
                .map(ReviewResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsForServiceType(UUID serviceTypeId) {
        return reviewRepository.findByServiceTypeIdAndApprovedTrueOrderByCreatedAtDesc(serviceTypeId).stream()
                .map(ReviewResponse::from)
                .toList();
    }

    @Transactional
    public ReviewResponse submitReview(ReviewRequest request, UUID clientId) {
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        TrainerProfile trainer = null;
        if (request.getTrainerId() != null) {
            trainer = trainerProfileRepository.findById(request.getTrainerId())
                    .orElseThrow(() -> new EntityNotFoundException("Trainer not found"));
        }

        ServiceType serviceType = null;
        if (request.getServiceTypeId() != null) {
            serviceType = serviceTypeRepository.findById(request.getServiceTypeId())
                    .orElseThrow(() -> new EntityNotFoundException("Service type not found"));
        }

        Review review = Review.builder()
                .client(client)
                .trainer(trainer)
                .serviceType(serviceType)
                .rating(request.getRating().shortValue())
                .title(request.getTitle())
                .body(request.getBody())
                .approved(false)
                .featured(false)
                .build();

        review = reviewRepository.save(review);
        return ReviewResponse.from(review);
    }

    @Transactional(readOnly = true)
    public ReviewResponse getReviewById(UUID id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Review not found"));
        return ReviewResponse.from(review);
    }

    @Transactional
    public ReviewResponse approveReview(UUID id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Review not found"));
        review.setApproved(true);
        review = reviewRepository.save(review);
        return ReviewResponse.from(review);
    }

    @Transactional
    public void rejectReview(UUID id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Review not found"));
        reviewRepository.delete(review);
    }

    @Transactional
    public ReviewResponse toggleFeatured(UUID id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Review not found"));
        review.setFeatured(!review.isFeatured());
        review = reviewRepository.save(review);
        return ReviewResponse.from(review);
    }
}
