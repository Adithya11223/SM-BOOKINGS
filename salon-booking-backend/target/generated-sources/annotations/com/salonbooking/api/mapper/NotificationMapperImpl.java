package com.salonbooking.api.mapper;

import com.salonbooking.api.dto.response.NotificationResponse;
import com.salonbooking.api.entity.Booking;
import com.salonbooking.api.entity.Notification;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-12T02:30:44-0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class NotificationMapperImpl implements NotificationMapper {

    @Override
    public NotificationResponse toResponse(Notification entity) {
        if ( entity == null ) {
            return null;
        }

        NotificationResponse notificationResponse = new NotificationResponse();

        notificationResponse.setBookingId( entityBookingId( entity ) );
        notificationResponse.setCreatedAt( entity.getCreatedAt() );
        notificationResponse.setId( entity.getId() );
        notificationResponse.setIsRead( entity.getIsRead() );
        notificationResponse.setMessage( entity.getMessage() );
        notificationResponse.setReadAt( entity.getReadAt() );
        notificationResponse.setReceiverId( entity.getReceiverId() );
        notificationResponse.setReceiverType( entity.getReceiverType() );
        notificationResponse.setServiceId( entity.getServiceId() );
        notificationResponse.setTitle( entity.getTitle() );
        notificationResponse.setType( entity.getType() );

        return notificationResponse;
    }

    private UUID entityBookingId(Notification notification) {
        if ( notification == null ) {
            return null;
        }
        Booking booking = notification.getBooking();
        if ( booking == null ) {
            return null;
        }
        UUID id = booking.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }
}
