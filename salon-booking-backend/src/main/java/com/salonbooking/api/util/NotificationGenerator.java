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
                .map(item -> item.getServiceNameSnapshot() != null ? item.getServiceNameSnapshot() : (item.getService() != null ? item.getService().getName() : "Service"))
                .collect(Collectors.joining(", "));
                
        return Notification.builder()
                .title("New Booking Received 🔔")
                .message(String.format("New order received! You got an order from %s for %s. 📅", booking.getCustomer().getName(), services))
                .type(NotificationType.BOOKING_CREATED)
                .receiverType("ADMIN")
                .receiverId(null)
                .booking(booking)
                .isRead(false)
                .build();
    }

    public Notification generateBookingStatusUpdatedNotification(Booking booking) {
        String services = booking.getItems().stream()
                .map(item -> item.getServiceNameSnapshot() != null ? item.getServiceNameSnapshot() : (item.getService() != null ? item.getService().getName() : "Service"))
                .collect(Collectors.joining(", "));

        String message;
        String title = "Booking Status Updated 📋";
        if (booking.getBookingStatus() == com.salonbooking.api.enums.BookingStatus.CONFIRMED) {
            title = "Booking Confirmed ✅";
            message = String.format("Great news %s! Your booking for %s has been accepted. We look forward to seeing you. 🎉", booking.getCustomer().getName(), services);
        } else if (booking.getBookingStatus() == com.salonbooking.api.enums.BookingStatus.COMPLETED) {
            title = "Service Completed 🌟";
            message = String.format("Thank you %s! Your booking is now completed. We hope to see you again soon! ✨", booking.getCustomer().getName());
        } else if (booking.getBookingStatus() == com.salonbooking.api.enums.BookingStatus.CANCELLED) {
            title = "Booking Cancelled ❌";
            message = String.format("Dear %s, unfortunately your booking for %s has been cancelled. Please contact us for details. 😔", booking.getCustomer().getName(), services);
        } else {
            message = String.format("Booking %s status changed to %s.", booking.getBookingNumber(), booking.getBookingStatus());
        }

        return Notification.builder()
                .title(title)
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

    public Notification generateAppointmentReminderNotification(Booking booking) {
        String services = booking.getItems().stream()
                .map(item -> item.getServiceNameSnapshot() != null ? item.getServiceNameSnapshot() : (item.getService() != null ? item.getService().getName() : "Service"))
                .collect(Collectors.joining(", "));

        String timeStr = booking.getBookingTime() != null ? booking.getBookingTime().toString() : "soon";
        String message = String.format("Reminder %s: Your upcoming appointment for %s is scheduled at %s. We look forward to seeing you! ⏰", 
                booking.getCustomer() != null ? booking.getCustomer().getName() : "Customer", services, timeStr);

        return Notification.builder()
                .title("Upcoming Appointment Reminder ⏰")
                .message(message)
                .type(NotificationType.APPOINTMENT_REMINDER)
                .receiverType("CUSTOMER")
                .receiverId(booking.getCustomer() != null ? booking.getCustomer().getId() : null)
                .booking(booking)
                .isRead(false)
                .build();
    }
}
