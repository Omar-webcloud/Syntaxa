"use client";

import { useState } from "react";
import { Book, BarChart, Lightbulb, Type, Layers, Layout } from "lucide-react";

export default function Practice() {
  const [userInput, setUserInput] = useState("");

  return (
    <div className="min-h-screen bg-[#F3EEF6] dark:bg-[#0F0A15] font-sans text-black dark:text-[#F3F4F6] flex flex-col items-center pb-24 transition-colors duration-300">
      <div className="w-full max-w-[412px] md:max-w-[768px] p-6 space-y-6">
        
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111] dark:text-[#F3F4F6]">Sentence Practice</h1>
          <p className="text-gray-500 dark:text-[#9CA3AF] font-medium tracking-tight">Improve Your Writing with Interactive Exercise.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#1C1625] p-4 rounded-[28px] shadow-sm flex flex-col items-center justify-center space-y-1 h-[100px] border border-transparent dark:border-[#2D2438]">
             <div className="flex items-center gap-2">
                <Book size={20} className="text-[#3AAAFF]" fill="#3AAAFF" />
                <span className="text-base sm:text-[18px] font-black text-black dark:text-[#F3F4F6]">36 Lesson</span>
             </div>
             <span className="text-[13px] text-gray-400 dark:text-[#9CA3AF] font-bold uppercase tracking-tight">Total Practiced</span>
          </div>
          <div className="bg-white dark:bg-[#1C1625] p-4 rounded-[28px] shadow-sm flex flex-col items-center justify-center space-y-1 h-[100px] border border-transparent dark:border-[#2D2438]">
             <div className="flex items-center gap-2">
                <BarChart size={20} className="text-[#8A56A4]" fill="#8A56A4" />
                <span className="text-base sm:text-[18px] font-black text-black dark:text-[#F3F4F6]">88%</span>
             </div>
             <span className="text-[13px] text-gray-400 dark:text-[#9CA3AF] font-bold uppercase tracking-tight">Average Accuracy</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1C1625] rounded-[40px] p-8 shadow-xl space-y-6 border border-gray-50 dark:border-[#2D2438] flex flex-col items-center text-center">
            <span className="bg-[#48CAFB] text-white text-[13px] font-black px-4 py-1.5 rounded-[10px]">
                Correct The Sentence
            </span>

            <div className="space-y-4 w-full">
                <p className="text-[16px] text-black dark:text-[#F3F4F6] font-black uppercase tracking-wider opacity-60">Question</p>
                <h3 className="text-[20px] sm:text-[24px] font-black leading-tight text-black dark:text-[#F3F4F6]">
                    She don&apos;t like playing tennis.
                </h3>
            </div>

            <div className="w-full space-y-4 pt-2">
                <input 
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type Your Answer Here..."
                    className="w-full h-[64px] bg-[#F3EEF6] dark:bg-[#0F0A15] border-2 border-[#E8DDED] dark:border-[#2D2438] rounded-[24px] px-6 text-center text-[16px] font-bold text-[#8A56A4] dark:text-[#A87BC7] outline-none placeholder:text-[#B7BBC3] dark:placeholder:text-[#3D334D] focus:border-[#8A56A4]"
                />
                <button className="w-full h-[64px] bg-[#8A56A4] text-white rounded-[24px] text-base sm:text-[18px] font-bold shadow-lg shadow-purple-200 dark:shadow-none active:scale-95 transition-transform">
                    Check Answer
                </button>
            </div>
        </div>

        <div className="space-y-4 pb-4">
            <h3 className="text-lg sm:text-[20px] font-black px-2 text-black dark:text-[#F3F4F6]">Practice Exercises</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ExerciseCategory 
                    icon={<Lightbulb size={24} />} 
                    title="Error Correction" 
                    desc="Identify and Fix Common Mistakes."
                />
                <ExerciseCategory 
                    icon={<Type size={24} />} 
                    title="Tenses" 
                    desc="Practice All Forms Present, Past and Future."
                />
                <ExerciseCategory 
                    icon={<Layers size={24} />} 
                    title="Articles & Preposition" 
                    desc="Master the use of articles and prepositions."
                />
                <ExerciseCategory 
                    icon={<Layout size={24} />} 
                    title="Sentence Structure" 
                    desc="Learn to build complex sentences correctly."
                />
            </div>
        </div>

      </div>
    </div>
  );
}

function ExerciseCategory({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="bg-[#E8DDED] dark:bg-[#1C1625] p-5 rounded-[28px] shadow-sm flex flex-col gap-3 min-h-[160px] border border-transparent dark:border-[#2D2438]">
            <div className="text-black dark:text-[#A87BC7]">
                {icon}
            </div>
            <div className="space-y-1">
                <h4 className="text-[16px] font-black leading-tight text-black dark:text-[#F3F4F6]">{title}</h4>
                <p className="text-[12px] text-gray-600 dark:text-[#9CA3AF] font-medium leading-tight">
                    {desc}
                </p>
            </div>
        </div>
    );
}
