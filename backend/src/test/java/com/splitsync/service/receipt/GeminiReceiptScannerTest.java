package com.splitsync.service.receipt;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.splitsync.dto.receipt.ScannedReceipt;
import com.splitsync.exception.ApiException;
import com.splitsync.exception.ErrorCode;

class GeminiReceiptScannerTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void parsesAmountsAsExactDecimals() throws Exception {
        ScannedReceipt receipt = parse("""
                {"isReceipt":true,"title":"Jimbaran Seafood","total":"83.05","currency":"usd",
                 "date":"2026-10-08","category":"Food & Drink",
                 "items":[{"name":"Grilled fish","amount":"40.10"},{"name":"","amount":"1"},{"name":"Tip","amount":"x"}]}
                """);

        assertThat(receipt.title()).isEqualTo("Jimbaran Seafood");
        assertThat(receipt.amount()).isEqualByComparingTo("83.05").hasScaleOf(2);
        assertThat(receipt.currency()).isEqualTo("USD");
        assertThat(receipt.date()).isEqualTo(LocalDate.of(2026, 10, 8));
        assertThat(receipt.category()).isEqualTo("Food & Drink");
        assertThat(receipt.items()).containsExactly(new ScannedReceipt.Item("Grilled fish", new BigDecimal("40.10")));
    }

    @Test
    void dropsImplausibleFieldsInsteadOfFailing() throws Exception {
        String future = LocalDate.now().plusDays(10).toString();
        ScannedReceipt receipt = parse("""
                {"isReceipt":true,"title":"  ","total":"$1,204.50","currency":"ZZZ","date":"%s",
                 "category":"Spaceships","items":[]}
                """.formatted(future));

        assertThat(receipt.title()).isNull();
        assertThat(receipt.amount()).isEqualByComparingTo("1204.50");
        assertThat(receipt.currency()).isNull();
        assertThat(receipt.date()).isNull();
        assertThat(receipt.category()).isEqualTo("Other");
    }

    @Test
    void rejectsImagesThatAreNotReceiptsOrHaveNoTotal() {
        assertThatThrownBy(() -> parse("""
                {"isReceipt":false,"title":"Cat","total":"12.00","currency":"","date":"","category":"Other","items":[]}
                """))
                .isInstanceOf(ApiException.class)
                .extracting(ex -> ((ApiException) ex).getCode())
                .isEqualTo(ErrorCode.RECEIPT_UNREADABLE);
        assertThatThrownBy(() -> parse("""
                {"isReceipt":true,"title":"Shop","total":"","currency":"","date":"","category":"Other","items":[]}
                """))
                .isInstanceOf(ApiException.class);
    }

    private ScannedReceipt parse(String json) throws Exception {
        return GeminiReceiptScanner.toReceipt(objectMapper.readTree(json));
    }
}
