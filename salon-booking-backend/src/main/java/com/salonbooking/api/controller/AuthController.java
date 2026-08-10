package com.salonbooking.api.controller;

import com.salonbooking.api.dto.ApiResponse;
import com.salonbooking.api.dto.request.LoginRequest;
import com.salonbooking.api.dto.response.AuthResponse;
import com.salonbooking.api.security.JwtUtils;
import com.salonbooking.api.security.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.salonbooking.api.dto.request.UpdateCredentialsRequest;
import com.salonbooking.api.repository.AdminRepository;
import com.salonbooking.api.entity.Admin;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Admin authentication endpoints")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    @Operation(summary = "Admin Login", description = "Authenticates an admin and returns a JWT token")
    public ResponseEntity<ApiResponse<AuthResponse>> authenticateAdmin(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("REST Request to login admin: {}", loginRequest.getEmail());
        
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        AuthResponse authResponse = AuthResponse.builder()
                .id(userDetails.getId())
                .token(jwt)
                .type("Bearer")
                .name(userDetails.getName())
                .email(userDetails.getUsername())
                .role(userDetails.getAuthorities().iterator().next().getAuthority())
                .build();

        return ResponseEntity.ok(ApiResponse.success(authResponse, "Login successful"));
    }

    @PostMapping("/logout")
    @Operation(summary = "Admin Logout", description = "Logs out the current admin (Client should discard the token)")
    public ResponseEntity<ApiResponse<Void>> logout() {
        log.info("REST Request to logout");
        return ResponseEntity.ok(ApiResponse.success(null, "Logged out successfully"));
    }

    @GetMapping("/me")
    @Operation(summary = "Get Profile", description = "Gets the currently authenticated admin's profile")
    public ResponseEntity<ApiResponse<UserDetailsImpl>> getProfile(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success(userDetails, "Profile retrieved successfully"));
    }

    @PutMapping("/credentials")
    @Operation(summary = "Update Credentials", description = "Updates the authenticated admin's email and/or password")
    public ResponseEntity<ApiResponse<Void>> updateCredentials(@Valid @RequestBody UpdateCredentialsRequest request, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        Admin admin = adminRepository.findById(userDetails.getId())
            .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (request.getCurrentPassword() == null || request.getCurrentPassword().isEmpty()) {
            throw new RuntimeException("Error: Current password is required to update credentials!");
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), admin.getPassword())) {
            throw new RuntimeException("Error: Current password is incorrect!");
        }

        if (request.getNewEmail() != null && !request.getNewEmail().isEmpty()) {
            // Check if email already exists
            if (!admin.getEmail().equals(request.getNewEmail()) && adminRepository.findByEmail(request.getNewEmail()).isPresent()) {
                throw new RuntimeException("Error: Email is already in use!");
            }
            admin.setEmail(request.getNewEmail());
        }

        if (request.getNewPassword() != null && !request.getNewPassword().isEmpty()) {
            admin.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        adminRepository.save(admin);
        
        log.info("Admin credentials updated successfully for ID: {}", admin.getId());
        return ResponseEntity.ok(ApiResponse.success(null, "Credentials updated successfully. Please login again."));
    }
}
