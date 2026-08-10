package com.salonbooking.api.controller;

import com.salonbooking.api.dto.ApiResponse;
import com.salonbooking.api.dto.response.CustomerResponse;
import com.salonbooking.api.dto.response.PageResponse;
import com.salonbooking.api.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
@Tag(name = "Customers", description = "Endpoints for viewing and managing customers")
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    @Operation(summary = "Get All Customers", description = "Retrieves all customers with optional filtering and pagination")
    public ResponseEntity<ApiResponse<PageResponse<CustomerResponse>>> getCustomers(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String phone,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "totalBookings") String sort) {
        
        log.info("REST Request to get customers");
        List<CustomerResponse> allCustomers = customerService.getAllCustomers();

        List<CustomerResponse> filtered = allCustomers.stream()
                .filter(c -> name == null || (c.getName() != null && c.getName().toLowerCase().contains(name.toLowerCase())))
                .filter(c -> phone == null || (c.getPhoneNumber() != null && c.getPhoneNumber().contains(phone)))
                .sorted((c1, c2) -> {
                    if ("name".equalsIgnoreCase(sort)) {
                        return c1.getName().compareToIgnoreCase(c2.getName());
                    }
                    return c2.getTotalBookings().compareTo(c1.getTotalBookings()); // default desc
                })
                .collect(Collectors.toList());

        int totalElements = filtered.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        int start = Math.min(page * size, totalElements);
        int end = Math.min((page + 1) * size, totalElements);
        List<CustomerResponse> content = filtered.subList(start, end);

        PageResponse<CustomerResponse> pageResponse = PageResponse.<CustomerResponse>builder()
                .content(content)
                .pageNumber(page)
                .pageSize(size)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .last(page >= totalPages - 1)
                .build();

        return ResponseEntity.ok(ApiResponse.success(pageResponse, "Customers retrieved successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Customer by ID", description = "Retrieves a specific customer by their UUID")
    public ResponseEntity<ApiResponse<CustomerResponse>> getCustomerById(@PathVariable UUID id) {
        log.info("REST Request to get customer: {}", id);
        return ResponseEntity.ok(ApiResponse.success(customerService.getCustomerById(id), "Customer retrieved successfully"));
    }
}
