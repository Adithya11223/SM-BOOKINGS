package com.salonbooking.api.service.impl;

import com.salonbooking.api.dto.request.CreateReviewRequest;
import com.salonbooking.api.dto.response.ReviewResponse;
import com.salonbooking.api.dto.response.ServiceRatingSummaryDto;
import com.salonbooking.api.entity.Booking;
import com.salonbooking.api.entity.Review;
import com.salonbooking.api.entity.Service;
import com.salonbooking.api.enums.BookingStatus;
import com.salonbooking.api.exception.BusinessException;
import com.salonbooking.api.exception.ResourceNotFoundException;
import com.salonbooking.api.mapper.ReviewMapper;
import com.salonbooking.api.repository.BookingRepository;
import com.salonbooking.api.repository.ReviewRepository;
import com.salonbooking.api.repository.ServiceRepository;
import com.salonbooking.api.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
public class ReviewServiceImpl implements ReviewService {

    private static final Logger log = LoggerFactory.getLogger(ReviewServiceImpl.class);

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final ServiceRepository serviceRepository;
    private final ReviewMapper reviewMapper;

    public ReviewServiceImpl(ReviewRepository reviewRepository,
                             BookingRepository bookingRepository,
                             ServiceRepository serviceRepository,
                             ReviewMapper reviewMapper) {
        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
        this.serviceRepository = serviceRepository;
        this.reviewMapper = reviewMapper;
    }

    @Override
    @Transactional
    public ReviewResponse createReview(UUID customerId, CreateReviewRequest request) {
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new BusinessException("Rating must be an integer between 1 and 5");
        }

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + request.getBookingId()));

        if (booking.getCustomer() == null) {
            throw new BusinessException("Booking has no associated customer");
        }

        if (customerId != null && !booking.getCustomer().getId().equals(customerId)) {
            throw new BusinessException("You can only review your own bookings");
        }

        UUID targetCustomerId = booking.getCustomer().getId();

        if (booking.getBookingStatus() != BookingStatus.COMPLETED) {
            throw new BusinessException("Only completed bookings can be reviewed");
        }

        Service service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with ID: " + request.getServiceId()));

        boolean serviceInBooking = booking.getItems().stream()
                .anyMatch(item -> item.getService() != null && item.getService().getId().equals(request.getServiceId()));

        if (!serviceInBooking) {
            throw new BusinessException("Selected service was not part of this booking");
        }

        if (reviewRepository.existsByBookingIdAndServiceId(request.getBookingId(), request.getServiceId())) {
            throw new BusinessException("You have already submitted a review for this service in this booking");
        }

        Review review = new Review(
                request.getRating(),
                request.getComment() != null ? request.getComment().trim() : null,
                booking.getCustomer(),
                service,
                booking
        );

        Review saved = reviewRepository.save(review);
        log.info("Saved review {} for booking {} by customer {}", saved.getId(), booking.getId(), targetCustomerId);
        return reviewMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsForService(UUID serviceId) {
        if (!serviceRepository.existsById(serviceId)) {
            throw new ResourceNotFoundException("Service not found with ID: " + serviceId);
        }
        return reviewRepository.findByServiceId(serviceId).stream()
                .map(reviewMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ServiceRatingSummaryDto getRatingSummaryForService(UUID serviceId) {
        if (!serviceRepository.existsById(serviceId)) {
            throw new ResourceNotFoundException("Service not found with ID: " + serviceId);
        }
        Double avg = reviewRepository.getAverageRatingForService(serviceId);
        long count = reviewRepository.countByServiceId(serviceId);
        double roundedAvg = avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0;

        return new ServiceRatingSummaryDto(serviceId, roundedAvg, count);
    }
}
