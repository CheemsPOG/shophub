package com.shophub.catalog.infrastructure;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shophub.catalog.domain.Category;

public interface CategoryRepository extends JpaRepository<Category, UUID> {

    Optional<Category> findBySlug(String slug);

    List<Category> findByParentId(UUID parentId);

    List<Category> findByParentIdIsNull();

    boolean existsBySlug(String slug);
}
