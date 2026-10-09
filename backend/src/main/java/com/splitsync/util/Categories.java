package com.splitsync.util;

import java.util.List;
import java.util.Map;

/** Expense categories offered by the frontend and the colour each one is drawn with. */
public final class Categories {

    public static final String DEFAULT = "Other";
    /** In the order the frontend lists them. */
    public static final List<String> NAMES = List.of("Food & Drink", "Accommodation", "Transport", "Activities",
            "Utilities", "Home", "Rent", "Wellness", DEFAULT);
    private static final String DEFAULT_COLOR = "#94a3b8";
    private static final Map<String, String> COLORS = Map.of(
            "Food & Drink", "#f59e0b",
            "Accommodation", "#6366f1",
            "Transport", "#3b82f6",
            "Activities", "#10b981",
            "Utilities", "#f59e0b",
            "Home", "#10b981",
            "Wellness", "#ec4899",
            "Rent", "#6366f1");

    private Categories() {
    }

    public static String colorOf(String category) {
        return COLORS.getOrDefault(category, DEFAULT_COLOR);
    }
}
