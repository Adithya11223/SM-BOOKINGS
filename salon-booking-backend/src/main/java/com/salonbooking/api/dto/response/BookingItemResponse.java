package com.salonbooking.api.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class BookingItemResponse {
    private UUID id;
    private UUID serviceId; // Can be null if service was deleted
    private String serviceNameSnapshot;
    private BigDecimal priceSnapshot;
    private Integer durationSnapshot;
    private Integer quantity;
    private BigDecimal subtotal;
}
