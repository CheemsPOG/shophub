package com.shophub.order.application;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shophub.catalog.infrastructure.ProductRepository;
import com.shophub.notification.domain.Notification;
import com.shophub.notification.infrastructure.NotificationRepository;
import com.shophub.order.domain.Order;
import com.shophub.order.domain.OrderItem;
import com.shophub.order.domain.OrderStatusHistory;
import com.shophub.order.infrastructure.OrderItemRepository;
import com.shophub.order.infrastructure.OrderRepository;
import com.shophub.order.infrastructure.OrderStatusHistoryRepository;
import com.shophub.payout.domain.LedgerEntry;
import com.shophub.payout.domain.SellerBalance;
import com.shophub.payout.infrastructure.LedgerEntryRepository;
import com.shophub.payout.infrastructure.SellerBalanceRepository;
import com.shophub.shared.error.ApiException;
import com.shophub.shop.infrastructure.ShopRepository;

@Service
public class OrderService {

    private final OrderRepository orders;
    private final OrderItemRepository orderItems;
    private final OrderStatusHistoryRepository history;
    private final ProductRepository products;
    private final SellerBalanceRepository balances;
    private final LedgerEntryRepository ledger;
    private final NotificationRepository notifications;
    private final ShopRepository shops;
    private final OrderMapper mapper;

