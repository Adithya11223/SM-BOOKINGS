package com.salonbooking.api.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public class PopularServiceDto {
    private UUID serviceId;
    private String serviceName;
    private Long bookingCount;
    private BigDecimal revenueGenerated;

    public PopularServiceDto() {}

    public PopularServiceDto(UUID serviceId, String serviceName, Long bookingCount, BigDecimal revenueGenerated) {
        this.serviceId = serviceId;
        this.serviceName = serviceName;
        this.bookingCount = bookingCount;
        this.revenueGenerated = revenueGenerated;
    }

    public UUID getServiceId() { return serviceId; }
    public void setServiceId(UUID serviceId) { this.serviceId = serviceId; }
    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }
    public Long getBookingCount() { return bookingCount; }
    public void setBookingCount(Long bookingCount) { this.bookingCount = bookingCount; }
    public BigDecimal getRevenueGenerated() { return revenueGenerated; }
    public void setRevenueGenerated(BigDecimal revenueGenerated) { this.revenueGenerated = revenueGenerated; }
}
