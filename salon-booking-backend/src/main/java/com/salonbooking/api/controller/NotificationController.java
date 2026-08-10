package com.salonbooking.api.controller;

import com.salonbooking.api.dto.ApiResponse;
import com.salonbooking.api.dto.response.NotificationResponse;
import com.salonbooking.api.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;

import java.util.List;
import java.util.UUID;

import com.salonbooking.api.service.WebSocketEventPublisher;

@Slf4j
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Endpoints for managing booking notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final WebSocketEventPublisher webSocketEventPublisher;

    @GetMapping
    @Operation(summary = "Get Notifications", description = "Retrieves notifications based on receiver type and ID")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications(
            @RequestParam(required = false) String receiverType,
            @RequestParam(required = false) UUID receiverId) {
        log.info("REST Request to get notifications for receiverType: {}, receiverId: {}", receiverType, receiverId);
        List<NotificationResponse> responses;
        if ("ADMIN".equalsIgnoreCase(receiverType)) {
            responses = notificationService.getAdminNotifications();
        } else {
            responses = notificationService.getCustomerNotifications(receiverId);
        }
        return ResponseEntity.ok(ApiResponse.success(responses, "Notifications retrieved successfully"));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark Notification as Read", description = "Marks a specific notification as read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable UUID id) {
        log.info("REST Request to mark notification as read: {}", id);
        NotificationResponse readNotification = notificationService.markAsRead(id);
        webSocketEventPublisher.publishNotificationUpdate(readNotification);
        return ResponseEntity.ok(ApiResponse.success(null, "Notification marked as read"));
    }
    @PatchMapping("/read-all")
    @Operation(summary = "Mark All Notifications as Read", description = "Marks all notifications for a receiver as read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @RequestParam String receiverType,
            @RequestParam(required = false) UUID receiverId) {
        log.info("REST Request to mark all notifications as read for receiverType: {}, receiverId: {}", receiverType, receiverId);
        notificationService.markAllAsRead(receiverType, receiverId);
        return ResponseEntity.ok(ApiResponse.success(null, "All notifications marked as read"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Notification", description = "Deletes a specific notification")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable UUID id) {
        log.info("REST Request to delete notification: {}", id);
        notificationService.deleteNotification(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Notification deleted successfully"));
    }

    @DeleteMapping("/clear-all")
    @Operation(summary = "Delete All Notifications", description = "Deletes all notifications for a receiver")
    public ResponseEntity<ApiResponse<Void>> deleteAllNotifications(
            @RequestParam String receiverType,
            @RequestParam(required = false) UUID receiverId) {
        log.info("REST Request to delete all notifications for receiverType: {}, receiverId: {}", receiverType, receiverId);
        notificationService.deleteAllNotifications(receiverType, receiverId);
        return ResponseEntity.ok(ApiResponse.success(null, "All notifications deleted successfully"));
    }
}
