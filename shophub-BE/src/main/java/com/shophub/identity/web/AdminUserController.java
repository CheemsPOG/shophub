package com.shophub.identity.web;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shophub.identity.domain.User;
import com.shophub.identity.infrastructure.UserRepository;
import com.shophub.shared.error.ApiException;
import com.shophub.shared.web.JsonMaps;
import com.shophub.shop.infrastructure.ShopRepository;

@RestController
@RequestMapping("/api/v1/admin/users")
public class AdminUserController {

    private final UserRepository users;
    private final ShopRepository shops;

    public AdminUserController(UserRepository users, ShopRepository shops) {
        this.users = users;
        this.shops = shops;
    }

    @GetMapping
    public Map<String, Object> list(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), Sort.by(Sort.Order.desc("createdAt")));
        Page<User> result = (role == null || role.isBlank()) ? users.findAll(pageable) : users.findByRole(role, pageable);
        List<Map<String, Object>> content = new ArrayList<>();
        for (User user : result.getContent()) {
            if (q != null && !q.isBlank()) {
                String needle = q.toLowerCase();
                if (!user.getEmail().toLowerCase().contains(needle) && !user.getFullName().toLowerCase().contains(needle)) {
                    continue;
                }
            }
            content.add(toDto(user));
        }
        return JsonMaps.of(
                "content", content,
                "page", result.getNumber(),
                "size", result.getSize(),
                "totalElements", result.getTotalElements(),
                "totalPages", result.getTotalPages());
    }

    @PostMapping("/{id}/ban")
    @Transactional
    public Map<String, Object> ban(@PathVariable UUID id) {
        User user = users.findById(id).orElseThrow(() -> ApiException.notFound("User not found"));
        user.setBannedAt(Instant.now());
        return toDto(user);
    }

    @PostMapping("/{id}/unban")
    @Transactional
    public Map<String, Object> unban(@PathVariable UUID id) {
        User user = users.findById(id).orElseThrow(() -> ApiException.notFound("User not found"));
        user.setBannedAt(null);
        return toDto(user);
    }

    private Map<String, Object> toDto(User user) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", user.getId().toString());
        dto.put("email", user.getEmail());
        dto.put("name", user.getFullName());
        dto.put("role", user.getRole());
        dto.put("phone", user.getPhone() == null ? "" : user.getPhone());
        dto.put("banned", user.getBannedAt() != null);
        dto.put("bannedAt", user.getBannedAt() == null ? null : user.getBannedAt().toString());
        dto.put("joinedAt", user.getCreatedAt() == null ? null : user.getCreatedAt().toString());
        dto.put("shopId", shops.findByUserId(user.getId()).map(s -> s.getId().toString()).orElse(""));
        return dto;
    }
}
