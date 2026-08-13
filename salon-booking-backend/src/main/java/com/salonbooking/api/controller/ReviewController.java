package com.salonbooking.api.controller;

import com.salonbooking.api.dto.request.CreateReviewRequest;
import com.salonbooking.api.dto.response.ApiResponse;
import com.salonbooking.api.dto.response.ReviewResponse;
import com.salonbooking.api.dto.response.ServiceRatingSummaryDto;
import com.salonbooking.api.exception.BusinessException;
import com.salonbooking.api.security.UserDetailsImpl;
import com.salonbooking.api.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Endpoints for submitting and viewing service reviews and ratings")
public class ReviewController {

    private static final Logger log = LoggerFactory.getLogger(ReviewController.class);

    private final ReviewService reviewService;

    private UserDetailsImpl getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl) {
            return (UserDetailsImpl) auth.getPrincipal();
        }
        return null;
    }

    @PostMapping(value = {"/reviews", "/reviews/"})
    @Operation(summary = "Submit Review", description = "Submit a 1-5 star review for a completed booking service")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(@Valid @RequestBody CreateReviewRequest request) {
        UserDetailsImpl user = getAuthenticatedUser();
        UUID customerId = (user != null) ? user.getId() : null;
        ReviewResponse response = reviewService.createReview(customerId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review submitted successfully", response));
    }

    @GetMapping(value = {"/services/{serviceId}/reviews", "/services/{serviceId}/reviews/"})
    @Operation(summary = "Get Service Reviews", description = "Retrieve all customer reviews for a given service")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getServiceReviews(@PathVariable UUID serviceId) {
        List<ReviewResponse> response = reviewService.getReviewsForService(serviceId);
        return ResponseEntity.ok(ApiResponse.success("Service reviews retrieved successfully", response));
    }

    @GetMapping(value = {"/services/{serviceId}/rating-summary", "/services/{serviceId}/rating-summary/"})
    @Operation(summary = "Get Service Rating Summary", description = "Retrieve average rating and review count for a service")
    public ResponseEntity<ApiResponse<ServiceRatingSummaryDto>> getServiceRatingSummary(@PathVariable UUID serviceId) {
        ServiceRatingSummaryDto response = reviewService.getRatingSummaryForService(serviceId);
        return ResponseEntity.ok(ApiResponse.success("Service rating summary retrieved successfully", response));
    }
}
