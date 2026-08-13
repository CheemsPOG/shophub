package com.shophub.catalog.application;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shophub.catalog.domain.Category;
import com.shophub.catalog.domain.Product;
import com.shophub.catalog.domain.ProductImage;
import com.shophub.catalog.domain.ProductVariantDef;
import com.shophub.catalog.infrastructure.CategoryRepository;
import com.shophub.catalog.infrastructure.ProductImageRepository;
import com.shophub.catalog.infrastructure.ProductRepository;
import com.shophub.catalog.infrastructure.ProductVariantDefRepository;
import com.shophub.shared.error.ApiException;
import com.shophub.shared.web.JsonMaps;
import com.shophub.shop.domain.Shop;
import com.shophub.shop.infrastructure.ShopRepository;

@Service
public class SellerProductService {

    private final ProductRepository products;
    private final ProductImageRepository images;
    private final ProductVariantDefRepository variants;
    private final CategoryRepository categories;
    private final ShopRepository shops;
    private final CatalogMapper mapper;

    public SellerProductService(
            ProductRepository products,
            ProductImageRepository images,
            ProductVariantDefRepository variants,
            CategoryRepository categories,
            ShopRepository shops,
            CatalogMapper mapper) {
        this.products = products;
        this.images = images;
        this.variants = variants;
        this.categories = categories;
        this.shops = shops;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> list(UUID shopId, int page, int size) {
        Page<Product> result = products.findByShopId(shopId,
                PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), Sort.by(Sort.Order.desc("createdAt"))));
        return JsonMaps.of(
                "content", mapper.toProducts(result.getContent()),
                "page", result.getNumber(),
                "size", result.getSize(),
                "totalElements", result.getTotalElements(),
                "totalPages", result.getTotalPages());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> get(UUID shopId, UUID id) {
        return mapper.toProduct(owned(shopId, id));
    }

    @Transactional
    public Map<String, Object> create(UUID shopId, Map<String, Object> body) {
        Product product = new Product();
        product.setShopId(shopId);
        apply(product, body, true);
        product.setStatus("draft");
        product.setSalesCount(0);
        product.setReviewCount(0);
        product.setRatingAvg(BigDecimal.ZERO);
        products.save(product);
        replaceImages(product.getId(), body.get("images"));
        replaceVariants(product.getId(), body.get("variants"));
        return mapper.toProduct(product);
    }

    @Transactional
    public Map<String, Object> update(UUID shopId, UUID id, Map<String, Object> body) {
        Product product = owned(shopId, id);
        apply(product, body, false);
        if (body.containsKey("images")) {
            replaceImages(product.getId(), body.get("images"));
        }
        if (body.containsKey("variants")) {
            replaceVariants(product.getId(), body.get("variants"));
        }
        return mapper.toProduct(product);
    }

    @Transactional
    public Map<String, Object> publish(UUID shopId, UUID id) {
        Shop shop = shops.findById(shopId).orElseThrow(() -> ApiException.notFound("Shop not found"));
        if (!"verified".equals(shop.getStatus())) {
            throw ApiException.forbidden("Shop must be verified before publishing products");
        }
        Product product = owned(shopId, id);
        if (!List.of("draft", "rejected").contains(product.getStatus())) {
            throw ApiException.badRequest("INVALID_STATE_TRANSITION", "Only draft or rejected products can be published");
        }
        product.setStatus("pending");
        return mapper.toProduct(product);
    }

    @Transactional
    public void delete(UUID shopId, UUID id) {
        Product product = owned(shopId, id);
        try {
            images.deleteByProductId(id);
            variants.deleteByProductId(id);
            products.delete(product);
            products.flush();
        } catch (DataIntegrityViolationException ex) {
            throw ApiException.conflict("PRODUCT_IN_USE", "This product has orders or carts referencing it and cannot be deleted");
        }
    }

