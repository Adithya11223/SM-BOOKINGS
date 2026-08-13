package com.salonbooking.api.service;

import com.salonbooking.api.dto.request.CreateBookingRequest;
import com.salonbooking.api.dto.request.UpdateBookingStatusRequest;
import com.salonbooking.api.dto.response.BookingDetailResponse;
import com.salonbooking.api.dto.response.BookingResponse;

import java.util.List;
import java.util.UUID;

public interface BookingService {
    List<BookingResponse> getAllBookings();
    BookingDetailResponse getBookingById(UUID id);
    BookingDetailResponse getBookingByNumber(String bookingNumber);
    List<BookingResponse> getBookingsByReferences(List<String> references);
    BookingDetailResponse createBooking(CreateBookingRequest request);
    BookingDetailResponse updateBookingStatus(UUID id, UpdateBookingStatusRequest request);
    void deleteBooking(UUID id);
    BookingDetailResponse partialAcceptBooking(UUID id, List<UUID> acceptedServiceIds);
    void markAdminViewed(UUID id);
    void markCustomerViewed(UUID id);
    void processAppointmentReminders();
}
