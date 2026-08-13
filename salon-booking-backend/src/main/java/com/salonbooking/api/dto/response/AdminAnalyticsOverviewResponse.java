package com.salonbooking.api.dto.response;

import java.math.BigDecimal;
import java.util.List;

public class AdminAnalyticsOverviewResponse {

    // Revenue Overview
    private BigDecimal todayRevenue;
    private BigDecimal currentWeekRevenue;
    private BigDecimal currentMonthRevenue;
    private BigDecimal previousMonthRevenue;

    // Booking Overview
    private Long totalBookings;
    private Long pendingBookings;
    private Long confirmedBookings;
    private Long completedBookings;
    private Long cancelledBookings;

    // Booking Performance
    private Double completionRate;
    private Double cancellationRate;

    // Customer Metrics
    private Long totalCustomers;
    private Long customersWithCompletedBookings;
    private Long repeatCustomers;

    // Charts & Top Items
    private List<DailyRevenueDto> revenueTrend;
    private List<PopularServiceDto> popularServices;

    public AdminAnalyticsOverviewResponse() {}

    public AdminAnalyticsOverviewResponse(BigDecimal todayRevenue, BigDecimal currentWeekRevenue, BigDecimal currentMonthRevenue, BigDecimal previousMonthRevenue, Long totalBookings, Long pendingBookings, Long confirmedBookings, Long completedBookings, Long cancelledBookings, Double completionRate, Double cancellationRate, Long totalCustomers, Long customersWithCompletedBookings, Long repeatCustomers, List<DailyRevenueDto> revenueTrend, List<PopularServiceDto> popularServices) {
        this.todayRevenue = todayRevenue;
        this.currentWeekRevenue = currentWeekRevenue;
        this.currentMonthRevenue = currentMonthRevenue;
        this.previousMonthRevenue = previousMonthRevenue;
        this.totalBookings = totalBookings;
        this.pendingBookings = pendingBookings;
        this.confirmedBookings = confirmedBookings;
        this.completedBookings = completedBookings;
        this.cancelledBookings = cancelledBookings;
        this.completionRate = completionRate;
        this.cancellationRate = cancellationRate;
        this.totalCustomers = totalCustomers;
        this.customersWithCompletedBookings = customersWithCompletedBookings;
        this.repeatCustomers = repeatCustomers;
        this.revenueTrend = revenueTrend;
        this.popularServices = popularServices;
    }

    public BigDecimal getTodayRevenue() { return todayRevenue; }
    public void setTodayRevenue(BigDecimal todayRevenue) { this.todayRevenue = todayRevenue; }
    public BigDecimal getCurrentWeekRevenue() { return currentWeekRevenue; }
    public void setCurrentWeekRevenue(BigDecimal currentWeekRevenue) { this.currentWeekRevenue = currentWeekRevenue; }
    public BigDecimal getCurrentMonthRevenue() { return currentMonthRevenue; }
    public void setCurrentMonthRevenue(BigDecimal currentMonthRevenue) { this.currentMonthRevenue = currentMonthRevenue; }
    public BigDecimal getPreviousMonthRevenue() { return previousMonthRevenue; }
    public void setPreviousMonthRevenue(BigDecimal previousMonthRevenue) { this.previousMonthRevenue = previousMonthRevenue; }

    public Long getTotalBookings() { return totalBookings; }
    public void setTotalBookings(Long totalBookings) { this.totalBookings = totalBookings; }
    public Long getPendingBookings() { return pendingBookings; }
    public void setPendingBookings(Long pendingBookings) { this.pendingBookings = pendingBookings; }
    public Long getConfirmedBookings() { return confirmedBookings; }
    public void setConfirmedBookings(Long confirmedBookings) { this.confirmedBookings = confirmedBookings; }
    public Long getCompletedBookings() { return completedBookings; }
    public void setCompletedBookings(Long completedBookings) { this.completedBookings = completedBookings; }
    public Long getCancelledBookings() { return cancelledBookings; }
    public void setCancelledBookings(Long cancelledBookings) { this.cancelledBookings = cancelledBookings; }

    public Double getCompletionRate() { return completionRate; }
    public void setCompletionRate(Double completionRate) { this.completionRate = completionRate; }
    public Double getCancellationRate() { return cancellationRate; }
    public void setCancellationRate(Double cancellationRate) { this.cancellationRate = cancellationRate; }

    public Long getTotalCustomers() { return totalCustomers; }
    public void setTotalCustomers(Long totalCustomers) { this.totalCustomers = totalCustomers; }
    public Long getCustomersWithCompletedBookings() { return customersWithCompletedBookings; }
    public void setCustomersWithCompletedBookings(Long customersWithCompletedBookings) { this.customersWithCompletedBookings = customersWithCompletedBookings; }
    public Long getRepeatCustomers() { return repeatCustomers; }
    public void setRepeatCustomers(Long repeatCustomers) { this.repeatCustomers = repeatCustomers; }

    public List<DailyRevenueDto> getRevenueTrend() { return revenueTrend; }
    public void setRevenueTrend(List<DailyRevenueDto> revenueTrend) { this.revenueTrend = revenueTrend; }
    public List<PopularServiceDto> getPopularServices() { return popularServices; }
    public void setPopularServices(List<PopularServiceDto> popularServices) { this.popularServices = popularServices; }
}
