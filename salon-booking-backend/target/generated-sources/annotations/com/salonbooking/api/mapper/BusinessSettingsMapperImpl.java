package com.salonbooking.api.mapper;

import com.salonbooking.api.dto.request.UpdateBusinessSettingsRequest;
import com.salonbooking.api.dto.response.BusinessSettingsResponse;
import com.salonbooking.api.entity.BusinessSettings;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-12T11:23:16-0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.11 (JetBrains s.r.o.)"
)
@Component
public class BusinessSettingsMapperImpl implements BusinessSettingsMapper {

    @Override
    public BusinessSettingsResponse toResponse(BusinessSettings entity) {
        if ( entity == null ) {
            return null;
        }

        BusinessSettingsResponse businessSettingsResponse = new BusinessSettingsResponse();

        businessSettingsResponse.setId( entity.getId() );
        businessSettingsResponse.setBusinessName( entity.getBusinessName() );
        businessSettingsResponse.setTagline( entity.getTagline() );
        businessSettingsResponse.setLogoUrl( entity.getLogoUrl() );
        businessSettingsResponse.setCoverImageUrl( entity.getCoverImageUrl() );
        businessSettingsResponse.setPhoneNumber( entity.getPhoneNumber() );
        businessSettingsResponse.setWhatsappNumber( entity.getWhatsappNumber() );
        businessSettingsResponse.setEmail( entity.getEmail() );
        businessSettingsResponse.setAddress( entity.getAddress() );
        businessSettingsResponse.setOpeningTime( entity.getOpeningTime() );
        businessSettingsResponse.setClosingTime( entity.getClosingTime() );
        businessSettingsResponse.setInstagram( entity.getInstagram() );
        businessSettingsResponse.setFacebook( entity.getFacebook() );
        businessSettingsResponse.setDescription( entity.getDescription() );
        businessSettingsResponse.setOwnerName( entity.getOwnerName() );
        businessSettingsResponse.setOwnerTitle( entity.getOwnerTitle() );
        businessSettingsResponse.setYoutube( entity.getYoutube() );
        businessSettingsResponse.setThreads( entity.getThreads() );
        businessSettingsResponse.setCurrency( entity.getCurrency() );
        businessSettingsResponse.setTimezone( entity.getTimezone() );
        businessSettingsResponse.setIsActive( entity.getIsActive() );
        businessSettingsResponse.setIsShopOpen( entity.getIsShopOpen() );
        businessSettingsResponse.setIsServiceOpen( entity.getIsServiceOpen() );
        businessSettingsResponse.setAdImageUrl( entity.getAdImageUrl() );
        businessSettingsResponse.setAdCreatedAt( entity.getAdCreatedAt() );

        return businessSettingsResponse;
    }

    @Override
    public void updateEntityFromRequest(UpdateBusinessSettingsRequest request, BusinessSettings entity) {
        if ( request == null ) {
            return;
        }

        entity.setBusinessName( request.getBusinessName() );
        entity.setTagline( request.getTagline() );
        entity.setLogoUrl( request.getLogoUrl() );
        entity.setCoverImageUrl( request.getCoverImageUrl() );
        entity.setPhoneNumber( request.getPhoneNumber() );
        entity.setWhatsappNumber( request.getWhatsappNumber() );
        entity.setEmail( request.getEmail() );
        entity.setAddress( request.getAddress() );
        entity.setOpeningTime( request.getOpeningTime() );
        entity.setClosingTime( request.getClosingTime() );
        entity.setInstagram( request.getInstagram() );
        entity.setFacebook( request.getFacebook() );
        entity.setDescription( request.getDescription() );
        entity.setOwnerName( request.getOwnerName() );
        entity.setOwnerTitle( request.getOwnerTitle() );
        entity.setYoutube( request.getYoutube() );
        entity.setThreads( request.getThreads() );
        entity.setCurrency( request.getCurrency() );
        entity.setTimezone( request.getTimezone() );
        entity.setIsShopOpen( request.getIsShopOpen() );
        entity.setIsServiceOpen( request.getIsServiceOpen() );
        entity.setAdImageUrl( request.getAdImageUrl() );
    }
}
