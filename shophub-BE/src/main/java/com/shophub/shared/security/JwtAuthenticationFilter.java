package com.shophub.shared.security;

import java.io.IOException;
import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.shophub.identity.infrastructure.UserRepository;
import com.shophub.shop.infrastructure.ShopRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final ShopRepository shopRepository;

    public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository, ShopRepository shopRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.shopRepository = shopRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith("Bearer ")) {
            try {
                var parsed = jwtService.parse(header.substring(7));
                var user = userRepository.findById(parsed.userId()).orElse(null);
                if (user != null && user.getDeletedAt() == null) {
                    UUID shopId = shopRepository.findByUserId(user.getId()).map(s -> s.getId()).orElse(parsed.shopId());
                    var principal = new ShopHubPrincipal(
                            user.getId(),
                            user.getEmail(),
                            user.getRole(),
                            shopId,
                            user.getBannedAt() != null);
                    var auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (Exception ignored) {
                SecurityContextHolder.clearContext();
            }
        }
        filterChain.doFilter(request, response);
    }
}
