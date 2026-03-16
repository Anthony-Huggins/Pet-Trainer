package com.pawforward.api.booking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {

    List<Booking> findByClientIdOrderByCreatedAtDesc(UUID clientId);

    List<Booking> findByClientIdAndStatus(UUID clientId, BookingStatus status);

    List<Booking> findBySessionId(UUID sessionId);

    boolean existsBySessionIdAndClientIdAndStatusNot(UUID sessionId, UUID clientId, BookingStatus excludeStatus);
}
