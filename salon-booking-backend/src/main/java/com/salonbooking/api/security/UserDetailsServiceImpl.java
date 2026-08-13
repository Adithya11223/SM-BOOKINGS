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
            String cleanPhone = username.replaceAll("[^0-9]", "");
            String suffix = cleanPhone.length() >= 10 ? cleanPhone.substring(cleanPhone.length() - 10) : cleanPhone;
            Customer customer = customerRepository.findByPhoneNumber(username)
                    .or(() -> customerRepository.findByPhoneNumber("+91" + suffix))
                    .or(() -> customerRepository.findByPhoneNumber(suffix))
                    .or(() -> customerRepository.findAll().stream()
                            .filter(c -> c.getPhoneNumber() != null && c.getPhoneNumber().replaceAll("[^0-9]", "").endsWith(suffix))
                            .findFirst())
                    .orElseThrow(() -> new UsernameNotFoundException("User Not Found with phone number: " + username));
            return UserDetailsImpl.build(customer);
        }
    }
}
