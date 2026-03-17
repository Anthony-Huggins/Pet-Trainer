package com.pawforward.api.trainer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface TrainerAvailabilityRepository extends JpaRepository<TrainerAvailability, UUID> {

    List<TrainerAvailability> findByTrainerId(UUID trainerId);

    List<TrainerAvailability> findByTrainerIdAndAvailableTrue(UUID trainerId);

    // Recurring availability for a specific day of week
    List<TrainerAvailability> findByTrainerIdAndDayOfWeekAndRecurringTrue(UUID trainerId, short dayOfWeek);

    // Date-specific overrides (blocks or additions)
    List<TrainerAvailability> findByTrainerIdAndSpecificDate(UUID trainerId, LocalDate specificDate);
}
