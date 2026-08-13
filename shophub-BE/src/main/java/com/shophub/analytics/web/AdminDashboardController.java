package com.shophub.analytics.web;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shophub.catalog.infrastructure.ProductRepository;
import com.shophub.dispute.infrastructure.DisputeRepository;
import com.shophub.identity.infrastructure.UserRepository;
import com.shophub.order.application.CheckoutService;
import com.shophub.order.domain.Order;
import com.shophub.order.infrastructure.OrderRepository;
import com.shophub.shared.web.JsonMaps;
import com.shophub.shop.infrastructure.SellerApplicationRepository;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminDashboardController {

    private final UserRepository users;
    private final ProductRepository products;
    private final OrderRepository orders;
    private final DisputeRepository disputes;
    private final SellerApplicationRepository applications;

    public AdminDashboardController(
            UserRepository users,
            ProductRepository products,
            OrderRepository orders,
            DisputeRepository disputes,
            SellerApplicationRepository applications) {
        this.users = users;
        this.products = products;
        this.orders = orders;
        this.disputes = disputes;
        this.applications = applications;
    }

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard() {
        List<Order> all = orders.findAll();
        BigDecimal gmv = all.stream()
                .filter(o -> !"cancelled".equals(o.getStatus()) && !"refunded".equals(o.getStatus()))
                .map(Order::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return JsonMaps.of(
                "users", users.count(),
                "buyers", users.countByRole("buyer"),
                "sellers", users.countByRole("seller"),
                "products", products.count(),
                "pendingProducts", products.countByStatus("pending"),
                "orders", orders.count(),
                "gmv", CheckoutService.money(gmv),
                "openDisputes", disputes.countByStatus("open") + disputes.countByStatus("under_review"),
                "pendingApplications", applications.countByStatus("pending"));
    }
}
