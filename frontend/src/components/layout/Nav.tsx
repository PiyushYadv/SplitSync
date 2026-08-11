"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, RefreshCw, X } from "lucide-react";

const NAV_ITEMS = [
  { label: "Features", href: "#features" },
  { label: "Receipt extraction", href: "#ocr" },
  { label: "Settlement", href: "#settlement" },
  { label: "FAQ", href: "#faq" },
  {
    label: "GitHub",
    href: "https://github.com/PiyushYadv/SplitSync",
    external: true,
  },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(globalThis.scrollY > 16);
    };

    globalThis.addEventListener("scroll", handleScroll);

    return () => {
      globalThis.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <RefreshCw size={14} className="text-white" strokeWidth={2.5} />
          </div>

          <span className="font-bold text-slate-900 text-sm tracking-tight">
            SplitSync
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 flex-1">
          {NAV_ITEMS.map((item) =>
            item.external ? (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                {item.label}
              </a>
            ),
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3 ml-auto">
          <Link
            href="/login"
            className="text-sm text-slate-600 hover:text-slate-900 transition-colors px-3 py-1.5"
          >
            Sign in
          </Link>

          <Link
            href="/signup"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Get started free
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="md:hidden ml-auto text-slate-600"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-slate-200 px-6 py-4 flex flex-col gap-3">
          {NAV_ITEMS.map((item) =>
            item.external ? (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-600 py-1"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className="text-sm text-slate-600 py-1"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ),
          )}

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/login"
              className="text-sm text-slate-600 py-2"
              onClick={() => setOpen(false)}
            >
              Sign in
            </Link>

            <Link
              href="/signup"
              className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg text-center"
              onClick={() => setOpen(false)}
            >
              Get started free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
