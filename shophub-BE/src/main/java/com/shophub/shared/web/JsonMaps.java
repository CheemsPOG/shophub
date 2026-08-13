package com.shophub.shared.web;

import java.util.LinkedHashMap;
import java.util.Map;

public final class JsonMaps {

    private JsonMaps() {
    }

    public static Map<String, Object> of(Object... keyValues) {
        Map<String, Object> map = new LinkedHashMap<>();
        for (int i = 0; i < keyValues.length; i += 2) {
            map.put(String.valueOf(keyValues[i]), i + 1 < keyValues.length ? keyValues[i + 1] : null);
        }
        return map;
    }
}
