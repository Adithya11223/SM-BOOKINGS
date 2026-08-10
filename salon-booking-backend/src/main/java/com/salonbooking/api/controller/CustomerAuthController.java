package com.salonbooking.api.controller;

import com.salonbooking.api.dto.CustomerLoginRequest;
import com.salonbooking.api.dto.CustomerRegisterRequest;
import com.salonbooking.api.dto.ForgotPasswordRequest;
import com.salonbooking.api.dto.ResetPasswordRequest;
import com.salonbooking.api.dto.ApiResponse;
import com.salonbooking.api.dto.response.AuthResponse;
import com.salonbooking.api.service.CustomerAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth/customer")
@RequiredArgsConstructor
public class CustomerAuthController {

    private final CustomerAuthService customerAuthService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody CustomerRegisterRequest request) {
        log.info("REST Request to register customer");
        return ResponseEntity.ok(ApiResponse.success(customerAuthService.register(request), "Customer registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody CustomerLoginRequest request) {
        log.info("REST Request to login customer");
        return ResponseEntity.ok(ApiResponse.success(customerAuthService.login(request), "Customer logged in successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        log.info("REST Request to generate reset OTP");
        customerAuthService.generateResetOtp(request.getPhoneNumber());
        return ResponseEntity.ok(ApiResponse.success(null, "If an account exists, an OTP has been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        log.info("REST Request to reset password");
        customerAuthService.resetPassword(request.getPhoneNumber(), request.getOtp(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success(null, "Password reset successfully."));
    }
}
