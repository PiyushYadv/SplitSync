"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { API_URL } from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";

type SocialButtonProps = {
  provider: "Google" | "Github" | "Apple";
};

export default function SocialButton({ provider }: SocialButtonProps) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        router.push(`${API_URL}${API_ENDPOINTS.auth.oauth(provider)}`);
      }}
      className="w-full flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
    >
      {provider === "Google" && (
        <Image src="/icons/google.svg" alt="Google" width={18} height={18} />
      )}
      {provider === "Github" && (
        <Image src="/icons/github.svg" alt="GitHub" width={18} height={18} />
      )}
      {provider === "Apple" && (
        <Image src="/icons/apple.svg" alt="Apple" width={18} height={18} />
      )}
      Continue with {provider}
    </button>
  );
}
