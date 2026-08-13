package com.shophub.order.application;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Year;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shophub.cart.application.CartService;
import com.shophub.cart.domain.Cart;
import com.shophub.cart.domain.CartItem;
import com.shophub.cart.infrastructure.CartItemRepository;
import com.shophub.catalog.domain.Product;
import com.shophub.catalog.infrastructure.ProductImageRepository;
import com.shophub.catalog.infrastructure.ProductRepository;
import com.shophub.identity.domain.Address;
import com.shophub.identity.infrastructure.AddressRepository;
import com.shophub.notification.domain.Notification;
import com.shophub.notification.infrastructure.NotificationRepository;
import com.shophub.order.domain.Checkout;
import com.shophub.order.domain.IdempotencyKey;
import com.shophub.order.domain.Order;
import com.shophub.order.domain.OrderItem;
import com.shophub.order.domain.OrderStatusHistory;
import com.shophub.order.domain.Payment;
import com.shophub.order.infrastructure.CheckoutRepository;
import com.shophub.order.infrastructure.IdempotencyKeyRepository;
import com.shophub.order.infrastructure.OrderItemRepository;
import com.shophub.order.infrastructure.OrderRepository;
import com.shophub.order.infrastructure.OrderStatusHistoryRepository;
import com.shophub.order.infrastructure.PaymentRepository;
import com.shophub.payout.domain.LedgerEntry;
import com.shophub.payout.domain.SellerBalance;
import com.shophub.payout.infrastructure.LedgerEntryRepository;
import com.shophub.payout.infrastructure.SellerBalanceRepository;
import com.shophub.platform.infrastructure.PlatformSettingRepository;
import com.shophub.promotion.domain.Coupon;
import com.shophub.promotion.domain.CouponRedemption;
import com.shophub.promotion.infrastructure.CouponRedemptionRepository;
import com.shophub.promotion.infrastructure.CouponRepository;
import com.shophub.shared.error.ApiException;
import com.shophub.shared.web.JsonMaps;
import com.shophub.shop.domain.Shop;
import com.shophub.shop.infrastructure.ShopRepository;

@Service
public class CheckoutService {

    private static final BigDecimal TAX_RATE = new BigDecimal("0.08");

    private final CartService cartService;
    private final CartItemRepository cartItems;
    private final AddressRepository addresses;
    private final ProductRepository products;
    private final ProductImageRepository images;
    private final ShopRepository shops;
    private final CheckoutRepository checkouts;
    private final OrderRepository orders;
    private final OrderItemRepository orderItems;
    private final OrderStatusHistoryRepository history;
    private final PaymentRepository payments;
    private final IdempotencyKeyRepository idempotencyKeys;
    private final CouponRepository coupons;
    private final CouponRedemptionRepository redemptions;
    private final SellerBalanceRepository balances;
    private final LedgerEntryRepository ledger;
    private final NotificationRepository notifications;
    private final PlatformSettingRepository settings;
    private final OrderMapper orderMapper;
    private final ObjectMapper objectMapper;

