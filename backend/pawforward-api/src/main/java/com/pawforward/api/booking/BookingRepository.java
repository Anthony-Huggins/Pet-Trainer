package com.pawforward.api.booking;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {

    List<Booking> findByClientIdOrderByCreatedAtDesc(UUID clientId);

    List<Booking> findByClientIdAndStatus(UUID clientId, BookingStatus status);

    List<Booking> findBySessionId(UUID sessionId);

    boolean existsBySessionIdAndClientIdAndStatusNot(UUID sessionId, UUID clientId, BookingStatus excludeStatus);

    Page<Booking> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status, Pageable pageable);

    long countByCreatedAtAfter(Instant after);

    List<Booking> findTop10ByOrderByCreatedAtDesc();

    @Query("SELECT DISTINCT b.client FROM Booking b WHERE b.session.trainer.id = :trainerId AND b.status <> 'CANCELLED'")
    List<com.pawforward.api.user.User> findDistinctClientsByTrainerId(@Param("trainerId") UUID trainerId);
}
