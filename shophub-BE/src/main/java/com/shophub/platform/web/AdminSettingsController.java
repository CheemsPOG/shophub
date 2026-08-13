package com.shophub.platform.web;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shophub.platform.domain.PlatformSetting;
import com.shophub.platform.infrastructure.PlatformSettingRepository;

@RestController
@RequestMapping("/api/v1/admin/settings")
public class AdminSettingsController {

    private final PlatformSettingRepository settings;
    private final ObjectMapper objectMapper;

    public AdminSettingsController(PlatformSettingRepository settings, ObjectMapper objectMapper) {
        this.settings = settings;
        this.objectMapper = objectMapper;
    }

    @GetMapping
    public Map<String, Object> get() {
        Map<String, Object> body = new LinkedHashMap<>();
        for (PlatformSetting setting : settings.findAll()) {
            body.put(setting.getKey(), parse(setting.getValue()));
        }
        return body;
    }

    @PutMapping
    @Transactional
    public Map<String, Object> put(@RequestBody Map<String, Object> body) {
        for (Map.Entry<String, Object> entry : body.entrySet()) {
            PlatformSetting setting = settings.findById(entry.getKey()).orElseGet(() -> {
                PlatformSetting created = new PlatformSetting();
                created.setKey(entry.getKey());
                return created;
            });
            try {
                setting.setValue(objectMapper.writeValueAsString(entry.getValue()));
            } catch (Exception ex) {
                setting.setValue("null");
            }
            settings.save(setting);
        }
        return get();
    }

    private Object parse(String json) {
        try {
            JsonNode node = objectMapper.readTree(json);
            if (node.isNumber()) {
                return node.decimalValue();
            }
            if (node.isBoolean()) {
                return node.booleanValue();
            }
            if (node.isTextual()) {
                return node.asText();
            }
            return objectMapper.convertValue(node, Object.class);
        } catch (Exception ex) {
            return json;
        }
    }
}