    public CheckoutService(
            CartService cartService,
            CartItemRepository cartItems,
            AddressRepository addresses,
            ProductRepository products,
            ProductImageRepository images,
            ShopRepository shops,
            CheckoutRepository checkouts,
            OrderRepository orders,
            OrderItemRepository orderItems,
            OrderStatusHistoryRepository history,
            PaymentRepository payments,
            IdempotencyKeyRepository idempotencyKeys,
            CouponRepository coupons,
            CouponRedemptionRepository redemptions,
            SellerBalanceRepository balances,
            LedgerEntryRepository ledger,
            NotificationRepository notifications,
            PlatformSettingRepository settings,
            OrderMapper orderMapper,
            ObjectMapper objectMapper) {
        this.cartService = cartService;
        this.cartItems = cartItems;
        this.addresses = addresses;
        this.products = products;
        this.images = images;
        this.shops = shops;
        this.checkouts = checkouts;
        this.orders = orders;
        this.orderItems = orderItems;
        this.history = history;
        this.payments = payments;
        this.idempotencyKeys = idempotencyKeys;
        this.coupons = coupons;
        this.redemptions = redemptions;
        this.balances = balances;
        this.ledger = ledger;
        this.notifications = notifications;
        this.settings = settings;
        this.orderMapper = orderMapper;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public Map<String, Object> checkout(UUID userId, UUID addressId, String deliveryMethod, String paymentMethod, String idempotencyKey) {
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            var existing = idempotencyKeys.findByKeyAndUserId(idempotencyKey, userId);
            if (existing.isPresent()) {
                try {
                    return objectMapper.readValue(existing.get().getResponseBody(), new TypeReference<Map<String, Object>>() {
                    });
                } catch (Exception ex) {
                    throw new IllegalStateException("Corrupt idempotency response", ex);
                }
            }
        }
        if (!List.of("standard", "express", "pickup").contains(deliveryMethod)) {
            throw ApiException.badRequest("INVALID_DELIVERY", "Delivery method must be standard, express, or pickup");
        }
        if (!List.of("card", "paypal", "cod").contains(paymentMethod)) {
            throw ApiException.badRequest("INVALID_PAYMENT", "Payment method must be card, paypal, or cod");
        }
        Address address = addresses.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> ApiException.notFound("Address not found"));
        Cart cart = cartService.getOrCreate(userId);
        List<CartItem> lines = cartItems.findByCartId(cart.getId());
        if (lines.isEmpty()) {
            throw ApiException.badRequest("EMPTY_CART", "Cart is empty");
        }

        Map<UUID, List<CartItem>> byShop = new LinkedHashMap<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        for (CartItem line : lines) {
            Product product = products.findById(line.getProductId())
                    .orElseThrow(() -> ApiException.notFound("Product not found"));
            if (!"active".equals(product.getStatus())) {
                throw ApiException.badRequest("PRODUCT_UNAVAILABLE", product.getTitle() + " is not available");
            }
            byShop.computeIfAbsent(product.getShopId(), key -> new ArrayList<>()).add(line);
            subtotal = subtotal.add(product.getPrice().multiply(BigDecimal.valueOf(line.getQty())));
        }
        subtotal = money(subtotal);

        Coupon coupon = null;
        if (cart.getCouponCode() != null && !cart.getCouponCode().isBlank()) {
            coupon = cartService.requireValidCoupon(cart.getCouponCode());
            if (redemptions.existsByCouponIdAndUserId(coupon.getId(), userId)) {
                throw ApiException.badRequest("INVALID_COUPON", "You have already used this coupon");
            }
        }
        BigDecimal discount = CartService.discountFor(coupon, subtotal);
        BigDecimal taxable = money(subtotal.subtract(discount));
        BigDecimal tax = money(taxable.multiply(TAX_RATE));
        BigDecimal shipping = shippingFor(deliveryMethod);
        BigDecimal total = money(taxable.add(tax).add(shipping));

        boolean cod = "cod".equals(paymentMethod);
        String orderStatus = cod ? "pending" : "processing";
        String paymentStatus = cod ? "pending" : "paid";
        String paymentProvider = switch (paymentMethod) {
            case "paypal" -> "mock_paypal";
            case "cod" -> "cod";
            default -> "mock_card";
        };
        String paymentProviderStatus = cod ? "pending" : "captured";

        String addressJson = writeAddress(address);
        Checkout checkout = new Checkout();
        checkout.setBuyerId(userId);
        checkout.setCheckoutNumber(nextNumber("SH"));
        checkout.setShippingAddress(addressJson);
        checkout.setDeliveryMethod(deliveryMethod);
        checkout.setPaymentMethod(paymentMethod);
        checkout.setCouponId(coupon == null ? null : coupon.getId());
        checkout.setSubtotal(subtotal);
        checkout.setShipping(shipping);
        checkout.setTax(tax);
        checkout.setTotal(total);
        checkouts.save(checkout);

