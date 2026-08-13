package com.shophub.messaging.infrastructure;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shophub.messaging.domain.Conversation;

public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    List<Conversation> findByBuyerIdOrderByLastMessageAtDesc(UUID buyerId);

    List<Conversation> findByShopIdOrderByLastMessageAtDesc(UUID shopId);

    Optional<Conversation> findByBuyerIdAndShopId(UUID buyerId, UUID shopId);

    Optional<Conversation> findByBuyerIdAndSupportTrue(UUID buyerId);
}
