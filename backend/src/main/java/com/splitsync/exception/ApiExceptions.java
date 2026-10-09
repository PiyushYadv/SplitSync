package com.splitsync.exception;

import java.util.Map;

import org.springframework.http.HttpStatus;

/** Factories for the errors services throw most often. */
public final class ApiExceptions {

    private ApiExceptions() {
    }

    public static ApiException notFound(String what) {
        return new ApiException(HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND, what + " not found");
    }

    public static ApiException forbidden(String message) {
        return new ApiException(HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN, message);
    }

    public static ApiException invalidField(String field, String message) {
        return new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, ErrorCode.VALIDATION_ERROR, message,
                Map.of(field, message));
    }

    public static ApiException conflict(ErrorCode code, String message) {
        return new ApiException(HttpStatus.CONFLICT, code, message);
    }
}
