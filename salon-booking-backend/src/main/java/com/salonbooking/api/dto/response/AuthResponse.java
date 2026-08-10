package com.salonbooking.api.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class AuthResponse {
    private UUID id;
    private String token;
    private String type;
    private String name;
    private String email;
    private String phoneNumber;
    private String role;
}
