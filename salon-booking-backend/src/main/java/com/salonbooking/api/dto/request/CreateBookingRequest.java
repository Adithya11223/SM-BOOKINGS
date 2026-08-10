package com.salonbooking.api.dto.request;

import com.salonbooking.api.enums.BookingType;
import com.salonbooking.api.validation.ValidEmail;
import com.salonbooking.api.validation.ValidPhone;
import jakarta.validation.Valid;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class CreateBookingRequest {

    @NotBlank(message = "Customer name is required")
    private String customerName;

    @ValidPhone
    @NotBlank(message = "Customer phone number is required")
    private String customerPhoneNumber;

    @ValidEmail
    private String customerEmail;

    @NotNull(message = "Booking type is required")
    private BookingType bookingType;

    @NotNull(message = "Booking date is required")
    @FutureOrPresent(message = "Booking date must be today or in the future")
    private LocalDate bookingDate;

    @NotNull(message = "Booking time is required")
    private LocalTime bookingTime;

    private String notes;

    private String address;

    private String googleMapsLink;

    private String eventType;

    private Integer peopleCount;

    @NotEmpty(message = "At least one service must be selected")
    @Valid
    private List<BookingItemRequest> items;
}
