package com.shophub.cart.web;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.shophub.cart.application.CartService;
import com.shophub.shared.security.ShopHubPrincipal;

@RestController
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping("/api/v1/cart")
    public Map<String, Object> getCart(@AuthenticationPrincipal ShopHubPrincipal principal) {
        return cartService.getCart(principal.getUserId());
    }

    @PutMapping("/api/v1/cart/items")
    public Map<String, Object> putItem(
            @AuthenticationPrincipal ShopHubPrincipal principal,
            @RequestBody CartItemRequest request) {
        return cartService.putItem(principal.getUserId(), request.productId(), request.qty(), request.variant());
    }

    @DeleteMapping("/api/v1/cart/items/{id}")
    public Map<String, Object> deleteItem(
            @AuthenticationPrincipal ShopHubPrincipal principal,
            @PathVariable UUID id) {
        return cartService.deleteItem(principal.getUserId(), id);
    }

    @PostMapping("/api/v1/cart/coupon")
    public Map<String, Object> applyCoupon(
            @AuthenticationPrincipal ShopHubPrincipal principal,
            @RequestBody CouponRequest request) {
        return cartService.applyCoupon(principal.getUserId(), request.code());
    }

    @DeleteMapping("/api/v1/cart/coupon")
    public Map<String, Object> clearCoupon(@AuthenticationPrincipal ShopHubPrincipal principal) {
        return cartService.clearCoupon(principal.getUserId());
    }

    @GetMapping("/api/v1/wishlist")
    public List<Map<String, Object>> wishlist(@AuthenticationPrincipal ShopHubPrincipal principal) {
        return cartService.listWishlist(principal.getUserId());
    }

    @PutMapping("/api/v1/wishlist/{productId}")
    public Map<String, Object> addWishlist(
            @AuthenticationPrincipal ShopHubPrincipal principal,
            @PathVariable UUID productId) {
        return cartService.addWishlist(principal.getUserId(), productId);
    }

    @PutMapping("/api/v1/wishlist")
    public Map<String, Object> addWishlistBody(
            @AuthenticationPrincipal ShopHubPrincipal principal,
            @RequestBody WishlistRequest request) {
        return cartService.addWishlist(principal.getUserId(), request.productId());
    }

    @DeleteMapping("/api/v1/wishlist/{productId}")
    public Map<String, String> removeWishlist(
            @AuthenticationPrincipal ShopHubPrincipal principal,
            @PathVariable UUID productId) {
        return cartService.removeWishlist(principal.getUserId(), productId);
    }

    public record CartItemRequest(UUID productId, int qty, String variant) {
    }

    public record CouponRequest(String code) {
    }

    public record WishlistRequest(UUID productId) {
    }
}
