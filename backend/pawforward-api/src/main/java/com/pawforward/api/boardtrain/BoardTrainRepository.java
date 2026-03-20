package com.pawforward.api.boardtrain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BoardTrainRepository extends JpaRepository<BoardTrainProgram, UUID> {

    List<BoardTrainProgram> findByClientIdOrderByCreatedAtDesc(UUID clientId);

    List<BoardTrainProgram> findByTrainerIdOrderByStartDateDesc(UUID trainerId);

    List<BoardTrainProgram> findByStatus(BoardTrainStatus status);

    List<BoardTrainProgram> findByDogId(UUID dogId);
}
