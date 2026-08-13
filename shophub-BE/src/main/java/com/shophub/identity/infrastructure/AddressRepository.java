package com.shophub.identity.infrastructure;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shophub.identity.domain.Address;

public interface AddressRepository extends JpaRepository<Address, UUID> {

    List<Address> findByUserId(UUID userId);

    Optional<Address> findByUserIdAndIsDefaultTrue(UUID userId);

    Optional<Address> findByIdAndUserId(UUID id, UUID userId);
}
