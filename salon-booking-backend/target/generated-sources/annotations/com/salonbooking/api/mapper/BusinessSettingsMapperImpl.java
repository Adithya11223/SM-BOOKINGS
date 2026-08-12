package com.salonbooking.api.mapper;

import com.salonbooking.api.dto.request.UpdateBusinessSettingsRequest;
import com.salonbooking.api.dto.response.BusinessSettingsResponse;
import com.salonbooking.api.entity.BusinessSettings;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-12T02:30:44-0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class BusinessSettingsMapperImpl implements BusinessSettingsMapper {

    @Override
    public BusinessSettingsResponse toResponse(BusinessSettings entity) {
        if ( entity == null ) {
            return null;
        }

        BusinessSettingsResponse businessSettingsResponse = new BusinessSettingsResponse();

        businessSettingsResponse.setAdCreatedAt( entity.getAdCreatedAt() );
        businessSettingsResponse.setAdImageUrl( entity.getAdImageUrl() );
        businessSettingsResponse.setAddress( entity.getAddress() );
        businessSettingsResponse.setBusinessName( entity.getBusinessName() );
        businessSettingsResponse.setClosingTime( entity.getClosingTime() );
        businessSettingsResponse.setCoverImageUrl( entity.getCoverImageUrl() );
        businessSettingsResponse.setCurrency( entity.getCurrency() );
        businessSettingsResponse.setDescription( entity.getDescription() );
        businessSettingsResponse.setEmail( entity.getEmail() );
        businessSettingsResponse.setFacebook( entity.getFacebook() );
        businessSettingsResponse.setId( entity.getId() );
        businessSettingsResponse.setInstagram( entity.getInstagram() );
        businessSettingsResponse.setIsActive( entity.getIsActive() );
        businessSettingsResponse.setIsServiceOpen( entity.getIsServiceOpen() );
        businessSettingsResponse.setIsShopOpen( entity.getIsShopOpen() );
        businessSettingsResponse.setLogoUrl( entity.getLogoUrl() );
        businessSettingsResponse.setOpeningTime( entity.getOpeningTime() );
        businessSettingsResponse.setOwnerName( entity.getOwnerName() );
        businessSettingsResponse.setOwnerTitle( entity.getOwnerTitle() );
        businessSettingsResponse.setPhoneNumber( entity.getPhoneNumber() );
        businessSettingsResponse.setTagline( entity.getTagline() );
        businessSettingsResponse.setThreads( entity.getThreads() );
        businessSettingsResponse.setTimezone( entity.getTimezone() );
        businessSettingsResponse.setWhatsappNumber( entity.getWhatsappNumber() );
        businessSettingsResponse.setYoutube( entity.getYoutube() );

        return businessSettingsResponse;
    }

    @Override
    public void updateEntityFromRequest(UpdateBusinessSettingsRequest request, BusinessSettings entity) {
        if ( request == null ) {
            return;
        }

        entity.setAdImageUrl( request.getAdImageUrl() );
        entity.setAddress( request.getAddress() );
        entity.setBusinessName( request.getBusinessName() );
        entity.setClosingTime( request.getClosingTime() );
        entity.setCoverImageUrl( request.getCoverImageUrl() );
        entity.setCurrency( request.getCurrency() );
        entity.setDescription( request.getDescription() );
        entity.setEmail( request.getEmail() );
        entity.setFacebook( request.getFacebook() );
        entity.setInstagram( request.getInstagram() );
        entity.setIsServiceOpen( request.getIsServiceOpen() );
        entity.setIsShopOpen( request.getIsShopOpen() );
        entity.setLogoUrl( request.getLogoUrl() );
        entity.setOpeningTime( request.getOpeningTime() );
        entity.setOwnerName( request.getOwnerName() );
        entity.setOwnerTitle( request.getOwnerTitle() );
        entity.setPhoneNumber( request.getPhoneNumber() );
        entity.setTagline( request.getTagline() );
        entity.setThreads( request.getThreads() );
        entity.setTimezone( request.getTimezone() );
        entity.setWhatsappNumber( request.getWhatsappNumber() );
        entity.setYoutube( request.getYoutube() );
    }
}
