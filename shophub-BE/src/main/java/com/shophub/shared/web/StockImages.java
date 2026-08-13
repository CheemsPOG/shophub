package com.shophub.shared.web;

/** Filters out placeholder stock-photo URLs (Picsum, Pravatar) that older demo
 * seeds may have written, so the API never serves them even if they are still
 * sitting in the database. */
public final class StockImages {

    private StockImages() {
    }

    /** Returns {@code url}, or {@code ""} if it is null/blank/a known stock-photo URL. */
    public static String orEmpty(String url) {
        return isStock(url) ? "" : (url == null ? "" : url);
    }

    public static boolean isStock(String url) {
        if (url == null || url.isBlank()) {
            return false;
        }
        return url.contains("picsum.photos") || url.contains("pravatar.cc");
    }
}
