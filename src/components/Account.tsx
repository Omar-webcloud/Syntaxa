"use client";

import { Settings, Trophy, Target, Flame, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";

export default function Account() {
  const { theme, setTheme } = useTheme();
  const [reminderActive, setReminderActive] = useState(true);
  const [soundActive, setSoundActive] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const USER = {
    name: "Abul Hayat",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sheba",
    stats: {
      quizzes: 46,
      streak: 5,
      gems: 124,
      timeSpent: "6h 9m"
    }
  };

  return (
    <div className="min-h-screen bg-[#F3EEF6] dark:bg-[#0F0A15] font-sans text-black dark:text-[#F3F4F6] flex justify-center pb-24 transition-colors duration-300">
      <div className="w-full max-w-[412px] md:max-w-[768px] p-6 flex flex-col items-center">
        
        <div className="relative">
          <div className="w-[140px] h-[140px] rounded-[16px] overflow-hidden bg-[#E5CCFA] border-4 border-white dark:border-[#2D2438] shadow-sm flex items-center justify-center">
            <Image 
              src={USER.avatar} 
              alt="Avatar" 
              width={140}
              height={140}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
          <div className="absolute -bottom-2 -right-2 w-[40px] h-[40px] rounded-full bg-[#E5CCFA] flex items-center justify-center border-2 border-white dark:border-[#2D2438] shadow-sm cursor-pointer hover:scale-110 transition-transform">
             <Settings size={18} className="text-[#8A56A4]" />
          </div>
        </div>

        {/* User Name */}
        <h1 className="mt-6 text-xl sm:text-[24px] font-bold">{USER.name}</h1>

        <div className="mt-10 w-full grid grid-cols-2 md:grid-cols-4 gap-[12px]">
            <div className="h-[88px] bg-white dark:bg-[#1C1625] rounded-[28px] flex items-center p-[12px] gap-[12px] shadow-sm border border-transparent dark:border-[#2D2438]">
                <div className="w-[49px] h-[48px] rounded-full bg-[#F0E4FF] dark:bg-[#2A2035] flex items-center justify-center shrink-0">
                    <Target size={22} className="text-[#8A56A4] dark:text-[#A87BC7]" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[12px] font-medium text-gray-500 dark:text-[#9CA3AF]">Total Quiz</span>
                    <span className="text-base sm:text-[18px] font-bold text-black dark:text-[#F3F4F6]">{USER.stats.quizzes}</span>
                </div>
            </div>

            <div className="h-[88px] bg-white dark:bg-[#1C1625] rounded-[28px] flex items-center p-[12px] gap-[12px] shadow-sm border border-transparent dark:border-[#2D2438]">
                <div className="w-[49px] h-[48px] rounded-full bg-[#FFF0DC] dark:bg-[#352820] flex items-center justify-center shrink-0">
                    <Flame size={22} className="text-[#FC9502]" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[12px] font-medium text-gray-500 dark:text-[#9CA3AF]">Total Streak</span>
                    <span className="text-base sm:text-[18px] font-bold text-black dark:text-[#F3F4F6]">{USER.stats.streak} Days</span>
                </div>
            </div>

            <div className="h-[88px] bg-white dark:bg-[#1C1625] rounded-[28px] flex items-center p-[12px] gap-[12px] shadow-sm border border-transparent dark:border-[#2D2438]">
                <div className="w-[49px] h-[48px] rounded-full bg-[#E7FBFF] dark:bg-[#1E2D35] flex items-center justify-center shrink-0">
                    <Trophy size={20} className="text-[#3AAAFF]" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[12px] font-medium text-gray-500 dark:text-[#9CA3AF]">Total Gem</span>
                    <span className="text-base sm:text-[18px] font-bold text-black dark:text-[#F3F4F6]">{USER.stats.gems}</span>
                </div>
            </div>

            <div className="h-[88px] bg-white dark:bg-[#1C1625] rounded-[28px] flex items-center p-[12px] gap-[12px] shadow-sm border border-transparent dark:border-[#2D2438]">
                <div className="w-[49px] h-[48px] rounded-full bg-[#E7FBFF] dark:bg-[#1E2D35] flex items-center justify-center shrink-0">
                    <Clock size={22} className="text-[#2EC0FF]" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[12px] font-medium text-gray-500 dark:text-[#9CA3AF]">Time Spent</span>
                    <span className="text-base sm:text-[18px] font-bold text-black dark:text-[#F3F4F6]">{USER.stats.timeSpent}</span>
                </div>
            </div>
        </div>

        <div className="mt-8 w-full text-left">
           <h2 className="text-base sm:text-[18px] font-bold px-2">Settings</h2>
        </div>

        <div className="mt-4 w-full bg-[#E8DDED] dark:bg-[#1C1625] rounded-[24px] p-[16px] flex flex-col gap-[12px] border border-transparent dark:border-[#2D2438]">
            <SettingRow 
              label="Daily Reminder" 
              active={reminderActive} 
              onToggle={() => setReminderActive(!reminderActive)}
            />
            <SettingRow 
              label="Sound Effects" 
              active={soundActive} 
              onToggle={() => setSoundActive(!soundActive)}
            />
            <SettingRow 
              label="Dark Mode" 
              active={theme === "dark"} 
              onToggle={() => setTheme(theme === "dark" ? "light" : "dark")}
            />
        </div>

        <div className="mt-4 w-full">
             <button className="w-full h-[51px] bg-white dark:bg-[#1C1625] rounded-[16px] flex items-center justify-center shadow-sm border border-transparent dark:border-[#2D2438] active:scale-95 transition-transform">
                 <span className="text-[16px] font-bold text-[#D00000] dark:text-[#FF4D4D]">Log Out</span>
             </button>
        </div>

      </div>
    </div>
  );
}

function SettingRow({ label, active, onToggle }: { label: string, active: boolean, onToggle: () => void }) {
    return (
        <div 
          className="w-full h-[54px] bg-white dark:bg-[#0F0A15] rounded-[16px] flex items-center justify-between px-[16px] shadow-sm cursor-pointer select-none group border border-transparent dark:border-[#2D2438]"
          onClick={onToggle}
        >
            <span className="text-[14px] font-semibold text-gray-700 dark:text-[#F3F4F6] group-hover:text-black dark:group-hover:text-white transition-colors">
              {label}
            </span>
            <div className={cn(
                "w-[53px] h-[33px] rounded-[22px] p-[4px] flex transition-all duration-300",
                active ? "bg-[#8A56A4] dark:bg-[#A87BC7] justify-end" : "bg-[#B7BBC3] dark:bg-[#3D334D] justify-start"
            )}>
                <div className="w-[25px] h-[25px] bg-white rounded-full shadow-md transition-all border border-transparent dark:border-[#2D2438]" />
            </div>
        </div>
    );
}
