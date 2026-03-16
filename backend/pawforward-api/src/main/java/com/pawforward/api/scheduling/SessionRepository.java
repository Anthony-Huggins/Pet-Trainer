package com.pawforward.api.scheduling;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface SessionRepository extends JpaRepository<Session, UUID> {

    List<Session> findByTrainerIdAndSessionDateBetween(UUID trainerId, LocalDate start, LocalDate end);

    List<Session> findByClassSeriesId(UUID classSeriesId);

    List<Session> findBySessionDateAndTrainerId(LocalDate date, UUID trainerId);
}
