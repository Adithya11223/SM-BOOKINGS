package com.salonbooking.api.service.impl;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.salonbooking.api.entity.FcmToken;
import com.salonbooking.api.entity.Notification;
import com.salonbooking.api.repository.FcmTokenRepository;
import com.salonbooking.api.service.PushNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PushNotificationServiceImpl implements PushNotificationService {

    private final FcmTokenRepository fcmTokenRepository;

    @Override
    public void sendPushNotification(Notification notification) {
        List<FcmToken> tokens;

        if ("ADMIN".equalsIgnoreCase(notification.getReceiverType())) {
            tokens = fcmTokenRepository.findByAdminIdIsNotNull();
        } else {
            if (notification.getReceiverId() != null) {
                tokens = fcmTokenRepository.findByCustomerId(notification.getReceiverId());
            } else {
                tokens = fcmTokenRepository.findByCustomerIdIsNotNull();
            }
        }

        if (tokens.isEmpty()) {
            log.info("No FCM tokens found for receiver. Skipping push notification.");
            return;
        }

        for (FcmToken fcmToken : tokens) {
            try {
                com.google.firebase.messaging.Notification fcmNotification = com.google.firebase.messaging.Notification.builder()
                        .setTitle(notification.getTitle())
                        .setBody(notification.getMessage())
                        .build();

                com.google.firebase.messaging.AndroidConfig androidConfig = com.google.firebase.messaging.AndroidConfig.builder()
                        .setNotification(com.google.firebase.messaging.AndroidNotification.builder()
                                .setChannelId("default")
                                .setSound("default")
                                .setColor("#FF231F7C")
                                .build())
                        .build();

                com.google.firebase.messaging.ApnsConfig apnsConfig = com.google.firebase.messaging.ApnsConfig.builder()
                        .setAps(com.google.firebase.messaging.Aps.builder()
                                .setSound("default")
                                .build())
                        .build();

                Message message = Message.builder()
                        .setNotification(fcmNotification)
                        .setAndroidConfig(androidConfig)
                        .setApnsConfig(apnsConfig)
                        .putData("title", notification.getTitle())
                        .putData("body", notification.getMessage())
                        .putData("notificationType", notification.getType().name())
                        .putData("bookingId", notification.getBooking() != null ? notification.getBooking().getId().toString() : "")
                        .putData("screen", notification.getBooking() != null ? (notification.getReceiverType().equals("ADMIN") ? "AdminBookingDetails" : "BookingDetails") : "Notifications")
                        .setToken(fcmToken.getToken())
                        .build();

                String response = FirebaseMessaging.getInstance().send(message);
                log.info("Successfully sent message to token {}: {}", fcmToken.getToken(), response);
            } catch (Exception e) {
                log.error("Failed to send push notification via FCM to token {}", fcmToken.getToken(), e);
            }
        }
    }
}
