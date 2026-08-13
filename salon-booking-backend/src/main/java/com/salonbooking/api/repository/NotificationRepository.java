package com.salonbooking.api.repository;

import com.salonbooking.api.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByBookingIdOrderByCreatedAtDesc(UUID bookingId);

    // Fetch for Admin (receiverId is null)
    List<Notification> findByReceiverTypeOrderByCreatedAtDesc(String receiverType);

    // Fetch for Customer: matching customerId OR broadcast notifications (receiverId is null)
    @Query("SELECT n FROM Notification n WHERE n.receiverType = :receiverType AND (:receiverId IS NULL OR n.receiverId = :receiverId OR n.receiverId IS NULL) ORDER BY n.createdAt DESC")
    List<Notification> findForCustomer(@Param("receiverType") String receiverType, @Param("receiverId") UUID receiverId);

    List<Notification> findByBookingIdAndReceiverTypeAndIsReadFalse(UUID bookingId, String receiverType);

    void deleteByCreatedAtBefore(java.time.Instant cutoffDate);
}
