package com.pawforward.api.scheduling;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ClassSeriesRepository extends JpaRepository<ClassSeries, UUID> {

    List<ClassSeries> findByStatusAndStartDateAfterOrderByStartDate(ClassSeriesStatus status, LocalDate date);

    List<ClassSeries> findByStatusInOrderByStartDate(List<ClassSeriesStatus> statuses);
}
