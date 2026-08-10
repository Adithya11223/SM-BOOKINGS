package com.salonbooking.api.service;

import com.salonbooking.api.dto.request.UpdateBusinessSettingsRequest;
import com.salonbooking.api.dto.response.BusinessSettingsResponse;
import com.salonbooking.api.entity.BusinessSettings;

public interface BusinessSettingsService {
    BusinessSettingsResponse getSettings();
    BusinessSettingsResponse updateSettings(UpdateBusinessSettingsRequest request);
    BusinessSettings getSettingsEntity();
}