    private Product owned(UUID shopId, UUID id) {
        Product product = products.findById(id).orElseThrow(() -> ApiException.notFound("Product not found"));
        if (!shopId.equals(product.getShopId())) {
            throw ApiException.forbidden("You do not own this product");
        }
        return product;
    }

    private void apply(Product product, Map<String, Object> body, boolean creating) {
        if (creating || body.containsKey("title")) {
            String title = string(body.get("title"));
            if (title == null || title.isBlank()) {
                throw ApiException.badRequest("INVALID_TITLE", "Title is required");
            }
            product.setTitle(title);
            if (product.getSlug() == null || creating) {
                product.setSlug(uniqueSlug(title));
            }
        }
        if (creating || body.containsKey("description")) {
            product.setDescription(string(body.get("description")) == null ? "" : string(body.get("description")));
        }
        if (creating || body.containsKey("categoryId") || body.containsKey("category")) {
            product.setCategoryId(resolveCategory(body));
        }
        if (body.containsKey("brand")) {
            product.setBrand(string(body.get("brand")));
        }
        if (creating || body.containsKey("price")) {
            product.setPrice(decimal(body.get("price")));
        }
        if (body.containsKey("compareAt")) {
            product.setCompareAt(body.get("compareAt") == null ? null : decimal(body.get("compareAt")));
        }
        if (creating || body.containsKey("stock")) {
            product.setStock(body.get("stock") == null ? 0 : ((Number) body.get("stock")).intValue());
        }
        if (body.containsKey("tags")) {
            product.setTags(tags(body.get("tags")));
        } else if (creating) {
            product.setTags(new String[0]);
        }
    }

    private UUID resolveCategory(Map<String, Object> body) {
        if (body.get("categoryId") != null) {
            return UUID.fromString(String.valueOf(body.get("categoryId")));
        }
        String nameOrSlug = string(body.get("category"));
        if (nameOrSlug == null) {
            throw ApiException.badRequest("INVALID_CATEGORY", "Category is required");
        }
        return categories.findBySlug(nameOrSlug)
                .or(() -> categories.findAll().stream().filter(c -> c.getName().equalsIgnoreCase(nameOrSlug)).findFirst())
                .map(Category::getId)
                .orElseThrow(() -> ApiException.notFound("Category not found"));
    }

    private void replaceImages(UUID productId, Object raw) {
        images.deleteByProductId(productId);
        if (!(raw instanceof List<?> list)) {
            return;
        }
        int order = 0;
        for (Object item : list) {
            if (item == null) {
                continue;
            }
            ProductImage image = new ProductImage();
            image.setProductId(productId);
            image.setObjectKey(String.valueOf(item));
            image.setSortOrder(order++);
            images.save(image);
        }
    }

    @SuppressWarnings("unchecked")
    private void replaceVariants(UUID productId, Object raw) {
        variants.deleteByProductId(productId);
        if (!(raw instanceof List<?> list)) {
            return;
        }
        for (Object item : list) {
            if (!(item instanceof Map<?, ?> map)) {
                continue;
            }
            Map<String, Object> typed = (Map<String, Object>) map;
            ProductVariantDef def = new ProductVariantDef();
            def.setProductId(productId);
            def.setName(String.valueOf(typed.getOrDefault("name", "Option")));
            Object options = typed.get("options");
            if (options instanceof List<?> optionList) {
                def.setOptions(optionList.stream().map(String::valueOf).toArray(String[]::new));
            } else {
                def.setOptions(new String[0]);
            }
            variants.save(def);
        }
    }

    private String uniqueSlug(String title) {
        String base = title.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
        String slug = base;
        int i = 1;
        while (products.existsBySlug(slug)) {
            slug = base + "-" + i++;
        }
        return slug;
    }

    private static String string(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private static BigDecimal decimal(Object value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        return new BigDecimal(String.valueOf(value));
    }

    @SuppressWarnings("unchecked")
    private static String[] tags(Object raw) {
        if (raw instanceof List<?> list) {
            return list.stream().map(String::valueOf).toArray(String[]::new);
        }
        return new String[0];
    }
}
