package com.salonbooking.api.security;

import com.salonbooking.api.entity.Admin;
import com.salonbooking.api.entity.Customer;
import com.salonbooking.api.repository.AdminRepository;
import com.salonbooking.api.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final AdminRepository adminRepository;
    private final CustomerRepository customerRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        if (username.contains("@")) {
            Admin admin = adminRepository.findByEmail(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User Not Found with email: " + username));
            return UserDetailsImpl.build(admin);
        } else {
            Customer customer = customerRepository.findByPhoneNumber(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User Not Found with phone number: " + username));
            return UserDetailsImpl.build(customer);
        }
    }
}
