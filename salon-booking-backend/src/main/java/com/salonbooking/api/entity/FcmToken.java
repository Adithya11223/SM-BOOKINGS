package com.salonbooking.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "fcm_token")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FcmToken extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String token;

    @Column(name = "device_id", nullable = false)
    private String deviceId;

    @Column(name = "admin_id")
    private UUID adminId;

    @Column(name = "customer_id")
    private UUID customerId;
}
