package com.salonbooking.api.repository;

import com.salonbooking.api.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByBookingIdOrderByCreatedAtDesc(UUID bookingId);

    // Fetch for Admin (receiverId is null)
    List<Notification> findByReceiverTypeOrderByCreatedAtDesc(String receiverType);

    // Fetch for specific Customer
    @org.springframework.data.jpa.repository.Query("SELECT n FROM Notification n WHERE n.receiverType = :receiverType AND n.receiverId = :receiverId ORDER BY n.createdAt DESC")
    List<Notification> findForCustomer(String receiverType, UUID receiverId);

    void deleteByCreatedAtBefore(java.time.Instant cutoffDate);
}
