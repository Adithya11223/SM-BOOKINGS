package com.salonbooking.api.mapper;

import com.salonbooking.api.dto.request.CreateServiceRequest;
import com.salonbooking.api.dto.request.UpdateServiceRequest;
import com.salonbooking.api.dto.response.ServiceResponse;
import com.salonbooking.api.entity.Service;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-12T02:30:44-0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class ServiceMapperImpl implements ServiceMapper {

    @Override
    public Service toEntity(CreateServiceRequest request) {
        if ( request == null ) {
            return null;
        }

        Service.ServiceBuilder service = Service.builder();

        service.category( request.getCategory() );
        service.description( request.getDescription() );
        service.durationMinutes( request.getDurationMinutes() );
        service.imageUrl( request.getImageUrl() );
        service.name( request.getName() );
        service.price( request.getPrice() );
        service.type( request.getType() );

        return service.build();
    }

    @Override
    public ServiceResponse toResponse(Service entity) {
        if ( entity == null ) {
            return null;
        }

        ServiceResponse serviceResponse = new ServiceResponse();

        serviceResponse.setCategory( entity.getCategory() );
        serviceResponse.setDescription( entity.getDescription() );
        serviceResponse.setDisplayOrder( entity.getDisplayOrder() );
        serviceResponse.setDurationMinutes( entity.getDurationMinutes() );
        serviceResponse.setId( entity.getId() );
        serviceResponse.setImageUrl( entity.getImageUrl() );
        serviceResponse.setIsVisible( entity.getIsVisible() );
        serviceResponse.setName( entity.getName() );
        serviceResponse.setPrice( entity.getPrice() );
        serviceResponse.setType( entity.getType() );

        return serviceResponse;
    }

    @Override
    public void updateEntityFromRequest(UpdateServiceRequest request, Service entity) {
        if ( request == null ) {
            return;
        }

        entity.setCategory( request.getCategory() );
        entity.setDescription( request.getDescription() );
        entity.setDisplayOrder( request.getDisplayOrder() );
        entity.setDurationMinutes( request.getDurationMinutes() );
        entity.setImageUrl( request.getImageUrl() );
        entity.setIsVisible( request.getIsVisible() );
        entity.setName( request.getName() );
        entity.setPrice( request.getPrice() );
        entity.setType( request.getType() );
    }
}
