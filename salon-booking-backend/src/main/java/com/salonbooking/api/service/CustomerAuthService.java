package com.salonbooking.api.service;

import com.salonbooking.api.dto.CustomerLoginRequest;
import com.salonbooking.api.dto.CustomerRegisterRequest;
import com.salonbooking.api.dto.response.AuthResponse;

public interface CustomerAuthService {
    AuthResponse register(CustomerRegisterRequest request);
    AuthResponse login(CustomerLoginRequest request);
    void generateResetOtp(String phoneNumber);
    void resetPassword(String phoneNumber, String otp, String newPassword);
}
