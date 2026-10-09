package com.splitsync.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** {@code currentPassword} is required unless the account signs in only with Google or GitHub. */
public record ChangeEmailRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email address")
        @Size(max = 255, message = "Email must be at most 255 characters")
        String email,

        @Size(max = 72, message = "Password must be at most 72 characters")
        String currentPassword) {
}
