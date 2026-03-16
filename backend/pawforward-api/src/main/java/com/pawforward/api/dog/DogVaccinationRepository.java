package com.pawforward.api.dog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DogVaccinationRepository extends JpaRepository<DogVaccination, UUID> {

    List<DogVaccination> findByDogId(UUID dogId);
}
