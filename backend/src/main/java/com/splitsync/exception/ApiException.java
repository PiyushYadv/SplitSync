package com.splitsync.exception;

import java.util.Map;

import org.springframework.http.HttpStatus;

import lombok.Getter;

@Getter
public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final ErrorCode code;
    private final Map<String, String> fieldErrors;

    public ApiException(HttpStatus status, ErrorCode code, String message) {
        this(status, code, message, null);
    }

    public ApiException(HttpStatus status, ErrorCode code, String message, Map<String, String> fieldErrors) {
        super(message);
        this.status = status;
        this.code = code;
        this.fieldErrors = fieldErrors;
    }
}
