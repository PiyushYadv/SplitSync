package com.splitsync.repository.projection;

import java.util.UUID;

public record GroupCount(UUID groupId, long count) {
}
