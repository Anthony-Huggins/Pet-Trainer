package com.pawforward.api.review;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {

    List<Review> findByApprovedTrueOrderByCreatedAtDesc();

    List<Review> findAllByOrderByCreatedAtDesc();

    List<Review> findByTrainerId(UUID trainerId);

    List<Review> findByServiceTypeIdAndApprovedTrueOrderByCreatedAtDesc(UUID serviceTypeId);

    List<Review> findByTrainerIdAndApprovedTrueOrderByCreatedAtDesc(UUID trainerId);
}
