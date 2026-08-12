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
}
