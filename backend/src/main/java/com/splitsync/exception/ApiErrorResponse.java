package com.splitsync.exception;

import java.util.Map;

public record ApiErrorResponse(String message, ErrorCode code, Map<String, String> fieldErrors) {

    public static ApiErrorResponse of(String message, ErrorCode code) {
        return new ApiErrorResponse(message, code, null);
    }
}
