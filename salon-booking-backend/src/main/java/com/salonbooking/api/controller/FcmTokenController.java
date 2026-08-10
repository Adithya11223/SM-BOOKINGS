package com.salonbooking.api.controller;

import com.salonbooking.api.dto.ApiResponse;
import com.salonbooking.api.entity.FcmToken;
import com.salonbooking.api.repository.FcmTokenRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
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
        private String receiverType; // ADMIN or CUSTOMER
        private UUID customerId; // Optional for anonymous customers
        private UUID adminId;    // Optional, can be derived from JWT, but keeping it explicit for now
    }

    @PostMapping("/token")
    @Operation(summary = "Register FCM Token", description = "Registers or updates a device FCM token")
    public ResponseEntity<ApiResponse<Void>> registerToken(@RequestBody FcmTokenRequest request) {
        log.info("Received FCM token registration for device: {}", request.getDeviceId());

        Optional<FcmToken> existingToken = fcmTokenRepository.findByDeviceId(request.getDeviceId());

        FcmToken fcmToken;
        if (existingToken.isPresent()) {
            fcmToken = existingToken.get();
            fcmToken.setToken(request.getToken());
            fcmToken.setCustomerId(request.getCustomerId());
            fcmToken.setAdminId(request.getAdminId());
        } else {
            fcmToken = FcmToken.builder()
                    .token(request.getToken())
                    .deviceId(request.getDeviceId())
                    .customerId(request.getCustomerId())
                    .adminId(request.getAdminId())
                    .build();
        }

        fcmTokenRepository.save(fcmToken);
        return ResponseEntity.ok(ApiResponse.success(null, "Token registered successfully"));
    }
}
