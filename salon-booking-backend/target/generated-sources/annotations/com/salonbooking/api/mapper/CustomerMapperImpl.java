package com.salonbooking.api.mapper;

import com.salonbooking.api.dto.request.CustomerRequest;
import com.salonbooking.api.dto.response.CustomerResponse;
import com.salonbooking.api.entity.Customer;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-12T02:30:44-0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class CustomerMapperImpl implements CustomerMapper {

    @Override
    public Customer toEntity(CustomerRequest request) {
        if ( request == null ) {
            return null;
        }

        Customer.CustomerBuilder customer = Customer.builder();

        customer.email( request.getEmail() );
        customer.name( request.getName() );
        customer.notes( request.getNotes() );
        customer.phoneNumber( request.getPhoneNumber() );

        return customer.build();
    }

    @Override
    public CustomerResponse toResponse(Customer entity) {
        if ( entity == null ) {
            return null;
        }

        CustomerResponse customerResponse = new CustomerResponse();

        customerResponse.setEmail( entity.getEmail() );
        customerResponse.setId( entity.getId() );
        customerResponse.setLastBookingDate( entity.getLastBookingDate() );
        customerResponse.setName( entity.getName() );
        customerResponse.setNotes( entity.getNotes() );
        customerResponse.setPhoneNumber( entity.getPhoneNumber() );
        customerResponse.setTotalBookings( entity.getTotalBookings() );

        return customerResponse;
    }

    @Override
    public void updateEntityFromRequest(CustomerRequest request, Customer entity) {
        if ( request == null ) {
            return;
        }

        entity.setEmail( request.getEmail() );
        entity.setName( request.getName() );
        entity.setNotes( request.getNotes() );
        entity.setPhoneNumber( request.getPhoneNumber() );
    }
}
