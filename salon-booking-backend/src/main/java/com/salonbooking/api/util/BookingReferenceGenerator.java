package com.salonbooking.api.util;

import com.salonbooking.api.enums.BookingType;
import com.salonbooking.api.repository.BookingRepository;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import java.util.Random;

@Component
@RequiredArgsConstructor
public class BookingReferenceGenerator {

    private final BookingRepository bookingRepository;
    private final Random random = new Random();

    public String generateBookingNumber(BookingType type) {
        String prefix = type == BookingType.HOME_SERVICE ? "BKG-HEM" : "BKG-VS";
        String bookingNumber;
        do {
            int number = 1000 + random.nextInt(9000); 
            bookingNumber = String.format("%s-%d", prefix, number);
        } while (bookingRepository.findByBookingNumber(bookingNumber).isPresent());
        return bookingNumber;
    }
}
