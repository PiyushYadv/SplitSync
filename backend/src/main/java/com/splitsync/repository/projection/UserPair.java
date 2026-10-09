package com.splitsync.repository.projection;

import java.util.UUID;

public record UserPair(UUID userId, UUID otherUserId) {
}
