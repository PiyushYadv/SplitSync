package com.splitsync.service.fx;

import java.math.BigDecimal;

import org.springframework.http.HttpStatus;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.splitsync.config.AppProperties;
import com.splitsync.exception.ApiException;
import com.splitsync.exception.ErrorCode;

import lombok.extern.slf4j.Slf4j;

/** ECB reference rates from the Frankfurter API (no API key required). */
@Slf4j
@Component
public class FrankfurterExchangeRateProvider implements ExchangeRateProvider {

    private final RestClient restClient;
    // Parse rates straight to BigDecimal so they never pass through a double.
    private final ObjectMapper objectMapper = new ObjectMapper()
            .enable(DeserializationFeature.USE_BIG_DECIMAL_FOR_FLOATS);

    public FrankfurterExchangeRateProvider(RestClient.Builder builder, AppProperties appProperties) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(3_000);
        requestFactory.setReadTimeout(5_000);
        this.restClient = builder.baseUrl(appProperties.fx().baseUrl()).requestFactory(requestFactory).build();
    }

    @Override
    public BigDecimal fetchRate(String from, String to) {
        try {
            String body = restClient.get()
                    .uri("/latest?base={from}&symbols={to}", from, to)
                    .retrieve()
                    .body(String.class);
            JsonNode rate = objectMapper.readTree(body).path("rates").path(to);
            if (!rate.isNumber()) {
                throw unsupported(from, to);
            }
            return rate.decimalValue();
        } catch (HttpClientErrorException.NotFound | HttpClientErrorException.UnprocessableEntity ex) {
            throw unsupported(from, to);
        } catch (RestClientException | java.io.IOException ex) {
            log.warn("Exchange rate lookup {}->{} failed", from, to, ex);
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.FX_UNAVAILABLE,
                    "Exchange rates are temporarily unavailable. Try again shortly.");
        }
    }

    private static ApiException unsupported(String from, String to) {
        return new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, ErrorCode.UNSUPPORTED_CURRENCY,
                "No exchange rate available from " + from + " to " + to);
    }
}
