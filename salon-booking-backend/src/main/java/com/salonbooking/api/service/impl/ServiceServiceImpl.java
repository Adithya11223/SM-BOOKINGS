package com.salonbooking.api.service.impl;

import com.salonbooking.api.dto.request.CreateServiceRequest;
import com.salonbooking.api.dto.request.UpdateServiceRequest;
import com.salonbooking.api.dto.response.ServiceResponse;
import com.salonbooking.api.entity.BusinessSettings;
import com.salonbooking.api.entity.Service;
import com.salonbooking.api.exception.ResourceNotFoundException;
import com.salonbooking.api.mapper.ServiceMapper;
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
    private final ServiceMapper mapper;
    private final BusinessSettingsService businessSettingsService;
    private final com.salonbooking.api.repository.NotificationRepository notificationRepository;
    private final com.salonbooking.api.service.PushNotificationService pushNotificationService;

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
            notificationRepository.save(notification);
            pushNotificationService.sendPushNotification(notification);
        } catch (Exception e) {
            log.error("Failed to send push notification for new service", e);
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
        try {
            repository.delete(service);
            repository.flush();
            log.info("Deleted service: {}", id);
        } catch (DataIntegrityViolationException e) {
            log.warn("Service {} is referenced by bookings. Soft deleting instead.", id);
            service.setIsVisible(false);
            repository.save(service);
        }
    }
}
