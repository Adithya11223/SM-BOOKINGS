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

    @Query("SELECT COUNT(DISTINCT c.id) FROM Booking b JOIN b.customer c WHERE b.bookingStatus = :status")
    Long countCustomersWithCompletedBookings(@Param("status") BookingStatus status);

    @Query("SELECT c.id FROM Booking b JOIN b.customer c WHERE b.bookingStatus = :status GROUP BY c.id HAVING COUNT(b.id) >= 2")
    List<UUID> findRepeatCustomerIds(@Param("status") BookingStatus status);
}
