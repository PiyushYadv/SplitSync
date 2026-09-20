"use client";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white border border-slate-200 rounded-xl p-8 max-w-md text-center">
        <h2 className="text-base font-bold text-slate-900">
          Something went wrong
        </h2>
        <p className="text-sm text-slate-500 mt-2 mb-5">
          We couldn’t load this section. Try again or return later.
        </p>
        <button
          onClick={reset}
          className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-semibold"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
