package com.shophub.shared.security;

import java.util.UUID;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class ShopHubPrincipal implements UserDetails {

    private final UUID userId;
    private final String email;
    private final String role;
    private final UUID shopId;
    private final boolean banned;

    public ShopHubPrincipal(UUID userId, String email, String role, UUID shopId, boolean banned) {
        this.userId = userId;
        this.email = email;
        this.role = role;
        this.shopId = shopId;
        this.banned = banned;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getRole() {
        return role;
    }

    public UUID getShopId() {
        return shopId;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));
    }

    @Override
    public String getPassword() {
        return "";
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !banned;
    }

    @Override
    public boolean isEnabled() {
        return !banned;
    }
}
