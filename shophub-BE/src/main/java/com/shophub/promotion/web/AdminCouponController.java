package com.shophub.promotion.web;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shophub.promotion.domain.Coupon;
import com.shophub.promotion.infrastructure.CouponRepository;
import com.shophub.shared.error.ApiException;

@RestController
@RequestMapping("/api/v1/admin/coupons")
public class AdminCouponController {

    private final CouponRepository coupons;

    public AdminCouponController(CouponRepository coupons) {
        this.coupons = coupons;
    }

    @GetMapping
    public List<Map<String, Object>> list() {
        return coupons.findAll().stream().map(this::toDto).toList();
    }

    @PostMapping
    @Transactional
    public Map<String, Object> create(@RequestBody CouponRequest request) {
        if (request.code() == null || request.code().isBlank()) {
            throw ApiException.badRequest("INVALID_CODE", "Coupon code is required");
        }
        String code = request.code().trim().toUpperCase();
        if (coupons.existsByCode(code)) {
            throw ApiException.conflict("CODE_TAKEN", "Coupon code already exists");
        }
        Coupon coupon = new Coupon();
        apply(coupon, request, code);
        if (coupon.getUsedCount() == 0 && request.used() != null) {
            coupon.setUsedCount(request.used());
        }
        coupons.save(coupon);
        if (coupon.getUsageLimit() <= 0) {
            coupon.setUsageLimit(1000);
        }
        return toDto(coupon);
    }

    @PutMapping("/{id}")
    @Transactional
    public Map<String, Object> update(@PathVariable UUID id, @RequestBody CouponRequest request) {
        Coupon coupon = coupons.findById(id).orElseThrow(() -> ApiException.notFound("Coupon not found"));
        apply(coupon, request, request.code() == null ? coupon.getCode() : request.code().trim().toUpperCase());
        return toDto(coupon);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public Map<String, String> delete(@PathVariable UUID id) {
        Coupon coupon = coupons.findById(id).orElseThrow(() -> ApiException.notFound("Coupon not found"));
        coupon.setStatus("disabled");
        return Map.of("status", "ok");
    }

    private void apply(Coupon coupon, CouponRequest request, String code) {
        coupon.setCode(code);
        if (request.type() != null) {
            coupon.setType(request.type());
        } else if (coupon.getType() == null) {
            coupon.setType("percent");
        }
        if (request.value() != null) {
            coupon.setValue(request.value());
        } else if (coupon.getValue() == null) {
            coupon.setValue(BigDecimal.ZERO);
        }
        if (request.usageLimit() != null) {
            coupon.setUsageLimit(request.usageLimit());
        }
        if (request.expiresAt() != null && !request.expiresAt().isBlank()) {
            coupon.setExpiresAt(Instant.parse(request.expiresAt()));
        } else if (coupon.getExpiresAt() == null) {
            coupon.setExpiresAt(Instant.now().plusSeconds(86400L * 365));
        }
        if (request.status() != null) {
            coupon.setStatus(request.status());
        } else if (coupon.getStatus() == null) {
            coupon.setStatus("active");
        }
    }

    private Map<String, Object> toDto(Coupon coupon) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", coupon.getId().toString());
        dto.put("code", coupon.getCode());
        dto.put("type", coupon.getType());
        dto.put("value", coupon.getValue());
        dto.put("usageLimit", coupon.getUsageLimit());
        dto.put("used", coupon.getUsedCount());
        dto.put("expiresAt", coupon.getExpiresAt() == null ? null : coupon.getExpiresAt().toString());
        dto.put("status", coupon.getStatus());
        return dto;
    }

    public record CouponRequest(String code, String type, BigDecimal value, Integer usageLimit, Integer used, String expiresAt, String status) {
    }
}
