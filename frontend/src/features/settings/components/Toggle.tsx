"use client";

export default function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: () => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onChange}
      className={`relative w-10 h-5 rounded-full transition-colors duration-200 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 ${on ? "bg-indigo-600" : "bg-slate-200"}`}
    >
      <span
        className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200"
        style={{ transform: on ? "translateX(20px)" : "translateX(0)" }}
      />
    </button>
  );
}
