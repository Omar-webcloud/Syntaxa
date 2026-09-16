"use client";

import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const languageMap: Record<string, string> = {
  en: "en-US",
  bn: "bn-BD",
  ko: "ko-KR",
};

export interface PronunciationButtonProps {
  text: string;
  lang: string;
  variant?: "primary" | "secondary" | "icon" | "inline";
  label?: string;
  className?: string;
  iconSize?: number;
  showLanguageTag?: boolean;
}

export default function PronunciationButton({
  text,
  lang,
  variant = "primary",
  label = "Listen Pronunciation",
  className,
  iconSize = 20,
  showLanguageTag = false,
}: PronunciationButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Determine BCP-47 language tag
  const targetLang = languageMap[lang.toLowerCase()] || lang;

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
    }
  }, []);

  // Show a temporary non-blocking hint if unsupported or voice missing
  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMsg(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMsg(null);
    }, 3000);
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!text || !text.trim()) return;

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      showToast("Speech synthesis not supported in this browser");
      return;
    }

    try {
      // Stop any ongoing speech to avoid queued overlap
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text.trim());
      utterance.lang = targetLang;
      utterance.rate = 0.9; // Slightly clearer pace for learners

      // Find best available device voice
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const langLower = targetLang.toLowerCase();
        const prefix = langLower.split("-")[0];

        const exactVoice = voices.find(
          (v) => v.lang.replace("_", "-").toLowerCase() === langLower,
        );
        const prefixVoice = voices.find(
          (v) =>
            v.lang.toLowerCase().startsWith(prefix) ||
            v.lang.replace("_", "-").toLowerCase().startsWith(prefix),
        );

        if (exactVoice) {
          utterance.voice = exactVoice;
        } else if (prefixVoice) {
          utterance.voice = prefixVoice;
        }
      }

      utterance.onstart = () => {
        setSpeaking(true);
      };

      utterance.onend = () => {
        setSpeaking(false);
      };

      utterance.onerror = (event) => {
        setSpeaking(false);
        // If canceled explicitly, don't show error toast
        if (event.error !== "canceled" && event.error !== "interrupted") {
          showToast(`Pronunciation unavailable for ${targetLang}`);
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Speech synthesis failed:", err);
      setSpeaking(false);
      showToast("Could not play audio");
    }
  };

  // Icon Only variant
  if (variant === "icon") {
    return (
      <div className="relative inline-flex items-center">
        <button
          type="button"
          onClick={handleSpeak}
          aria-label={`Pronounce ${text}`}
          title={`Pronounce (${targetLang})`}
          className={cn(
            "p-2 rounded-full text-[#8A56A4] dark:text-[#A87BC7] hover:bg-[#F0E4FF] dark:hover:bg-[#2D1F3D] active:scale-95 transition-all focus:outline-none",
            speaking && "animate-pulse text-[#6E3C8A] bg-[#F0E4FF] dark:bg-[#2D1F3D]",
            className,
          )}
        >
          {speaking ? (
            <Volume2 size={iconSize} className="animate-bounce" />
          ) : (
            <Volume2 size={iconSize} />
          )}
        </button>

        {toastMsg && (
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 text-[11px] font-semibold text-white bg-gray-900/90 dark:bg-gray-800 rounded-lg whitespace-nowrap shadow-md z-50 animate-fade-in">
            {toastMsg}
          </span>
        )}
      </div>
    );
  }

  // Inline / small variant
  if (variant === "inline") {
    return (
      <div className="relative inline-flex items-center">
        <button
          type="button"
          onClick={handleSpeak}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#F0E4FF] dark:bg-[#2D1F3D] text-[#8A56A4] dark:text-[#A87BC7] hover:bg-[#E4D1FF] dark:hover:bg-[#3D2952] active:scale-95 transition-all",
            speaking && "ring-2 ring-[#8A56A4] dark:ring-[#A87BC7]",
            className,
          )}
        >
          <Volume2 size={iconSize || 14} className={speaking ? "animate-pulse" : ""} />
          <span>{label || "Listen"}</span>
          {showLanguageTag && (
            <span className="text-[10px] opacity-70 uppercase">({lang})</span>
          )}
        </button>

        {toastMsg && (
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 text-[10px] font-medium text-white bg-gray-900/90 rounded shadow z-50">
            {toastMsg}
          </span>
        )}
      </div>
    );
  }

  // Secondary full-width / button variant
  if (variant === "secondary") {
    return (
      <div className="relative w-full">
        <button
          type="button"
          onClick={handleSpeak}
          className={cn(
            "w-full h-[60px] bg-white dark:bg-[#1C1625] border-2 border-[#E8DDED] dark:border-[#2D2438] text-black dark:text-[#F3F4F6] rounded-[24px] text-[16px] font-bold flex items-center justify-center gap-3 active:scale-95 transition-transform hover:border-[#8A56A4] dark:hover:border-[#A87BC7]",
            speaking && "border-[#8A56A4] dark:border-[#A87BC7] bg-[#FBF9FD] dark:bg-[#251D30]",
            className,
          )}
        >
          <Volume2 size={iconSize || 24} className={speaking ? "animate-pulse text-[#8A56A4] dark:text-[#A87BC7]" : ""} />
          <span>{speaking ? "Speaking..." : label}</span>
          {showLanguageTag && (
            <span className="text-xs text-gray-400 dark:text-gray-500 font-normal uppercase">
              [{targetLang}]
            </span>
          )}
        </button>

        {toastMsg && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 text-xs font-semibold text-white bg-gray-900/90 dark:bg-gray-800 rounded-xl shadow-lg z-50">
            {toastMsg}
          </div>
        )}
      </div>
    );
  }

  // Primary full-width button (default)
  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={handleSpeak}
        className={cn(
          "w-full h-[60px] bg-[#8A56A4] text-white rounded-[24px] text-[16px] font-bold flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-lg shadow-purple-200 dark:shadow-none hover:bg-[#7D4D95]",
          speaking && "bg-[#713E89] ring-2 ring-purple-300 dark:ring-purple-600",
          className,
        )}
      >
        <Volume2 size={iconSize || 24} className={speaking ? "animate-pulse" : ""} />
        <span>{speaking ? "Speaking..." : label}</span>
        {showLanguageTag && (
          <span className="text-xs text-purple-200 font-normal uppercase">
            [{targetLang}]
          </span>
        )}
      </button>

      {toastMsg && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 text-xs font-semibold text-white bg-gray-900/90 dark:bg-gray-800 rounded-xl shadow-lg z-50">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
