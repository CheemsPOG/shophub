package com.shophub.shop.web;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shophub.catalog.infrastructure.ProductRepository;
import com.shophub.shared.error.ApiException;
import com.shophub.shared.security.ShopHubPrincipal;
import com.shophub.shop.domain.Shop;
import com.shophub.shop.infrastructure.ShopRepository;

@RestController
@RequestMapping("/api/v1/seller/shop")
public class SellerShopController {

    private final ShopRepository shops;
    private final ProductRepository products;

    public SellerShopController(ShopRepository shops, ProductRepository products) {
        this.shops = shops;
        this.products = products;
    }

    @GetMapping
    public Map<String, Object> get(@AuthenticationPrincipal ShopHubPrincipal principal) {
        return toDto(requireShop(principal));
    }

    @PutMapping
    @Transactional
    public Map<String, Object> update(@AuthenticationPrincipal ShopHubPrincipal principal, @RequestBody Map<String, String> body) {
        Shop shop = requireShop(principal);
        if (body.containsKey("businessName") && body.get("businessName") != null && !body.get("businessName").isBlank()) {
            shop.setBusinessName(body.get("businessName"));
        }
        if (body.containsKey("tagline")) {
            shop.setTagline(body.get("tagline"));
        }
        if (body.containsKey("description")) {
            shop.setDescription(body.get("description"));
        }
        if (body.containsKey("email")) {
            shop.setEmail(body.get("email"));
        }
        if (body.containsKey("phone")) {
            shop.setPhone(body.get("phone"));
        }
        if (body.containsKey("address")) {
            shop.setAddress(body.get("address"));
        }
        if (body.containsKey("logo") || body.containsKey("logoKey")) {
            shop.setLogoKey(body.getOrDefault("logo", body.get("logoKey")));
        }
        if (body.containsKey("banner") || body.containsKey("bannerKey")) {
            shop.setBannerKey(body.getOrDefault("banner", body.get("bannerKey")));
        }
        return toDto(shop);
    }

    private Shop requireShop(ShopHubPrincipal principal) {
        UUID shopId = principal.getShopId();
        if (shopId == null) {
            throw ApiException.forbidden("Seller shop not found");
        }
        return shops.findById(shopId).orElseThrow(() -> ApiException.notFound("Shop not found"));
    }

    private Map<String, Object> toDto(Shop shop) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", shop.getId().toString());
        dto.put("userId", shop.getUserId().toString());
        dto.put("businessName", shop.getBusinessName());
        dto.put("slug", shop.getSlug());
        dto.put("logo", com.shophub.shared.web.StockImages.orEmpty(shop.getLogoKey()));
        dto.put("banner", com.shophub.shared.web.StockImages.orEmpty(shop.getBannerKey()));
        dto.put("tagline", shop.getTagline() == null ? "" : shop.getTagline());
        dto.put("description", shop.getDescription() == null ? "" : shop.getDescription());
        dto.put("email", shop.getEmail());
        dto.put("phone", shop.getPhone() == null ? "" : shop.getPhone());
        dto.put("address", shop.getAddress() == null ? "" : shop.getAddress());
        dto.put("plan", shop.getPlan());
        dto.put("status", shop.getStatus());
        dto.put("commissionRate", shop.getCommissionRate());
        dto.put("rating", shop.getRatingAvg());
        dto.put("totalSales", shop.getTotalSales());
        dto.put("productCount", products.countByShopId(shop.getId()));
        dto.put("joinedAt", shop.getCreatedAt() == null ? null : shop.getCreatedAt().toString());
        return dto;
    }
}
