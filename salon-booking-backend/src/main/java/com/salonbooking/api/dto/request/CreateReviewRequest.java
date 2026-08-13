package com.salonbooking.api.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

public class CreateReviewRequest {

    public CreateReviewRequest() {}

    public CreateReviewRequest(UUID bookingId, UUID serviceId, Integer rating, String comment) {
        this.bookingId = bookingId;
        this.serviceId = serviceId;
        this.rating = rating;
        this.comment = comment;
    }

    @NotNull(message = "Booking ID is required")
    private UUID bookingId;

    @NotNull(message = "Service ID is required")
    private UUID serviceId;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating cannot exceed 5")
    private Integer rating;

    private String comment;

    public UUID getBookingId() { return bookingId; }
    public void setBookingId(UUID bookingId) { this.bookingId = bookingId; }
    public UUID getServiceId() { return serviceId; }
    public void setServiceId(UUID serviceId) { this.serviceId = serviceId; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}
