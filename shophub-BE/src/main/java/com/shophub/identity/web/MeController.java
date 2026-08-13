package com.shophub.identity.web;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.shophub.identity.application.AuthService;
import com.shophub.identity.domain.Address;
import com.shophub.identity.domain.User;
import com.shophub.identity.infrastructure.AddressRepository;
import com.shophub.identity.infrastructure.UserRepository;
import com.shophub.shared.error.ApiException;
import com.shophub.shared.security.ShopHubPrincipal;

@RestController
public class MeController {

    private final UserRepository users;
    private final AddressRepository addresses;
    private final AuthService authService;

    public MeController(UserRepository users, AddressRepository addresses, AuthService authService) {
        this.users = users;
        this.addresses = addresses;
        this.authService = authService;
    }

    @GetMapping("/api/v1/me")
    public Map<String, Object> me(@AuthenticationPrincipal ShopHubPrincipal principal) {
        User user = users.findById(principal.getUserId()).orElseThrow(() -> ApiException.notFound("User not found"));
        return authService.userDto(user);
    }

    @PatchMapping("/api/v1/me")
    @Transactional
    public Map<String, Object> update(@AuthenticationPrincipal ShopHubPrincipal principal, @RequestBody Map<String, String> body) {
        User user = users.findById(principal.getUserId()).orElseThrow(() -> ApiException.notFound("User not found"));
        if (body.containsKey("name")) {
            user.setFullName(body.get("name"));
        }
        if (body.containsKey("phone")) {
            user.setPhone(body.get("phone"));
        }
        if (body.containsKey("gender")) {
            user.setGender(body.get("gender"));
        }
        if (body.containsKey("dateOfBirth") && body.get("dateOfBirth") != null && !body.get("dateOfBirth").isBlank()) {
            user.setDateOfBirth(LocalDate.parse(body.get("dateOfBirth")));
        }
        return authService.userDto(user);
    }

    @GetMapping("/api/v1/addresses")
    public List<Address> listAddresses(@AuthenticationPrincipal ShopHubPrincipal principal) {
        return addresses.findByUserId(principal.getUserId());
    }

    @PostMapping("/api/v1/addresses")
    @Transactional
    public Address createAddress(@AuthenticationPrincipal ShopHubPrincipal principal, @RequestBody Address body) {
        body.setId(null);
        body.setUserId(principal.getUserId());
        if (body.isDefault()) {
            addresses.findByUserIdAndIsDefaultTrue(principal.getUserId()).ifPresent(existing -> existing.setIsDefault(false));
        }
        return addresses.save(body);
    }

    @PutMapping("/api/v1/addresses/{id}")
    @Transactional
    public Address updateAddress(@AuthenticationPrincipal ShopHubPrincipal principal, @PathVariable UUID id, @RequestBody Address body) {
        Address existing = addresses.findByIdAndUserId(id, principal.getUserId()).orElseThrow(() -> ApiException.notFound("Address not found"));
        existing.setLabel(body.getLabel());
        existing.setName(body.getName());
        existing.setLine1(body.getLine1());
        existing.setCity(body.getCity());
        existing.setState(body.getState());
        existing.setZip(body.getZip());
        existing.setCountry(body.getCountry());
        existing.setPhone(body.getPhone());
        return existing;
    }

    @PostMapping("/api/v1/addresses/{id}/default")
    @Transactional
    public Address makeDefault(@AuthenticationPrincipal ShopHubPrincipal principal, @PathVariable UUID id) {
        Address existing = addresses.findByIdAndUserId(id, principal.getUserId()).orElseThrow(() -> ApiException.notFound("Address not found"));
        addresses.findByUserIdAndIsDefaultTrue(principal.getUserId()).ifPresent(current -> current.setIsDefault(false));
        existing.setIsDefault(true);
        return existing;
    }

    @DeleteMapping("/api/v1/addresses/{id}")
    @Transactional
    public Map<String, String> deleteAddress(@AuthenticationPrincipal ShopHubPrincipal principal, @PathVariable UUID id) {
        Address existing = addresses.findByIdAndUserId(id, principal.getUserId()).orElseThrow(() -> ApiException.notFound("Address not found"));
        addresses.delete(existing);
        return Map.of("status", "ok");
    }
}
