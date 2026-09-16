"use client";

import { useState } from "react";
import { Loader2, CheckCircle, AlertCircle, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { recordWritingCheck } from "@/lib/userStats";
import type { CorrectWritingResponse, WritingIssue } from "@/lib/ai/types";

export default function WritingCoach() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CorrectWritingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = text.trim().length >= 10 && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/ai/correct-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });

      if (res.ok) {
        const data: CorrectWritingResponse = await res.json();
        setResult(data);
        recordWritingCheck();
      } else {
        setError("AI is unavailable right now. Please try again later.");
      }
    } catch {
      setError("Something went wrong. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setText("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Writing input card */}
      <div className="bg-white dark:bg-[#1C1625] rounded-[40px] p-8 shadow-xl space-y-6 border border-gray-50 dark:border-[#2D2438]">
        <span className="bg-transparent text-[#8A56A4] dark:text-[#A87BC7] dark:border-[#A87BC7] text-[13px] font-black px-4 py-1.5 rounded-[10px] uppercase tracking-wide">
          Free Writing
        </span>

        <div className="space-y-2">
          <p className="text-[14px] text-gray-500 dark:text-[#9CA3AF] font-medium">
            Write 1-3 sentences in English and get AI-powered grammar feedback.
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your sentences here..."
            disabled={loading}
            rows={4}
            className={cn(
              "w-full bg-[#F3EEF6] dark:bg-[#0F0A15] border-2 rounded-[24px] px-6 py-4 text-[16px] font-medium outline-none transition-colors resize-none",
              "border-[#E8DDED] dark:border-[#2D2438] text-black dark:text-[#F3F4F6] focus:border-[#8A56A4]",
              "placeholder:text-gray-400 dark:placeholder:text-[#9CA3AF]",
            )}
          />
          <p className="text-[12px] text-gray-400 dark:text-[#9CA3AF] text-right">
            {text.length} characters {text.trim().length < 10 && text.length > 0 ? "(minimum 10)" : ""}
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={cn(
            "w-full h-[64px] text-white rounded-[24px] text-base sm:text-[18px] font-bold shadow-lg dark:shadow-none transition-all flex items-center justify-center gap-2",
            canSubmit
              ? "bg-[#8A56A4] shadow-purple-200 active:scale-95"
              : "bg-gray-300 dark:bg-[#2D2438] text-gray-500 dark:text-gray-400 shadow-none cursor-not-allowed",
          )}
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" /> Checking...
            </>
          ) : (
            <>
              <Send size={20} /> Check Writing
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-[24px] text-center font-bold border border-red-100 dark:border-red-900/30">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* No errors — success! */}
          {!result.hasErrors ? (
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-[28px] border border-green-200 dark:border-green-900/30 text-center space-y-2">
              <CheckCircle className="mx-auto text-green-500" size={40} />
              <h3 className="text-lg font-black text-green-700 dark:text-green-400">
                No errors found — nice work! 🎉
              </h3>
              <p className="text-[14px] text-green-600 dark:text-green-500 font-medium">
                Your writing is grammatically correct.
              </p>
            </div>
          ) : (
            <>
              {/* Corrected text */}
              <div className="bg-white dark:bg-[#1C1625] rounded-[28px] p-6 shadow-sm border border-gray-50 dark:border-[#2D2438] space-y-4">
                <h3 className="text-[14px] font-bold text-gray-500 dark:text-[#9CA3AF] uppercase tracking-wider">
                  Corrected Version
                </h3>
                <p className="text-base font-medium leading-relaxed text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-4 rounded-[16px] border border-green-100 dark:border-green-900/30">
                  {result.corrected}
                </p>
              </div>

              {/* Issues list */}
              <div className="bg-white dark:bg-[#1C1625] rounded-[28px] p-6 shadow-sm border border-gray-50 dark:border-[#2D2438] space-y-4">
                <h3 className="flex items-center gap-2 text-[14px] font-bold text-gray-500 dark:text-[#9CA3AF] uppercase tracking-wider">
                  <AlertCircle size={16} className="text-amber-500" />
                  {result.issues.length} {result.issues.length === 1 ? "Issue" : "Issues"} Found
                </h3>
                <div className="space-y-3">
                  {result.issues.map((issue: WritingIssue, i: number) => (
                    <div
                      key={i}
                      className="bg-[#F3EEF6] dark:bg-[#0F0A15] p-4 rounded-[20px] border border-[#E8DDED] dark:border-[#2D2438] space-y-2"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-1">
                          <p className="text-[14px]">
                            <span className="line-through text-red-500 dark:text-red-400 font-medium">
                              {issue.original}
                            </span>
                            <span className="mx-2 text-gray-400">→</span>
                            <span className="text-green-600 dark:text-green-400 font-bold">
                              {issue.fixed}
                            </span>
                          </p>
                          <p className="text-[13px] text-gray-500 dark:text-[#9CA3AF] font-medium">
                            {issue.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Try again button */}
          <button
            onClick={handleReset}
            className="w-full h-[56px] bg-transparent border-2 border-[#E8DDED] dark:border-[#2D2438] text-black dark:text-white rounded-[24px] text-base font-bold flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-gray-50 dark:hover:bg-[#2D2438]/50"
          >
            Write Something Else
          </button>
        </div>
      )}
    </div>
  );
}
