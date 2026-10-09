"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, FileText, Loader2, RefreshCw, ScanLine, Upload, X } from "lucide-react";
import ExpenseForm, { type ExpensePrefill } from "@/src/features/expenses/components/ExpenseForm";
import { errorMessage } from "@/src/lib/api/client";
import { useScanReceipt } from "@/src/lib/data/mutations";
import { formatMoney } from "@/src/lib/format/money";
import type { ScannedReceipt } from "@/src/types/domain";

const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf";
const MAX_BYTES = 10 * 1024 * 1024;

function toPrefill(receipt: ScannedReceipt): ExpensePrefill {
  return {
    title: receipt.title,
    amount: receipt.amount.toFixed(2),
    category: receipt.category,
    currency: receipt.currency,
    date: receipt.date,
  };
}

/** Add an expense from a receipt photo: the scan prefills the form for review. */
export default function ReceiptScanModal({
  defaultGroupId,
  onClose,
}: {
  defaultGroupId?: string;
  onClose: () => void;
}) {
  const scan = useScanReceipt();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  // Bumped per scan so the form remounts with the new values.
  const [scanCount, setScanCount] = useState(0);

  useEffect(() => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- object URL must be created and revoked together
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function choose(next: File | undefined) {
    if (!next) return;
    scan.reset();
    setPreviewUrl(null);
    if (!ACCEPTED_TYPES.split(",").includes(next.type)) {
      setFile(null);
      setLocalError("Upload a JPEG, PNG, WebP, HEIC or PDF receipt.");
      return;
    }
    if (next.size > MAX_BYTES) {
      setFile(null);
      setLocalError("That file is over 10 MB. Try a smaller photo.");
      return;
    }
    setLocalError(null);
    setFile(next);
    scan.mutate(next, { onSuccess: () => setScanCount((count) => count + 1) });
  }

  const receipt = scan.data;
  const error = localError ?? (scan.isError ? errorMessage(scan.error) : null);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden border border-slate-200"
        style={{ maxHeight: "90vh" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-indigo-50 rounded-md flex items-center justify-center">
              <Camera size={14} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Add Expense from Receipt</h2>
              <p className="text-[11px] text-slate-400">
                We read the receipt and fill in the form. Check it before saving.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-1/2 border-r border-slate-200 p-5 flex flex-col gap-3 overflow-auto bg-slate-50">
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_TYPES}
              // Opens the camera directly on phones.
              capture="environment"
              className="hidden"
              onChange={(event) => {
                choose(event.target.files?.[0]);
                event.target.value = "";
              }}
            />

            {!file ? (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  choose(event.dataTransfer.files[0]);
                }}
                className={`flex-1 min-h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-8 transition-colors ${
                  dragging ? "border-indigo-400 bg-indigo-50" : "border-slate-300 hover:border-slate-400"
                }`}
              >
                <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center mb-4">
                  <Upload size={22} className="text-slate-500" />
                </div>
                <p className="text-sm font-semibold text-slate-700 mb-1">
                  Drop a receipt or click to upload
                </p>
                <p className="text-xs text-slate-400">JPEG, PNG, WebP, HEIC or PDF, up to 10 MB</p>
              </button>
            ) : (
              <div className="relative rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center min-h-48">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- local object URL, nothing to optimize
                  <img src={previewUrl} alt="Receipt" className="max-h-80 w-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
                    <FileText size={28} />
                    <span className="text-xs">{file.name}</span>
                  </div>
                )}
                {scan.isPending && (
                  <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center gap-2">
                    <Loader2 size={22} className="text-indigo-600 animate-spin" />
                    <span className="text-xs font-semibold text-slate-600">Reading receipt…</span>
                  </div>
                )}
              </div>
            )}

            {error && (
              <p className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-600">
                {error}
              </p>
            )}

            {receipt && !scan.isPending && (
              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mb-2">
                  <ScanLine size={13} /> Filled in from the receipt
                </p>
                {receipt.items.length > 0 && (
                  <ul className="flex flex-col gap-1 text-xs text-slate-600">
                    {receipt.items.map((item, index) => (
                      <li key={index} className="flex justify-between gap-3">
                        <span className="truncate">{item.name}</span>
                        <span className="font-medium tabular-nums">
                          {receipt.currency
                            ? formatMoney(item.amount, receipt.currency)
                            : item.amount.toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {(file || error) && !scan.isPending && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="self-start flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-500"
              >
                <RefreshCw size={12} /> Use a different photo
              </button>
            )}
          </div>

          <div className="w-1/2 overflow-auto">
            <ExpenseForm
              key={scanCount}
              defaultGroupId={defaultGroupId}
              prefill={receipt ? toPrefill(receipt) : undefined}
              onCancel={onClose}
              onCreated={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
