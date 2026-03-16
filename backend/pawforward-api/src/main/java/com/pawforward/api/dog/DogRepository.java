package com.pawforward.api.dog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DogRepository extends JpaRepository<Dog, UUID> {

    List<Dog> findByOwnerId(UUID ownerId);
}
