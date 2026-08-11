package com.salonbooking.api.service.impl;

import com.salonbooking.api.dto.request.CustomerRequest;
import com.salonbooking.api.dto.response.CustomerResponse;
import com.salonbooking.api.entity.Customer;
import com.salonbooking.api.exception.ResourceNotFoundException;
import com.salonbooking.api.mapper.CustomerMapper;
import com.salonbooking.api.repository.CustomerRepository;
import com.salonbooking.api.service.CustomerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository repository;
    private final CustomerMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<CustomerResponse> getAllCustomers() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(UUID id) {
        return repository.findById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerResponse getCustomerByPhoneNumber(String phoneNumber) {
        return repository.findByPhoneNumber(phoneNumber)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with phone number: " + phoneNumber));
    }

    @Override
    @Transactional
    public Customer getOrCreateCustomer(String name, String phoneNumber, String email) {
        return repository.findByPhoneNumber(phoneNumber)
                .map(existing -> {
                    boolean updated = false;
                    if (name != null && !name.trim().isEmpty() && !name.equals(existing.getName())) {
                        existing.setName(name);
                        updated = true;
                    }
                    if (email != null && !email.trim().isEmpty() && !email.equals(existing.getEmail())) {
                        existing.setEmail(email);
                        updated = true;
                    }
                    if (updated) {
                        return repository.save(existing);
                    }
                    return existing;
                })
                .orElseGet(() -> {
                    Customer newCustomer = Customer.builder()
                            .name(name)
                            .phoneNumber(phoneNumber)
                            .email(email)
                            .build();
                    log.info("Auto-creating new customer with phone: {}", phoneNumber);
                    return repository.save(newCustomer);
                });
    }

    @Override
    @Transactional
    public CustomerResponse updateCustomer(UUID id, CustomerRequest request) {
        Customer customer = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        
        mapper.updateEntityFromRequest(request, customer);
        Customer updated = repository.save(customer);
        log.info("Updated customer: {}", updated.getId());
        return mapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void updateCustomerBookingStats(Customer customer) {
        customer.setTotalBookings(customer.getTotalBookings() + 1);
        customer.setLastBookingDate(java.time.Instant.now());
        repository.save(customer);
        log.info("Updated booking stats for customer: {}", customer.getId());
    }
}
