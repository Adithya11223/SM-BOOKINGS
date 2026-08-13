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
    date = "2026-08-13T04:15:07-0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.11 (JetBrains s.r.o.)"
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

        BookingResponse.BookingResponseBuilder<?, ?> bookingResponse = BookingResponse.builder();

        bookingResponse.customerName( entityCustomerName( entity ) );
        bookingResponse.id( entity.getId() );
        bookingResponse.bookingNumber( entity.getBookingNumber() );
        bookingResponse.bookingType( entity.getBookingType() );
        bookingResponse.bookingStatus( entity.getBookingStatus() );
        bookingResponse.bookingDate( entity.getBookingDate() );
        bookingResponse.bookingTime( entity.getBookingTime() );
        bookingResponse.totalAmount( entity.getTotalAmount() );
        bookingResponse.totalDuration( entity.getTotalDuration() );
        bookingResponse.hasUnreadAdminUpdates( entity.getHasUnreadAdminUpdates() );
        bookingResponse.hasUnreadCustomerUpdates( entity.getHasUnreadCustomerUpdates() );
        bookingResponse.items( bookingItemListToBookingItemResponseList( entity.getItems() ) );

        return bookingResponse.build();
    }

    @Override
    public BookingDetailResponse toDetailResponse(Booking entity) {
        if ( entity == null ) {
            return null;
        }

        BookingDetailResponse.BookingDetailResponseBuilder<?, ?> bookingDetailResponse = BookingDetailResponse.builder();

        bookingDetailResponse.customerName( entityCustomerName( entity ) );
        bookingDetailResponse.id( entity.getId() );
        bookingDetailResponse.bookingNumber( entity.getBookingNumber() );
        bookingDetailResponse.bookingType( entity.getBookingType() );
        bookingDetailResponse.bookingStatus( entity.getBookingStatus() );
        bookingDetailResponse.bookingDate( entity.getBookingDate() );
        bookingDetailResponse.bookingTime( entity.getBookingTime() );
        bookingDetailResponse.totalAmount( entity.getTotalAmount() );
        bookingDetailResponse.totalDuration( entity.getTotalDuration() );
        bookingDetailResponse.hasUnreadAdminUpdates( entity.getHasUnreadAdminUpdates() );
        bookingDetailResponse.hasUnreadCustomerUpdates( entity.getHasUnreadCustomerUpdates() );
        bookingDetailResponse.notes( entity.getNotes() );
        bookingDetailResponse.address( entity.getAddress() );
        bookingDetailResponse.googleMapsLink( entity.getGoogleMapsLink() );
        bookingDetailResponse.eventType( entity.getEventType() );
        bookingDetailResponse.peopleCount( entity.getPeopleCount() );
        bookingDetailResponse.customer( customerMapper.toResponse( entity.getCustomer() ) );
        bookingDetailResponse.items( bookingItemListToBookingItemResponseList( entity.getItems() ) );

        return bookingDetailResponse.build();
    }

    @Override
    public BookingItemResponse toItemResponse(BookingItem entity) {
        if ( entity == null ) {
            return null;
        }

        BookingItemResponse bookingItemResponse = new BookingItemResponse();

        bookingItemResponse.setServiceId( entityServiceId( entity ) );
        bookingItemResponse.setId( entity.getId() );
        bookingItemResponse.setServiceNameSnapshot( entity.getServiceNameSnapshot() );
        bookingItemResponse.setPriceSnapshot( entity.getPriceSnapshot() );
        bookingItemResponse.setDurationSnapshot( entity.getDurationSnapshot() );
        bookingItemResponse.setQuantity( entity.getQuantity() );
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
