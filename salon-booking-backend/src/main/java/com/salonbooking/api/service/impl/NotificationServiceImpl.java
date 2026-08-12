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
        
        for (Notification notification : notifications) {
            if (!notification.getIsRead()) {
                notification.setIsRead(true);
                notification.setReadAt(java.time.Instant.now());
            }
        }
        repository.saveAll(notifications);
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
