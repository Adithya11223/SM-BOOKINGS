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
                .message(String.format("New order received! You got an order from %s for %s.", booking.getCustomer().getName(), services))
                .type(NotificationType.BOOKING_CREATED)
                .receiverType("ADMIN")
                .receiverId(null)
                .booking(booking)
                .isRead(false)
                .build();
    }

    public Notification generateBookingStatusUpdatedNotification(Booking booking) {
        String services = booking.getItems().stream()
                .map(item -> item.getService().getName())
                .collect(Collectors.joining(", "));

        String message;
        if (booking.getBookingStatus() == com.salonbooking.api.enums.BookingStatus.CONFIRMED) {
            message = String.format("Dear %s, your booking for %s has been accepted!", booking.getCustomer().getName(), services);
        } else if (booking.getBookingStatus() == com.salonbooking.api.enums.BookingStatus.COMPLETED) {
            message = String.format("Dear %s, your booking is completed. Please visit again!", booking.getCustomer().getName());
        } else if (booking.getBookingStatus() == com.salonbooking.api.enums.BookingStatus.CANCELLED) {
            message = String.format("Dear %s, unfortunately your booking for %s has been cancelled.", booking.getCustomer().getName(), services);
        } else {
            message = String.format("Booking %s status changed to %s.", booking.getBookingNumber(), booking.getBookingStatus());
        }

        return Notification.builder()
                .title("Booking Status Updated")
                .message(message)
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
