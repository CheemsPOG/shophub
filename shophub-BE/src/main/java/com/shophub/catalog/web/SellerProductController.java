package com.shophub.catalog.web;

import java.util.Map;
import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shophub.catalog.application.SellerProductService;
import com.shophub.shared.error.ApiException;
import com.shophub.shared.security.ShopHubPrincipal;

@RestController
@RequestMapping("/api/v1/seller/products")
public class SellerProductController {

    private final SellerProductService sellerProductService;

    public SellerProductController(SellerProductService sellerProductService) {
        this.sellerProductService = sellerProductService;
    }

    @GetMapping
    public Map<String, Object> list(
            @AuthenticationPrincipal ShopHubPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return sellerProductService.list(shopId(principal), page, size);
    }

    @GetMapping("/{id}")
    public Map<String, Object> get(@AuthenticationPrincipal ShopHubPrincipal principal, @PathVariable UUID id) {
        return sellerProductService.get(shopId(principal), id);
    }

    @PostMapping
    public Map<String, Object> create(
            @AuthenticationPrincipal ShopHubPrincipal principal,
            @RequestBody Map<String, Object> body) {
        return sellerProductService.create(shopId(principal), body);
    }

    @PutMapping("/{id}")
    public Map<String, Object> update(
            @AuthenticationPrincipal ShopHubPrincipal principal,
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {
        return sellerProductService.update(shopId(principal), id, body);
    }

    @PostMapping("/{id}/publish")
    public Map<String, Object> publish(@AuthenticationPrincipal ShopHubPrincipal principal, @PathVariable UUID id) {
        return sellerProductService.publish(shopId(principal), id);
    }

    @PostMapping("/{id}/unpublish")
    public Map<String, Object> unpublish(@AuthenticationPrincipal ShopHubPrincipal principal, @PathVariable UUID id) {
        return sellerProductService.unpublish(shopId(principal), id);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> delete(@AuthenticationPrincipal ShopHubPrincipal principal, @PathVariable UUID id) {
        sellerProductService.delete(shopId(principal), id);
        return Map.of("status", "ok");
    }

    private UUID shopId(ShopHubPrincipal principal) {
        if (principal.getShopId() == null) {
            throw ApiException.forbidden("Seller shop not found");
        }
        return principal.getShopId();
    }
}
