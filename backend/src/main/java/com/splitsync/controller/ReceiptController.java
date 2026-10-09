package com.splitsync.controller;

import java.io.IOException;
import java.util.Set;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.splitsync.dto.receipt.ScannedReceipt;
import com.splitsync.exception.ApiExceptions;
import com.splitsync.service.receipt.ReceiptScanner;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/receipts")
@RequiredArgsConstructor
public class ReceiptController {

    private static final Set<String> SUPPORTED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "application/pdf");

    private final ReceiptScanner receiptScanner;

    /** Reads a receipt photo (up to 10 MB) and returns values to prefill the expense form. Nothing is stored. */
    @PostMapping("/scan")
    public ScannedReceipt scan(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw ApiExceptions.invalidField("file", "Choose a receipt photo");
        }
        String type = file.getContentType();
        if (type == null || !SUPPORTED_TYPES.contains(type)) {
            throw ApiExceptions.invalidField("file", "Upload a JPEG, PNG, WebP, HEIC or PDF receipt");
        }
        return receiptScanner.scan(file.getBytes(), type);
    }
}
