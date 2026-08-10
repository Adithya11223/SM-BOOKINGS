package com.salonbooking.api.repository;

import com.salonbooking.api.entity.FcmToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FcmTokenRepository extends JpaRepository<FcmToken, UUID> {
    Optional<FcmToken> findByToken(String token);
    Optional<FcmToken> findByDeviceId(String deviceId);
    
    List<FcmToken> findByAdminIdIsNotNull();
    List<FcmToken> findByCustomerId(UUID customerId);
    List<FcmToken> findByCustomerIdIsNotNull(); // All customers
}
