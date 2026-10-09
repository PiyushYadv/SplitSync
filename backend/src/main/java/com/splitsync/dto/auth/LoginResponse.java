package com.splitsync.dto.auth;

import java.time.Instant;

public record LoginResponse(UserResponse user, Instant expiresAt) {
}
