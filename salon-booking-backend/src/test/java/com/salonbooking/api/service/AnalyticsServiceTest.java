package com.salonbooking.api.service;

import com.salonbooking.api.dto.response.AdminAnalyticsOverviewResponse;
import com.salonbooking.api.enums.BookingStatus;
import com.salonbooking.api.repository.BookingRepository;
import com.salonbooking.api.repository.CustomerRepository;
import com.salonbooking.api.service.impl.AnalyticsServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private CustomerRepository customerRepository;

    private AnalyticsService analyticsService;

    @BeforeEach
    void setUp() {
        analyticsService = new AnalyticsServiceImpl(bookingRepository, customerRepository);
    }

    @Test
    void revenueOverviewAndBookingCountsCalculatedCorrectly() {
        LocalDate today = LocalDate.now();
        when(bookingRepository.calculateRevenueForDate(any(LocalDate.class))).thenReturn(new BigDecimal("1500.00"));
        when(bookingRepository.calculateRevenueBetween(any(Instant.class), any(Instant.class))).thenReturn(new BigDecimal("5000.00"));

        when(bookingRepository.count()).thenReturn(10L);
        when(bookingRepository.countByBookingStatus(BookingStatus.PENDING)).thenReturn(2L);
        when(bookingRepository.countByBookingStatus(BookingStatus.CONFIRMED)).thenReturn(3L);
        when(bookingRepository.countByBookingStatus(BookingStatus.COMPLETED)).thenReturn(4L);
        when(bookingRepository.countByBookingStatus(BookingStatus.CANCELLED)).thenReturn(1L);

        when(customerRepository.count()).thenReturn(8L);
        when(customerRepository.countCustomersWithCompletedBookings()).thenReturn(4L);
        when(customerRepository.findRepeatCustomerIds()).thenReturn(Collections.singletonList(UUID.randomUUID()));

        UUID serviceId = UUID.randomUUID();
        List<Object[]> topServices = new ArrayList<>();
        topServices.add(new Object[]{serviceId, "Haircut & Styling", 5L, new BigDecimal("2500.00")});
        when(bookingRepository.findTopPopularServices(any(Pageable.class))).thenReturn(topServices);

        AdminAnalyticsOverviewResponse response = analyticsService.getAnalyticsOverview();

        assertNotNull(response);
        assertEquals(new BigDecimal("1500.00"), response.getTodayRevenue());
        assertEquals(new BigDecimal("5000.00"), response.getCurrentWeekRevenue());
        assertEquals(10L, response.getTotalBookings());
        assertEquals(2L, response.getPendingBookings());
        assertEquals(3L, response.getConfirmedBookings());
        assertEquals(4L, response.getCompletedBookings());
        assertEquals(1L, response.getCancelledBookings());

        assertEquals(40.0, response.getCompletionRate());
        assertEquals(10.0, response.getCancellationRate());

        assertEquals(8L, response.getTotalCustomers());
        assertEquals(4L, response.getCustomersWithCompletedBookings());
        assertEquals(1L, response.getRepeatCustomers());

        assertEquals(7, response.getRevenueTrend().size());
        assertEquals(1, response.getPopularServices().size());
        assertEquals("Haircut & Styling", response.getPopularServices().get(0).getServiceName());
    }

    @Test
    void emptyDatabaseReturnsZeroesSafely() {
        when(bookingRepository.calculateRevenueForDate(any(LocalDate.class))).thenReturn(BigDecimal.ZERO);
        when(bookingRepository.calculateRevenueBetween(any(Instant.class), any(Instant.class))).thenReturn(BigDecimal.ZERO);

        when(bookingRepository.count()).thenReturn(0L);
        when(bookingRepository.countByBookingStatus(any(BookingStatus.class))).thenReturn(0L);

        when(customerRepository.count()).thenReturn(0L);
        when(customerRepository.countCustomersWithCompletedBookings()).thenReturn(0L);
        when(customerRepository.findRepeatCustomerIds()).thenReturn(Collections.emptyList());
        when(bookingRepository.findTopPopularServices(any(Pageable.class))).thenReturn(Collections.emptyList());

        AdminAnalyticsOverviewResponse response = analyticsService.getAnalyticsOverview();

        assertNotNull(response);
        assertEquals(BigDecimal.ZERO, response.getTodayRevenue());
        assertEquals(0L, response.getTotalBookings());
        assertEquals(0.0, response.getCompletionRate());
        assertEquals(0.0, response.getCancellationRate());
        assertEquals(0L, response.getRepeatCustomers());
        assertEquals(7, response.getRevenueTrend().size());
        assertTrue(response.getPopularServices().isEmpty());
    }
}