        Payment payment = new Payment();
        payment.setCheckoutId(checkout.getId());
        payment.setProvider(paymentProvider);
        payment.setStatus(paymentProviderStatus);
        payment.setAmount(total);
        payment.setProviderRef(cod ? null : "MOCK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        payments.save(payment);

        List<Order> created = new ArrayList<>();
        int shopIndex = 0;
        BigDecimal allocatedShipping = BigDecimal.ZERO;
        BigDecimal allocatedTax = BigDecimal.ZERO;
        BigDecimal allocatedDiscount = BigDecimal.ZERO;
        List<UUID> shopIds = new ArrayList<>(byShop.keySet());
        for (UUID shopId : shopIds) {
            List<CartItem> shopLines = byShop.get(shopId);
            BigDecimal shopSubtotal = BigDecimal.ZERO;
            for (CartItem line : shopLines) {
                Product product = products.findById(line.getProductId()).orElseThrow();
                shopSubtotal = shopSubtotal.add(product.getPrice().multiply(BigDecimal.valueOf(line.getQty())));
            }
            shopSubtotal = money(shopSubtotal);
            boolean last = shopIndex == shopIds.size() - 1;
            BigDecimal share = subtotal.compareTo(BigDecimal.ZERO) == 0
                    ? BigDecimal.ZERO
                    : shopSubtotal.divide(subtotal, 8, RoundingMode.HALF_UP);
            BigDecimal shopDiscount = last ? discount.subtract(allocatedDiscount) : money(discount.multiply(share));
            BigDecimal shopTax = last ? tax.subtract(allocatedTax) : money(tax.multiply(share));
            BigDecimal shopShipping = last ? shipping.subtract(allocatedShipping) : money(shipping.multiply(share));
            allocatedDiscount = allocatedDiscount.add(shopDiscount);
            allocatedTax = allocatedTax.add(shopTax);
            allocatedShipping = allocatedShipping.add(shopShipping);
            BigDecimal shopTotal = money(shopSubtotal.subtract(shopDiscount).add(shopTax).add(shopShipping));

            Shop shop = shops.findById(shopId).orElseThrow(() -> ApiException.notFound("Shop not found"));
            Order order = new Order();
            order.setCheckoutId(checkout.getId());
            order.setOrderNumber(nextNumber("SH"));
            order.setBuyerId(userId);
            order.setShopId(shopId);
            order.setStatus(orderStatus);
            order.setPaymentStatus(paymentStatus);
            order.setSubtotal(shopSubtotal);
            order.setShipping(shopShipping);
            order.setTax(shopTax);
            order.setTotal(shopTotal);
            order.setCommissionRate(commissionRate(shop));
            order.setShippingAddress(addressJson);
            orders.save(order);
            addHistory(order.getId(), null, orderStatus, userId);

            for (CartItem line : shopLines) {
                Product product = products.findById(line.getProductId()).orElseThrow();
                int updated = products.decrementStock(product.getId(), line.getQty());
                if (updated == 0) {
                    throw ApiException.conflict("INSUFFICIENT_STOCK", "Not enough stock for " + product.getTitle());
                }
                String image = images.findByProductIdOrderBySortOrderAsc(product.getId()).stream()
                        .map(img -> img.getObjectKey())
                        .filter(key -> key != null && !key.contains("picsum.photos"))
                        .findFirst()
                        .orElse(null);
                OrderItem item = new OrderItem();
                item.setOrderId(order.getId());
                item.setProductId(product.getId());
                item.setTitle(product.getTitle());
                item.setImageKey(image);
                item.setUnitPrice(product.getPrice());
                item.setQty(line.getQty());
                item.setVariantLabel(line.getVariantLabel());
                orderItems.save(item);
            }
            if (!cod) {
                creditPending(shop, order);
            }
            notify(shop.getUserId(), "order", "New order received",
                    "You have a new order " + order.getOrderNumber() + " for " + money(shopTotal) + ".",
                    "order", order.getId());
            created.add(order);
            shopIndex++;
        }

        if (coupon != null) {
            int bumped = coupons.incrementUsed(coupon.getId());
            if (bumped == 0) {
                throw ApiException.badRequest("INVALID_COUPON", "Coupon usage limit reached");
            }
            CouponRedemption redemption = new CouponRedemption();
            redemption.setCouponId(coupon.getId());
            redemption.setUserId(userId);
            redemption.setOrderId(created.getFirst().getId());
            redemptions.save(redemption);
        }

        cartService.clearItems(userId);
        notify(userId, "order", "Order placed",
                "Your checkout " + checkout.getCheckoutNumber() + " was placed successfully.",
                "checkout", checkout.getId());

        Map<String, Object> response = JsonMaps.of(
                "checkoutId", checkout.getId().toString(),
                "checkoutNumber", checkout.getCheckoutNumber(),
                "deliveryMethod", deliveryMethod,
                "paymentMethod", paymentMethod,
                "subtotal", subtotal,
                "discount", discount,
                "shipping", shipping,
                "tax", tax,
                "total", total,
                "orders", created.stream().map(orderMapper::toOrder).toList());

        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            IdempotencyKey stored = new IdempotencyKey();
            stored.setKey(idempotencyKey);
            stored.setUserId(userId);
            try {
                stored.setResponseBody(objectMapper.writeValueAsString(response));
            } catch (Exception ex) {
                stored.setResponseBody("{}");
            }
            idempotencyKeys.save(stored);
        }
        return response;
    }

    public static BigDecimal shippingFor(String deliveryMethod) {
        return switch (deliveryMethod) {
            case "express" -> new BigDecimal("15.00");
            case "pickup" -> new BigDecimal("5.00");
            default -> BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        };
    }

    public static BigDecimal money(BigDecimal value) {
        return (value == null ? BigDecimal.ZERO : value).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal commissionRate(Shop shop) {
        if (shop.getCommissionRate() != null) {
            return shop.getCommissionRate();
        }
        String key = "pro".equals(shop.getPlan()) ? "commission_pro" : "commission_default";
        return settings.findById(key)
                .map(s -> {
                    try {
                        return objectMapper.readTree(s.getValue()).decimalValue();
                    } catch (Exception ex) {
                        return "pro".equals(shop.getPlan()) ? new BigDecimal("5") : new BigDecimal("8");
                    }
                })
                .orElse("pro".equals(shop.getPlan()) ? new BigDecimal("5") : new BigDecimal("8"));
    }

    private void creditPending(Shop shop, Order order) {
        BigDecimal rate = order.getCommissionRate().divide(new BigDecimal("100"), 6, RoundingMode.HALF_UP);
        BigDecimal earnings = money(order.getSubtotal().multiply(BigDecimal.ONE.subtract(rate)));
        SellerBalance balance = balances.findById(shop.getId()).orElseGet(() -> {
            SellerBalance created = new SellerBalance();
            created.setShopId(shop.getId());
            created.setAvailable(BigDecimal.ZERO);
            created.setPending(BigDecimal.ZERO);
            return balances.save(created);
        });
        balance.setPending(money(balance.getPending().add(earnings)));
        LedgerEntry entry = new LedgerEntry();
        entry.setShopId(shop.getId());
        entry.setOrderId(order.getId());
        entry.setType("credit_pending");
        entry.setAmount(earnings);
        ledger.save(entry);
    }

    private void addHistory(UUID orderId, String from, String to, UUID actorId) {
        OrderStatusHistory row = new OrderStatusHistory();
        row.setOrderId(orderId);
        row.setFromStatus(from);
        row.setToStatus(to);
        row.setActorId(actorId);
        history.save(row);
    }

    private void notify(UUID userId, String type, String title, String body, String entityType, UUID entityId) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setBody(body);
        notification.setEntityType(entityType);
        notification.setEntityId(entityId);
        notifications.save(notification);
    }

    private String writeAddress(Address address) {
        try {
            return objectMapper.writeValueAsString(JsonMaps.of(
                    "name", address.getName(),
                    "line1", address.getLine1(),
                    "city", address.getCity(),
                    "state", address.getState(),
                    "zip", address.getZip(),
                    "country", address.getCountry(),
                    "phone", address.getPhone(),
                    "label", address.getLabel()));
        } catch (Exception ex) {
            throw new IllegalStateException(ex);
        }
    }

    private String nextNumber(String prefix) {
        int seq = ThreadLocalRandom.current().nextInt(10000, 99999);
        return prefix + "-" + Year.now() + "-" + seq;
    }
}
