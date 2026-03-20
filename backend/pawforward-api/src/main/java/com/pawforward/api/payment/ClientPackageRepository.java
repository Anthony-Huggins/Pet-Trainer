package com.pawforward.api.payment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ClientPackageRepository extends JpaRepository<ClientPackage, UUID> {

    List<ClientPackage> findByClientIdAndStatus(UUID clientId, String status);

    List<ClientPackage> findByClientIdOrderByPurchasedAtDesc(UUID clientId);
}
