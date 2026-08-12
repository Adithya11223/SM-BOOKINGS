package com.salonbooking.api.mapper;

import com.salonbooking.api.dto.response.BookingDetailResponse;
import com.salonbooking.api.dto.response.BookingItemResponse;
import com.salonbooking.api.dto.response.BookingResponse;
import com.salonbooking.api.entity.Booking;
import com.salonbooking.api.entity.BookingItem;
import com.salonbooking.api.entity.Customer;
import com.salonbooking.api.entity.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-12T02:30:44-0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class BookingMapperImpl implements BookingMapper {

    @Autowired
    private CustomerMapper customerMapper;

    @Override
    public BookingResponse toResponse(Booking entity) {
        if ( entity == null ) {
            return null;
        }

        BookingResponse bookingResponse = new BookingResponse();

        bookingResponse.setCustomerName( entityCustomerName( entity ) );
        bookingResponse.setBookingDate( entity.getBookingDate() );
        bookingResponse.setBookingNumber( entity.getBookingNumber() );
        bookingResponse.setBookingStatus( entity.getBookingStatus() );
        bookingResponse.setBookingTime( entity.getBookingTime() );
        bookingResponse.setBookingType( entity.getBookingType() );
        bookingResponse.setId( entity.getId() );
        bookingResponse.setTotalAmount( entity.getTotalAmount() );
        bookingResponse.setTotalDuration( entity.getTotalDuration() );

        return bookingResponse;
    }

    @Override
    public BookingDetailResponse toDetailResponse(Booking entity) {
        if ( entity == null ) {
            return null;
        }

        BookingDetailResponse bookingDetailResponse = new BookingDetailResponse();

        bookingDetailResponse.setCustomerName( entityCustomerName( entity ) );
        bookingDetailResponse.setBookingDate( entity.getBookingDate() );
        bookingDetailResponse.setBookingNumber( entity.getBookingNumber() );
        bookingDetailResponse.setBookingStatus( entity.getBookingStatus() );
        bookingDetailResponse.setBookingTime( entity.getBookingTime() );
        bookingDetailResponse.setBookingType( entity.getBookingType() );
        bookingDetailResponse.setId( entity.getId() );
        bookingDetailResponse.setTotalAmount( entity.getTotalAmount() );
        bookingDetailResponse.setTotalDuration( entity.getTotalDuration() );
        bookingDetailResponse.setAddress( entity.getAddress() );
        bookingDetailResponse.setCustomer( customerMapper.toResponse( entity.getCustomer() ) );
        bookingDetailResponse.setEventType( entity.getEventType() );
        bookingDetailResponse.setGoogleMapsLink( entity.getGoogleMapsLink() );
        bookingDetailResponse.setItems( bookingItemListToBookingItemResponseList( entity.getItems() ) );
        bookingDetailResponse.setNotes( entity.getNotes() );
        bookingDetailResponse.setPeopleCount( entity.getPeopleCount() );

        return bookingDetailResponse;
    }

    @Override
    public BookingItemResponse toItemResponse(BookingItem entity) {
        if ( entity == null ) {
            return null;
        }

        BookingItemResponse bookingItemResponse = new BookingItemResponse();

        bookingItemResponse.setServiceId( entityServiceId( entity ) );
        bookingItemResponse.setDurationSnapshot( entity.getDurationSnapshot() );
        bookingItemResponse.setId( entity.getId() );
        bookingItemResponse.setPriceSnapshot( entity.getPriceSnapshot() );
        bookingItemResponse.setQuantity( entity.getQuantity() );
        bookingItemResponse.setServiceNameSnapshot( entity.getServiceNameSnapshot() );
        bookingItemResponse.setSubtotal( entity.getSubtotal() );

        return bookingItemResponse;
    }

    private String entityCustomerName(Booking booking) {
        if ( booking == null ) {
            return null;
        }
        Customer customer = booking.getCustomer();
        if ( customer == null ) {
            return null;
        }
        String name = customer.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }

    protected List<BookingItemResponse> bookingItemListToBookingItemResponseList(List<BookingItem> list) {
        if ( list == null ) {
            return null;
        }

        List<BookingItemResponse> list1 = new ArrayList<BookingItemResponse>( list.size() );
        for ( BookingItem bookingItem : list ) {
            list1.add( toItemResponse( bookingItem ) );
        }

        return list1;
    }

    private UUID entityServiceId(BookingItem bookingItem) {
        if ( bookingItem == null ) {
            return null;
        }
        Service service = bookingItem.getService();
        if ( service == null ) {
            return null;
        }
        UUID id = service.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }
}
