package com.splitsync.repository.projection;

import java.util.UUID;

public record UserCount(UUID userId, long count) {
}
