package com.shophub.platform.infrastructure;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shophub.platform.domain.AuditLog;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    List<AuditLog> findByEntityTypeAndEntityId(String entityType, UUID entityId);

    List<AuditLog> findByActorIdOrderByCreatedAtDesc(UUID actorId);
}
