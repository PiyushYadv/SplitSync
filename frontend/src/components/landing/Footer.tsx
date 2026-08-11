// import { RefreshCw } from "lucide-react";

// export default function Footer() {
//   const cols = [
//     {
//       heading: "Product",
//       links: ["Features", "Pricing", "Changelog", "Roadmap", "Status"],
//     },
//     {
//       heading: "Use cases",
//       links: ["Group trips", "Roommates", "Events", "Corporate", "Couples"],
//     },
//     {
//       heading: "Developers",
//       links: ["API docs", "Webhooks", "SDKs", "Open source", "Status"],
//     },
//     {
//       heading: "Company",
//       links: ["About", "Blog", "Careers", "Press", "Contact"],
//     },
//     {
//       heading: "Legal",
//       links: ["Privacy", "Terms", "Security", "Cookie policy", "DPA"],
//     },
//   ];
//   return (
//     <footer className="bg-slate-900 text-slate-400 pt-16 pb-8">
//       <div className="max-w-7xl mx-auto px-6">
//         <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-14">
//           <div className="col-span-2 md:col-span-1">
//             <div className="flex items-center gap-2 mb-4">
//               <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center">
//                 <RefreshCw size={13} className="text-white" strokeWidth={2.5} />
//               </div>
//               <span className="font-bold text-white text-sm">SplitSync</span>
//             </div>
//             <p className="text-sm text-slate-500 leading-relaxed mb-4">
//               The intelligent expense-splitting platform for groups.
//             </p>
//             <div className="flex gap-3">
//               {["𝕏", "in", "gh"].map((s) => (
//                 <a
//                   key={s}
//                   href="#"
//                   className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 hover:text-white transition-colors"
//                 >
//                   {s}
//                 </a>
//               ))}
//             </div>
//           </div>
//           {cols.map(({ heading, links }) => (
//             <div key={heading}>
//               <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
//                 {heading}
//               </p>
//               <ul className="flex flex-col gap-2.5">
//                 {links.map((l) => (
//                   <li key={l}>
//                     <a
//                       href="#"
//                       className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
//                     >
//                       {l}
//                     </a>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           ))}
//         </div>
//         <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
//           <p className="text-xs text-slate-600">
//             © 2025 SplitSync, Inc. All rights reserved.
//           </p>
//           <div className="flex items-center gap-4">
//             {["Privacy", "Terms", "Cookies"].map((l) => (
//               <a
//                 key={l}
//                 href="#"
//                 className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
//               >
//                 {l}
//               </a>
//             ))}
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// }

import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center">
                <RefreshCw size={13} className="text-white" strokeWidth={2.5} />
              </div>

              <span className="font-bold text-white text-sm">SplitSync</span>
            </div>

            <p className="text-sm text-slate-500 leading-relaxed mb-5 max-w-xs">
              AI-powered expense splitting for groups. Scan receipts, split
              shared expenses, and simplify settlement.
            </p>

            <div className="flex gap-3">
              <a
                href="https://github.com/piyushyadv/splitsync"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <FaGithub size={15} />
              </a>

              <a
                href="https://linkedin.com/in/piyushyadav276"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <FaLinkedin size={15} />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
              Product
            </p>

            <ul className="flex flex-col gap-2.5">
              {[
                { label: "Features", href: "#features" },
                { label: "Receipt extraction", href: "#ocr" },
                { label: "Settlement", href: "#settlement" },
                { label: "FAQ", href: "#faq" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Project */}
          <div>
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
              Project
            </p>

            <ul className="flex flex-col gap-2.5">
              <li>
                <Link
                  href="/signup"
                  className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Get started
                </Link>
              </li>

              <li>
                <a
                  href="https://github.com/yourusername/splitsync"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                >
                  GitHub
                </a>
              </li>

              {/* <li>
                <a
                  href="#"
                  className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Live application
                </a>
              </li> */}
            </ul>
          </div>

          {/* Tech stack */}
          <div>
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
              Tech stack
            </p>

            <ul className="flex flex-col gap-2.5">
              {["Next.js", "Spring Boot", "Supabase", "Redis"].map(
                (technology) => (
                  <li key={technology} className="text-sm text-slate-500">
                    {technology}
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-600">
            © 2026 SplitSync. All rights reserved.
          </p>

          <p className="text-xs text-slate-600">
            Built with Next.js & SpringBoot
          </p>
        </div>
      </div>
    </footer>
  );
}
