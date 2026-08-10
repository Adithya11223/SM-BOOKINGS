package com.salonbooking.api.mapper;

import com.salonbooking.api.dto.request.CustomerRequest;
import com.salonbooking.api.dto.response.CustomerResponse;
import com.salonbooking.api.entity.Customer;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CustomerMapper {

    Customer toEntity(CustomerRequest request);

    CustomerResponse toResponse(Customer entity);

    void updateEntityFromRequest(CustomerRequest request, @MappingTarget Customer entity);
}
