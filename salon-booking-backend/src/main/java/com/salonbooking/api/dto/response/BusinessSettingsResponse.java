package com.salonbooking.api.dto.response;

import lombok.Data;

import java.time.LocalTime;
import java.util.UUID;

@Data
public class BusinessSettingsResponse {
    private UUID id;
    private String businessName;
    private String tagline;
    private String logoUrl;
    private String coverImageUrl;
    private String phoneNumber;
    private String whatsappNumber;
    private String email;
    private String address;
    private LocalTime openingTime;
    private LocalTime closingTime;
    private String instagram;
    private String facebook;
    private String description;
    private String ownerName;
    private String ownerTitle;
    private String youtube;
    private String threads;
    private String currency;
    private String timezone;
    private Boolean isActive;
    private Boolean isShopOpen;
    private Boolean isServiceOpen;
    private String adImageUrl;
    private java.time.Instant adCreatedAt;
}
