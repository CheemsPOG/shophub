package com.shophub.shared.security;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private final JwtProperties properties;
    private final SecretKey signingKey;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
        this.signingKey = Keys.hmacShaKeyFor(normalizeKey(properties.getSecret()));
    }

    private static byte[] normalizeKey(String secret) {
        byte[] raw = secret.getBytes(StandardCharsets.UTF_8);
        if (raw.length >= 32) {
            return raw;
        }
        byte[] padded = new byte[32];
        System.arraycopy(raw, 0, padded, 0, raw.length);
        return padded;
    }

    public String generateAccessToken(UUID userId, String email, String role, UUID shopId) {
        Instant now = Instant.now();
        var builder = Jwts.builder()
                .subject(userId.toString())
                .claim("email", email)
                .claim("role", role)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(properties.getAccessTokenTtlMinutes() * 60)))
                .signWith(signingKey);
        if (shopId != null) {
            builder.claim("shopId", shopId.toString());
        }
        return builder.compact();
    }

    public ParsedToken parse(String token) {
        Claims claims = Jwts.parser().verifyWith(signingKey).build().parseSignedClaims(token).getPayload();
        UUID shopId = claims.get("shopId", String.class) != null ? UUID.fromString(claims.get("shopId", String.class)) : null;
        return new ParsedToken(
                UUID.fromString(claims.getSubject()),
                claims.get("email", String.class),
                claims.get("role", String.class),
                shopId);
    }

    public long refreshTtlSeconds(boolean rememberMe) {
        long days = rememberMe ? properties.getRememberMeTtlDays() : properties.getRefreshTokenTtlDays();
        return days * 24 * 60 * 60;
    }

    public record ParsedToken(UUID userId, String email, String role, UUID shopId) {
    }
}
