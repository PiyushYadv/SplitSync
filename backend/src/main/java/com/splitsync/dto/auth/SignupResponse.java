package com.splitsync.dto.auth;

import java.util.UUID;

public record SignupResponse(UUID userId, boolean verificationRequired) {
}
