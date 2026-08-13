package com.salonbooking.api.mapper;

import com.salonbooking.api.dto.request.CustomerRequest;
import com.salonbooking.api.dto.response.CustomerResponse;
import com.salonbooking.api.entity.Customer;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-12T17:33:14-0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.11 (JetBrains s.r.o.)"
)
@Component
public class CustomerMapperImpl implements CustomerMapper {

    @Override
    public Customer toEntity(CustomerRequest request) {
        if ( request == null ) {
            return null;
        }

        Customer.CustomerBuilder customer = Customer.builder();

        customer.name( request.getName() );
        customer.phoneNumber( request.getPhoneNumber() );
        customer.email( request.getEmail() );
        customer.notes( request.getNotes() );

        return customer.build();
    }

    @Override
    public CustomerResponse toResponse(Customer entity) {
        if ( entity == null ) {
            return null;
        }

        CustomerResponse customerResponse = new CustomerResponse();

        customerResponse.setId( entity.getId() );
        customerResponse.setName( entity.getName() );
        customerResponse.setPhoneNumber( entity.getPhoneNumber() );
        customerResponse.setEmail( entity.getEmail() );
        customerResponse.setNotes( entity.getNotes() );
        customerResponse.setLastBookingDate( entity.getLastBookingDate() );
        customerResponse.setTotalBookings( entity.getTotalBookings() );

        return customerResponse;
    }

    @Override
    public void updateEntityFromRequest(CustomerRequest request, Customer entity) {
        if ( request == null ) {
            return;
        }

        entity.setName( request.getName() );
        entity.setPhoneNumber( request.getPhoneNumber() );
        entity.setEmail( request.getEmail() );
        entity.setNotes( request.getNotes() );
    }
}
