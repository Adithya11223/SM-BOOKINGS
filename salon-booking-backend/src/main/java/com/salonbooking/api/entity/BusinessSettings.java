package com.salonbooking.api.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "business_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessSettings extends BaseEntity {

    @Column(name = "business_name", nullable = false)
    private String businessName;

    private String tagline;

    @Column(name = "logo_url", columnDefinition = "TEXT")
    private String logoUrl;

    @Column(name = "cover_image_url", columnDefinition = "TEXT")
    private String coverImageUrl;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "whatsapp_number")
    private String whatsappNumber;

    private String email;
    
    private String address;

    @Column(name = "opening_time")
    private LocalTime openingTime;

    @Column(name = "closing_time")
    private LocalTime closingTime;

    private String instagram;
    
    private String facebook;
    
    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "owner_name")
    private String ownerName;

    @Column(name = "owner_title")
    private String ownerTitle;

    private String youtube;

    private String threads;

    @Column(nullable = false)
    @Builder.Default
    private String currency = "USD";

    @Column(nullable = false)
    @Builder.Default
    private String timezone = "UTC";

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_shop_open", nullable = false)
    @Builder.Default
    private Boolean isShopOpen = true;

    @Column(name = "is_service_open", nullable = false)
    @Builder.Default
    private Boolean isServiceOpen = true;

    @Column(name = "ad_image_url", columnDefinition = "TEXT")
    private String adImageUrl;

    @Column(name = "ad_created_at")
    private Instant adCreatedAt;

    @OneToMany(mappedBy = "businessSettings", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Service> services = new ArrayList<>();
}
