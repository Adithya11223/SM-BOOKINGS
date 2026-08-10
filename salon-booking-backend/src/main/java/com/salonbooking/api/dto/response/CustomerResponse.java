package com.salonbooking.api.dto.response;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class CustomerResponse {
    private UUID id;
    private String name;
    private String phoneNumber;
    private String email;
    private String notes;
    private Instant lastBookingDate;
    private Integer totalBookings;
}
