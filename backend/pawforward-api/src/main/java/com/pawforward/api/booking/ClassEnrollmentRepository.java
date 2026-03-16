package com.pawforward.api.booking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ClassEnrollmentRepository extends JpaRepository<ClassEnrollment, UUID> {

    List<ClassEnrollment> findByClientId(UUID clientId);

    List<ClassEnrollment> findByClassSeriesId(UUID classSeriesId);

    boolean existsByClassSeriesIdAndClientIdAndStatusNot(UUID classSeriesId, UUID clientId, EnrollmentStatus excludeStatus);
}
