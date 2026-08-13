package com.salonbooking.api.dto.response;

import com.salonbooking.api.enums.BookingStatus;
import com.salonbooking.api.enums.BookingType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class BookingResponse {
    private UUID id;
    private String bookingNumber;
    private BookingType bookingType;
    private BookingStatus bookingStatus;
    private LocalDate bookingDate;
    private LocalTime bookingTime;
    private BigDecimal totalAmount;
    private Integer totalDuration;
    private String customerName; // Flattened for easy summary display
    private Boolean hasUnreadAdminUpdates;
    private Boolean hasUnreadCustomerUpdates;
}
