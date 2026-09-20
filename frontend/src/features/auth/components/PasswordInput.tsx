import { Eye, EyeOff } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";

type PasswordInputProps = {
  label?: string;
  placeholder?: string;
  registration: UseFormRegisterReturn;
  error?: string;
  showPassword: boolean;
  onToggleVisibility: () => void;
};

export default function PasswordInput({
  label,
  placeholder,
  registration,
  error,
  showPassword,
  onToggleVisibility,
}: PasswordInputProps) {
  return (
    <div>
      {label && (
        <label className="text-xs font-semibold text-slate-600 block mb-1.5">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 pr-11 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
          {...registration}
        />

        <button
          type="button"
          onClick={onToggleVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
