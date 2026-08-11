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
            tokens = fcmTokenRepository.findByAdminIdIsNotNull();
        } else {
            if (notification.getReceiverId() != null) {
                tokens = fcmTokenRepository.findByCustomerId(notification.getReceiverId());
            } else {
                tokens = fcmTokenRepository.findByAdminIdIsNull();
            }
        }

        if (tokens.isEmpty()) {
            log.info("No FCM tokens found for receiver. Skipping push notification.");
            return;
        }

        List<Map<String, Object>> messages = new ArrayList<>();
        for (FcmToken fcmToken : tokens) {
            String token = fcmToken.getToken();
            if (token == null || !token.startsWith("ExponentPushToken[")) {
                log.warn("Invalid Expo push token format: {}", token);
                continue;
            }

            Map<String, Object> message = new HashMap<>();
            message.put("to", token);
            message.put("sound", "default");
            message.put("title", notification.getTitle());
            message.put("body", notification.getMessage());

            Map<String, String> data = new HashMap<>();
            data.put("notificationType", notification.getType().name());
            data.put("bookingId", notification.getBooking() != null ? notification.getBooking().getId().toString() : "");
            data.put("screen", notification.getBooking() != null ? (notification.getReceiverType().equals("ADMIN") ? "AdminBookingDetails" : "BookingDetails") : "Notifications");
            message.put("data", data);

            messages.add(message);
        }

        if (messages.isEmpty()) {
            return;
        }

        try {
            // Read optional FCM server key from environment (used by some back‑ends). Not required by Expo Push but kept for future use.
            String fcmServerKey = System.getenv("FCM_SERVER_KEY");
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Accept", "application/json");
            if (fcmServerKey != null && !fcmServerKey.isBlank()) {
                headers.set("Authorization", "key=" + fcmServerKey);
            }

            HttpEntity<List<Map<String, Object>>> request = new HttpEntity<>(messages, headers);
            String response = restTemplate.postForObject("https://exp.host/--/api/v2/push/send", request, String.class);
            log.info("Sent Expo Push notifications. Response: {}", response);
        } catch (Exception e) {
            log.error("Failed to send Expo push notifications", e);
            // If the exception contains a response body, log it for debugging
            if (e.getCause() != null) {
                log.error("Underlying cause: {}", e.getCause().getMessage());
            }
        }
    }
}
