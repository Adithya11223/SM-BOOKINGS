package com.salonbooking.api.mapper;

import com.salonbooking.api.dto.request.CreateServiceRequest;
import com.salonbooking.api.dto.request.UpdateServiceRequest;
import com.salonbooking.api.dto.response.ServiceResponse;
import com.salonbooking.api.entity.Service;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-12T17:33:14-0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.11 (JetBrains s.r.o.)"
)
@Component
public class ServiceMapperImpl implements ServiceMapper {

    @Override
    public Service toEntity(CreateServiceRequest request) {
        if ( request == null ) {
            return null;
        }

        Service.ServiceBuilder service = Service.builder();

        service.name( request.getName() );
        service.description( request.getDescription() );
        service.category( request.getCategory() );
        service.type( request.getType() );
        service.price( request.getPrice() );
        service.durationMinutes( request.getDurationMinutes() );
        service.imageUrl( request.getImageUrl() );

        return service.build();
    }

    @Override
    public ServiceResponse toResponse(Service entity) {
        if ( entity == null ) {
            return null;
        }

        ServiceResponse serviceResponse = new ServiceResponse();

        serviceResponse.setId( entity.getId() );
        serviceResponse.setName( entity.getName() );
        serviceResponse.setDescription( entity.getDescription() );
        serviceResponse.setCategory( entity.getCategory() );
        serviceResponse.setType( entity.getType() );
        serviceResponse.setPrice( entity.getPrice() );
        serviceResponse.setDurationMinutes( entity.getDurationMinutes() );
        serviceResponse.setImageUrl( entity.getImageUrl() );
        serviceResponse.setIsVisible( entity.getIsVisible() );
        serviceResponse.setDisplayOrder( entity.getDisplayOrder() );

        return serviceResponse;
    }

    @Override
    public void updateEntityFromRequest(UpdateServiceRequest request, Service entity) {
        if ( request == null ) {
            return;
        }

        entity.setName( request.getName() );
        entity.setDescription( request.getDescription() );
        entity.setCategory( request.getCategory() );
        entity.setType( request.getType() );
        entity.setPrice( request.getPrice() );
        entity.setDurationMinutes( request.getDurationMinutes() );
        entity.setImageUrl( request.getImageUrl() );
        entity.setIsVisible( request.getIsVisible() );
        entity.setDisplayOrder( request.getDisplayOrder() );
    }
}
