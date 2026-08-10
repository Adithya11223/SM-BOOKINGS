package com.salonbooking.api.dto.response;

import com.salonbooking.api.enums.NotificationType;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class NotificationResponse {
    private UUID id;
    private String title;
    private String message;
    private NotificationType type;
    private Boolean isRead;
    private Instant createdAt;
    private UUID bookingId; // Just the ID for simple navigation
    private String receiverType;
    private UUID receiverId;
    private UUID serviceId;
    private Instant readAt;
}
