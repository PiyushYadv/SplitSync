// import { Camera, CheckCircle2, MoveRight } from "lucide-react";

// export default function HighlightOCR() {
//   return (
//     <section className="py-24 bg-slate-50 border-y border-slate-200" id="ocr">
//       <div className="max-w-7xl mx-auto px-6">
//         <div className="grid md:grid-cols-2 gap-16 items-center">
//           <div>
//             <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1 mb-6">
//               <Camera size={12} className="text-indigo-500" />
//               <span className="text-xs font-semibold text-indigo-600">
//                 AI-Powered Receipt OCR
//               </span>
//             </div>
//             <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-5">
//               Scan a receipt.
//               <br />
//               Skip the manual entry.
//             </h2>
//             <p className="text-slate-500 leading-relaxed mb-8">
//               Upload a photo or PDF and automatically extract merchant details,
//               line items, taxes, and totals. Review the extracted data, then
//               split the expense with your group.
//             </p>
//             <ul className="flex flex-col gap-3 mb-8">
//               {[
//                 "Extracts merchant details, items, taxes, and totals",
//                 "Supports image and PDF receipt uploads",
//                 "Review and edit extracted data before saving",
//                 "Split expenses by item, percentage, or exact amount",
//               ].map((f) => (
//                 <li
//                   key={f}
//                   className="flex items-start gap-2.5 text-sm text-slate-600"
//                 >
//                   <CheckCircle2
//                     size={16}
//                     className="text-emerald-500 shrink-0 mt-0.5"
//                   />
//                   {f}
//                 </li>
//               ))}
//             </ul>
//             <a
//               href="#"
//               className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
//             >
//               See OCR in action <MoveRight size={15} />
//             </a>
//           </div>
//           <div className="relative">
//             <div className="absolute -inset-8 bg-indigo-500/5 rounded-3xl" />
//             <div className="relative bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
//               <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 bg-slate-50">
//                 <div className="w-6 h-6 bg-indigo-50 rounded-md flex items-center justify-center">
//                   <Camera size={12} className="text-indigo-600" />
//                 </div>
//                 <span className="text-xs font-semibold text-slate-700">
//                   Add Expense — OCR Scan
//                 </span>
//                 <div className="ml-auto text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full ring-1 ring-emerald-200">
//                   Confidence: 98%
//                 </div>
//               </div>
//               <div className="p-4 flex gap-4">
//                 <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-xs relative">
//                   <div className="text-center mb-3">
//                     <p className="font-bold text-slate-800">
//                       JIMBARAN SEAFOOD CAFÉ
//                     </p>
//                     <p className="text-slate-400 text-[10px]">Jul 23, 2025</p>
//                   </div>
//                   {[
//                     ["2× Grilled Barramundi", "$42.00"],
//                     ["1× Coconut curry", "$18.50"],
//                     ["3× Bintang Beer", "$15.00"],
//                     ["Tax (10%)", "$7.55"],
//                   ].map(([l, a]) => (
//                     <div
//                       key={l}
//                       className="flex justify-between py-0.5 relative"
//                     >
//                       <div className="absolute inset-0 bg-emerald-400/12 border border-emerald-300/50 rounded pointer-events-none" />
//                       <span className="text-slate-600">{l}</span>
//                       <span className="font-semibold text-slate-800">{a}</span>
//                     </div>
//                   ))}
//                   <div className="border-t border-dashed border-slate-300 mt-2 pt-2 flex justify-between font-bold text-slate-900">
//                     <span>TOTAL</span>
//                     <span>$83.05</span>
//                   </div>
//                 </div>
//                 <div className="w-40 flex flex-col gap-2">
//                   {[
//                     { l: "Merchant", v: "Jimbaran Café" },
//                     { l: "Total", v: "$83.05" },
//                     { l: "Currency", v: "USD" },
//                     { l: "Date", v: "Jul 23, 2025" },
//                   ].map(({ l, v }) => (
//                     <div key={l}>
//                       <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
//                         {l}
//                       </p>
//                       <div className="bg-white border border-indigo-300 rounded px-2 py-1.5 text-[11px] font-semibold text-slate-800">
//                         {v}
//                       </div>
//                     </div>
//                   ))}
//                   <div className="mt-1 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1.5 rounded text-center">
//                     Add Expense
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }
"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2 } from "lucide-react";

type OCRStep = 0 | 1 | 2 | 3 | 4;

