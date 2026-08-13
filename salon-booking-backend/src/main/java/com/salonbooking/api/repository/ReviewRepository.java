package com.salonbooking.api.repository;

import com.salonbooking.api.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    
    @Query("SELECT r FROM Review r JOIN FETCH r.customer c JOIN r.service s WHERE s.id = :serviceId ORDER BY r.createdAt DESC")
    List<Review> findByServiceId(@Param("serviceId") UUID serviceId);

    Optional<Review> findByBookingIdAndServiceId(UUID bookingId, UUID serviceId);

    boolean existsByBookingIdAndServiceId(UUID bookingId, UUID serviceId);

    @Query("SELECT AVG(r.rating) FROM Review r JOIN r.service s WHERE s.id = :serviceId")
    Double getAverageRatingForService(@Param("serviceId") UUID serviceId);

    long countByServiceId(UUID serviceId);
}
