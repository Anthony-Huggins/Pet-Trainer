package com.pawforward.api.scheduling;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface SessionRepository extends JpaRepository<Session, UUID> {

    List<Session> findByTrainerIdAndSessionDateBetween(UUID trainerId, LocalDate start, LocalDate end);

    List<Session> findByClassSeriesId(UUID classSeriesId);

    List<Session> findBySessionDateAndTrainerId(LocalDate date, UUID trainerId);

    // Find sessions that overlap with a proposed time range for a trainer on a given date
    @Query("SELECT s FROM Session s WHERE s.trainer.id = :trainerId " +
           "AND s.sessionDate = :date " +
           "AND s.status <> com.pawforward.api.scheduling.SessionStatus.CANCELLED " +
           "AND s.startTime < :endTime AND s.endTime > :startTime")
    List<Session> findConflictingSessions(
            @Param("trainerId") UUID trainerId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);
}
