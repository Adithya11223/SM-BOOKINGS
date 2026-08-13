package com.salonbooking.api.repository;

import com.salonbooking.api.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    Optional<Customer> findByPhoneNumber(String phoneNumber);
    boolean existsByPhoneNumber(String phoneNumber);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT b.customer.id) FROM Booking b WHERE b.bookingStatus = com.salonbooking.api.enums.BookingStatus.COMPLETED AND b.customer IS NOT NULL")
    Long countCustomersWithCompletedBookings();

    @org.springframework.data.jpa.repository.Query("SELECT b.customer.id FROM Booking b WHERE b.bookingStatus = com.salonbooking.api.enums.BookingStatus.COMPLETED AND b.customer IS NOT NULL GROUP BY b.customer.id HAVING COUNT(b.id) >= 2")
    java.util.List<java.util.UUID> findRepeatCustomerIds();
}
