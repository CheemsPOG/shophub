package com.shophub.cart.application;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shophub.cart.domain.Cart;
import com.shophub.cart.domain.CartItem;
import com.shophub.cart.domain.WishlistItem;
import com.shophub.cart.infrastructure.CartItemRepository;
import com.shophub.cart.infrastructure.CartRepository;
import com.shophub.cart.infrastructure.WishlistItemRepository;
import com.shophub.catalog.application.CatalogMapper;
import com.shophub.catalog.domain.Product;
import com.shophub.catalog.infrastructure.ProductImageRepository;
import com.shophub.catalog.infrastructure.ProductRepository;
import com.shophub.promotion.domain.Coupon;
import com.shophub.promotion.infrastructure.CouponRepository;
import com.shophub.shared.error.ApiException;
import com.shophub.shared.web.JsonMaps;
import com.shophub.shop.infrastructure.ShopRepository;

@Service
public class CartService {

    private final CartRepository carts;
    private final CartItemRepository cartItems;
    private final WishlistItemRepository wishlist;
    private final ProductRepository products;
    private final ProductImageRepository images;
    private final CouponRepository coupons;
    private final ShopRepository shops;
    private final CatalogMapper mapper;

    public CartService(
            CartRepository carts,
            CartItemRepository cartItems,
            WishlistItemRepository wishlist,
            ProductRepository products,
            ProductImageRepository images,
            CouponRepository coupons,
            ShopRepository shops,
            CatalogMapper mapper) {
        this.carts = carts;
        this.cartItems = cartItems;
        this.wishlist = wishlist;
        this.products = products;
        this.images = images;
        this.coupons = coupons;
        this.shops = shops;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getCart(UUID userId) {
        Cart cart = carts.findByUserId(userId).orElse(null);
        if (cart == null) {
            return emptyCart();
        }
        return toCartDto(cart);
    }

    @Transactional
    public Map<String, Object> putItem(UUID userId, UUID productId, int qty, String variant) {
        if (qty < 0) {
            throw ApiException.badRequest("INVALID_QTY", "Quantity cannot be negative");
        }
        Product product = products.findById(productId).orElseThrow(() -> ApiException.notFound("Product not found"));
        if (!"active".equals(product.getStatus())) {
            throw ApiException.badRequest("PRODUCT_UNAVAILABLE", "Product is not available");
        }
        Cart cart = getOrCreate(userId);
        String label = blankToNull(variant);
        CartItem existing = findLine(cart.getId(), productId, label).orElse(null);
        if (qty == 0) {
            if (existing != null) {
                cartItems.delete(existing);
            }
            return toCartDto(cart);
        }
        if (qty > product.getStock()) {
            throw ApiException.conflict("INSUFFICIENT_STOCK", "Not enough stock for " + product.getTitle());
        }
        if (existing == null) {
            existing = new CartItem();
            existing.setCartId(cart.getId());
            existing.setProductId(productId);
            existing.setVariantLabel(label);
            existing.setQty(qty);
            cartItems.save(existing);
        } else {
            existing.setQty(qty);
        }
        return toCartDto(cart);
    }

    @Transactional
    public Map<String, Object> deleteItem(UUID userId, UUID itemId) {
        Cart cart = carts.findByUserId(userId).orElseThrow(() -> ApiException.notFound("Cart not found"));
        CartItem item = cartItems.findByIdAndCartId(itemId, cart.getId())
                .orElseThrow(() -> ApiException.notFound("Cart item not found"));
        cartItems.delete(item);
        return toCartDto(cart);
    }

    @Transactional
    public Map<String, Object> applyCoupon(UUID userId, String code) {
        if (code == null || code.isBlank()) {
            throw ApiException.badRequest("INVALID_COUPON", "Coupon code is required");
        }
        Coupon coupon = requireValidCoupon(code.trim().toUpperCase());
        Cart cart = getOrCreate(userId);
        cart.setCouponCode(coupon.getCode());
        return toCartDto(cart);
    }

    @Transactional
    public Map<String, Object> clearCoupon(UUID userId) {
        Cart cart = getOrCreate(userId);
        cart.setCouponCode(null);
        return toCartDto(cart);
    }

    @Transactional
    public void clearItems(UUID userId) {
        carts.findByUserId(userId).ifPresent(cart -> {
            cartItems.deleteByCartId(cart.getId());
            cart.setCouponCode(null);
        });
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listWishlist(UUID userId) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (WishlistItem item : wishlist.findByIdUserIdOrderByAddedAtDesc(userId)) {
            Product product = products.findById(item.getId().getProductId()).orElse(null);
            result.add(JsonMaps.of(
                    "productId", item.getId().getProductId().toString(),
                    "addedAt", item.getAddedAt() == null ? null : item.getAddedAt().toString(),
                    "product", product == null ? null : mapper.toProduct(product)));
        }
        return result;
    }

    @Transactional
    public Map<String, Object> addWishlist(UUID userId, UUID productId) {
        products.findById(productId).orElseThrow(() -> ApiException.notFound("Product not found"));
        if (!wishlist.existsByIdUserIdAndIdProductId(userId, productId)) {
            WishlistItem item = new WishlistItem();
            item.setId(new WishlistItem.Id(userId, productId));
            wishlist.save(item);
        }
        return JsonMaps.of("productId", productId.toString(), "status", "ok");
    }

    @Transactional
    public Map<String, String> removeWishlist(UUID userId, UUID productId) {
        wishlist.deleteByIdUserIdAndIdProductId(userId, productId);
        return Map.of("status", "ok");
    }

    public Cart getOrCreate(UUID userId) {
        return carts.findByUserId(userId).orElseGet(() -> {
            Cart cart = new Cart();
            cart.setUserId(userId);
            return carts.save(cart);
        });
    }

    public Coupon requireValidCoupon(String code) {
        Coupon coupon = coupons.findByCode(code).orElseThrow(() -> ApiException.badRequest("INVALID_COUPON", "Unknown coupon code"));
        if (!"active".equals(coupon.getStatus()) || coupon.getExpiresAt().isBefore(Instant.now())) {
            throw ApiException.badRequest("INVALID_COUPON", "Coupon is not active");
        }
        if (coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw ApiException.badRequest("INVALID_COUPON", "Coupon usage limit reached");
        }
        return coupon;
    }

    public static BigDecimal discountFor(Coupon coupon, BigDecimal subtotal) {
        if (coupon == null || subtotal == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        BigDecimal discount;
        if ("percent".equals(coupon.getType())) {
            discount = subtotal.multiply(coupon.getValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            discount = coupon.getValue() == null ? BigDecimal.ZERO : coupon.getValue();
        }
        if (discount.compareTo(subtotal) > 0) {
            discount = subtotal;
        }
        return discount.setScale(2, RoundingMode.HALF_UP);
    }

    private java.util.Optional<CartItem> findLine(UUID cartId, UUID productId, String variant) {
        if (variant == null) {
            return cartItems.findByCartIdAndProductIdAndVariantLabelIsNull(cartId, productId);
        }
        return cartItems.findByCartIdAndProductIdAndVariantLabel(cartId, productId, variant);
    }

    private Map<String, Object> emptyCart() {
        return JsonMaps.of(
                "items", List.of(),
                "couponCode", null,
                "subtotal", BigDecimal.ZERO.setScale(2),
                "discount", BigDecimal.ZERO.setScale(2),
                "tax", BigDecimal.ZERO.setScale(2),
                "shipping", BigDecimal.ZERO.setScale(2),
                "total", BigDecimal.ZERO.setScale(2));
    }

    private Map<String, Object> toCartDto(Cart cart) {
        List<CartItem> lines = cartItems.findByCartId(cart.getId());
        List<Map<String, Object>> itemDtos = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        for (CartItem line : lines) {
            Product product = products.findById(line.getProductId()).orElse(null);
            if (product == null) {
                continue;
            }
            String image = images.findByProductIdOrderBySortOrderAsc(product.getId()).stream()
                    .map(img -> img.getObjectKey())
                    .filter(key -> key != null && !key.contains("picsum.photos"))
                    .findFirst()
                    .orElse("");
            String sellerName = shops.findById(product.getShopId()).map(s -> s.getBusinessName()).orElse("");
            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(line.getQty()));
            subtotal = subtotal.add(lineTotal);
            Map<String, Object> dto = new LinkedHashMap<>();
            dto.put("id", line.getId().toString());
            dto.put("productId", product.getId().toString());
            dto.put("title", product.getTitle());
            dto.put("image", image);
            dto.put("price", product.getPrice());
            dto.put("qty", line.getQty());
            dto.put("sellerId", product.getShopId().toString());
            dto.put("sellerName", sellerName);
            dto.put("variant", line.getVariantLabel());
            itemDtos.add(dto);
        }
        subtotal = subtotal.setScale(2, RoundingMode.HALF_UP);
        Coupon coupon = null;
        if (cart.getCouponCode() != null && !cart.getCouponCode().isBlank()) {
            coupon = coupons.findByCode(cart.getCouponCode()).orElse(null);
            try {
                if (coupon != null) {
                    requireValidCoupon(coupon.getCode());
                }
            } catch (ApiException ex) {
                coupon = null;
            }
        }
        BigDecimal discount = discountFor(coupon, subtotal);
        BigDecimal taxable = subtotal.subtract(discount);
        BigDecimal tax = taxable.multiply(new BigDecimal("0.08")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal shipping = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = taxable.add(tax).add(shipping);
        return JsonMaps.of(
                "items", itemDtos,
                "couponCode", cart.getCouponCode(),
                "subtotal", subtotal,
                "discount", discount,
                "tax", tax,
                "shipping", shipping,
                "total", total);
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
