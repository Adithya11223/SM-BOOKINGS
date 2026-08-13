package com.salonbooking.api.service;

import com.salonbooking.api.dto.response.NotificationResponse;
import com.salonbooking.api.security.UserDetailsImpl;

import java.util.List;
import java.util.UUID;

public interface NotificationService {
    List<NotificationResponse> getBookingNotifications(UUID bookingId);
    List<NotificationResponse> getAdminNotifications();
    List<NotificationResponse> getCustomerNotifications(UUID customerId);
    NotificationResponse markAsRead(UUID id, UserDetailsImpl userDetails);
    void markAllAsRead(String receiverType, UUID receiverId);
    void deleteNotification(UUID id, UserDetailsImpl userDetails);
    void deleteAllNotifications(String receiverType, UUID receiverId);
    void broadcastAnnouncement(String title, String message);
}
