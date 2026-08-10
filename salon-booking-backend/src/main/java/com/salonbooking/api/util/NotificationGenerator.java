package com.salonbooking.api.util;

import com.salonbooking.api.entity.Booking;
import com.salonbooking.api.entity.Notification;
import com.salonbooking.api.enums.NotificationType;
import org.springframework.stereotype.Component;
import java.util.stream.Collectors;

@Component
public class NotificationGenerator {

    public Notification generateBookingCreatedNotification(Booking booking) {
        String services = booking.getItems().stream()
                .map(item -> item.getService().getName())
                .collect(Collectors.joining(", "));
                
        return Notification.builder()
                .title("New Booking Received")
                .message(String.format("Booking %s (%s) has been created for %s.", booking.getBookingNumber(), services, booking.getCustomer().getName()))
                .type(NotificationType.BOOKING_CREATED)
                .receiverType("ADMIN")
                .receiverId(null)
                .booking(booking)
                .isRead(false)
                .build();
    }

    public Notification generateBookingStatusUpdatedNotification(Booking booking) {
        return Notification.builder()
                .title("Booking Status Updated")
                .message(String.format("Booking %s status changed to %s.", booking.getBookingNumber(), booking.getBookingStatus()))
                .type(NotificationType.BOOKING_UPDATED)
                .receiverType("CUSTOMER")
                .receiverId(booking.getCustomer().getId())
                .booking(booking)
                .isRead(false)
                .build();
    }

    public Notification generateServiceNotification(String title, String message, java.util.UUID serviceId, NotificationType type) {
        return Notification.builder()
                .title(title)
                .message(message)
                .type(type)
                .receiverType("CUSTOMER")
                .receiverId(null) // Broadcast to all
                .serviceId(serviceId)
                .isRead(false)
                .build();
    }

    public Notification generateBusinessNotification(String title, String message, NotificationType type) {
        return Notification.builder()
                .title(title)
                .message(message)
                .type(type)
                .receiverType("CUSTOMER")
                .receiverId(null) // Broadcast to all
                .isRead(false)
                .build();
    }
}
