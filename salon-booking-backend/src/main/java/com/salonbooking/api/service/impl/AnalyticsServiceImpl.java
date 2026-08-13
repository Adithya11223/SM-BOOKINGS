package com.salonbooking.api.service.impl;

import com.salonbooking.api.dto.response.AdminAnalyticsOverviewResponse;
import com.salonbooking.api.dto.response.DailyRevenueDto;
import com.salonbooking.api.dto.response.PopularServiceDto;
import com.salonbooking.api.enums.BookingStatus;
import com.salonbooking.api.repository.BookingRepository;
import com.salonbooking.api.repository.CustomerRepository;
import com.salonbooking.api.service.AnalyticsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsServiceImpl.class);

    private final BookingRepository bookingRepository;
    private final CustomerRepository customerRepository;

    public AnalyticsServiceImpl(BookingRepository bookingRepository, CustomerRepository customerRepository) {
        this.bookingRepository = bookingRepository;
        this.customerRepository = customerRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public AdminAnalyticsOverviewResponse getAnalyticsOverview() {
        LocalDate today = LocalDate.now();
        ZoneId zoneId = ZoneId.systemDefault();
        List<BookingStatus> validStatuses = Arrays.asList(BookingStatus.CONFIRMED, BookingStatus.COMPLETED);

        // 1. Revenue Overview
        BigDecimal todayRevenue = bookingRepository.calculateRevenueForDate(validStatuses, today);

        LocalDate startOfWeek = today.with(DayOfWeek.MONDAY);
        LocalDate startOfNextWeek = startOfWeek.plusWeeks(1);
        BigDecimal currentWeekRevenue = bookingRepository.calculateRevenueBetween(
                validStatuses,
                startOfWeek.atStartOfDay(zoneId).toInstant(),
                startOfNextWeek.atStartOfDay(zoneId).toInstant()
        );

        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDate startOfNextMonth = startOfMonth.plusMonths(1);
        BigDecimal currentMonthRevenue = bookingRepository.calculateRevenueBetween(
                validStatuses,
                startOfMonth.atStartOfDay(zoneId).toInstant(),
                startOfNextMonth.atStartOfDay(zoneId).toInstant()
        );

        LocalDate startOfPrevMonth = startOfMonth.minusMonths(1);
        BigDecimal previousMonthRevenue = bookingRepository.calculateRevenueBetween(
                validStatuses,
                startOfPrevMonth.atStartOfDay(zoneId).toInstant(),
                startOfMonth.atStartOfDay(zoneId).toInstant()
        );

        // 2. Booking Counts & Statuses
        long totalBookings = bookingRepository.count();
        long pendingBookings = bookingRepository.countByBookingStatus(BookingStatus.PENDING);
        long confirmedBookings = bookingRepository.countByBookingStatus(BookingStatus.CONFIRMED);
        long completedBookings = bookingRepository.countByBookingStatus(BookingStatus.COMPLETED);
        long cancelledBookings = bookingRepository.countByBookingStatus(BookingStatus.CANCELLED);

        // 3. Performance Rates
        double completionRate = totalBookings > 0
                ? Math.round(((double) completedBookings / totalBookings) * 1000.0) / 10.0
                : 0.0;
        double cancellationRate = totalBookings > 0
                ? Math.round(((double) cancelledBookings / totalBookings) * 1000.0) / 10.0
                : 0.0;

        // 4. Revenue Trend (Last 7 Days)
        List<DailyRevenueDto> revenueTrend = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            BigDecimal dayRevenue = bookingRepository.calculateRevenueForDate(validStatuses, date);
            String dateStr = date.toString();
            String dayLabel = date.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);

            revenueTrend.add(new DailyRevenueDto(dateStr, dayLabel, dayRevenue != null ? dayRevenue : BigDecimal.ZERO));
        }

        // 5. Popular Services (Top 5)
        List<PopularServiceDto> popularServices = new ArrayList<>();
        List<Object[]> topServiceRows = bookingRepository.findTopPopularServices(validStatuses, PageRequest.of(0, 5));
        if (topServiceRows != null) {
            for (Object[] row : topServiceRows) {
                UUID sId = (UUID) row[0];
                String sName = (String) row[1];
                Long bCount = (Long) row[2];
                BigDecimal rev = (BigDecimal) row[3];
                popularServices.add(new PopularServiceDto(sId, sName, bCount, rev != null ? rev : BigDecimal.ZERO));
            }
        }

        // 6. Customer Metrics
        long totalCustomers = customerRepository.count();
        Long withCompleted = customerRepository.countCustomersWithCompletedBookings();
        long customersWithCompleted = withCompleted != null ? withCompleted : 0L;

        List<UUID> repeatCustomerIds = customerRepository.findRepeatCustomerIds();
        long repeatCustomers = repeatCustomerIds != null ? repeatCustomerIds.size() : 0L;

        log.info("Fetched admin analytics: Total Bookings={}, Today Revenue={}, Popular Services Count={}",
                totalBookings, todayRevenue, popularServices.size());

        return new AdminAnalyticsOverviewResponse(
                todayRevenue != null ? todayRevenue : BigDecimal.ZERO,
                currentWeekRevenue != null ? currentWeekRevenue : BigDecimal.ZERO,
                currentMonthRevenue != null ? currentMonthRevenue : BigDecimal.ZERO,
                previousMonthRevenue != null ? previousMonthRevenue : BigDecimal.ZERO,
                totalBookings,
                pendingBookings,
                confirmedBookings,
                completedBookings,
                cancelledBookings,
                completionRate,
                cancellationRate,
                totalCustomers,
                customersWithCompleted,
                repeatCustomers,
                revenueTrend,
                popularServices
        );
    }
}
