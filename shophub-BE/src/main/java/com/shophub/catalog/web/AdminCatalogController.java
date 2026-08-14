package com.shophub.catalog.web;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shophub.catalog.application.CatalogMapper;
import com.shophub.catalog.domain.Category;
import com.shophub.catalog.domain.Product;
import com.shophub.catalog.infrastructure.CategoryRepository;
import com.shophub.catalog.infrastructure.ProductRepository;
import com.shophub.shared.error.ApiException;
import com.shophub.shared.web.JsonMaps;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminCatalogController {

    private final ProductRepository products;
    private final CategoryRepository categories;
    private final CatalogMapper mapper;

    public AdminCatalogController(
            ProductRepository products,
            CategoryRepository categories,
            CatalogMapper mapper) {
        this.products = products;
        this.categories = categories;
        this.mapper = mapper;
    }

    @GetMapping("/products")
    public Map<String, Object> products(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), Sort.by(Sort.Order.desc("createdAt")));
        Page<Product> result = (status == null || status.isBlank())
                ? products.findAll(pageable)
                : products.findByStatus(status, pageable);
        return JsonMaps.of(
                "content", mapper.toProducts(result.getContent()),
                "page", result.getNumber(),
                "size", result.getSize(),
                "totalElements", result.getTotalElements(),
                "totalPages", result.getTotalPages());
    }

    @GetMapping("/categories")
    public List<Map<String, Object>> listCategories() {
        return categories.findAll().stream().map(mapper::toCategory).toList();
    }

    @PostMapping("/categories")
    @Transactional
    public Map<String, Object> createCategory(@RequestBody CategoryRequest request) {
        if (request.slug() != null && categories.existsBySlug(request.slug())) {
            throw ApiException.conflict("SLUG_TAKEN", "Category slug already exists");
        }
        Category category = new Category();
        category.setName(request.name());
        category.setSlug(request.slug() == null || request.slug().isBlank() ? slugify(request.name()) : request.slug());
        category.setIcon(request.icon());
        category.setParentId(request.parentId());
        categories.save(category);
        return mapper.toCategory(category);
    }

    @PutMapping("/categories/{id}")
    @Transactional
    public Map<String, Object> updateCategory(@PathVariable UUID id, @RequestBody CategoryRequest request) {
        Category category = categories.findById(id).orElseThrow(() -> ApiException.notFound("Category not found"));
        if (request.name() != null) {
            category.setName(request.name());
        }
        if (request.slug() != null && !request.slug().isBlank()) {
            category.setSlug(request.slug());
        }
        if (request.icon() != null) {
            category.setIcon(request.icon());
        }
        if (request.parentId() != null) {
            category.setParentId(request.parentId());
        }
        return mapper.toCategory(category);
    }

    @DeleteMapping("/categories/{id}")
    @Transactional
    public Map<String, String> deleteCategory(@PathVariable UUID id) {
        Category category = categories.findById(id).orElseThrow(() -> ApiException.notFound("Category not found"));
        categories.delete(category);
        return Map.of("status", "ok");
    }

    private String slugify(String name) {
        return name.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
    }

    public record CategoryRequest(String name, String slug, String icon, UUID parentId) {
    }
}
