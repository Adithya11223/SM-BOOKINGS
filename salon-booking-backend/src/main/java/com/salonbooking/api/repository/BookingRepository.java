package com.salonbooking.api.repository;

import com.salonbooking.api.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {
    Optional<Booking> findByBookingNumber(String bookingNumber);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"customer", "items"})
    @org.springframework.data.jpa.repository.Query("SELECT b FROM Booking b")
    java.util.List<Booking> findAllBookings();

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"customer", "items"})
    java.util.List<Booking> findByBookingNumberIn(java.util.List<String> bookingNumbers);

    java.util.List<Booking> findByBookingStatusAndUpdatedAtBefore(com.salonbooking.api.enums.BookingStatus status, java.time.Instant date);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"customer", "items"})
    @org.springframework.data.jpa.repository.Query("SELECT b FROM Booking b WHERE b.bookingStatus = :status AND (b.reminderSent = false OR b.reminderSent IS NULL)")
    java.util.List<Booking> findPendingReminders(@org.springframework.data.repository.query.Param("status") com.salonbooking.api.enums.BookingStatus status);

    Long countByBookingStatus(com.salonbooking.api.enums.BookingStatus bookingStatus);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(b.totalAmount) FROM Booking b WHERE b.bookingStatus IN :statuses AND b.createdAt >= :startDate AND b.createdAt < :endDate")
    java.math.BigDecimal calculateRevenueBetween(@org.springframework.data.repository.query.Param("statuses") java.util.List<com.salonbooking.api.enums.BookingStatus> statuses, @org.springframework.data.repository.query.Param("startDate") java.time.Instant startDate, @org.springframework.data.repository.query.Param("endDate") java.time.Instant endDate);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(b.totalAmount) FROM Booking b WHERE b.bookingStatus IN :statuses AND b.bookingDate = :date")
    java.math.BigDecimal calculateRevenueForDate(@org.springframework.data.repository.query.Param("statuses") java.util.List<com.salonbooking.api.enums.BookingStatus> statuses, @org.springframework.data.repository.query.Param("date") java.time.LocalDate date);

    @org.springframework.data.jpa.repository.Query("SELECT s.id, s.name, COUNT(bi.id), SUM(bi.priceSnapshot) FROM BookingItem bi JOIN bi.booking b JOIN bi.service s WHERE b.bookingStatus IN :statuses GROUP BY s.id, s.name ORDER BY COUNT(bi.id) DESC")
    java.util.List<Object[]> findTopPopularServices(@org.springframework.data.repository.query.Param("statuses") java.util.List<com.salonbooking.api.enums.BookingStatus> statuses, org.springframework.data.domain.Pageable pageable);
}
