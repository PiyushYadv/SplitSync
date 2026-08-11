// export default function LogosBar() {
//   return (
//     <section className="py-14 bg-slate-50 border-y border-slate-200">
//       <div className="max-w-7xl mx-auto px-6">
//         <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest mb-8">
//           Trusted by teams at
//         </p>
//         <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
//           {[
//             "Airbnb",
//             "Notion",
//             "Figma",
//             "Stripe",
//             "Vercel",
//             "Linear",
//             "Loom",
//             "Framer",
//           ].map((l) => (
//             <span
//               key={l}
//               className="text-slate-300 font-bold text-lg tracking-tight select-none"
//             >
//               {l}
//             </span>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

export default function LogosBar() {
  return (
    <section className="py-10 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest mb-7">
          Built for modern group travel
        </p>

        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {[
            "Multi-currency",
            "AI receipt scanning",
            "Smart settlement",
            "Real-time expense tracking",
            "Group-friendly",
          ].map((item) => (
            <span key={item} className="text-slate-400 font-semibold text-sm">
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
