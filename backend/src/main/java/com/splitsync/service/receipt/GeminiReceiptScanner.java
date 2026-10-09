package com.splitsync.service.receipt;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.splitsync.config.AppProperties;
import com.splitsync.dto.receipt.ScannedReceipt;
import com.splitsync.exception.ApiException;
import com.splitsync.exception.ErrorCode;
import com.splitsync.util.Categories;
import com.splitsync.util.Currencies;
import com.splitsync.util.Money;

import lombok.extern.slf4j.Slf4j;

/**
 * Reads receipts with Gemini's generateContent API, constrained to a JSON schema. Amounts are requested as
 * decimal strings and parsed to BigDecimal, so they never pass through a double.
 */
@Slf4j
@Component
public class GeminiReceiptScanner implements ReceiptScanner {

    private static final String PROMPT = """
            Read this receipt photo for an expense-splitting app.
            - isReceipt: false if the image is not a receipt, bill or invoice.
            - title: the merchant or venue name, short (e.g. "Blue Bottle Coffee").
            - total: the final amount paid including tax and tip, as a plain decimal string like "83.05".
            - currency: the ISO 4217 code if the receipt shows or clearly implies one, else "".
            - date: the purchase date as YYYY-MM-DD, else "".
            - category: the best match from the allowed values.
            - items: line items with their amounts as decimal strings; [] if unreadable.
            Never guess a total that isn't printed on the receipt.
            """;

    private static final Map<String, Object> RESPONSE_SCHEMA = Map.of(
            "type", "OBJECT",
            "properties", Map.of(
                    "isReceipt", Map.of("type", "BOOLEAN"),
                    "title", Map.of("type", "STRING"),
                    "total", Map.of("type", "STRING"),
                    "currency", Map.of("type", "STRING"),
                    "date", Map.of("type", "STRING"),
                    "category", Map.of("type", "STRING", "enum", Categories.NAMES),
                    "items", Map.of("type", "ARRAY", "items", Map.of(
                            "type", "OBJECT",
                            "properties", Map.of(
                                    "name", Map.of("type", "STRING"),
                                    "amount", Map.of("type", "STRING")),
                            "required", List.of("name", "amount")))),
            "required", List.of("isReceipt", "title", "total", "currency", "date", "category", "items"));

    private final AppProperties.Gemini config;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public GeminiReceiptScanner(RestClient.Builder builder, AppProperties appProperties, ObjectMapper objectMapper) {
        this.config = appProperties.ocr().gemini();
        this.objectMapper = objectMapper;
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(5_000);
        requestFactory.setReadTimeout(30_000);
        this.restClient = builder.baseUrl(config.baseUrl()).requestFactory(requestFactory).build();
    }

    @Override
    public ScannedReceipt scan(byte[] image, String mimeType) {
        if (!config.isConfigured()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.RECEIPT_SCAN_UNAVAILABLE,
                    "Receipt scanning isn't set up on this server");
        }
        Map<String, Object> request = Map.of(
                "contents", List.of(Map.of("parts", List.of(
                        Map.of("inline_data", Map.of("mime_type", mimeType,
                                "data", Base64.getEncoder().encodeToString(image))),
                        Map.of("text", PROMPT)))),
                "generationConfig", Map.of(
                        "response_mime_type", "application/json",
                        "response_schema", RESPONSE_SCHEMA,
                        "temperature", 0));
        try {
            // Serialized up front so the request carries a Content-Length instead of being chunked.
            byte[] payload = objectMapper.writeValueAsBytes(request);
            String body = restClient.post()
                    .uri("/models/{model}:generateContent", config.model())
                    .header("x-goog-api-key", config.apiKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .contentLength(payload.length)
                    .body(payload)
                    .retrieve()
                    .body(String.class);
            String json = objectMapper.readTree(body)
                    .path("candidates").path(0).path("content").path("parts").path(0).path("text").asText("");
            return toReceipt(objectMapper.readTree(json));
        } catch (RestClientException | IOException ex) {
            log.warn("Gemini receipt scan failed", ex);
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.RECEIPT_SCAN_UNAVAILABLE,
                    "Receipt scanning is temporarily unavailable. Try again or enter the expense manually.");
        }
    }

    /** Validates the model's answer field by field; anything implausible becomes null rather than an error. */
    static ScannedReceipt toReceipt(JsonNode result) {
        BigDecimal total = amount(result.path("total").asText(""));
        if (!result.path("isReceipt").asBoolean(false) || total == null) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, ErrorCode.RECEIPT_UNREADABLE,
                    "Couldn't read a total from that image. Try a clearer photo of the whole receipt.");
        }

        List<ScannedReceipt.Item> items = new ArrayList<>();
        for (JsonNode item : result.path("items")) {
            String name = item.path("name").asText("").trim();
            BigDecimal value = amount(item.path("amount").asText(""));
            if (!name.isEmpty() && value != null) {
                items.add(new ScannedReceipt.Item(name, value));
            }
        }

        String category = result.path("category").asText("");
        return new ScannedReceipt(
                blankToNull(result.path("title").asText("").trim()),
                total,
                currency(result.path("currency").asText("")),
                date(result.path("date").asText("")),
                Categories.NAMES.contains(category) ? category : Categories.DEFAULT,
                items);
    }

    private static BigDecimal amount(String raw) {
        String cleaned = raw.replaceAll("[^0-9.\\-]", "");
        try {
            BigDecimal value = Money.of(new BigDecimal(cleaned));
            return value.signum() > 0 ? value : null;
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private static String currency(String raw) {
        if (raw.isBlank()) {
            return null;
        }
        try {
            return Currencies.normalize(raw, "currency");
        } catch (ApiException ex) {
            return null;
        }
    }

    /** Ignores dates the model invented badly, including ones in the future. */
    private static LocalDate date(String raw) {
        try {
            LocalDate date = LocalDate.parse(raw.trim());
            return date.isAfter(LocalDate.now().plusDays(1)) ? null : date;
        } catch (DateTimeParseException ex) {
            return null;
        }
    }

    private static String blankToNull(String value) {
        return value.isEmpty() ? null : value;
    }
}
