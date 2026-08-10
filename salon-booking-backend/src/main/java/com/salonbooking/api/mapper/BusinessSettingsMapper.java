package com.salonbooking.api.mapper;

import com.salonbooking.api.dto.request.UpdateBusinessSettingsRequest;
import com.salonbooking.api.dto.response.BusinessSettingsResponse;
import com.salonbooking.api.entity.BusinessSettings;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface BusinessSettingsMapper {

    BusinessSettingsResponse toResponse(BusinessSettings entity);

    void updateEntityFromRequest(UpdateBusinessSettingsRequest request, @MappingTarget BusinessSettings entity);
}
