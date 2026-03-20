package com.pawforward.api.training;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface TrainingLogRepository extends JpaRepository<TrainingLog, UUID> {

    List<TrainingLog> findByDogIdOrderByLogDateDesc(UUID dogId);

    List<TrainingLog> findByTrainerIdOrderByLogDateDesc(UUID trainerId);

    List<TrainingLog> findBySessionId(UUID sessionId);

    List<TrainingLog> findByDogIdAndLogDateBetween(UUID dogId, LocalDate from, LocalDate to);
}