export default function HighlightOCR() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [ocrStep, setOcrStep] = useState<OCRStep>(0);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const runAnimation = () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];

      setOcrStep(1);

      timersRef.current.push(
        setTimeout(() => setOcrStep(2), 900),
        setTimeout(() => setOcrStep(3), 1800),
        setTimeout(() => setOcrStep(4), 2700),
      );
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          runAnimation();
        } else {
          timersRef.current.forEach(clearTimeout);
          timersRef.current = [];
          setOcrStep(0);
        }
      },
      {
        threshold: 0.45,
      },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const statusText: Record<OCRStep, string> = {
    0: "Ready to scan",
    1: "Scanning receipt...",
    2: "Extracting line items...",
    3: "Processing expense data...",
    4: "OCR Complete",
  };

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-slate-50 border-y border-slate-200"
      id="ocr"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* LEFT */}
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1 mb-6">
              <Camera size={12} className="text-indigo-500" />

              <span className="text-xs font-semibold text-indigo-600">
                AI-Powered Receipt Extraction
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-5">
              Scan a receipt.
              <br />
              Skip the manual entry.
            </h2>

            <p className="text-slate-500 leading-relaxed mb-8">
              Upload a photo or PDF and automatically extract merchant details,
              line items, taxes, and totals. Review the extracted data, then
              split the expense with your group.
            </p>

            <ul className="flex flex-col gap-3">
              {[
                "Extracts merchant details, items, taxes, and totals",
                "Supports image and PDF receipt uploads",
                "Review and edit extracted data before saving",
                "Split expenses by item, percentage, or exact amount",
              ].map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2.5 text-sm text-slate-600"
                >
                  <CheckCircle2
                    size={16}
                    className="text-emerald-500 shrink-0 mt-0.5"
                  />

                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* OCR MOCKUP */}
          <div className="relative">
            <div className="absolute -inset-8 bg-indigo-500/5 rounded-3xl" />

            <div
              className={`relative bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden transition-all duration-500 ${
                ocrStep > 0 && ocrStep < 4 ? "ring-2 ring-indigo-200" : ""
              }`}
            >
              {/* HEADER */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 bg-slate-50">
                <div className="w-6 h-6 bg-indigo-50 rounded-md flex items-center justify-center">
                  <Camera size={12} className="text-indigo-600" />
                </div>

                <span className="text-xs font-semibold text-slate-700">
                  Add Expense — Receipt Scan
                </span>

                <div
                  className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 transition-all duration-300 ${
                    ocrStep === 4
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                      : ocrStep > 0
                        ? "bg-indigo-50 text-indigo-700 ring-indigo-200"
                        : "bg-slate-100 text-slate-500 ring-slate-200"
                  }`}
                >
                  {statusText[ocrStep]}
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-4 flex gap-4">
                {/* RECEIPT */}
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-xs relative overflow-hidden">
                  {/* Scanning line */}
                  {ocrStep > 0 && ocrStep < 4 && (
                    <div className="absolute left-0 right-0 top-0 h-0.5 bg-indigo-500 animate-[scan_1.2s_ease-in-out_infinite] z-20" />
                  )}

                  <div className="text-center mb-3">
                    <p className="font-bold text-slate-800">
                      JIMBARAN SEAFOOD CAFÉ
                    </p>

                    <p className="text-slate-400 text-[10px]">Jul 23, 2025</p>
                  </div>

                  {[
                    ["2× Grilled Barramundi", "$42.00"],
                    ["1× Coconut Curry", "$18.50"],
                    ["3× Fresh Juice", "$15.00"],
                    ["Tax (10%)", "$7.55"],
                  ].map(([label, amount], index) => (
                    <div
                      key={label}
                      className={`flex justify-between py-0.5 relative transition-all duration-500 ${
                        ocrStep >= 2
                          ? "opacity-100 translate-x-0"
                          : "opacity-50"
                      }`}
                      style={{
                        transitionDelay: `${index * 120}ms`,
                      }}
                    >
                      {ocrStep >= 2 && (
                        <div className="absolute inset-0 bg-emerald-400/10 border border-emerald-300/40 rounded pointer-events-none" />
                      )}

                      <span className="text-slate-600 relative z-10">
                        {label}
                      </span>

                      <span className="font-semibold text-slate-800 relative z-10">
                        {amount}
                      </span>
                    </div>
                  ))}

                  <div className="border-t border-dashed border-slate-300 mt-2 pt-2 flex justify-between font-bold text-slate-900">
                    <span>TOTAL</span>
                    <span>$83.05</span>
                  </div>
                </div>

                {/* EXTRACTED DATA */}
                <div className="w-40 flex flex-col gap-2">
                  {[
                    {
                      label: "Merchant",
                      value: "Jimbaran Café",
                      step: 2,
                    },
                    {
                      label: "Total",
                      value: "$83.05",
                      step: 2,
                    },
                    {
                      label: "Currency",
                      value: "USD",
                      step: 3,
                    },
                    {
                      label: "Date",
                      value: "Jul 23, 2025",
                      step: 3,
                    },
                  ].map(({ label, value, step }, index) => (
                    <div
                      key={label}
                      className={`transition-all duration-500 ${
                        ocrStep >= step
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-2"
                      }`}
                      style={{
                        transitionDelay: `${index * 100}ms`,
                      }}
                    >
                      <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                        {label}
                      </p>

                      <div className="bg-white border border-indigo-300 rounded px-2 py-1.5 text-[11px] font-semibold text-slate-800">
                        {value}
                      </div>
                    </div>
                  ))}

                  {/* ACTION */}
                  <div
                    className={`mt-1 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1.5 rounded text-center transition-all duration-500 ${
                      ocrStep === 4
                        ? "opacity-100 translate-y-0"
                        : "opacity-40 translate-y-1"
                    }`}
                  >
                    {ocrStep === 4
                      ? "Add Expense"
                      : ocrStep === 0
                        ? "Scan"
                        : "Processing..."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateY(0);
            opacity: 0;
          }

          20% {
            opacity: 1;
          }

          80% {
            opacity: 1;
          }

          100% {
            transform: translateY(180px);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}
