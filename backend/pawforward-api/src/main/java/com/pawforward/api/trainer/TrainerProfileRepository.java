package com.pawforward.api.trainer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TrainerProfileRepository extends JpaRepository<TrainerProfile, UUID> {

    Optional<TrainerProfile> findByUserId(UUID userId);

    List<TrainerProfile> findByAcceptingClientsTrue();
}
