package com.salonbooking.api.mapper;

import com.salonbooking.api.dto.response.NotificationResponse;
import com.salonbooking.api.entity.Booking;
import com.salonbooking.api.entity.Notification;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-10T13:30:05-0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.11 (JetBrains s.r.o.)"
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
        notificationResponse.setId( entity.getId() );
        notificationResponse.setTitle( entity.getTitle() );
        notificationResponse.setMessage( entity.getMessage() );
        notificationResponse.setType( entity.getType() );
        notificationResponse.setIsRead( entity.getIsRead() );
        notificationResponse.setCreatedAt( entity.getCreatedAt() );
        notificationResponse.setReceiverType( entity.getReceiverType() );
        notificationResponse.setReceiverId( entity.getReceiverId() );
        notificationResponse.setServiceId( entity.getServiceId() );
        notificationResponse.setReadAt( entity.getReadAt() );

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
