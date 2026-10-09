package com.splitsync.dto.settings;

import java.util.Map;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

public record UpdateSettingsRequest(
        @NotBlank(message = "Section is required")
        String section,

        @NotEmpty(message = "Nothing to update")
        Map<String, Object> values) {
}
