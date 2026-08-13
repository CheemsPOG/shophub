package com.shophub.identity.web;

import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shophub.identity.application.AuthService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public Map<String, Object> register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request.fullName(), request.email(), request.password(), request.role(), request.storeName());
    }

    @PostMapping("/login")
    public Map<String, Object> login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request.email(), request.password(), request.role(), Boolean.TRUE.equals(request.rememberMe()));
    }

    @PostMapping("/refresh")
    public Map<String, Object> refresh(@RequestBody TokenRequest request) {
        return authService.refresh(request.refreshToken());
    }

    @PostMapping("/logout")
    public Map<String, String> logout(@RequestBody(required = false) TokenRequest request) {
        authService.logout(request == null ? null : request.refreshToken());
        return Map.of("status", "ok");
    }

    @PostMapping("/forgot-password")
    public Map<String, String> forgot(@RequestBody EmailRequest request) {
        authService.forgotPassword(request.email());
        return Map.of("status", "ok");
    }

    @PostMapping("/reset-password")
    public Map<String, String> reset(@RequestBody ResetRequest request) {
        authService.resetPassword(request.token(), request.password());
        return Map.of("status", "ok");
    }

    public record RegisterRequest(@NotBlank String fullName, @NotBlank @Email String email, @NotBlank String password, String role, String storeName) {
    }

    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password, String role, Boolean rememberMe) {
    }

    public record TokenRequest(String refreshToken) {
    }

    public record EmailRequest(@Email String email) {
    }

    public record ResetRequest(@NotBlank String token, @NotBlank String password) {
    }
}
