package com.splitsync.dto.group;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateGroupRequest(
        @NotBlank(message = "Group name is required")
        @Size(max = 255, message = "Group name must be at most 255 characters")
        String name,

        @NotBlank(message = "Emoji is required")
        @Size(max = 20, message = "Emoji is too long")
        String emoji,

        @NotBlank(message = "Color is required")
        @Pattern(regexp = "emerald|indigo|amber|rose|violet|sky", message = "Unsupported group color")
        String color,

        @Pattern(regexp = "[A-Za-z]{3}", message = "Currency must be a 3-letter ISO code")
        String baseCurrency,

        @Size(max = 50, message = "You can invite at most 50 members at once")
        List<UUID> memberIds) {
}
