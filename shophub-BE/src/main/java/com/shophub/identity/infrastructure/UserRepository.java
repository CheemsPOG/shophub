package com.shophub.identity.infrastructure;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shophub.identity.domain.User;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndDeletedAtIsNull(String email);

    boolean existsByEmail(String email);

    org.springframework.data.domain.Page<User> findByRole(String role, org.springframework.data.domain.Pageable pageable);

    long countByRole(String role);
}
