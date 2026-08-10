package com.salonbooking.api.util;

import com.salonbooking.api.enums.BookingType;
import org.springframework.stereotype.Component;
import java.util.Random;

@Component
public class BookingReferenceGenerator {

    private final Random random = new Random();

    public String generateBookingNumber(BookingType type) {
        String prefix = type == BookingType.HOME_SERVICE ? "BKG-HEM" : "BKG-VS";
        // Generating a random 4-digit number as per user specification (e.g. 7778)
        int number = 1000 + random.nextInt(9000); 
        return String.format("%s-%d", prefix, number);
    }
}
