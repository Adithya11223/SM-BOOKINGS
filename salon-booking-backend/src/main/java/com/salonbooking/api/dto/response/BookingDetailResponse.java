package com.salonbooking.api.dto.response;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class BookingDetailResponse extends BookingResponse {
    private String notes;
    private String address;
    private String googleMapsLink;
    private String eventType;
    private Integer peopleCount;
    private CustomerResponse customer;
    private List<BookingItemResponse> items;
}
