package com.salonbooking.api.controller;

import com.salonbooking.api.dto.ApiResponse;
import com.salonbooking.api.dto.request.UpdateBusinessSettingsRequest;
import com.salonbooking.api.dto.response.BusinessSettingsResponse;
import com.salonbooking.api.entity.Notification;
import com.salonbooking.api.enums.NotificationType;
import com.salonbooking.api.repository.NotificationRepository;
import com.salonbooking.api.service.BusinessSettingsService;
import com.salonbooking.api.service.PushNotificationService;
import com.salonbooking.api.service.WebSocketEventPublisher;
import com.salonbooking.api.util.NotificationGenerator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/business")
@RequiredArgsConstructor
@Tag(name = "Business Settings", description = "Endpoints for managing global salon settings")
public class BusinessSettingsController {

    private final BusinessSettingsService service;
    private final WebSocketEventPublisher webSocketEventPublisher;
    private final NotificationRepository notificationRepository;
    private final NotificationGenerator notificationGenerator;
    private final PushNotificationService pushNotificationService;

    @GetMapping
    @Operation(summary = "Get Business Settings", description = "Retrieves the global settings for the salon")
    public ResponseEntity<ApiResponse<BusinessSettingsResponse>> getSettings() {
        log.info("REST Request to get business settings");
        BusinessSettingsResponse response = service.getSettings();
        return ResponseEntity.ok(ApiResponse.success(response, "Business settings retrieved successfully"));
    }

    @PutMapping
    @Operation(summary = "Update Business Settings", description = "Updates the global settings for the salon")
    public ResponseEntity<ApiResponse<BusinessSettingsResponse>> updateSettings(
            @Valid @RequestBody UpdateBusinessSettingsRequest request) {
        log.info("REST Request to update business settings");
        BusinessSettingsResponse response = service.updateSettings(request);
        webSocketEventPublisher.publishBusinessUpdate(response);

        return ResponseEntity.ok(ApiResponse.success(response, "Business settings updated successfully"));
    }
}
