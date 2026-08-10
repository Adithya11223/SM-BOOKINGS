package com.salonbooking.api.service;

import com.salonbooking.api.dto.request.CreateServiceRequest;
import com.salonbooking.api.dto.request.UpdateServiceRequest;
import com.salonbooking.api.dto.response.ServiceResponse;
import com.salonbooking.api.entity.Service;

import java.util.List;
import java.util.UUID;

public interface ServiceService {
    List<ServiceResponse> getAllVisibleServices();
    List<ServiceResponse> getAllServices();
    ServiceResponse getServiceById(UUID id);
    Service getServiceEntityById(UUID id);
    ServiceResponse createService(CreateServiceRequest request);
    ServiceResponse updateService(UUID id, UpdateServiceRequest request);
    void deleteService(UUID id);
}
