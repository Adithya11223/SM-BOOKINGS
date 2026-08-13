package com.salonbooking.api.service.impl;

import com.salonbooking.api.dto.response.NotificationResponse;
import com.salonbooking.api.entity.Notification;
import com.salonbooking.api.exception.ResourceNotFoundException;
import com.salonbooking.api.mapper.NotificationMapper;
import com.salonbooking.api.repository.NotificationRepository;
import com.salonbooking.api.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.springframework.scheduling.annotation.Scheduled;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository repository;
    private final NotificationMapper mapper;
    private final com.salonbooking.api.util.NotificationGenerator notificationGenerator;
    private final com.salonbooking.api.service.WebSocketEventPublisher webSocketEventPublisher;
    private final com.salonbooking.api.service.PushNotificationService pushNotificationService;
    private final com.salonbooking.api.repository.CustomerRepository customerRepository;

    private final com.salonbooking.api.repository.BookingUpdateRepository bookingUpdateRepository;
    private final com.salonbooking.api.repository.BookingRepository bookingRepository;
    private final com.salonbooking.api.mapper.BookingMapper bookingMapper;

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getBookingNotifications(UUID bookingId) {
        return repository.findByBookingIdOrderByCreatedAtDesc(bookingId).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getAdminNotifications() {
        return repository.findByReceiverTypeOrderByCreatedAtDesc("ADMIN").stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getCustomerNotifications(UUID customerId) {
        return repository.findForCustomer("CUSTOMER", customerId).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public NotificationResponse markAsRead(UUID id) {
        Notification notification = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notification.setIsRead(true);
        notification.setReadAt(java.time.Instant.now());
        notification = repository.save(notification);

        // If this notification is tied to a booking, also mark that booking's unread indicator as read
        if (notification.getBooking() != null) {
            UUID bookingId = notification.getBooking().getId();
            com.salonbooking.api.enums.TargetRole targetRole = "ADMIN".equalsIgnoreCase(notification.getReceiverType()) 
                    ? com.salonbooking.api.enums.TargetRole.ADMIN 
                    : com.salonbooking.api.enums.TargetRole.CUSTOMER;
            
            List<com.salonbooking.api.entity.BookingUpdate> updates = 
                    bookingUpdateRepository.findByBookingIdAndTargetRoleAndIsReadFalse(bookingId, targetRole);
            if (!updates.isEmpty()) {
                updates.forEach(u -> u.setRead(true));
                bookingUpdateRepository.saveAll(updates);
            }
            bookingRepository.findById(bookingId).ifPresent(b -> {
                webSocketEventPublisher.publishBookingUpdate("UPDATED", bookingMapper.toDetailResponse(b));
            });
        }

        webSocketEventPublisher.publishNotificationUpdate(notification);
        log.info("Marked notification as read: {}", id);
        return mapper.toResponse(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(String receiverType, UUID receiverId) {
        List<Notification> notifications;
        if ("ADMIN".equalsIgnoreCase(receiverType)) {
            notifications = repository.findByReceiverTypeOrderByCreatedAtDesc("ADMIN");
        } else {
            notifications = repository.findForCustomer("CUSTOMER", receiverId);
        }
        
        com.salonbooking.api.enums.TargetRole targetRole = "ADMIN".equalsIgnoreCase(receiverType) 
                ? com.salonbooking.api.enums.TargetRole.ADMIN 
                : com.salonbooking.api.enums.TargetRole.CUSTOMER;

        java.util.Set<UUID> touchedBookingIds = new java.util.HashSet<>();

        for (Notification notification : notifications) {
            if (!notification.getIsRead()) {
                notification.setIsRead(true);
                notification.setReadAt(java.time.Instant.now());
                if (notification.getBooking() != null) {
                    touchedBookingIds.add(notification.getBooking().getId());
                }
            }
        }
        repository.saveAll(notifications);

        for (UUID bId : touchedBookingIds) {
            List<com.salonbooking.api.entity.BookingUpdate> updates = 
                    bookingUpdateRepository.findByBookingIdAndTargetRoleAndIsReadFalse(bId, targetRole);
            if (!updates.isEmpty()) {
                updates.forEach(u -> u.setRead(true));
                bookingUpdateRepository.saveAll(updates);
            }
            bookingRepository.findById(bId).ifPresent(b -> {
                webSocketEventPublisher.publishBookingUpdate("UPDATED", bookingMapper.toDetailResponse(b));
            });
        }

        log.info("Marked all notifications as read for receiverType={}, receiverId={}", receiverType, receiverId);
    }

    @Override
    @Transactional
    public void deleteNotification(UUID id) {
        Notification notification = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        repository.delete(notification);
        log.info("Deleted notification: {}", id);
    }

    @Override
    @Transactional
    public void deleteAllNotifications(String receiverType, UUID receiverId) {
        List<Notification> notifications;
        if ("ADMIN".equalsIgnoreCase(receiverType)) {
            notifications = repository.findByReceiverTypeOrderByCreatedAtDesc("ADMIN");
        } else {
            notifications = repository.findForCustomer("CUSTOMER", receiverId);
        }
        repository.deleteAll(notifications);
        log.info("Deleted all notifications for receiverType={}, receiverId={}", receiverType, receiverId);
    }

    @Override
    @Transactional
    public void broadcastAnnouncement(String title, String message) {
        List<com.salonbooking.api.entity.Customer> customers = customerRepository.findAll();
        for (com.salonbooking.api.entity.Customer customer : customers) {
            Notification notification = notificationGenerator.generateBusinessNotification(
                title, message, com.salonbooking.api.enums.NotificationType.PROMOTIONAL
            );
            notification.setReceiverId(customer.getId());
            notification = repository.save(notification);
            webSocketEventPublisher.publishNotificationUpdate(notification);
        }
        
        // Push notification logic can just use a dummy notification since it looks for fcm tokens
        Notification broadcastNotif = notificationGenerator.generateBusinessNotification(
            title, message, com.salonbooking.api.enums.NotificationType.PROMOTIONAL
        );
        pushNotificationService.sendPushNotification(broadcastNotif);
        
        log.info("Broadcast announcement: {}", title);
    }

    @Scheduled(cron = "0 0 0 * * *") // Runs daily at midnight
    @Transactional
    public void deleteOldNotifications() {
        Instant sevenDaysAgo = Instant.now().minus(7, ChronoUnit.DAYS);
        repository.deleteByCreatedAtBefore(sevenDaysAgo);
        log.info("Automatically deleted notifications older than 7 days (before {})", sevenDaysAgo);
    }
}
