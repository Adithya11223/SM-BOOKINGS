package com.salonbooking.api.mapper;

import com.salonbooking.api.dto.response.ReviewResponse;
import com.salonbooking.api.entity.Review;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapper {

    public ReviewResponse toResponse(Review entity) {
        if (entity == null) {
            return null;
        }
        return new ReviewResponse(
                entity.getId(),
                entity.getRating(),
                entity.getComment(),
                entity.getCustomer() != null ? entity.getCustomer().getId() : null,
                entity.getCustomer() != null ? entity.getCustomer().getName() : null,
                entity.getService() != null ? entity.getService().getId() : null,
                entity.getBooking() != null ? entity.getBooking().getId() : null,
                entity.getCreatedAt()
        );
    }
}
