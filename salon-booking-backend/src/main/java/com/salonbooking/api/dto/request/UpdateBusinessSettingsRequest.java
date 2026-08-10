package com.salonbooking.api.dto.request;

import com.salonbooking.api.validation.ValidEmail;
import com.salonbooking.api.validation.ValidPhone;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalTime;

@Data
public class UpdateBusinessSettingsRequest {

    @NotBlank(message = "Business name is required")
    private String businessName;

    private String tagline;

    private String logoUrl;

    private String coverImageUrl;

    @ValidPhone
    private String phoneNumber;

    @ValidPhone
    private String whatsappNumber;

    @ValidEmail
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

    @NotBlank(message = "Currency is required")
    private String currency;

    @NotBlank(message = "Timezone is required")
    private String timezone;

    private Boolean isShopOpen;

    private Boolean isServiceOpen;

    private String adImageUrl;
}
