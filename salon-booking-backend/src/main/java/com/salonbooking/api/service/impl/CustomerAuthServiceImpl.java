package com.salonbooking.api.service.impl;

import com.salonbooking.api.dto.CustomerLoginRequest;
import com.salonbooking.api.dto.CustomerRegisterRequest;
import com.salonbooking.api.dto.response.AuthResponse;
import com.salonbooking.api.entity.Customer;
import com.salonbooking.api.exception.BusinessException;
import com.salonbooking.api.repository.CustomerRepository;
import com.salonbooking.api.security.JwtUtils;
import com.salonbooking.api.service.CustomerAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerAuthServiceImpl implements CustomerAuthService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    
    // In-memory OTP storage for simulation purposes
    private final ConcurrentHashMap<String, String> otpStorage = new ConcurrentHashMap<>();

    @Override
    @Transactional
    public AuthResponse register(CustomerRegisterRequest request) {
        if (customerRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new BusinessException("Phone number is already in use");
        }

        Customer customer = Customer.builder()
                .name(request.getName())
                .phoneNumber(request.getPhoneNumber())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        customerRepository.save(customer);

        // Auto login after registration
        return login(new CustomerLoginRequest(request.getPhoneNumber(), request.getPassword()));
    }

    @Override
    public AuthResponse login(CustomerLoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getPhoneNumber(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        String cleanPhone = request.getPhoneNumber().replaceAll("[^0-9]", "");
        String suffix = cleanPhone.length() >= 10 ? cleanPhone.substring(cleanPhone.length() - 10) : cleanPhone;
        Customer customer = customerRepository.findByPhoneNumber(request.getPhoneNumber())
                .or(() -> customerRepository.findByPhoneNumber("+91" + suffix))
                .or(() -> customerRepository.findByPhoneNumber(suffix))
                .or(() -> customerRepository.findAll().stream()
                        .filter(c -> c.getPhoneNumber() != null && c.getPhoneNumber().replaceAll("[^0-9]", "").endsWith(suffix))
                        .findFirst())
                .orElseThrow(() -> new BusinessException("Customer not found"));

        return AuthResponse.builder()
                .id(customer.getId())
                .token(jwt)
                .type("Bearer")
                .name(customer.getName())
                .phoneNumber(customer.getPhoneNumber())
                .role("ROLE_CUSTOMER")
                .build();
    }

    @Override
    public void generateResetOtp(String phoneNumber) {
        if (!customerRepository.existsByPhoneNumber(phoneNumber)) {
            throw new BusinessException("No account found with this phone number.");
        }

        // Generate a random 4-digit OTP
        String otp = String.format("%04d", new Random().nextInt(10000));
        otpStorage.put(phoneNumber, otp);

        // Simulate sending SMS by logging it to the console
        log.info("\n\n=======================================================");
        log.info("🔔 SIMULATED SMS OTP 🔔");
        log.info("To: {}", phoneNumber);
        log.info("Your password reset code is: {}", otp);
        log.info("=======================================================\n\n");
    }

    @Override
    @Transactional
    public void resetPassword(String phoneNumber, String otp, String newPassword) {
        String storedOtp = otpStorage.get(phoneNumber);
        
        if (storedOtp == null || !storedOtp.equals(otp)) {
            throw new BusinessException("Invalid or expired OTP.");
        }

        Customer customer = customerRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new BusinessException("Customer not found."));

        customer.setPassword(passwordEncoder.encode(newPassword));
        customerRepository.save(customer);

        // Clear the OTP after successful reset
        otpStorage.remove(phoneNumber);
    }
}
