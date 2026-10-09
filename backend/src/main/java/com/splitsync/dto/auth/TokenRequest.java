package com.splitsync.dto.auth;

import jakarta.validation.constraints.NotBlank;

/** The token from an emailed verification or email change link. */
public record TokenRequest(
        @NotBlank(message = "Token is required")
        String token) {
}
