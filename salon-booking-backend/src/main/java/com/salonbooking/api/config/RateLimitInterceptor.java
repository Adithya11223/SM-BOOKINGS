package com.salonbooking.api.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private final Map<String, Bucket> loginBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> bookingBuckets = new ConcurrentHashMap<>();

    // Login: 5 requests per minute
    private Bucket getLoginBucket(String ip) {
        return loginBuckets.computeIfAbsent(ip, k -> Bucket.builder()
                .addLimit(Bandwidth.classic(5, Refill.intervally(5, Duration.ofMinutes(1))))
                .build());
    }

    // Booking: 10 requests per minute
    private Bucket getBookingBucket(String ip) {
        return bookingBuckets.computeIfAbsent(ip, k -> Bucket.builder()
                .addLimit(Bandwidth.classic(10, Refill.intervally(10, Duration.ofMinutes(1))))
                .build());
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String uri = request.getRequestURI();
        String clientIp = request.getRemoteAddr(); // Or X-Forwarded-For if behind a proxy

        if (uri.startsWith("/api/v1/auth/login")) {
            Bucket bucket = getLoginBucket(clientIp);
            if (!bucket.tryConsume(1)) {
                log.warn("Rate limit exceeded for login attempt from IP: {}", clientIp);
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.getWriter().write("Too many login attempts. Please try again later.");
                return false;
            }
        } else if (uri.startsWith("/api/v1/bookings") && request.getMethod().equalsIgnoreCase("POST")) {
            Bucket bucket = getBookingBucket(clientIp);
            if (!bucket.tryConsume(1)) {
                log.warn("Rate limit exceeded for booking attempt from IP: {}", clientIp);
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.getWriter().write("Too many booking attempts. Please try again later.");
                return false;
            }
        }

        return true;
    }
}
