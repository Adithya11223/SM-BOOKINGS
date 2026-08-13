package com.salonbooking.api.dto.response;

import java.math.BigDecimal;

public class DailyRevenueDto {
    private String dateStr;
    private String dayLabel;
    private BigDecimal revenue;

    public DailyRevenueDto() {}

    public DailyRevenueDto(String dateStr, String dayLabel, BigDecimal revenue) {
        this.dateStr = dateStr;
        this.dayLabel = dayLabel;
        this.revenue = revenue;
    }

    public String getDateStr() { return dateStr; }
    public void setDateStr(String dateStr) { this.dateStr = dateStr; }
    public String getDayLabel() { return dayLabel; }
    public void setDayLabel(String dayLabel) { this.dayLabel = dayLabel; }
    public BigDecimal getRevenue() { return revenue; }
    public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
}
