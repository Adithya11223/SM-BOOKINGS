package com.salonbooking.api.dto.request;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class UpdateCredentialsRequest {
    @Email(message = "Please provide a valid email address")
    private String newEmail;
    
    private String newPassword;
    
    private String currentPassword;
}
