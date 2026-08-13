package com.salonbooking.api.repository;

import com.salonbooking.api.entity.BookingItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface BookingItemRepository extends JpaRepository<BookingItem, UUID> {
    @Modifying
    @Query("UPDATE BookingItem b SET b.service = null WHERE b.service.id = :serviceId")
    void nullifyServiceReference(@Param("serviceId") UUID serviceId);
}
