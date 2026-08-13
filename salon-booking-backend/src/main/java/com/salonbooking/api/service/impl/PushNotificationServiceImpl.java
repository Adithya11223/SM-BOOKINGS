package com.salonbooking.api.service.impl;

import com.salonbooking.api.entity.FcmToken;
import com.salonbooking.api.entity.Notification;
import com.salonbooking.api.repository.FcmTokenRepository;
import com.salonbooking.api.service.PushNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PushNotificationServiceImpl implements PushNotificationService {

    private final FcmTokenRepository fcmTokenRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public void sendPushNotification(Notification notification) {
        List<FcmToken> tokens;

        if ("ADMIN".equalsIgnoreCase(notification.getReceiverType())) {
            tokens = fcmTokenRepository.findAdminTokens();
            log.info("Found {} admin push token(s)", tokens.size());
        } else {
            if (notification.getReceiverId() != null) {
                tokens = fcmTokenRepository.findByCustomerId(notification.getReceiverId());
            } else {
                tokens = fcmTokenRepository.findCustomerTokens();
            }
            log.info("Found {} customer push token(s)", tokens.size());
        }

        if (tokens.isEmpty()) {
            log.info("No push tokens found for receiverType={} receiverId={}. Skipping push notification.", 
                    notification.getReceiverType(), notification.getReceiverId());
            return;
        }

        List<Map<String, Object>> messages = new ArrayList<>();
        for (FcmToken fcmToken : tokens) {
            if (fcmToken == null || fcmToken.getToken() == null || fcmToken.getToken().isBlank()) {
                continue;
            }
            // Support ExponentPushToken[...], ExpoPushToken[...], or any Expo format
            String trimmedToken = fcmToken.getToken().trim();
            if (trimmedToken.isEmpty()) {
                log.warn("Skipping empty push token");
                continue;
            }

            Map<String, Object> message = new HashMap<>();
            message.put("to", trimmedToken);
            message.put("sound", "default");
            message.put("title", notification.getTitle());
            message.put("body", notification.getMessage());
            message.put("channelId", "default");
            message.put("priority", "high");
            message.put("_displayInForeground", true);

            Map<String, String> data = new HashMap<>();
            data.put("id", notification.getId() != null ? notification.getId().toString() : "");
            data.put("title", notification.getTitle() != null ? notification.getTitle() : "");
            data.put("message", notification.getMessage() != null ? notification.getMessage() : "");
            data.put("notificationType", notification.getType() != null ? notification.getType().name() : "GENERAL");
            data.put("bookingId", notification.getBooking() != null ? notification.getBooking().getId().toString() : "");
            data.put("serviceId", notification.getServiceId() != null ? notification.getServiceId().toString() : "");

            String targetScreen = "Notifications";
            if (notification.getBooking() != null) {
                targetScreen = notification.getReceiverType().equalsIgnoreCase("ADMIN") ? "AdminBookingDetails" : "BookingDetails";
            } else if (notification.getServiceId() != null) {
                targetScreen = "ServiceDetails";
            }
            data.put("screen", targetScreen);
            data.put("createdAt", notification.getCreatedAt() != null ? notification.getCreatedAt().toString() : java.time.Instant.now().toString());
            message.put("data", data);

            messages.add(message);
        }

        if (messages.isEmpty()) {
            log.warn("No valid Expo push tokens found after filtering");
            return;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Accept", "application/json");

            // Optional Expo Access Token if configured
            String expoAccessToken = System.getenv("EXPO_ACCESS_TOKEN");
            if (expoAccessToken != null && !expoAccessToken.isBlank()) {
                headers.set("Authorization", "Bearer " + expoAccessToken.trim());
            }

            HttpEntity<List<Map<String, Object>>> request = new HttpEntity<>(messages, headers);
            String response = restTemplate.postForObject("https://exp.host/--/api/v2/push/send", request, String.class);
            log.info("Successfully pushed {} notification(s) via Expo. Response: {}", messages.size(), response);
        } catch (Exception e) {
            log.error("Failed to send Expo push notifications: {}", e.getMessage(), e);
            if (e.getCause() != null) {
                log.error("Underlying cause: {}", e.getCause().getMessage());
            }
        }
    }
}
