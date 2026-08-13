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
    private final com.salonbooking.api.repository.CustomerRepository customerRepository;
    private final ReviewMapper reviewMapper;
    private final com.salonbooking.api.mapper.BookingMapper bookingMapper;
    private final com.salonbooking.api.repository.NotificationRepository notificationRepository;
    private final com.salonbooking.api.service.PushNotificationService pushNotificationService;
    private final com.salonbooking.api.service.WebSocketEventPublisher webSocketEventPublisher;

    public ReviewServiceImpl(ReviewRepository reviewRepository,
                             BookingRepository bookingRepository,
                             ServiceRepository serviceRepository,
                             com.salonbooking.api.repository.CustomerRepository customerRepository,
                             ReviewMapper reviewMapper,
                             com.salonbooking.api.mapper.BookingMapper bookingMapper,
                             com.salonbooking.api.repository.NotificationRepository notificationRepository,
                             com.salonbooking.api.service.PushNotificationService pushNotificationService,
                             com.salonbooking.api.service.WebSocketEventPublisher webSocketEventPublisher) {
        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
        this.serviceRepository = serviceRepository;
        this.customerRepository = customerRepository;
        this.reviewMapper = reviewMapper;
        this.bookingMapper = bookingMapper;
        this.notificationRepository = notificationRepository;
        this.pushNotificationService = pushNotificationService;
        this.webSocketEventPublisher = webSocketEventPublisher;
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

        if (customerId != null) {
            boolean isOwner = booking.getCustomer().getId().equals(customerId);
            if (!isOwner) {
                com.salonbooking.api.entity.Customer loggedInCustomer = customerRepository.findById(customerId).orElse(null);
                if (loggedInCustomer != null && loggedInCustomer.getPhoneNumber() != null && booking.getCustomer().getPhoneNumber() != null) {
                    String p1 = loggedInCustomer.getPhoneNumber().replaceAll("[^0-9]", "");
                    String p2 = booking.getCustomer().getPhoneNumber().replaceAll("[^0-9]", "");
                    if (!p1.isEmpty() && p1.equals(p2)) {
                        isOwner = true;
                    }
                }
            }
            if (!isOwner) {
                boolean isAdmin = false;
                org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.getAuthorities() != null) {
                    isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
                }
                if (!isAdmin) {
                    throw new BusinessException("You can only review your own bookings");
                }
            }
        }

        UUID targetCustomerId = booking.getCustomer().getId();

        if (booking.getBookingStatus() != BookingStatus.COMPLETED) {
            throw new BusinessException("Only completed bookings can be reviewed");
        }

        if (reviewRepository.existsByBookingId(request.getBookingId())) {
            throw new BusinessException("You have already submitted a review for this order");
        }

        Service service = null;
        if (request.getServiceId() != null) {
            service = serviceRepository.findById(request.getServiceId()).orElse(null);
        }
        if (service == null && !booking.getItems().isEmpty() && booking.getItems().get(0).getService() != null) {
            service = booking.getItems().get(0).getService();
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

        // Notify Admin of new review
        try {
            String customerName = (booking.getCustomer() != null && booking.getCustomer().getName() != null)
                    ? booking.getCustomer().getName() : "Customer";
            String title = "⭐ New Order Rating";
            String stars = "★".repeat(Math.max(1, Math.min(5, saved.getRating())));
            String message = customerName + " rated order " + booking.getBookingNumber() + " " + stars +
                    (saved.getComment() != null && !saved.getComment().isBlank() ? ": \"" + saved.getComment() + "\"" : "");

            com.salonbooking.api.entity.Notification notif = com.salonbooking.api.entity.Notification.builder()
                    .booking(booking)
                    .receiverType("ADMIN")
                    .receiverId(null)
                    .title(title)
                    .message(message)
                    .type(com.salonbooking.api.enums.NotificationType.BOOKING_UPDATED)
                    .serviceId(service.getId())
                    .isRead(false)
                    .build();

            notif = notificationRepository.save(notif);
            webSocketEventPublisher.publishNotificationUpdate(notif);
            pushNotificationService.sendPushNotification(notif);

            // Publish updated booking event so admin dashboard cards update immediately
            ReviewResponse reviewResp = reviewMapper.toResponse(saved);
            webSocketEventPublisher.publishBookingUpdate("UPDATED", bookingMapper.toDetailResponse(booking));

            return reviewResp;
        } catch (Exception e) {
            log.error("Error pushing review notification to admin: {}", e.getMessage());
        }

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
