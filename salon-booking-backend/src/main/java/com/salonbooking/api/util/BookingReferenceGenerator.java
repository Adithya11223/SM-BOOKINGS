package com.salonbooking.api.util;

import com.salonbooking.api.enums.BookingType;
import com.salonbooking.api.repository.BookingRepository;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class BookingReferenceGenerator {

    private final BookingRepository bookingRepository;

    public String generateBookingNumber(BookingType type) {
        String prefix = type == BookingType.HOME_SERVICE ? "BKG-HEM" : "BKG-VS";
        String bookingNumber;
        do {
            String randomStr = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            bookingNumber = String.format("%s-%s", prefix, randomStr);
        } while (bookingRepository.findByBookingNumber(bookingNumber).isPresent());
        return bookingNumber;
    }
}
