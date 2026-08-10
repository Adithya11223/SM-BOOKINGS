package com.salonbooking.api.service;

import com.salonbooking.api.dto.request.CustomerRequest;
import com.salonbooking.api.dto.response.CustomerResponse;
import com.salonbooking.api.entity.Customer;

import java.util.List;
import java.util.UUID;

public interface CustomerService {
    List<CustomerResponse> getAllCustomers();
    CustomerResponse getCustomerById(UUID id);
    CustomerResponse getCustomerByPhoneNumber(String phoneNumber);
    Customer getOrCreateCustomer(String name, String phoneNumber, String email);
    CustomerResponse updateCustomer(UUID id, CustomerRequest request);
    void updateCustomerBookingStats(Customer customer);
}
