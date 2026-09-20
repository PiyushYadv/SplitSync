"use client";

import { useState } from "react";
import { Camera, Check, X } from "lucide-react";
import type { Member } from "@/src/data/groupData";

export default function ReceiptScanModal({
  members,
  onClose,
}: {
  members: Member[];
  onClose: () => void;
}) {
  const [scanned, setScanned] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const scan = () => {
    setScanned(true);
    setTitle("Receipt expense");
    setAmount("0.00");
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Scan receipt</h2>
            <p className="text-xs text-slate-400">
              Extract an expense and split it with the group
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400"
          >
            <X size={14} />
          </button>
        </div>
        {!scanned ? (
          <button
            onClick={scan}
            className="m-6 w-[calc(100%-3rem)] border-2 border-dashed border-indigo-200 bg-indigo-50 rounded-xl py-16 flex flex-col items-center gap-2 text-indigo-600"
          >
            <Camera size={28} />
            <span className="text-sm font-semibold">Scan receipt</span>
            <span className="text-xs text-indigo-400">
              Upload or use your camera
            </span>
          </button>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              onClose();
            }}
            className="p-6 flex flex-col gap-4"
          >
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Description
              </label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-1.5 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Amount
              </label>
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                type="number"
                step="0.01"
                className="mt-1.5 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm"
              />
            </div>
            <p className="text-xs text-slate-400">
              {members.length} group members available for splitting.
            </p>
            <button className="flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-semibold">
              <Check size={14} /> Add expense
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
