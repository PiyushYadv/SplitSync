package com.splitsync;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import com.splitsync.dto.receipt.ScannedReceipt;

class ReceiptScanIntegrationTest extends IntegrationTestBase {

    @Test
    void returnsScannedFieldsForASupportedImage() throws Exception {
        TestUser user = signupAndLogin("Receipt Scanner");
        when(receiptScanner.scan(any(), eq("image/jpeg"))).thenReturn(new ScannedReceipt("Corner Cafe",
                new BigDecimal("12.50"), "EUR", LocalDate.of(2026, 10, 1), "Food & Drink",
                List.of(new ScannedReceipt.Item("Flat white", new BigDecimal("4.50")))));

        mockMvc.perform(multipart("/receipts/scan")
                        .file(new MockMultipartFile("file", "receipt.jpg", "image/jpeg", new byte[] { 1, 2, 3 }))
                        .cookie(user.session()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Corner Cafe"))
                .andExpect(jsonPath("$.amount").value(12.50))
                .andExpect(jsonPath("$.currency").value("EUR"))
                .andExpect(jsonPath("$.date").value("2026-10-01"))
                .andExpect(jsonPath("$.items[0].name").value("Flat white"));
    }

    @Test
    void rejectsUnsupportedFilesAndAnonymousUsers() throws Exception {
        TestUser user = signupAndLogin("Receipt Rejecter");
        mockMvc.perform(multipart("/receipts/scan")
                        .file(new MockMultipartFile("file", "notes.txt", "text/plain", "hi".getBytes()))
                        .cookie(user.session()))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.fieldErrors.file").exists());
        mockMvc.perform(multipart("/receipts/scan").cookie(user.session()))
                .andExpect(status().isBadRequest());
        mockMvc.perform(multipart("/receipts/scan")
                        .file(new MockMultipartFile("file", "r.png", "image/png", new byte[] { 1 })))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(receiptScanner);
    }
}
