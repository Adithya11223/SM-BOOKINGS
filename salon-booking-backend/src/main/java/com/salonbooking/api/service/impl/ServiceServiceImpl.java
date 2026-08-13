package com.salonbooking.api.service.impl;

import com.salonbooking.api.dto.request.CreateServiceRequest;
import com.salonbooking.api.dto.request.UpdateServiceRequest;
import com.salonbooking.api.dto.response.ServiceResponse;
import com.salonbooking.api.entity.BusinessSettings;
import com.salonbooking.api.entity.Service;
import com.salonbooking.api.exception.ResourceNotFoundException;
import com.salonbooking.api.mapper.ServiceMapper;
import com.salonbooking.api.repository.BookingItemRepository;
import com.salonbooking.api.repository.ServiceRepository;
import com.salonbooking.api.service.BusinessSettingsService;
import com.salonbooking.api.service.ServiceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.dao.DataIntegrityViolationException;

@Slf4j
@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class ServiceServiceImpl implements ServiceService {

    private final ServiceRepository repository;
    private final BookingItemRepository bookingItemRepository;
    private final ServiceMapper mapper;
    private final BusinessSettingsService businessSettingsService;
    private final com.salonbooking.api.repository.NotificationRepository notificationRepository;
    private final com.salonbooking.api.service.PushNotificationService pushNotificationService;
    private final com.salonbooking.api.service.WebSocketEventPublisher webSocketEventPublisher;

    @Override
    @Transactional(readOnly = true)
    public List<ServiceResponse> getAllVisibleServices() {
        return repository.findByIsVisibleTrueOrderByDisplayOrderAsc().stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceResponse> getAllServices() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ServiceResponse getServiceById(UUID id) {
        return mapper.toResponse(getServiceEntityById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public Service getServiceEntityById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));
    }

    @Override
    @Transactional
    @com.salonbooking.api.annotation.AuditLog(action = "Create Service")
    public ServiceResponse createService(CreateServiceRequest request) {
        BusinessSettings settings = businessSettingsService.getSettingsEntity();
        Service service = mapper.toEntity(request);
        service.setBusinessSettings(settings);
        
        Service saved = repository.save(service);
        log.info("Created new service: {}", saved.getName());

        try {
            com.salonbooking.api.entity.Notification notification = com.salonbooking.api.entity.Notification.builder()
                    .title("New Service Available!")
                    .message(String.format("Now in shree matha beauty parlor \"%s\" is available in %s services", saved.getName(), saved.getType().equals(com.salonbooking.api.enums.ServiceType.HOME_SERVICE) ? "Home" : "Salon"))
                    .type(com.salonbooking.api.enums.NotificationType.SERVICE_ADDED)
                    .receiverType("CUSTOMER")
                    .serviceId(saved.getId())
                    .build();
            notification = notificationRepository.save(notification);
            webSocketEventPublisher.publishNotificationUpdate(notification);
            pushNotificationService.sendPushNotification(notification);
        } catch (Exception e) {
            log.error("Failed to send notification for new service", e);
        }

        return mapper.toResponse(saved);
    }

    @Override
    @Transactional
    @com.salonbooking.api.annotation.AuditLog(action = "Update Service")
    public ServiceResponse updateService(UUID id, UpdateServiceRequest request) {
        Service service = getServiceEntityById(id);
        mapper.updateEntityFromRequest(request, service);
        
        Service updated = repository.save(service);
        log.info("Updated service: {}", updated.getId());
        return mapper.toResponse(updated);
    }

    @Override
    @Transactional
    @com.salonbooking.api.annotation.AuditLog(action = "Delete Service")
    public void deleteService(UUID id) {
        Service service = getServiceEntityById(id);

        // 1. Detach service from existing booking items (snapshots preserve details)
        bookingItemRepository.nullifyServiceReference(id);

        // 2. Detach from BusinessSettings collection
        if (service.getBusinessSettings() != null && service.getBusinessSettings().getServices() != null) {
            service.getBusinessSettings().getServices().remove(service);
        }

        // 3. Delete service cleanly
        repository.delete(service);
        log.info("Deleted service: {}", id);
    }
}
