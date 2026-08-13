package com.salonbooking.api.service;

import com.salonbooking.api.dto.request.CreateReviewRequest;
import com.salonbooking.api.dto.response.ReviewResponse;
import com.salonbooking.api.dto.response.ServiceRatingSummaryDto;
import com.salonbooking.api.entity.Booking;
import com.salonbooking.api.entity.BookingItem;
import com.salonbooking.api.entity.Customer;
import com.salonbooking.api.entity.Review;
import com.salonbooking.api.entity.Service;
import com.salonbooking.api.enums.BookingStatus;
import com.salonbooking.api.exception.BusinessException;
import com.salonbooking.api.mapper.ReviewMapper;
import com.salonbooking.api.repository.BookingRepository;
import com.salonbooking.api.repository.ReviewRepository;
import com.salonbooking.api.repository.ServiceRepository;
import com.salonbooking.api.service.impl.ReviewServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private ServiceRepository serviceRepository;

    @Mock
    private com.salonbooking.api.repository.CustomerRepository customerRepository;

    @Mock
    private ReviewMapper reviewMapper;

    @Mock
    private com.salonbooking.api.mapper.BookingMapper bookingMapper;

    @Mock
    private com.salonbooking.api.repository.NotificationRepository notificationRepository;

    @Mock
    private PushNotificationService pushNotificationService;

    @Mock
    private WebSocketEventPublisher webSocketEventPublisher;

    @InjectMocks
    private ReviewServiceImpl reviewService;

    private UUID customerId;
    private UUID otherCustomerId;
    private UUID bookingId;
    private UUID serviceId;
    private Customer customer;
    private Service service;
    private Booking completedBooking;
    private Booking pendingBooking;
    private Booking confirmedBooking;
    private Booking cancelledBooking;

    @BeforeEach
    void setUp() {
        customerId = UUID.randomUUID();
        otherCustomerId = UUID.randomUUID();
        bookingId = UUID.randomUUID();
        serviceId = UUID.randomUUID();

        customer = new Customer();
        customer.setId(customerId);
        customer.setName("Customer A");

        service = new Service();
        service.setId(serviceId);
        service.setName("Hair Cut");

        BookingItem item = BookingItem.builder()
                .service(service)
                .build();
        item.setId(UUID.randomUUID());

        completedBooking = Booking.builder()
                .customer(customer)
                .bookingStatus(BookingStatus.COMPLETED)
                .items(Collections.singletonList(item))
                .build();
        completedBooking.setId(bookingId);

        pendingBooking = Booking.builder()
                .customer(customer)
                .bookingStatus(BookingStatus.PENDING)
                .items(Collections.singletonList(item))
                .build();
        pendingBooking.setId(bookingId);

        confirmedBooking = Booking.builder()
                .customer(customer)
                .bookingStatus(BookingStatus.CONFIRMED)
                .items(Collections.singletonList(item))
                .build();
        confirmedBooking.setId(bookingId);

        cancelledBooking = Booking.builder()
                .customer(customer)
                .bookingStatus(BookingStatus.CANCELLED)
                .items(Collections.singletonList(item))
                .build();
        cancelledBooking.setId(bookingId);
    }

    @Test
    void completedCustomerBookingCanBeReviewed() {
        CreateReviewRequest req = new CreateReviewRequest(bookingId, serviceId, 5, "Excellent service!");

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(completedBooking));
        when(reviewRepository.existsByBookingId(bookingId)).thenReturn(false);

        Review savedReview = new Review();
        savedReview.setId(UUID.randomUUID());
        savedReview.setRating(5);
        savedReview.setComment("Excellent service!");

        ReviewResponse mockResp = new ReviewResponse();
        mockResp.setRating(5);

        when(reviewRepository.save(any(Review.class))).thenReturn(savedReview);
        when(reviewMapper.toResponse(savedReview)).thenReturn(mockResp);

        ReviewResponse response = reviewService.createReview(customerId, req);

        assertNotNull(response);
        assertEquals(5, response.getRating());
        verify(reviewRepository).save(any(Review.class));
    }

    @Test
    void pendingBookingCannotBeReviewed() {
        CreateReviewRequest req = new CreateReviewRequest(bookingId, serviceId, 5, "Nice");

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(pendingBooking));

        assertThrows(BusinessException.class, () -> reviewService.createReview(customerId, req));
    }

    @Test
    void confirmedBookingCannotBeReviewed() {
        CreateReviewRequest req = new CreateReviewRequest(bookingId, serviceId, 5, "Nice");

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(confirmedBooking));

        assertThrows(BusinessException.class, () -> reviewService.createReview(customerId, req));
    }

    @Test
    void cancelledBookingCannotBeReviewed() {
        CreateReviewRequest req = new CreateReviewRequest(bookingId, serviceId, 5, "Nice");

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(cancelledBooking));

        assertThrows(BusinessException.class, () -> reviewService.createReview(customerId, req));
    }

    @Test
    void duplicateReviewThrowsException() {
        CreateReviewRequest req = new CreateReviewRequest(bookingId, serviceId, 5, "Nice");

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(completedBooking));
        when(reviewRepository.existsByBookingId(bookingId)).thenReturn(true);

        assertThrows(BusinessException.class, () -> reviewService.createReview(customerId, req));
    }

    @Test
    void nonOwnerCannotReviewBooking() {
        CreateReviewRequest req = new CreateReviewRequest(bookingId, serviceId, 5, "Nice");

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(completedBooking));

        UUID otherCustomer = UUID.randomUUID();
        assertThrows(BusinessException.class, () -> reviewService.createReview(otherCustomer, req));
    }

    @Test
    void invalidRatingBelow1ThrowsException() {
        CreateReviewRequest req = new CreateReviewRequest(bookingId, serviceId, 0, "Bad");

        assertThrows(BusinessException.class, () -> reviewService.createReview(customerId, req));
    }

    @Test
    void invalidRatingAbove5ThrowsException() {
        CreateReviewRequest req = new CreateReviewRequest(bookingId, serviceId, 6, "Super");

        assertThrows(BusinessException.class, () -> reviewService.createReview(customerId, req));
    }

    @Test
    void duplicateReviewIsRejected() {
        CreateReviewRequest req = new CreateReviewRequest(bookingId, serviceId, 5, "Nice");

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(completedBooking));
        when(reviewRepository.existsByBookingId(bookingId)).thenReturn(true);

        assertThrows(BusinessException.class, () -> reviewService.createReview(customerId, req));
    }

    @Test
    void serviceRatingAverageAndCountCalculatedCorrectly() {
        when(serviceRepository.existsById(serviceId)).thenReturn(true);
        when(reviewRepository.getAverageRatingForService(serviceId)).thenReturn(4.6666);
        when(reviewRepository.countByServiceId(serviceId)).thenReturn(3L);

        ServiceRatingSummaryDto summary = reviewService.getRatingSummaryForService(serviceId);

        assertNotNull(summary);
        assertEquals(4.7, summary.getAverageRating());
        assertEquals(3L, summary.getReviewCount());
    }
}
