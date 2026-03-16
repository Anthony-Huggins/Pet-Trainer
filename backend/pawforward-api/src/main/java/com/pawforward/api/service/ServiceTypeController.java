package com.pawforward.api.service;

import com.pawforward.api.service.dto.ServiceTypeRequest;
import com.pawforward.api.service.dto.ServiceTypeResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/services")
public class ServiceTypeController {

    private final ServiceTypeService serviceTypeService;

    public ServiceTypeController(ServiceTypeService serviceTypeService) {
        this.serviceTypeService = serviceTypeService;
    }

    /**
     * Public endpoint - lists all active services.
     * Optionally filter by category.
     */
    @GetMapping
    public ResponseEntity<List<ServiceTypeResponse>> getServices(
            @RequestParam(required = false) ServiceCategory category) {
        List<ServiceTypeResponse> services;
        if (category != null) {
            services = serviceTypeService.getServicesByCategory(category);
        } else {
            services = serviceTypeService.getAllActiveServices();
        }
        return ResponseEntity.ok(services);
    }

    /**
     * Public endpoint - get a single service by ID.
     */
    @GetMapping("/{serviceId}")
    public ResponseEntity<ServiceTypeResponse> getService(@PathVariable UUID serviceId) {
        return ResponseEntity.ok(serviceTypeService.getService(serviceId));
    }

    /**
     * Admin-only: list all services including inactive.
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ServiceTypeResponse>> getAllServices() {
        return ResponseEntity.ok(serviceTypeService.getAllServices());
    }

    /**
     * Admin-only: create a new service type.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceTypeResponse> createService(@Valid @RequestBody ServiceTypeRequest request) {
        ServiceTypeResponse service = serviceTypeService.createService(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(service);
    }

    /**
     * Admin-only: update a service type.
     */
    @PutMapping("/{serviceId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceTypeResponse> updateService(@PathVariable UUID serviceId,
                                                              @Valid @RequestBody ServiceTypeRequest request) {
        return ResponseEntity.ok(serviceTypeService.updateService(serviceId, request));
    }

    /**
     * Admin-only: delete a service type.
     */
    @DeleteMapping("/{serviceId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteService(@PathVariable UUID serviceId) {
        serviceTypeService.deleteService(serviceId);
        return ResponseEntity.noContent().build();
    }
}
