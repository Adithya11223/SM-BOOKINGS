package com.salonbooking.api.dto.request;

import com.salonbooking.api.enums.BookingStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateBookingStatusRequest {

    @NotNull(message = "Booking status is required")
    private BookingStatus bookingStatus;
}
