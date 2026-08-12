package com.salonbooking.api.repository;

import com.salonbooking.api.entity.BookingUpdate;
import com.salonbooking.api.entity.enums.TargetRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BookingUpdateRepository extends JpaRepository<BookingUpdate, UUID> {
    List<BookingUpdate> findByBookingIdAndTargetRoleAndIsReadFalse(UUID bookingId, TargetRole targetRole);
    void deleteByBookingId(UUID bookingId);
}
