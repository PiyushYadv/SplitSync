export default function AppLoading() {
  return (
    <div className="flex-1 bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto animate-pulse space-y-4">
        <div className="h-5 w-32 rounded bg-slate-200" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-28 rounded-lg bg-white border border-slate-200" />
          <div className="h-28 rounded-lg bg-white border border-slate-200" />
          <div className="h-28 rounded-lg bg-white border border-slate-200" />
        </div>
        <div className="h-80 rounded-lg bg-white border border-slate-200" />
      </div>
    </div>
  );
}
