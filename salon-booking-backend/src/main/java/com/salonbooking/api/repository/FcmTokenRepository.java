package com.salonbooking.api.repository;

import com.salonbooking.api.entity.FcmToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FcmTokenRepository extends JpaRepository<FcmToken, UUID> {
    Optional<FcmToken> findByToken(String token);
    Optional<FcmToken> findByDeviceId(String deviceId);
    
    @Query("SELECT f FROM FcmToken f WHERE f.adminId IS NOT NULL OR f.receiverType = 'ADMIN' OR f.receiverType = 'admin'")
    List<FcmToken> findAdminTokens();

    @Query("SELECT f FROM FcmToken f WHERE f.customerId = :customerId")
    List<FcmToken> findByCustomerId(@Param("customerId") UUID customerId);

    @Query("SELECT f FROM FcmToken f WHERE f.adminId IS NULL AND (f.receiverType IS NULL OR f.receiverType = 'CUSTOMER' OR f.receiverType = 'customer')")
    List<FcmToken> findCustomerTokens();

    List<FcmToken> findByAdminIdIsNotNull();
    List<FcmToken> findByAdminIdIsNull();
}
