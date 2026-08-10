package com.salonbooking.api.mapper;

import com.salonbooking.api.dto.response.BookingDetailResponse;
import com.salonbooking.api.dto.response.BookingItemResponse;
import com.salonbooking.api.dto.response.BookingResponse;
import com.salonbooking.api.entity.Booking;
import com.salonbooking.api.entity.BookingItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {CustomerMapper.class})
public interface BookingMapper {

    @Mapping(target = "customerName", source = "customer.name")
    BookingResponse toResponse(Booking entity);

    @Mapping(target = "customerName", source = "customer.name")
    BookingDetailResponse toDetailResponse(Booking entity);

    @Mapping(target = "serviceId", source = "service.id")
    BookingItemResponse toItemResponse(BookingItem entity);
}
