package com.splitsync.service.receipt;

import com.splitsync.dto.receipt.ScannedReceipt;

/** Reads an uploaded receipt image. Implementations must not keep the image. */
public interface ReceiptScanner {

    ScannedReceipt scan(byte[] image, String mimeType);
}
