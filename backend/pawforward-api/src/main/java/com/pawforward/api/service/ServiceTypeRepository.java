package com.pawforward.api.service;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ServiceTypeRepository extends JpaRepository<ServiceType, UUID> {

    List<ServiceType> findByActiveTrueOrderBySortOrder();

    List<ServiceType> findByCategoryAndActiveTrueOrderBySortOrder(ServiceCategory category);
}
