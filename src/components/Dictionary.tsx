"use client";

import { useState } from "react";
import { Search, X, Volume2 } from "lucide-react";

export default function Dictionary() {
  const [query, setQuery] = useState("Define");

  return (
    <div className="min-h-screen bg-[#F3EEF6] dark:bg-[#0F0A15] font-sans text-black dark:text-[#F3F4F6] flex flex-col items-center pb-24 transition-colors duration-300">
      <div className="w-full max-w-[412px] md:max-w-[768px] p-6 space-y-6">
        
        <div className="space-y-1 mt-4">
          <h1 className="text-3xl font-extrabold text-[#111] dark:text-[#F3F4F6]">Dictionary</h1>
          <p className="text-gray-500 dark:text-[#9CA3AF] font-medium tracking-tight">From English to Bangla</p>
        </div>

        <div className="flex gap-3">
            <div className="relative flex-1">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full h-[60px] bg-white dark:bg-[#1C1625] rounded-[24px] px-6 pr-12 text-[18px] font-medium shadow-sm border border-transparent dark:border-[#2D2438] focus:border-[#8A56A4] outline-none text-black dark:text-[#F3F4F6]"
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                    <X size={20} />
                </button>
            </div>
            <button className="w-[60px] h-[60px] bg-[#8A56A4] text-white rounded-[24px] flex items-center justify-center shadow-lg shadow-purple-200 dark:shadow-none active:scale-95 transition-transform">
                <Search size={24} />
            </button>
        </div>

        <div className="bg-white dark:bg-[#1C1625] rounded-[40px] p-8 shadow-xl space-y-6 border border-gray-50 dark:border-[#2D2438]">
            <div className="space-y-1">
                <h2 className="text-3xl font-black text-[#8A56A4] dark:text-[#A87BC7]">সংজ্ঞায়িত করা</h2>
                <p className="text-[18px] text-[#8A56A4] dark:text-[#A87BC7] opacity-70">/dıˈfaın/</p>
            </div>

            <div className="space-y-4">
                <p className="text-[18px] font-bold leading-snug text-black dark:text-[#F3F4F6]">
                    State or describe exactly the nature, scope, or meaning of.
                </p>
                <div className="pl-4 border-l-4 border-[#E8DDED] dark:border-[#3D334D]">
                    <p className="text-[14px] text-gray-400 dark:text-[#9CA3AF] italic font-medium leading-relaxed">
                        &quot;Define a word while you define its full meaning and examples.&quot;
                    </p>
                </div>
            </div>

            <button className="w-full h-[60px] bg-[#8A56A4] text-white rounded-[24px] text-[16px] font-bold flex items-center justify-center gap-3 active:scale-95 transition-transform">
                <Volume2 size={24} />
                Listen Pronunciation
            </button>
        </div>

        <div className="space-y-4">
            <h3 className="text-[20px] font-black px-2 dark:text-[#F3F4F6] text-black">Word of The Day</h3>
            
            <div className="bg-white dark:bg-[#1C1625] rounded-[40px] p-8 shadow-xl space-y-6 border border-gray-50 dark:border-[#2D2438]">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-black dark:text-[#F3F4F6]">Ephemeral</h2>
                        <p className="text-[18px] text-[#8A56A4] dark:text-[#A87BC7] opacity-70">/ɪˈfɛm(ə)rəl/</p>
                    </div>
                    <span className="text-2xl font-black text-[#8A56A4] dark:text-[#A87BC7]">ক্ষণস্থায়ী</span>
                </div>

                <div className="space-y-4">
                    <p className="text-[18px] font-bold leading-snug text-black dark:text-[#F3F4F6]">
                        Lasting for a very short time; fleeting or transitory in nature.
                    </p>
                    <div className="pl-4 border-l-4 border-[#E8DDED] dark:border-[#3D334D]">
                        <p className="text-[14px] text-gray-400 dark:text-[#9CA3AF] italic font-medium leading-relaxed">
                            &quot;The beauty of a sunset is ephemeral, fading into darkness within minutes.&quot;
                        </p>
                    </div>
                </div>

                <button className="w-full h-[60px] bg-white dark:bg-[#1C1625] border-2 border-[#E8DDED] dark:border-[#2D2438] text-black dark:text-[#F3F4F6] rounded-[24px] text-[16px] font-bold flex items-center justify-center gap-3 active:scale-95 transition-transform">
                    <Volume2 size={24} />
                    Listen Pronunciation
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}
