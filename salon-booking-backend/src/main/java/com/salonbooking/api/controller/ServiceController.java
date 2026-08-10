package com.salonbooking.api.controller;

import com.salonbooking.api.dto.ApiResponse;
import com.salonbooking.api.dto.request.CreateServiceRequest;
import com.salonbooking.api.dto.request.UpdateServiceRequest;
import com.salonbooking.api.dto.response.PageResponse;
import com.salonbooking.api.dto.response.ServiceResponse;
import com.salonbooking.api.enums.ServiceCategory;
import com.salonbooking.api.enums.ServiceType;
import com.salonbooking.api.service.ServiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.salonbooking.api.service.WebSocketEventPublisher;

@Slf4j
@RestController
@RequestMapping("/api/v1/services")
@RequiredArgsConstructor
@Tag(name = "Services", description = "Endpoints for managing salon services")
public class ServiceController {

    private final ServiceService serviceService;
    private final WebSocketEventPublisher webSocketEventPublisher;
    private final com.salonbooking.api.repository.NotificationRepository notificationRepository;
    private final com.salonbooking.api.util.NotificationGenerator notificationGenerator;
    private final com.salonbooking.api.service.PushNotificationService pushNotificationService;

    @GetMapping
    @Operation(summary = "Get All Services", description = "Retrieves services with optional filtering and pagination")
    public ResponseEntity<ApiResponse<PageResponse<ServiceResponse>>> getServices(
            @RequestParam(required = false) ServiceCategory category,
            @RequestParam(required = false) ServiceType type,
            @RequestParam(required = false) Boolean visible,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "displayOrder") String sort) {
        
        log.info("REST Request to get services");
        List<ServiceResponse> allServices = serviceService.getAllServices();

        // In-memory filtering
        List<ServiceResponse> filtered = allServices.stream()
                .filter(s -> category == null || s.getCategory() == category)
                .filter(s -> type == null || s.getType() == type)
                .filter(s -> visible == null || s.getIsVisible().equals(visible))
                .sorted((s1, s2) -> {
                    if ("price".equalsIgnoreCase(sort)) {
                        return s1.getPrice().compareTo(s2.getPrice());
                    }
                    return s1.getDisplayOrder().compareTo(s2.getDisplayOrder()); // default
                })
                .collect(Collectors.toList());

        // In-memory pagination
        int totalElements = filtered.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        int start = Math.min(page * size, totalElements);
        int end = Math.min((page + 1) * size, totalElements);
        List<ServiceResponse> content = filtered.subList(start, end);

        PageResponse<ServiceResponse> pageResponse = PageResponse.<ServiceResponse>builder()
                .content(content)
                .pageNumber(page)
                .pageSize(size)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .last(page >= totalPages - 1)
                .build();

        return ResponseEntity.ok(ApiResponse.success(pageResponse, "Services retrieved successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Service by ID", description = "Retrieves a specific service by its UUID")
    public ResponseEntity<ApiResponse<ServiceResponse>> getServiceById(@PathVariable UUID id) {
        log.info("REST Request to get service: {}", id);
        return ResponseEntity.ok(ApiResponse.success(serviceService.getServiceById(id), "Service retrieved successfully"));
    }

    @PostMapping
    @Operation(summary = "Create Service", description = "Creates a new salon service")
    public ResponseEntity<ApiResponse<ServiceResponse>> createService(@Valid @RequestBody CreateServiceRequest request) {
        log.info("REST Request to create service");
        ServiceResponse response = serviceService.createService(request);
        webSocketEventPublisher.publishServiceUpdate("CREATED", response);
        
        if (Boolean.TRUE.equals(response.getIsVisible())) {
            com.salonbooking.api.entity.Notification notification = notificationGenerator.generateServiceNotification(
                    "New Service Available",
                    "We've added a new service: " + response.getName(),
                    response.getId(),
                    com.salonbooking.api.enums.NotificationType.SERVICE_ADDED
            );
            notification = notificationRepository.save(notification);
            webSocketEventPublisher.publishNotificationUpdate(notification);
            pushNotificationService.sendPushNotification(notification);
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Service created successfully"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Service", description = "Updates an existing salon service")
    public ResponseEntity<ApiResponse<ServiceResponse>> updateService(
            @PathVariable UUID id, @Valid @RequestBody UpdateServiceRequest request) {
        log.info("REST Request to update service: {}", id);
        
        ServiceResponse oldService = serviceService.getServiceById(id);
        
        ServiceResponse response = serviceService.updateService(id, request);
        webSocketEventPublisher.publishServiceUpdate("UPDATED", response);

        return ResponseEntity.ok(ApiResponse.success(response, "Service updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Service", description = "Deletes a specific service by its UUID")
    public ResponseEntity<ApiResponse<Void>> deleteService(@PathVariable UUID id) {
        log.info("REST Request to delete service: {}", id);
        serviceService.deleteService(id);
        
        // We only have the ID here. For deletion, we just need to send the ID to the client.
        ServiceResponse deletedService = new ServiceResponse();
        deletedService.setId(id);
        webSocketEventPublisher.publishServiceUpdate("DELETED", deletedService);
        
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PatchMapping("/{id}/visibility")
    @Operation(summary = "Toggle Service Visibility", description = "Quickly toggles the visibility flag of a service")
    public ResponseEntity<ApiResponse<ServiceResponse>> toggleVisibility(@PathVariable UUID id, @RequestParam Boolean isVisible) {
        log.info("REST Request to toggle visibility for service: {} to {}", id, isVisible);
        
        // As per constraint "Expose existing service layer": We fetch, map to update DTO, and use existing updateService
        ServiceResponse existing = serviceService.getServiceById(id);
        
        UpdateServiceRequest request = new UpdateServiceRequest();
        request.setName(existing.getName());
        request.setDescription(existing.getDescription());
        request.setCategory(existing.getCategory());
        request.setType(existing.getType());
        request.setPrice(existing.getPrice());
        request.setDurationMinutes(existing.getDurationMinutes());
        request.setImageUrl(existing.getImageUrl());
        request.setDisplayOrder(existing.getDisplayOrder());
        request.setIsVisible(isVisible);
        
        ServiceResponse response = serviceService.updateService(id, request);
        webSocketEventPublisher.publishServiceUpdate("UPDATED", response);
        
        return ResponseEntity.ok(ApiResponse.success(response, "Service visibility updated successfully"));
    }
}
