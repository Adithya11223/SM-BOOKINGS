package com.salonbooking.api.controller;

import com.salonbooking.api.dto.response.AdminAnalyticsOverviewResponse;
import com.salonbooking.api.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/analytics")
@Tag(name = "Admin Analytics", description = "Backend-driven analytics for salon performance, revenue, bookings, and customer metrics")
@SecurityRequirement(name = "bearerAuth")
public class AnalyticsController {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsController.class);

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/overview")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get overview of admin analytics", description = "Returns revenue breakdown, booking counts, completion/cancellation rates, 7-day revenue trend, top 5 popular services, and customer insights.")
    public ResponseEntity<AdminAnalyticsOverviewResponse> getAnalyticsOverview() {
        log.info("Admin analytics overview requested");
        AdminAnalyticsOverviewResponse overview = analyticsService.getAnalyticsOverview();
        return ResponseEntity.ok(overview);
    }
}
