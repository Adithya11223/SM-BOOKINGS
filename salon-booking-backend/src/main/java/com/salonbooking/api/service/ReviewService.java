package com.salonbooking.api.service;

import com.salonbooking.api.dto.request.CreateReviewRequest;
import com.salonbooking.api.dto.response.ReviewResponse;
import com.salonbooking.api.dto.response.ServiceRatingSummaryDto;

import java.util.List;
import java.util.UUID;

public interface ReviewService {
    ReviewResponse createReview(UUID customerId, CreateReviewRequest request);
    List<ReviewResponse> getReviewsForService(UUID serviceId);
    ServiceRatingSummaryDto getRatingSummaryForService(UUID serviceId);
}
