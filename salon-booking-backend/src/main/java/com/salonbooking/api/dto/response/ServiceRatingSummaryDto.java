package com.salonbooking.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

public class ServiceRatingSummaryDto {

    public ServiceRatingSummaryDto() {}

    public ServiceRatingSummaryDto(UUID serviceId, Double averageRating, Long reviewCount) {
        this.serviceId = serviceId;
        this.averageRating = averageRating;
        this.reviewCount = reviewCount;
    }
    private UUID serviceId;
    private Double averageRating;
    private Long reviewCount;

    public UUID getServiceId() { return serviceId; }
    public void setServiceId(UUID serviceId) { this.serviceId = serviceId; }
    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
    public Long getReviewCount() { return reviewCount; }
    public void setReviewCount(Long reviewCount) { this.reviewCount = reviewCount; }
}
