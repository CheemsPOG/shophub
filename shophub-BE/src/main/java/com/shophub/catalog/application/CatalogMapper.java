package com.shophub.catalog.application;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.shophub.catalog.domain.Category;
import com.shophub.catalog.domain.Product;
import com.shophub.catalog.domain.ProductImage;
import com.shophub.catalog.domain.ProductVariantDef;
import com.shophub.catalog.infrastructure.CategoryRepository;
import com.shophub.catalog.infrastructure.ProductImageRepository;
import com.shophub.catalog.infrastructure.ProductRepository;
import com.shophub.catalog.infrastructure.ProductVariantDefRepository;
import com.shophub.shop.domain.Shop;
import com.shophub.shop.infrastructure.ShopRepository;

@Component
public class CatalogMapper {

    private final ProductImageRepository images;
    private final ProductVariantDefRepository variants;
    private final CategoryRepository categories;
    private final ShopRepository shops;
    private final ProductRepository products;

    public CatalogMapper(
            ProductImageRepository images,
            ProductVariantDefRepository variants,
            CategoryRepository categories,
            ShopRepository shops,
            ProductRepository products) {
        this.images = images;
        this.variants = variants;
        this.categories = categories;
        this.shops = shops;
        this.products = products;
    }

    public Map<String, Object> toProduct(Product product) {
        List<Map<String, Object>> list = toProducts(List.of(product));
        return list.isEmpty() ? Map.of() : list.getFirst();
    }

    public List<Map<String, Object>> toProducts(List<Product> productList) {
        if (productList == null || productList.isEmpty()) {
            return List.of();
        }
        List<UUID> ids = productList.stream().map(Product::getId).toList();
        Map<UUID, List<String>> imageMap = images.findByProductIdInOrderBySortOrderAsc(ids).stream()
                .collect(Collectors.groupingBy(ProductImage::getProductId,
                        Collectors.mapping(ProductImage::getObjectKey, Collectors.toList())));
        Map<UUID, List<Map<String, Object>>> variantMap = variants.findByProductIdIn(ids).stream()
                .collect(Collectors.groupingBy(ProductVariantDef::getProductId,
                        Collectors.mapping(this::toVariant, Collectors.toList())));
        Map<UUID, Category> categoryMap = loadCategories(productList);
        Map<UUID, Shop> shopMap = loadShops(productList);

        List<Map<String, Object>> result = new ArrayList<>();
        for (Product product : productList) {
            Category category = categoryMap.get(product.getCategoryId());
            Shop shop = shopMap.get(product.getShopId());
            Map<String, Object> dto = new LinkedHashMap<>();
            dto.put("id", product.getId().toString());
            dto.put("title", product.getTitle());
            dto.put("slug", product.getSlug());
            dto.put("description", product.getDescription());
            dto.put("category", category == null ? "" : category.getName());
            dto.put("categoryId", product.getCategoryId().toString());
            dto.put("price", product.getPrice());
            dto.put("compareAt", product.getCompareAt());
            dto.put("rating", product.getRatingAvg());
            dto.put("reviews", product.getReviewCount());
            dto.put("stock", product.getStock());
            dto.put("images", imageMap.getOrDefault(product.getId(), List.of()).stream()
                    .filter(key -> key != null && !key.contains("picsum.photos"))
                    .toList());
            dto.put("sellerId", product.getShopId().toString());
            dto.put("sellerName", shop == null ? "" : shop.getBusinessName());
            dto.put("brand", product.getBrand() == null ? "" : product.getBrand());
            dto.put("tags", product.getTags() == null ? List.of() : Arrays.asList(product.getTags()));
            dto.put("status", product.getStatus());
            dto.put("createdAt", product.getCreatedAt() == null ? null : product.getCreatedAt().toString());
            dto.put("sales", product.getSalesCount());
            dto.put("variants", variantMap.getOrDefault(product.getId(), List.of()));
            result.add(dto);
        }
        return result;
    }

    public Map<String, Object> toCategory(Category category) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", category.getId().toString());
        dto.put("name", category.getName());
        dto.put("slug", category.getSlug());
        dto.put("icon", category.getIcon() == null ? "" : category.getIcon());
        dto.put("parentId", category.getParentId() == null ? null : category.getParentId().toString());
        dto.put("productCount", products.countByCategoryIdAndStatus(category.getId(), "active"));
        return dto;
    }

    public Map<String, Object> toCategory(Category category, long productCount) {
        Map<String, Object> dto = toCategoryWithoutCount(category);
        dto.put("productCount", productCount);
        return dto;
    }

    public Map<String, Object> toCategoryWithoutCount(Category category) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", category.getId().toString());
        dto.put("name", category.getName());
        dto.put("slug", category.getSlug());
        dto.put("icon", category.getIcon() == null ? "" : category.getIcon());
        dto.put("parentId", category.getParentId() == null ? null : category.getParentId().toString());
        return dto;
    }

    private Map<String, Object> toVariant(ProductVariantDef def) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("name", def.getName());
        dto.put("options", def.getOptions() == null ? List.of() : Arrays.asList(def.getOptions()));
        return dto;
    }

    private Map<UUID, Category> loadCategories(List<Product> productList) {
        Collection<UUID> ids = productList.stream().map(Product::getCategoryId).collect(Collectors.toSet());
        return categories.findAllById(ids).stream().collect(Collectors.toMap(Category::getId, Function.identity()));
    }

    private Map<UUID, Shop> loadShops(List<Product> productList) {
        Collection<UUID> ids = productList.stream().map(Product::getShopId).collect(Collectors.toSet());
        return shops.findAllById(ids).stream().collect(Collectors.toMap(Shop::getId, Function.identity()));
    }

    public static BigDecimal money(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
