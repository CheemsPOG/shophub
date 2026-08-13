package com.shophub.catalog.application;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shophub.catalog.domain.Category;
import com.shophub.catalog.domain.Product;
import com.shophub.catalog.domain.Review;
import com.shophub.catalog.infrastructure.CategoryRepository;
import com.shophub.catalog.infrastructure.ProductRepository;
import com.shophub.catalog.infrastructure.ReviewRepository;
import com.shophub.identity.domain.User;
import com.shophub.identity.infrastructure.UserRepository;
import com.shophub.order.infrastructure.OrderItemRepository;
import com.shophub.shared.error.ApiException;
import com.shophub.shared.web.JsonMaps;
import com.shophub.shop.infrastructure.ShopRepository;

@Service
public class CatalogService {

    private final ProductRepository products;
    private final CategoryRepository categories;
    private final ReviewRepository reviews;
    private final UserRepository users;
    private final OrderItemRepository orderItems;
    private final ShopRepository shops;
    private final CatalogMapper mapper;

    public CatalogService(
            ProductRepository products,
            CategoryRepository categories,
            ReviewRepository reviews,
            UserRepository users,
            OrderItemRepository orderItems,
            ShopRepository shops,
            CatalogMapper mapper) {
        this.products = products;
        this.categories = categories;
        this.reviews = reviews;
        this.users = users;
        this.orderItems = orderItems;
        this.shops = shops;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> home() {
        List<Category> cats = categories.findByParentIdIsNull();
        List<Map<String, Object>> categoryDtos = cats.stream().map(mapper::toCategory).toList();
        Page<Product> featured = products.search("", null, null, false,
                PageRequest.of(0, 8, Sort.by(Sort.Order.desc("salesCount"), Sort.Order.desc("createdAt"))));
        Page<Product> deals = products.search("", null, null, true,
                PageRequest.of(0, 8, Sort.by(Sort.Order.desc("createdAt"))));
        Page<Product> trending = products.search("", null, null, false,
                PageRequest.of(0, 8, Sort.by(Sort.Order.desc("ratingAvg"), Sort.Order.desc("reviewCount"))));
        return JsonMaps.of(
                "categories", categoryDtos,
                "featured", mapper.toProducts(featured.getContent()),
                "deals", mapper.toProducts(deals.getContent()),
                "trending", mapper.toProducts(trending.getContent()),
                "stats", JsonMaps.of(
                        "buyers", users.countByRole("buyer"),
                        "sellers", shops.countByStatus("verified"),
                        "products", products.countByStatus("active")));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listCategories() {
        return categories.findByParentIdIsNull().stream().map(mapper::toCategory).toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> searchProducts(String q, String categorySlug, BigDecimal maxPrice, Boolean deals,
            String sort, int page, int size) {
        UUID categoryId = null;
        if (categorySlug != null && !categorySlug.isBlank()) {
            categoryId = categories.findBySlug(categorySlug)
                    .orElseThrow(() -> ApiException.notFound("Category not found"))
                    .getId();
        }
        boolean dealsOnly = Boolean.TRUE.equals(deals);
        String query = (q == null || q.isBlank()) ? "" : q.trim();
        int safeSize = Math.min(Math.max(size, 1), 100);
        int safePage = Math.max(page, 0);
        Pageable pageable = PageRequest.of(safePage, safeSize, sortFor(sort));
        Page<Product> result = products.search(query, categoryId, maxPrice, dealsOnly, pageable);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("content", mapper.toProducts(result.getContent()));
        body.put("page", result.getNumber());
        body.put("size", result.getSize());
        body.put("totalElements", result.getTotalElements());
        body.put("totalPages", result.getTotalPages());
        return body;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getProduct(String idOrSlug) {
        Product product = findByIdOrSlug(idOrSlug);
        Map<String, Object> dto = new LinkedHashMap<>(mapper.toProduct(product));
        dto.put("reviewList", listReviews(product.getId()));
        return dto;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listReviews(UUID productId) {
        List<Review> list = reviews.findByProductIdOrderByCreatedAtDesc(productId);
        List<Map<String, Object>> dtos = new ArrayList<>();
        for (Review review : list) {
            User author = users.findById(review.getUserId()).orElse(null);
            dtos.add(JsonMaps.of(
                    "id", review.getId().toString(),
                    "productId", review.getProductId().toString(),
                    "author", author == null ? "ShopHub shopper" : author.getFullName(),
                    "avatar", author == null ? "" : com.shophub.shared.web.StockImages.orEmpty(author.getAvatarKey()),
                    "rating", review.getRating(),
                    "title", review.getTitle(),
                    "body", review.getBody(),
                    "date", review.getCreatedAt() == null ? null : review.getCreatedAt().toString(),
                    "helpful", review.getHelpfulCount(),
                    "verified", review.isVerified()));
        }
        return dtos;
    }

    @Transactional
    public Map<String, Object> createReview(UUID userId, String idOrSlug, int rating, String title, String body) {
        if (rating < 1 || rating > 5) {
            throw ApiException.badRequest("INVALID_RATING", "Rating must be between 1 and 5");
        }
        Product product = findByIdOrSlug(idOrSlug);
        if (reviews.existsByProductIdAndUserId(product.getId(), userId)) {
            throw ApiException.conflict("REVIEW_EXISTS", "You have already reviewed this product");
        }
        Review review = new Review();
        review.setProductId(product.getId());
        review.setUserId(userId);
        review.setRating(rating);
        review.setTitle(title == null || title.isBlank() ? "Review" : title);
        review.setBody(body == null ? "" : body);
        review.setVerified(orderItems.hasDeliveredPurchase(product.getId(), userId));
        reviews.save(review);

        int count = product.getReviewCount() + 1;
        BigDecimal previous = product.getRatingAvg() == null ? BigDecimal.ZERO : product.getRatingAvg();
        BigDecimal total = previous.multiply(BigDecimal.valueOf(product.getReviewCount())).add(BigDecimal.valueOf(rating));
        product.setReviewCount(count);
        product.setRatingAvg(total.divide(BigDecimal.valueOf(count), 2, java.math.RoundingMode.HALF_UP));

        return JsonMaps.of(
                "id", review.getId().toString(),
                "rating", review.getRating(),
                "title", review.getTitle(),
                "body", review.getBody(),
                "verified", review.isVerified(),
                "helpful", review.getHelpfulCount());
    }

    public Product findByIdOrSlug(String idOrSlug) {
        if (idOrSlug == null || idOrSlug.isBlank()) {
            throw ApiException.notFound("Product not found");
        }
        try {
            UUID id = UUID.fromString(idOrSlug);
            return products.findById(id).orElseThrow(() -> ApiException.notFound("Product not found"));
        } catch (IllegalArgumentException ex) {
            return products.findBySlug(idOrSlug).orElseThrow(() -> ApiException.notFound("Product not found"));
        }
    }

    private Sort sortFor(String sort) {
        if (sort == null || sort.isBlank() || "featured".equals(sort)) {
            return Sort.by(Sort.Order.desc("salesCount"), Sort.Order.desc("createdAt"));
        }
        return switch (sort) {
            case "price_asc" -> Sort.by(Sort.Order.asc("price"));
            case "price_desc" -> Sort.by(Sort.Order.desc("price"));
            case "rating" -> Sort.by(Sort.Order.desc("ratingAvg"), Sort.Order.desc("reviewCount"));
            case "newest" -> Sort.by(Sort.Order.desc("createdAt"));
            default -> Sort.by(Sort.Order.desc("salesCount"), Sort.Order.desc("createdAt"));
        };
    }
}
