package com.salonbooking.api.mapper;

import com.salonbooking.api.dto.response.NotificationResponse;
import com.salonbooking.api.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    @Mapping(target = "bookingId", source = "booking.id")
    @Mapping(target = "serviceId", source = "service.id")
    NotificationResponse toResponse(Notification entity);
}
