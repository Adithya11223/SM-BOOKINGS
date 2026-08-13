package com.salonbooking.api.controller;

import com.salonbooking.api.dto.ApiResponse;
import com.salonbooking.api.entity.FcmToken;
import com.salonbooking.api.repository.FcmTokenRepository;
import com.salonbooking.api.security.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/fcm")
@RequiredArgsConstructor
@Tag(name = "FCM", description = "Endpoints for Firebase Cloud Messaging token management")
public class FcmTokenController {

    private final FcmTokenRepository fcmTokenRepository;

    @Data
    public static class FcmTokenRequest {
        private String token;
        private String deviceId;
        private String receiverType;
        private UUID customerId;
        private UUID adminId;
    }

    private UserDetailsImpl getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl) {
            return (UserDetailsImpl) auth.getPrincipal();
        }
        return null;
    }

    @PostMapping("/token")
    @Operation(summary = "Register FCM Token", description = "Registers or updates a device FCM token with authenticated identity")
    public ResponseEntity<ApiResponse<Void>> registerToken(@RequestBody FcmTokenRequest request) {
        UserDetailsImpl user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required to register device token"));
        }

        if (request.getDeviceId() == null || request.getDeviceId().isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Device ID is required"));
        }

        if (request.getToken() == null || request.getToken().isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("FCM Token is required"));
        }

        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        String receiverType = isAdmin ? "ADMIN" : "CUSTOMER";
        UUID customerId = isAdmin ? null : user.getId();
        UUID adminId = isAdmin ? user.getId() : null;

        log.info("Received FCM token registration for device: {} (user: {}, role: {})", 
                request.getDeviceId(), user.getId(), receiverType);

        Optional<FcmToken> existingToken = fcmTokenRepository.findByDeviceId(request.getDeviceId());

        FcmToken fcmToken;
        if (existingToken.isPresent()) {
            fcmToken = existingToken.get();
            fcmToken.setToken(request.getToken());
            fcmToken.setCustomerId(customerId);
            fcmToken.setAdminId(adminId);
            fcmToken.setReceiverType(receiverType);
        } else {
            fcmToken = FcmToken.builder()
                    .token(request.getToken())
                    .deviceId(request.getDeviceId())
                    .customerId(customerId)
                    .adminId(adminId)
                    .receiverType(receiverType)
                    .build();
        }

        fcmTokenRepository.save(fcmToken);
        log.info("Saved FCM token for device {} associated with user {}", request.getDeviceId(), user.getId());
        return ResponseEntity.ok(ApiResponse.success(null, "Token registered successfully"));
    }

    @PostMapping("/token/unregister")
    @Operation(summary = "Unregister FCM Token", description = "Detaches or removes a device FCM token on logout with ownership verification")
    public ResponseEntity<ApiResponse<Void>> unregisterToken(@RequestBody FcmTokenRequest request) {
        UserDetailsImpl user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required to unregister device token"));
        }

        if (request.getDeviceId() == null || request.getDeviceId().isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Device ID is required"));
        }

        log.info("Received FCM token unregistration for device: {} by user: {}", request.getDeviceId(), user.getId());

        Optional<FcmToken> existingToken = fcmTokenRepository.findByDeviceId(request.getDeviceId());
        if (existingToken.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.success(null, "Token not found or already detached"));
        }

        FcmToken fcmToken = existingToken.get();
        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        boolean isOwner;
        if (isAdmin) {
            isOwner = fcmToken.getAdminId() != null && fcmToken.getAdminId().equals(user.getId());
        } else {
            isOwner = fcmToken.getCustomerId() != null && fcmToken.getCustomerId().equals(user.getId());
        }

        if (!isOwner) {
            log.warn("Unauthorized attempt by user {} to unregister device token for device {}", user.getId(), request.getDeviceId());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("You are not authorized to unregister this device token"));
        }

        fcmToken.setCustomerId(null);
        fcmToken.setAdminId(null);
        fcmTokenRepository.save(fcmToken);
        log.info("Successfully detached device token for device {} from user {}", request.getDeviceId(), user.getId());
        return ResponseEntity.ok(ApiResponse.success(null, "Token unregistered successfully"));
    }
}
