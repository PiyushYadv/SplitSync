// import Link from "next/link";

// import { ArrowRight } from "lucide-react";

// export default function CTABanner() {
//   return (
//     <section className="py-24 bg-indigo-600 relative overflow-hidden" id="cta">
//       <div className="absolute inset-0 pointer-events-none">
//         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-150 bg-white/5 rounded-full blur-3xl" />
//         <div className="absolute bottom-0 right-1/4 w-100 h-100 bg-indigo-400/20 rounded-full blur-3xl" />
//       </div>
//       <div className="relative max-w-4xl mx-auto px-6 text-center">
//         <p className="text-indigo-300 text-sm font-semibold uppercase tracking-widest mb-4">
//           Get started today
//         </p>
//         <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
//           Your next trip starts here
//         </h2>
//         <p className="text-indigo-200 text-lg mb-10 max-w-xl mx-auto">
//           Join 200,000+ people who stopped fighting over bills. Free forever for
//           small groups. Up in 30 seconds.
//         </p>
//         <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
//           <Link
//             href="/signup"
//             className="flex items-center gap-2 bg-white text-indigo-700 font-bold px-8 py-3.5 rounded-xl text-sm hover:bg-indigo-50 transition-all hover:shadow-xl group"
//           >
//             Start for free{" "}
//             <ArrowRight
//               size={16}
//               className="group-hover:translate-x-0.5 transition-transform"
//             />
//           </Link>
//           <button
//             type="button"
//             className="flex items-center gap-2 text-white border border-white/30 hover:border-white/60 font-semibold px-8 py-3.5 rounded-xl text-sm transition-all"
//           >
//             Talk to sales
//           </button>
//         </div>
//         <p className="text-indigo-300/70 text-xs">
//           No credit card required · Free forever for groups of 3
//         </p>
//       </div>
//     </section>
//   );
// }

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTABanner() {
  return (
    <section className="py-24 bg-indigo-600 relative overflow-hidden" id="cta">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-150 bg-white/5 rounded-full blur-3xl" />

        <div className="absolute bottom-0 right-1/4 w-100 h-100 bg-indigo-400/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <p className="text-indigo-300 text-sm font-semibold uppercase tracking-widest mb-4">
          Get started with SplitSync
        </p>

        <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
          Split expenses.
          <br />
          Settle smarter.
        </h2>

        <p className="text-indigo-200 text-lg mb-10 max-w-xl mx-auto">
          Create a group, add shared expenses, scan receipts with AI, and
          simplify the final settlement.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <Link
            href="/signup"
            className="flex items-center gap-2 bg-white text-indigo-700 font-bold px-8 py-3.5 rounded-xl text-sm hover:bg-indigo-50 transition-all hover:shadow-xl group"
          >
            Get started for free
            <ArrowRight
              size={16}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </Link>

          <Link
            href="/login"
            className="flex items-center gap-2 text-white border border-white/30 hover:border-white/60 font-semibold px-8 py-3.5 rounded-xl text-sm transition-all"
          >
            Log in
          </Link>
        </div>

        <p className="text-indigo-300/70 text-xs">No credit card required</p>
      </div>
    </section>
  );
}
