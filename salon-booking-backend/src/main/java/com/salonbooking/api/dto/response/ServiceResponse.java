package com.salonbooking.api.dto.response;

import com.salonbooking.api.enums.ServiceCategory;
import com.salonbooking.api.enums.ServiceType;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class ServiceResponse {
    private UUID id;
    private String name;
    private String description;
    private ServiceCategory category;
    private ServiceType type;
    private BigDecimal price;
    private Integer durationMinutes;
    private String imageUrl;
    private Boolean isVisible;
    private Integer displayOrder;
}
