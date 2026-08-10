package com.salonbooking.api.dto.request;

import com.salonbooking.api.validation.ValidEmail;
import com.salonbooking.api.validation.ValidPhone;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CustomerRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Phone number is required")
    @ValidPhone
    private String phoneNumber;

    @ValidEmail
    private String email;

    private String notes;
}
