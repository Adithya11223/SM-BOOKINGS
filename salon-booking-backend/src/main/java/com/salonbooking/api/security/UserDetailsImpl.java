package com.salonbooking.api.security;

import com.salonbooking.api.entity.Admin;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.UUID;

@Data
@AllArgsConstructor
public class UserDetailsImpl implements UserDetails {

    private UUID id;
    private String name;
    private String username;
    private String password;
    private Collection<? extends GrantedAuthority> authorities;
    private boolean enabled;

    public static UserDetailsImpl build(Admin admin) {
        GrantedAuthority authority = new SimpleGrantedAuthority(admin.getRole());

        return new UserDetailsImpl(
                admin.getId(),
                admin.getName(),
                admin.getEmail(),
                admin.getPassword(),
                Collections.singletonList(authority),
                admin.getEnabled()
        );
    }

    public static UserDetailsImpl build(com.salonbooking.api.entity.Customer customer) {
        GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_CUSTOMER");

        return new UserDetailsImpl(
                customer.getId(),
                customer.getName(),
                customer.getPhoneNumber(),
                customer.getPassword(),
                Collections.singletonList(authority),
                true // customers are enabled by default
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
