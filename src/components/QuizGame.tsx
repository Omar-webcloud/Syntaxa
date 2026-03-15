"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function QuizGame() {
  const currentQuestionIndex = 3;
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const score = 2;

  const MAX_QUESTIONS = 10;
  const progress = ((currentQuestionIndex + 1) / MAX_QUESTIONS) * 100;

  return (
    <div className="min-h-screen bg-[#F3EEF6] dark:bg-[#0F0A15] font-sans text-black dark:text-[#F3F4F6] flex flex-col items-center pb-24 transition-colors duration-300">
      <div className="w-full max-w-[412px] md:max-w-[768px] p-6 space-y-6">
        
        <div className="space-y-1 mt-4">
          <p className="text-[18px] font-semibold text-[#111] dark:text-[#9CA3AF] opacity-80">Welcome Back Abul Hayat!</p>
          <h1 className="text-3xl font-extrabold text-[#111] dark:text-[#F3F4F6]">Your Daily Quiz</h1>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-[14px] font-bold text-gray-500 dark:text-[#9CA3AF]">
             <span>Question {currentQuestionIndex + 1}/{MAX_QUESTIONS}</span>
             <span>{score} Corrects</span>
          </div>
          <div className="h-[12px] w-full bg-[#FFE0B2] dark:bg-[#2C1F10] rounded-full overflow-hidden border border-transparent dark:border-[#2D2438]">
             <div 
                className="h-full bg-[#FC9502] rounded-full" 
                style={{ width: `${progress}%` }} 
             />
          </div>
        </div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#1C1625] rounded-[40px] p-8 shadow-xl space-y-8 mt-10 relative border border-gray-50 dark:border-[#2D2438]"
        >
            <div className="flex justify-between items-center">
                <span className="bg-[#F0E4FF] dark:bg-[#2D1F3D] text-[#8A56A4] dark:text-[#A87BC7] text-[14px] font-bold px-4 py-1.5 rounded-full">
                    Fill In
                </span>
                <div className="flex items-center gap-1.5 cursor-pointer">
                    <span className="text-[14px] font-bold text-[#FC9502]">Hint (-5)</span>
                    <span className="text-xl">💎</span>
                </div>
            </div>

            <h3 className="text-[22px] font-black leading-tight text-black dark:text-[#F3F4F6]">
                They ...... playing football when it started raining.
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["are", "were", "have", "had"].map((option, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSelectedOption(idx)}
                        className={cn(
                            "w-full h-[60px] rounded-[24px] border-2 text-center text-[18px] font-medium transition-all duration-200",
                            selectedOption === idx 
                                ? "border-[#8A56A4] bg-[#F0E4FF] dark:bg-[#2D1F3D] text-[#8A56A4] dark:text-[#A87BC7]" 
                                : "border-[#E8DDED] dark:border-[#2D2438] text-[#B7BBC3] dark:text-[#3D334D] bg-transparent hover:border-[#8A56A4]"
                        )}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </motion.div>

        <div className="pt-6">
            <button className="w-full h-[64px] bg-[#8A56A4] text-white rounded-[24px] text-[18px] font-bold shadow-lg shadow-purple-200 dark:shadow-none active:scale-95 transition-transform">
                Check Answer
            </button>
        </div>

      </div>
    </div>
  );
}
