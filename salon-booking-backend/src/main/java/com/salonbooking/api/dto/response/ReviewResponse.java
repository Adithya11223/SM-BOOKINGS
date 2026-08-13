package com.salonbooking.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

public class ReviewResponse {

    public ReviewResponse() {}

    public ReviewResponse(UUID id, Integer rating, String comment, UUID customerId, String customerName, UUID serviceId, UUID bookingId, Instant createdAt) {
        this.id = id;
        this.rating = rating;
        this.comment = comment;
        this.customerId = customerId;
        this.customerName = customerName;
        this.serviceId = serviceId;
        this.bookingId = bookingId;
        this.createdAt = createdAt;
    }
    private UUID id;
    private Integer rating;
    private String comment;
    private UUID customerId;
    private String customerName;
    private UUID serviceId;
    private UUID bookingId;
    private Instant createdAt;

    public UUID getId() { return id; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getComment() { return comment; }
    public UUID getCustomerId() { return customerId; }
    public String getCustomerName() { return customerName; }
    public UUID getServiceId() { return serviceId; }
    public UUID getBookingId() { return bookingId; }
    public Instant getCreatedAt() { return createdAt; }
}
