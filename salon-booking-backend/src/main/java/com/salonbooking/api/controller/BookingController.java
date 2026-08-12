package com.salonbooking.api.controller;

import com.salonbooking.api.dto.ApiResponse;
import com.salonbooking.api.dto.request.CreateBookingRequest;
import com.salonbooking.api.dto.request.UpdateBookingStatusRequest;
import com.salonbooking.api.dto.response.BookingDetailResponse;
import com.salonbooking.api.dto.response.BookingResponse;
import com.salonbooking.api.dto.response.PageResponse;
import com.salonbooking.api.enums.BookingStatus;
import com.salonbooking.api.enums.BookingType;
import com.salonbooking.api.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.salonbooking.api.service.WebSocketEventPublisher;

@Slf4j
@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Endpoints for managing customer bookings")
public class BookingController {

    private final BookingService bookingService;
    private final WebSocketEventPublisher webSocketEventPublisher;

    @PostMapping
    @Operation(summary = "Create Booking", description = "Creates a new booking and automatically generates a unique reference number")
    public ResponseEntity<ApiResponse<BookingDetailResponse>> createBooking(@Valid @RequestBody CreateBookingRequest request) {
        log.info("REST Request to create booking");
        BookingDetailResponse response = bookingService.createBooking(request);
        webSocketEventPublisher.publishBookingUpdate("CREATED", response);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Booking created successfully"));
    }

    @GetMapping
    @Operation(summary = "Get All Bookings", description = "Retrieves all bookings with optional filtering and pagination")
    public ResponseEntity<ApiResponse<PageResponse<BookingResponse>>> getBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) LocalDate date,
            @RequestParam(required = false) BookingType bookingType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "bookingDate") String sort) {
        
        log.info("REST Request to get bookings");
        List<BookingResponse> allBookings = bookingService.getAllBookings();

        List<BookingResponse> filtered = allBookings.stream()
                .filter(b -> status == null || b.getBookingStatus() == status)
                .filter(b -> date == null || b.getBookingDate().equals(date))
                .filter(b -> bookingType == null || b.getBookingType() == bookingType)
                .sorted((b1, b2) -> {
                    if ("totalAmount".equalsIgnoreCase(sort)) {
                        return b2.getTotalAmount().compareTo(b1.getTotalAmount()); // desc
                    }
                    return b2.getBookingDate().compareTo(b1.getBookingDate()); // default desc
                })
                .collect(Collectors.toList());

        int totalElements = filtered.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        int start = Math.min(page * size, totalElements);
        int end = Math.min((page + 1) * size, totalElements);
        List<BookingResponse> content = filtered.subList(start, end);

        PageResponse<BookingResponse> pageResponse = PageResponse.<BookingResponse>builder()
                .content(content)
                .pageNumber(page)
                .pageSize(size)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .last(page >= totalPages - 1)
                .build();

        return ResponseEntity.ok(ApiResponse.success(pageResponse, "Bookings retrieved successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Booking by ID", description = "Retrieves detailed information of a specific booking by its UUID")
    public ResponseEntity<ApiResponse<BookingDetailResponse>> getBookingById(@PathVariable UUID id) {
        log.info("REST Request to get booking: {}", id);
        return ResponseEntity.ok(ApiResponse.success(bookingService.getBookingById(id), "Booking retrieved successfully"));
    }

    @GetMapping("/reference/{reference}")
    @Operation(summary = "Get Booking by Reference", description = "Retrieves detailed information of a specific booking by its string reference number")
    public ResponseEntity<ApiResponse<BookingDetailResponse>> getBookingByReference(@PathVariable String reference) {
        log.info("REST Request to get booking by reference: {}", reference);
        return ResponseEntity.ok(ApiResponse.success(bookingService.getBookingByNumber(reference), "Booking retrieved successfully"));
    }

    @PostMapping("/bulk-references")
    @Operation(summary = "Get Bookings by References", description = "Retrieves multiple bookings by their reference numbers")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookingsByReferences(@RequestBody List<String> references) {
        log.info("REST Request to get bookings by bulk references: {}", references.size());
        return ResponseEntity.ok(ApiResponse.success(bookingService.getBookingsByReferences(references), "Bookings retrieved successfully"));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update Booking Status", description = "Updates the status of a specific booking (e.g. PENDING to COMPLETED)")
    public ResponseEntity<ApiResponse<BookingDetailResponse>> updateBookingStatus(
            @PathVariable UUID id, @Valid @RequestBody UpdateBookingStatusRequest request) {
        log.info("REST Request to update booking status for: {}", id);
        BookingDetailResponse response = bookingService.updateBookingStatus(id, request);
        webSocketEventPublisher.publishBookingUpdate("UPDATED", response);
        return ResponseEntity.ok(ApiResponse.success(response, "Booking status updated successfully"));
    }

    @PatchMapping("/{id}/partial-accept")
    @Operation(summary = "Partially Accept Booking", description = "Accepts some services of a booking and creates a new cancelled booking for rejected services")
    public ResponseEntity<ApiResponse<BookingDetailResponse>> partialAcceptBooking(
            @PathVariable UUID id,
            @RequestBody List<UUID> acceptedServiceIds) {
        log.info("REST Request to partially accept booking: {}", id);
        BookingDetailResponse response = bookingService.partialAcceptBooking(id, acceptedServiceIds);
        return ResponseEntity.ok(ApiResponse.success(response, "Booking partially accepted"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Cancelled Booking", description = "Permanently deletes a cancelled booking from the database")
    public ResponseEntity<ApiResponse<Void>> deleteBooking(@PathVariable UUID id) {
        log.info("REST Request to delete cancelled booking: {}", id);
        bookingService.deleteBooking(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Booking deleted successfully"));
    }
}
