package com.splitsync.dto.config;

import java.util.List;

/** Which optional features this deployment has configured, so the frontend only shows working buttons. */
public record ClientConfigResponse(List<String> oauthProviders, boolean receiptScanning) {
}
