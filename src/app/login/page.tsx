"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function Login() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F3EEF6] dark:bg-[#0F0A15] flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-sm text-center space-y-6 bg-white dark:bg-[#1C1625] p-8 rounded-[32px] shadow-xl border border-gray-100 dark:border-[#2D2438]">
        <div className="w-16 h-16 bg-[#8A56A4] rounded-2xl mx-auto flex items-center justify-center shadow-lg transform -rotate-3 mb-4">
          <Sparkles className="text-white" size={28} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Instant Access Enabled</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No login required! All features and your progress are automatically saved to your guest account.
          </p>
        </div>
        <Link
          href="/"
          className="w-full py-3.5 bg-[#8A56A4] text-white rounded-2xl font-bold hover:bg-[#7D4D95] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span>Continue to App</span>
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
