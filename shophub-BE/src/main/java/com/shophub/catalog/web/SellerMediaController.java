package com.shophub.catalog.web;

import java.util.Map;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.shophub.shared.error.ApiException;
import com.shophub.shared.security.ShopHubPrincipal;
import com.shophub.shared.storage.MediaStorageService;
import com.shophub.shared.web.JsonMaps;

@RestController
@RequestMapping("/api/v1/seller/media")
public class SellerMediaController {

    private final MediaStorageService storage;

    public SellerMediaController(MediaStorageService storage) {
        this.storage = storage;
    }

    @PostMapping
    public Map<String, Object> upload(
            @AuthenticationPrincipal ShopHubPrincipal principal,
            @RequestParam("file") MultipartFile file) {
        if (principal.getShopId() == null) {
            throw ApiException.forbidden("Seller shop not found");
        }
        String url = storage.upload(file, "products/" + principal.getShopId());
        return JsonMaps.of("url", url);
    }
}
