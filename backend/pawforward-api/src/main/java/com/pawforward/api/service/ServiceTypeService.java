package com.pawforward.api.service;

import com.pawforward.api.service.dto.ServiceTypeRequest;
import com.pawforward.api.service.dto.ServiceTypeResponse;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ServiceTypeService {

    private final ServiceTypeRepository serviceTypeRepository;

    public ServiceTypeService(ServiceTypeRepository serviceTypeRepository) {
        this.serviceTypeRepository = serviceTypeRepository;
    }

    @Transactional(readOnly = true)
    public List<ServiceTypeResponse> getAllActiveServices() {
        return serviceTypeRepository.findByActiveTrueOrderBySortOrder().stream()
                .map(ServiceTypeResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ServiceTypeResponse> getServicesByCategory(ServiceCategory category) {
        return serviceTypeRepository.findByCategoryAndActiveTrueOrderBySortOrder(category).stream()
                .map(ServiceTypeResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ServiceTypeResponse getService(UUID serviceId) {
        ServiceType service = findById(serviceId);
        return ServiceTypeResponse.from(service);
    }

    @Transactional(readOnly = true)
    public List<ServiceTypeResponse> getAllServices() {
        return serviceTypeRepository.findAll().stream()
                .map(ServiceTypeResponse::from)
                .toList();
    }

    @Transactional
    public ServiceTypeResponse createService(ServiceTypeRequest request) {
        ServiceType service = ServiceType.builder()
                .name(request.getName().trim())
                .category(request.getCategory())
                .description(request.getDescription())
                .durationMinutes(request.getDurationMinutes())
                .maxParticipants(request.getMaxParticipants())
                .price(request.getPrice())
                .depositAmount(request.getDepositAmount())
                .active(request.getActive() != null ? request.getActive() : true)
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .imageUrl(request.getImageUrl())
                .build();

        service = serviceTypeRepository.save(service);
        return ServiceTypeResponse.from(service);
    }

    @Transactional
    public ServiceTypeResponse updateService(UUID serviceId, ServiceTypeRequest request) {
        ServiceType service = findById(serviceId);

        service.setName(request.getName().trim());
        service.setCategory(request.getCategory());
        service.setDescription(request.getDescription());
        service.setDurationMinutes(request.getDurationMinutes());
        service.setMaxParticipants(request.getMaxParticipants());
        service.setPrice(request.getPrice());
        service.setDepositAmount(request.getDepositAmount());
        if (request.getActive() != null) {
            service.setActive(request.getActive());
        }
        if (request.getSortOrder() != null) {
            service.setSortOrder(request.getSortOrder());
        }
        service.setImageUrl(request.getImageUrl());

        service = serviceTypeRepository.save(service);
        return ServiceTypeResponse.from(service);
    }

    @Transactional
    public void deleteService(UUID serviceId) {
        ServiceType service = findById(serviceId);
        serviceTypeRepository.delete(service);
    }

    private ServiceType findById(UUID serviceId) {
        return serviceTypeRepository.findById(serviceId)
                .orElseThrow(() -> new EntityNotFoundException("Service not found"));
    }
}
