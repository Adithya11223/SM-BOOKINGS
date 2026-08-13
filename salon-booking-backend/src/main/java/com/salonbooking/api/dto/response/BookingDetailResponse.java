package com.salonbooking.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
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