    public OrderService(
            OrderRepository orders,
            OrderItemRepository orderItems,
            OrderStatusHistoryRepository history,
            ProductRepository products,
            SellerBalanceRepository balances,
            LedgerEntryRepository ledger,
            NotificationRepository notifications,
            ShopRepository shops,
            OrderMapper mapper) {
        this.orders = orders;
        this.orderItems = orderItems;
        this.history = history;
        this.products = products;
        this.balances = balances;
        this.ledger = ledger;
        this.notifications = notifications;
        this.shops = shops;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listBuyer(UUID buyerId) {
        return orders.findByBuyerIdOrderByPlacedAtDesc(buyerId).stream().map(mapper::toOrder).toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getBuyer(UUID buyerId, UUID orderId) {
        Order order = orders.findByIdAndBuyerId(orderId, buyerId).orElseThrow(() -> ApiException.notFound("Order not found"));
        return mapper.toOrder(order);
    }

    @Transactional
    public Map<String, Object> cancelBuyer(UUID buyerId, UUID orderId) {
        Order order = orders.findByIdAndBuyerId(orderId, buyerId).orElseThrow(() -> ApiException.notFound("Order not found"));
        cancel(order, buyerId, "Cancelled by buyer");
        return mapper.toOrder(order);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> listSeller(UUID shopId, int page, int size) {
        Page<Order> result = orders.findByShopId(shopId, PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100)));
        return page(result);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSeller(UUID shopId, UUID orderId) {
        Order order = orders.findByIdAndShopId(orderId, shopId).orElseThrow(() -> ApiException.notFound("Order not found"));
        return mapper.toOrder(order);
    }

    @Transactional
    public Map<String, Object> confirm(UUID shopId, UUID actorId, UUID orderId) {
        Order order = orders.findByIdAndShopId(orderId, shopId).orElseThrow(() -> ApiException.notFound("Order not found"));
        transition(order, actorId, "processing", List.of("pending"));
        notify(order.getBuyerId(), "order", "Order confirmed",
                "Your order " + order.getOrderNumber() + " has been confirmed and is being prepared.", "order", order.getId());
        return mapper.toOrder(order);
    }

    @Transactional
    public Map<String, Object> ship(UUID shopId, UUID actorId, UUID orderId, String trackingNumber) {
        Order order = orders.findByIdAndShopId(orderId, shopId).orElseThrow(() -> ApiException.notFound("Order not found"));
        transition(order, actorId, "shipped", List.of("processing"));
        if (trackingNumber != null && !trackingNumber.isBlank()) {
            order.setTrackingNumber(trackingNumber);
        }
        notify(order.getBuyerId(), "order", "Order shipped",
                "Your order " + order.getOrderNumber() + " is on the way.", "order", order.getId());
        return mapper.toOrder(order);
    }

    @Transactional
    public Map<String, Object> deliver(UUID shopId, UUID actorId, UUID orderId) {
        Order order = orders.findByIdAndShopId(orderId, shopId).orElseThrow(() -> ApiException.notFound("Order not found"));
        transition(order, actorId, "delivered", List.of("shipped"));
        if ("pending".equals(order.getPaymentStatus())) {
            order.setPaymentStatus("paid");
            creditPending(order);
        }
        releaseAvailable(order);
        notify(order.getBuyerId(), "order", "Order delivered",
                "Your order " + order.getOrderNumber() + " has been delivered.", "order", order.getId());
        return mapper.toOrder(order);
    }

    @Transactional
    public Map<String, Object> cancelSeller(UUID shopId, UUID actorId, UUID orderId) {
        Order order = orders.findByIdAndShopId(orderId, shopId).orElseThrow(() -> ApiException.notFound("Order not found"));
        cancel(order, actorId, "Cancelled by seller");
        return mapper.toOrder(order);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> listAdmin(int page, int size) {
        Page<Order> result = orders.findAll(PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100)));
        return page(result);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAdmin(UUID orderId) {
        Order order = orders.findById(orderId).orElseThrow(() -> ApiException.notFound("Order not found"));
        return mapper.toOrder(order);
    }

    @Transactional
    public void refundOrder(Order order, UUID actorId) {
        if ("refunded".equals(order.getStatus())) {
            return;
        }
        String from = order.getStatus();
        if (!"cancelled".equals(from)) {
            restoreStock(order);
            clawback(order);
        }
        order.setStatus("refunded");
        order.setPaymentStatus("refunded");
        addHistory(order.getId(), from, "refunded", actorId);
    }

    private void cancel(Order order, UUID actorId, String reason) {
        if (!List.of("pending", "processing").contains(order.getStatus())) {
            throw ApiException.badRequest("INVALID_STATE_TRANSITION", "Only pending or processing orders can be cancelled");
        }
        String from = order.getStatus();
        order.setStatus("cancelled");
        restoreStock(order);
        clawback(order);
        addHistory(order.getId(), from, "cancelled", actorId);
        UUID sellerUserId = shops.findById(order.getShopId()).map(s -> s.getUserId()).orElse(null);
        if (sellerUserId != null) {
            notify(sellerUserId, "order", "Order cancelled", reason + ": " + order.getOrderNumber(), "order", order.getId());
        }
        notify(order.getBuyerId(), "order", "Order cancelled",
                "Order " + order.getOrderNumber() + " was cancelled.", "order", order.getId());
    }

    private void transition(Order order, UUID actorId, String to, List<String> allowedFrom) {
        if (!allowedFrom.contains(order.getStatus())) {
            throw ApiException.badRequest("INVALID_STATE_TRANSITION",
                    "Cannot move order from " + order.getStatus() + " to " + to);
        }
        String from = order.getStatus();
        order.setStatus(to);
        addHistory(order.getId(), from, to, actorId);
    }

    private void restoreStock(Order order) {
        for (OrderItem item : orderItems.findByOrderId(order.getId())) {
            products.incrementStock(item.getProductId(), item.getQty());
        }
    }

    private BigDecimal earnings(Order order) {
        BigDecimal rate = order.getCommissionRate().divide(new BigDecimal("100"), 6, RoundingMode.HALF_UP);
        return CheckoutService.money(order.getSubtotal().multiply(BigDecimal.ONE.subtract(rate)));
    }

    private SellerBalance balance(UUID shopId) {
        return balances.findById(shopId).orElseGet(() -> {
            SellerBalance created = new SellerBalance();
            created.setShopId(shopId);
            created.setAvailable(BigDecimal.ZERO);
            created.setPending(BigDecimal.ZERO);
            return balances.save(created);
        });
    }

    private void creditPending(Order order) {
        BigDecimal amount = earnings(order);
        SellerBalance balance = balance(order.getShopId());
        balance.setPending(CheckoutService.money(balance.getPending().add(amount)));
        LedgerEntry entry = new LedgerEntry();
        entry.setShopId(order.getShopId());
        entry.setOrderId(order.getId());
        entry.setType("credit_pending");
        entry.setAmount(amount);
        ledger.save(entry);
    }

    private void releaseAvailable(Order order) {
        BigDecimal amount = earnings(order);
        SellerBalance balance = balance(order.getShopId());
        BigDecimal pending = balance.getPending() == null ? BigDecimal.ZERO : balance.getPending();
        if (pending.compareTo(amount) >= 0) {
            balance.setPending(CheckoutService.money(pending.subtract(amount)));
        } else {
            balance.setPending(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
        }
        balance.setAvailable(CheckoutService.money(balance.getAvailable().add(amount)));
        LedgerEntry entry = new LedgerEntry();
        entry.setShopId(order.getShopId());
        entry.setOrderId(order.getId());
        entry.setType("release_available");
        entry.setAmount(amount);
        ledger.save(entry);
    }

    private void clawback(Order order) {
        boolean credited = ledger.findByOrderId(order.getId()).stream()
                .anyMatch(e -> "credit_pending".equals(e.getType()));
        if (!credited) {
            return;
        }
        boolean already = ledger.findByOrderId(order.getId()).stream()
                .anyMatch(e -> "clawback".equals(e.getType()));
        if (already) {
            return;
        }
        BigDecimal amount = earnings(order);
        SellerBalance balance = balance(order.getShopId());
        BigDecimal pending = balance.getPending() == null ? BigDecimal.ZERO : balance.getPending();
        if (pending.compareTo(amount) >= 0) {
            balance.setPending(CheckoutService.money(pending.subtract(amount)));
        } else {
            BigDecimal remainder = amount.subtract(pending);
            balance.setPending(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
            BigDecimal available = balance.getAvailable() == null ? BigDecimal.ZERO : balance.getAvailable();
            balance.setAvailable(CheckoutService.money(available.subtract(remainder).max(BigDecimal.ZERO)));
        }
        LedgerEntry entry = new LedgerEntry();
        entry.setShopId(order.getShopId());
        entry.setOrderId(order.getId());
        entry.setType("clawback");
        entry.setAmount(amount);
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

    private Map<String, Object> page(Page<Order> result) {
        List<Map<String, Object>> content = new ArrayList<>();
        for (Order order : result.getContent()) {
            content.add(mapper.toOrder(order));
        }
        return com.shophub.shared.web.JsonMaps.of(
                "content", content,
                "page", result.getNumber(),
                "size", result.getSize(),
                "totalElements", result.getTotalElements(),
                "totalPages", result.getTotalPages());
    }
}
