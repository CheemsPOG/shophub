package com.shophub.catalog.infrastructure;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.shophub.catalog.domain.Product;

public interface ProductRepository extends JpaRepository<Product, UUID>, JpaSpecificationExecutor<Product> {

    Optional<Product> findBySlug(String slug);

    List<Product> findByShopId(UUID shopId);

    Page<Product> findByShopId(UUID shopId, Pageable pageable);

    List<Product> findByShopIdAndStatus(UUID shopId, String status);

    List<Product> findByCategoryId(UUID categoryId);

    List<Product> findByStatus(String status);

    Page<Product> findByStatus(String status, Pageable pageable);

    boolean existsBySlug(String slug);

    long countByShopId(UUID shopId);

    long countByStatus(String status);

    long countByCategoryIdAndStatus(UUID categoryId, String status);

    @Query("""
            select p from Product p
            where p.status = 'active'
              and (:categoryId is null or p.categoryId = :categoryId)
              and (:maxPrice is null or p.price <= :maxPrice)
              and (:deals = false or (p.compareAt is not null and p.compareAt > p.price))
              and (:q = '' or lower(p.title) like lower(concat('%', :q, '%'))
                   or lower(p.description) like lower(concat('%', :q, '%'))
                   or lower(coalesce(p.brand, '')) like lower(concat('%', :q, '%')))
            """)
    Page<Product> search(
            @Param("q") String q,
            @Param("categoryId") UUID categoryId,
            @Param("maxPrice") java.math.BigDecimal maxPrice,
            @Param("deals") boolean deals,
            Pageable pageable);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update Product p set p.stock = p.stock - :qty, p.salesCount = p.salesCount + :qty where p.id = :id and p.stock >= :qty")
    int decrementStock(@Param("id") UUID id, @Param("qty") int qty);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update Product p set p.stock = p.stock + :qty, p.salesCount = case when p.salesCount >= :qty then p.salesCount - :qty else 0 end where p.id = :id")
    int incrementStock(@Param("id") UUID id, @Param("qty") int qty);
}
