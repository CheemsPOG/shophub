package com.shophub.catalog.web;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shophub.catalog.application.CatalogService;
import com.shophub.shared.security.ShopHubPrincipal;

@RestController
@RequestMapping("/api/v1/catalog")
public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping("/home")
    public Map<String, Object> home() {
        return catalogService.home();
    }

    @GetMapping("/categories")
    public List<Map<String, Object>> categories() {
        return catalogService.listCategories();
    }

    @GetMapping("/products")
    public Map<String, Object> products(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean deals,
            @RequestParam(required = false, defaultValue = "featured") String sort,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size) {
        return catalogService.searchProducts(q, category, maxPrice, deals, sort, page, size);
    }

    @GetMapping("/products/{idOrSlug}")
    public Map<String, Object> product(@PathVariable String idOrSlug) {
        return catalogService.getProduct(idOrSlug);
    }

    @GetMapping("/products/{idOrSlug}/reviews")
    public List<Map<String, Object>> reviews(@PathVariable String idOrSlug) {
        return catalogService.listReviews(catalogService.findByIdOrSlug(idOrSlug).getId());
    }

    @PostMapping("/products/{idOrSlug}/reviews")
    public Map<String, Object> createReview(
            @AuthenticationPrincipal ShopHubPrincipal principal,
            @PathVariable String idOrSlug,
            @RequestBody ReviewRequest request) {
        return catalogService.createReview(
                principal.getUserId(),
                idOrSlug,
                request.rating(),
                request.title(),
                request.body());
    }

    public record ReviewRequest(int rating, String title, String body) {
    }
}
