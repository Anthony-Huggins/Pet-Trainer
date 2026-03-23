package com.pawforward.api.review.dto;

import com.pawforward.api.review.Review;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@AllArgsConstructor
@Builder
public class ReviewResponse {

    private UUID id;
    private UUID clientId;
    private String clientName;
    private UUID trainerId;
    private String trainerName;
    private UUID serviceTypeId;
    private String serviceTypeName;
    private short rating;
    private String title;
    private String body;
    private boolean featured;
    private boolean approved;
    private Instant createdAt;

    public static ReviewResponse from(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .clientId(review.getClient().getId())
                .clientName(review.getClient().getFullName())
                .trainerId(review.getTrainer() != null ? review.getTrainer().getId() : null)
                .trainerName(review.getTrainer() != null ? review.getTrainer().getUser().getFullName() : null)
                .serviceTypeId(review.getServiceType() != null ? review.getServiceType().getId() : null)
                .serviceTypeName(review.getServiceType() != null ? review.getServiceType().getName() : null)
                .rating(review.getRating())
                .title(review.getTitle())
                .body(review.getBody())
                .featured(review.isFeatured())
                .approved(review.isApproved())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
