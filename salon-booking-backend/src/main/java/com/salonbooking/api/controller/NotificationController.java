package com.salonbooking.api.controller;

import com.salonbooking.api.dto.ApiResponse;
import com.salonbooking.api.dto.response.NotificationResponse;
import com.salonbooking.api.security.UserDetailsImpl;
import com.salonbooking.api.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Endpoints for managing booking notifications")
public class NotificationController {

    private final NotificationService notificationService;

    private UserDetailsImpl getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl) {
            return (UserDetailsImpl) auth.getPrincipal();
        }
        return null;
    }

    private boolean isAdmin(UserDetailsImpl userDetails) {
        return userDetails != null && userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    @GetMapping
    @Operation(summary = "Get Notifications", description = "Retrieves notifications for the authenticated user")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications() {
        UserDetailsImpl user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required to access notifications"));
        }

        if (isAdmin(user)) {
            List<NotificationResponse> responses = notificationService.getAdminNotifications();
            return ResponseEntity.ok(ApiResponse.success(responses, "Admin notifications retrieved successfully"));
        } else {
            List<NotificationResponse> responses = notificationService.getCustomerNotifications(user.getId());
            return ResponseEntity.ok(ApiResponse.success(responses, "Customer notifications retrieved successfully"));
        }
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark Notification as Read", description = "Marks a specific notification as read after ownership verification")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable UUID id) {
        UserDetailsImpl user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required"));
        }

        log.info("REST Request by user {} to mark notification as read: {}", user.getId(), id);
        notificationService.markAsRead(id, user);
        return ResponseEntity.ok(ApiResponse.success(null, "Notification marked as read"));
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Mark All Notifications as Read", description = "Marks all notifications for the authenticated user as read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        UserDetailsImpl user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required"));
        }

        if (isAdmin(user)) {
            log.info("REST Request by admin {} to mark all notifications as read", user.getId());
            notificationService.markAllAsRead("ADMIN", null);
        } else {
            log.info("REST Request by customer {} to mark all notifications as read", user.getId());
            notificationService.markAllAsRead("CUSTOMER", user.getId());
        }

        return ResponseEntity.ok(ApiResponse.success(null, "All notifications marked as read"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Notification", description = "Deletes a specific notification after ownership verification")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable UUID id) {
        UserDetailsImpl user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required"));
        }

        log.info("REST Request by user {} to delete notification: {}", user.getId(), id);
        notificationService.deleteNotification(id, user);
        return ResponseEntity.ok(ApiResponse.success(null, "Notification deleted successfully"));
    }

    @DeleteMapping("/clear-all")
    @Operation(summary = "Delete All Notifications", description = "Deletes all notifications for the authenticated user")
    public ResponseEntity<ApiResponse<Void>> deleteAllNotifications() {
        UserDetailsImpl user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required"));
        }

        if (isAdmin(user)) {
            log.info("REST Request by admin {} to delete all notifications", user.getId());
            notificationService.deleteAllNotifications("ADMIN", null);
        } else {
            log.info("REST Request by customer {} to delete all notifications", user.getId());
            notificationService.deleteAllNotifications("CUSTOMER", user.getId());
        }

        return ResponseEntity.ok(ApiResponse.success(null, "All notifications deleted successfully"));
    }

    @PostMapping("/announce")
    @Operation(summary = "Broadcast Announcement", description = "Broadcasts an announcement to all customers (Admin only)")
    public ResponseEntity<ApiResponse<Void>> broadcastAnnouncement(
            @jakarta.validation.Valid @RequestBody com.salonbooking.api.dto.request.AnnouncementRequest request) {
        UserDetailsImpl user = getAuthenticatedUser();
        if (user == null || !isAdmin(user)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Admin privileges required to broadcast announcements"));
        }

        log.info("REST Request by admin {} to broadcast announcement: {}", user.getId(), request.getTitle());
        notificationService.broadcastAnnouncement(request.getTitle(), request.getMessage());
        return ResponseEntity.ok(ApiResponse.success(null, "Announcement broadcasted successfully"));
    }
}
