package com.pawforward.api.training;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TrainingGoalRepository extends JpaRepository<TrainingGoal, UUID> {

    List<TrainingGoal> findByDogIdOrderByCreatedAtDesc(UUID dogId);

    List<TrainingGoal> findByDogIdAndStatus(UUID dogId, GoalStatus status);

    List<TrainingGoal> findByTrainerIdOrderByCreatedAtDesc(UUID trainerId);
}
