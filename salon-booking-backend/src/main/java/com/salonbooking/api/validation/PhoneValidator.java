package com.salonbooking.api.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.util.StringUtils;

public class PhoneValidator implements ConstraintValidator<ValidPhone, String> {

    @Override
    public boolean isValid(String phone, ConstraintValidatorContext context) {
        if (!StringUtils.hasText(phone)) {
            return true; // Use @NotBlank or @NotNull for null checks
        }
        
        // Simple regex to allow digits, spaces, dashes, plus and parentheses
        // Must contain at least 10 digits
        String cleaned = phone.replaceAll("\\D", "");
        return phone.matches("^[\\d\\s\\-\\+\\(\\)]+$") && cleaned.length() >= 10;
    }
}
