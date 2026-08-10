package com.salonbooking.api.mapper;

import com.salonbooking.api.dto.request.CreateServiceRequest;
import com.salonbooking.api.dto.request.UpdateServiceRequest;
import com.salonbooking.api.dto.response.ServiceResponse;
import com.salonbooking.api.entity.Service;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ServiceMapper {

    Service toEntity(CreateServiceRequest request);

    ServiceResponse toResponse(Service entity);

    void updateEntityFromRequest(UpdateServiceRequest request, @MappingTarget Service entity);
}
