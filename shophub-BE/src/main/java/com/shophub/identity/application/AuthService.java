package com.shophub.identity.application;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shophub.identity.domain.PasswordResetToken;
import com.shophub.identity.domain.RefreshToken;
import com.shophub.identity.domain.User;
import com.shophub.identity.infrastructure.PasswordResetTokenRepository;
import com.shophub.identity.infrastructure.RefreshTokenRepository;
import com.shophub.identity.infrastructure.UserRepository;
import com.shophub.shared.error.ApiException;
import com.shophub.shared.security.JwtService;
import com.shophub.shop.domain.SellerApplication;
import com.shophub.shop.domain.Shop;
import com.shophub.shop.infrastructure.SellerApplicationRepository;
import com.shophub.shop.infrastructure.ShopRepository;

@Service
public class AuthService {

    private final UserRepository users;
    private final RefreshTokenRepository refreshTokens;
    private final PasswordResetTokenRepository resetTokens;
    private final ShopRepository shops;
    private final SellerApplicationRepository applications;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final SecureRandom random = new SecureRandom();

    public AuthService(
            UserRepository users,
            RefreshTokenRepository refreshTokens,
            PasswordResetTokenRepository resetTokens,
            ShopRepository shops,
            SellerApplicationRepository applications,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.users = users;
        this.refreshTokens = refreshTokens;
        this.resetTokens = resetTokens;
        this.shops = shops;
        this.applications = applications;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public Map<String, Object> register(String fullName, String email, String password, String role, String storeName) {
        if (!"buyer".equals(role) && !"seller".equals(role)) {
            throw ApiException.badRequest("INVALID_ROLE", "Only buyer or seller accounts can be registered");
        }
        if (users.existsByEmail(email.toLowerCase())) {
            throw ApiException.conflict("EMAIL_TAKEN", "An account with this email already exists");
        }
        User user = new User();
        user.setEmail(email.toLowerCase());
        user.setFullName(fullName);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        users.save(user);

        if ("seller".equals(role)) {
            Shop shop = new Shop();
            shop.setUserId(user.getId());
            shop.setBusinessName(storeName == null || storeName.isBlank() ? fullName + "'s Store" : storeName);
            shop.setSlug(slugify(shop.getBusinessName()) + "-" + user.getId().toString().substring(0, 8));
            shop.setEmail(user.getEmail());
            shop.setPlan("standard");
            shop.setStatus("pending");
            shop.setRatingAvg(java.math.BigDecimal.ZERO);
            shops.save(shop);

            SellerApplication application = new SellerApplication();
            application.setUserId(user.getId());
            application.setShopId(shop.getId());
            application.setBusinessName(shop.getBusinessName());
            application.setApplicantName(fullName);
            application.setEmail(user.getEmail());
            application.setStatus("pending");
            applications.save(application);
        }
        return tokensFor(user, false);
    }

    @Transactional
    public Map<String, Object> login(String email, String password, String role, boolean rememberMe) {
        User user = users.findByEmailAndDeletedAtIsNull(email.toLowerCase())
                .orElseThrow(() -> ApiException.unauthorized("Invalid email or password"));
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw ApiException.unauthorized("Invalid email or password");
        }
        if (user.getBannedAt() != null) {
            throw ApiException.forbidden("This account has been banned");
        }
        if (role != null && !role.isBlank() && !role.equals(user.getRole())) {
            throw ApiException.forbidden("This account cannot sign in to the " + role + " portal");
        }
        return tokensFor(user, rememberMe);
    }

    @Transactional
    public Map<String, Object> refresh(String refreshToken) {
        String hash = sha256(refreshToken);
        RefreshToken stored = refreshTokens.findByTokenHash(hash)
                .orElseThrow(() -> ApiException.unauthorized("Invalid refresh token"));
        if (stored.getRevokedAt() != null || stored.getExpiresAt().isBefore(Instant.now())) {
            throw ApiException.unauthorized("Refresh token expired");
        }
        stored.setRevokedAt(Instant.now());
        User user = users.findById(stored.getUserId()).orElseThrow(() -> ApiException.unauthorized("User not found"));
        return tokensFor(user, false);
    }

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return;
        }
        refreshTokens.findByTokenHash(sha256(refreshToken)).ifPresent(token -> token.setRevokedAt(Instant.now()));
    }

    @Transactional
    public void forgotPassword(String email) {
        users.findByEmailAndDeletedAtIsNull(email.toLowerCase()).ifPresent(user -> {
            PasswordResetToken token = new PasswordResetToken();
            token.setUserId(user.getId());
            token.setTokenHash(sha256(randomToken()));
            token.setExpiresAt(Instant.now().plusSeconds(1800));
            resetTokens.save(token);
        });
    }

    @Transactional
    public void resetPassword(String rawToken, String newPassword) {
        PasswordResetToken token = resetTokens.findByTokenHash(sha256(rawToken))
                .orElseThrow(() -> ApiException.badRequest("INVALID_TOKEN", "Reset link is invalid"));
        if (token.getUsedAt() != null || token.getExpiresAt().isBefore(Instant.now())) {
            throw ApiException.badRequest("INVALID_TOKEN", "Reset link has expired");
        }
        User user = users.findById(token.getUserId()).orElseThrow(() -> ApiException.notFound("User not found"));
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        token.setUsedAt(Instant.now());
    }

    public Map<String, Object> userDto(User user) {
        UUID shopId = shops.findByUserId(user.getId()).map(Shop::getId).orElse(null);
        return Map.of(
                "id", user.getId().toString(),
                "email", user.getEmail(),
                "name", user.getFullName(),
                "role", user.getRole(),
                "avatar", com.shophub.shared.web.StockImages.orEmpty(user.getAvatarKey()),
                "joinedAt", user.getCreatedAt() == null ? Instant.now().toString() : user.getCreatedAt().toString(),
                "shopId", shopId == null ? "" : shopId.toString(),
                "phone", user.getPhone() == null ? "" : user.getPhone());
    }

    private Map<String, Object> tokensFor(User user, boolean rememberMe) {
        UUID shopId = shops.findByUserId(user.getId()).map(Shop::getId).orElse(null);
        String access = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole(), shopId);
        String refresh = randomToken();
        RefreshToken entity = new RefreshToken();
        entity.setUserId(user.getId());
        entity.setTokenHash(sha256(refresh));
        entity.setExpiresAt(Instant.now().plusSeconds(jwtService.refreshTtlSeconds(rememberMe)));
        refreshTokens.save(entity);
        return Map.of(
                "accessToken", access,
                "refreshToken", refresh,
                "user", userDto(user));
    }

    private String randomToken() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    private String sha256(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    private String slugify(String name) {
        return name.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
    }
}
