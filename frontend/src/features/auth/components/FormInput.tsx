import type { UseFormRegisterReturn } from "react-hook-form";

type FormInputProps = {
  label: string;
  type?: string;
  placeholder?: string;
  registration: UseFormRegisterReturn;
  error?: string;
};

export default function FormInput({
  label,
  type = "text",
  placeholder,
  registration,
  error,
}: FormInputProps) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-600 block mb-1.5">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
        {...registration}
      />

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
