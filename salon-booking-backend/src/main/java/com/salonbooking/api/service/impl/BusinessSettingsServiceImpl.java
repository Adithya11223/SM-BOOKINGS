package com.salonbooking.api.service.impl;

import com.salonbooking.api.dto.request.UpdateBusinessSettingsRequest;
import com.salonbooking.api.dto.response.BusinessSettingsResponse;
import com.salonbooking.api.entity.BusinessSettings;
import com.salonbooking.api.exception.BusinessException;
import com.salonbooking.api.mapper.BusinessSettingsMapper;
import com.salonbooking.api.repository.BusinessSettingsRepository;
import com.salonbooking.api.service.BusinessSettingsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class BusinessSettingsServiceImpl implements BusinessSettingsService {

    private final BusinessSettingsRepository repository;
    private final BusinessSettingsMapper mapper;

    @Override
    @Transactional
    public BusinessSettingsResponse getSettings() {
        BusinessSettings settings = getSettingsEntity();
        
        // Check for ad expiration (7 days)
        if (settings.getAdImageUrl() != null && settings.getAdCreatedAt() != null) {
            java.time.Instant expiryTime = settings.getAdCreatedAt().plus(7, java.time.temporal.ChronoUnit.DAYS);
            if (java.time.Instant.now().isAfter(expiryTime)) {
                // Ad has expired, clear it
                settings.setAdImageUrl(null);
                settings.setAdCreatedAt(null);
                repository.save(settings);
            }
        }
        
        return mapper.toResponse(settings);
    }

    @Override
    @Transactional
    @com.salonbooking.api.annotation.AuditLog(action = "Update Business Settings")
    public BusinessSettingsResponse updateSettings(UpdateBusinessSettingsRequest request) {
        BusinessSettings settings = getSettingsEntity();
        
        String oldAdImageUrl = settings.getAdImageUrl();
        
        mapper.updateEntityFromRequest(request, settings);
        
        // If a new ad image was uploaded (or if it was just added), update the created at time
        if (request.getAdImageUrl() != null && !request.getAdImageUrl().equals(oldAdImageUrl)) {
            settings.setAdCreatedAt(java.time.Instant.now());
        } else if (request.getAdImageUrl() == null || request.getAdImageUrl().isEmpty()) {
            settings.setAdImageUrl(null);
            settings.setAdCreatedAt(null);
        }
        
        BusinessSettings updated = repository.save(settings);
        log.info("Business settings updated successfully");
        return mapper.toResponse(updated);
    }

    @Override
    @Transactional
    public BusinessSettings getSettingsEntity() {
        java.util.List<BusinessSettings> allSettings = repository.findAll();
        if (!allSettings.isEmpty()) {
            return allSettings.get(0);
        }
        
        BusinessSettings defaultSettings = new BusinessSettings();
        defaultSettings.setBusinessName("SM Saloon");
        defaultSettings.setOwnerName("Shalini Banja");
        defaultSettings.setOwnerTitle("Lead Stylist & Founder");
        defaultSettings.setTagline("Experience the best salon services");
        defaultSettings.setDescription("Welcome to SM Saloon, your premium destination for hair, skin, and nail care. We provide top-notch services at our shop and at your doorstep.");
        defaultSettings.setAddress("123 Beauty Avenue, Makeup City, Fashion State");
        defaultSettings.setPhoneNumber("+1 987-654-3210");
        defaultSettings.setWhatsappNumber("+1 987-654-3210");
        defaultSettings.setEmail("contact@smsaloon.com");
        defaultSettings.setInstagram("@smsaloon_official");
        defaultSettings.setFacebook("SM Saloon");
        defaultSettings.setYoutube("SM Saloon TV");
        defaultSettings.setThreads("@smsaloon_official");
        defaultSettings.setOpeningTime(java.time.LocalTime.of(9, 0));
        defaultSettings.setClosingTime(java.time.LocalTime.of(21, 0));
        return repository.save(defaultSettings);
    }
}
