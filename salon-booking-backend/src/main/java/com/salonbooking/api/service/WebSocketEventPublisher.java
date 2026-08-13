package com.salonbooking.api.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebSocketEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public void publishBusinessUpdate(Object businessSettings) {
        log.info("Publishing Business Update to /topic/business");
        messagingTemplate.convertAndSend("/topic/business", businessSettings);
    }

    public void publishServiceUpdate(String action, Object service) {
        log.info("Publishing Service Update [{}] to /topic/services", action);
        Map<String, Object> payload = new HashMap<>();
        payload.put("action", action);
        payload.put("data", service);
        messagingTemplate.convertAndSend("/topic/services", payload);
    }

    public void publishBookingUpdate(String action, Object booking) {
        log.info("Publishing Booking Update [{}] to /topic/bookings", action);
        Map<String, Object> payload = new HashMap<>();
        payload.put("action", action);
        payload.put("data", booking);
        messagingTemplate.convertAndSend("/topic/bookings", payload);
    }

    public void publishNotificationUpdate(com.salonbooking.api.entity.Notification notification) {
        if ("ADMIN".equalsIgnoreCase(notification.getReceiverType())) {
            log.info("Publishing Notification Update to /topic/admin/notifications");
            messagingTemplate.convertAndSend("/topic/admin/notifications", notification);
        } else {
            if (notification.getReceiverId() != null) {
                String destination = "/topic/customer/" + notification.getReceiverId() + "/notifications";
                log.info("Publishing Notification Update to {}", destination);
                messagingTemplate.convertAndSend(destination, notification);
            } else {
                log.info("Publishing Notification Update to /topic/customer/all/notifications");
                messagingTemplate.convertAndSend("/topic/customer/all/notifications", notification);
            }
        }
    }
    
    public void publishNotificationSync(String receiverType, java.util.UUID receiverId, String action) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("action", action);
        payload.put("receiverType", receiverType);
        payload.put("receiverId", receiverId);
        
        if ("ADMIN".equalsIgnoreCase(receiverType)) {
            log.info("Publishing Notification Sync [{}] to /topic/admin/notifications", action);
            messagingTemplate.convertAndSend("/topic/admin/notifications", payload);
        } else {
            if (receiverId != null) {
                String destination = "/topic/customer/" + receiverId + "/notifications";
                log.info("Publishing Notification Sync [{}] to {}", action, destination);
                messagingTemplate.convertAndSend(destination, payload);
            } else {
                messagingTemplate.convertAndSend("/topic/customer/all/notifications", payload);
            }
        }
    }
}
