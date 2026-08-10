package com.salonbooking.api.util;

import com.salonbooking.api.exception.BusinessException;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DateValidator {

    public void validateBookingDate(LocalDate bookingDate) {
        if (bookingDate == null) {
            throw new BusinessException("Booking date is required");
        }
        
        if (bookingDate.isBefore(LocalDate.now())) {
            throw new BusinessException("Booking date cannot be in the past");
        }
    }
}
