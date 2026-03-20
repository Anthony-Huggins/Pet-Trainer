package com.pawforward.api.training;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TrainingMediaRepository extends JpaRepository<TrainingMedia, UUID> {

    List<TrainingMedia> findByTrainingLogId(UUID trainingLogId);

    List<TrainingMedia> findByDogId(UUID dogId);
}
