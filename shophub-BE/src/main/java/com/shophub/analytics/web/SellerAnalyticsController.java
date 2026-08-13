package com.shophub.analytics.web;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shophub.catalog.infrastructure.ProductRepository;
import com.shophub.order.application.CheckoutService;
import com.shophub.order.application.OrderMapper;
import com.shophub.order.domain.Order;
import com.shophub.order.infrastructure.OrderRepository;
import com.shophub.payout.infrastructure.SellerBalanceRepository;
import com.shophub.shared.error.ApiException;
import com.shophub.shared.security.ShopHubPrincipal;
import com.shophub.shared.web.JsonMaps;

@RestController
@RequestMapping("/api/v1/seller")
public class SellerAnalyticsController {

    private final OrderRepository orders;
    private final ProductRepository products;
    private final SellerBalanceRepository balances;
    private final OrderMapper orderMapper;

    public SellerAnalyticsController(
            OrderRepository orders,
            ProductRepository products,
            SellerBalanceRepository balances,
            OrderMapper orderMapper) {
        this.orders = orders;
        this.products = products;
        this.balances = balances;
        this.orderMapper = orderMapper;
    }

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard(@AuthenticationPrincipal ShopHubPrincipal principal) {
        UUID shopId = shopId(principal);
        List<Order> shopOrders = orders.findByShopId(shopId);
        BigDecimal revenue = shopOrders.stream()
                .filter(o -> !"cancelled".equals(o.getStatus()) && !"refunded".equals(o.getStatus()))
                .map(Order::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        List<Order> recent = shopOrders.stream()
                .sorted(Comparator.comparing(Order::getPlacedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(8)
                .toList();
        var balance = balances.findById(shopId).orElse(null);
        return JsonMaps.of(
                "orders", shopOrders.size(),
                "pendingOrders", orders.countByShopIdAndStatus(shopId, "pending") + orders.countByShopIdAndStatus(shopId, "processing"),
                "products", products.countByShopId(shopId),
                "revenue", CheckoutService.money(revenue),
                "availableBalance", balance == null ? BigDecimal.ZERO : balance.getAvailable(),
                "pendingBalance", balance == null ? BigDecimal.ZERO : balance.getPending(),
                "recentOrders", recent.stream().map(orderMapper::toOrder).toList());
    }

    @GetMapping("/analytics")
    public Map<String, Object> analytics(
            @AuthenticationPrincipal ShopHubPrincipal principal,
            @RequestParam(defaultValue = "30d") String period) {
        UUID shopId = shopId(principal);
        int days = "7d".equals(period) ? 7 : "90d".equals(period) ? 90 : 30;
        Instant from = LocalDate.now(ZoneOffset.UTC).minusDays(days - 1L).atStartOfDay().toInstant(ZoneOffset.UTC);
        List<Order> shopOrders = orders.findByShopId(shopId).stream()
                .filter(o -> o.getPlacedAt() != null && !o.getPlacedAt().isBefore(from))
                .filter(o -> !"cancelled".equals(o.getStatus()) && !"refunded".equals(o.getStatus()))
                .toList();
        Map<LocalDate, BigDecimal> byDay = shopOrders.stream().collect(Collectors.groupingBy(
                o -> LocalDate.ofInstant(o.getPlacedAt(), ZoneOffset.UTC),
                Collectors.reducing(BigDecimal.ZERO, Order::getSubtotal, BigDecimal::add)));
        List<Map<String, Object>> series = new ArrayList<>();
        for (int i = 0; i < days; i++) {
            LocalDate day = LocalDate.now(ZoneOffset.UTC).minusDays(days - 1L - i);
            series.add(JsonMaps.of(
                    "date", day.toString(),
                    "revenue", CheckoutService.money(byDay.getOrDefault(day, BigDecimal.ZERO))));
        }
        BigDecimal revenue = shopOrders.stream().map(Order::getSubtotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("period", period);
        body.put("orders", shopOrders.size());
        body.put("revenue", CheckoutService.money(revenue));
        body.put("averageOrder", shopOrders.isEmpty()
                ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP)
                : CheckoutService.money(revenue.divide(BigDecimal.valueOf(shopOrders.size()), 2, RoundingMode.HALF_UP)));
        body.put("series", series);
        return body;
    }

    private UUID shopId(ShopHubPrincipal principal) {
        if (principal.getShopId() == null) {
            throw ApiException.forbidden("Seller shop not found");
        }
        return principal.getShopId();
    }
}
