package com.pawforward.api.payment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PackageRepository extends JpaRepository<TrainingPackage, UUID> {

    List<TrainingPackage> findByActiveTrue();
}
