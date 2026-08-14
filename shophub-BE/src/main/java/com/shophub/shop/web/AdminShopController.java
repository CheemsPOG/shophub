package com.shophub.shop.web;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shophub.catalog.domain.Category;
import com.shophub.catalog.infrastructure.CategoryRepository;
import com.shophub.catalog.infrastructure.ProductRepository;
import com.shophub.shop.domain.Shop;
import com.shophub.shop.infrastructure.ShopRepository;

@RestController
@RequestMapping("/api/v1/admin/shops")
public class AdminShopController {

    private final ShopRepository shops;
    private final ProductRepository products;
    private final CategoryRepository categories;

    public AdminShopController(ShopRepository shops, ProductRepository products, CategoryRepository categories) {
        this.shops = shops;
        this.products = products;
        this.categories = categories;
    }

    @GetMapping
    public List<Map<String, Object>> list() {
        return shops.findAll().stream().map(this::toDto).toList();
    }

    private Map<String, Object> toDto(Shop shop) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", shop.getId().toString());
        dto.put("userId", shop.getUserId().toString());
        dto.put("name", shop.getBusinessName());
        dto.put("businessName", shop.getBusinessName());
        dto.put("email", shop.getEmail());
        dto.put("status", shop.getStatus());
        dto.put("rating", shop.getRatingAvg());
        dto.put("sales", shop.getTotalSales());
        dto.put("productCount", products.countByShopId(shop.getId()));
        dto.put("category", shop.getCategoryId() == null
                ? ""
                : categories.findById(shop.getCategoryId()).map(Category::getName).orElse(""));
        dto.put("joinedAt", shop.getCreatedAt() == null ? null : shop.getCreatedAt().toString());
        return dto;
    }
}
