package com.salonbooking.api.util;

import com.salonbooking.api.entity.BookingItem;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class PriceCalculator {

    public BigDecimal calculateTotalAmount(List<BookingItem> items) {
        if (items == null || items.isEmpty()) {
            return BigDecimal.ZERO;
        }
        
        return items.stream()
                .map(BookingItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public Integer calculateTotalDuration(List<BookingItem> items) {
        if (items == null || items.isEmpty()) {
            return 0;
        }
        
        return items.stream()
                .mapToInt(item -> item.getDurationSnapshot() * item.getQuantity())
                .sum();
    }
}
