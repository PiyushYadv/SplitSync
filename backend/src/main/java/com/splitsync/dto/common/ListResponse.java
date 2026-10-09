package com.splitsync.dto.common;

import java.util.List;

public record ListResponse<T>(List<T> data, long total, String nextCursor) {

    public static <T> ListResponse<T> of(List<T> data) {
        return new ListResponse<>(data, data.size(), null);
    }
}
