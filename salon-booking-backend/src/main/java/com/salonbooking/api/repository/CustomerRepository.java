package com.salonbooking.api.repository;

import com.salonbooking.api.entity.Customer;
import com.salonbooking.api.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    Optional<Customer> findByPhoneNumber(String phoneNumber);
    boolean existsByPhoneNumber(String phoneNumber);

    @Query("SELECT COUNT(DISTINCT b.customer.id) FROM Booking b WHERE b.bookingStatus = :status AND b.customer IS NOT NULL")
    Long countCustomersWithCompletedBookings(@Param("status") BookingStatus status);

    @Query("SELECT b.customer.id FROM Booking b WHERE b.bookingStatus = :status AND b.customer IS NOT NULL GROUP BY b.customer.id HAVING COUNT(b.id) >= 2")
    List<UUID> findRepeatCustomerIds(@Param("status") BookingStatus status);
}
