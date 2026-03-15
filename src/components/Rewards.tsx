"use client";

import { Check, Star, Lock, Lightbulb, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Rewards() {
  const GEMS = 124;
  const STREAK = 5;

  return (
    <div className="min-h-screen bg-[#F3EEF6] dark:bg-[#0F0A15] font-sans text-black dark:text-[#F3F4F6] flex flex-col items-center pb-24 transition-colors duration-300">
      <div className="w-full max-w-[412px] md:max-w-[768px] p-6 space-y-8">
        
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-[#111] dark:text-[#F3F4F6]">My Rewards</h1>
          <p className="text-gray-500 dark:text-[#9CA3AF] font-medium tracking-tight">Keep Your Streak Alive to Earn More</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#1C1625] p-6 rounded-[24px] shadow-sm flex flex-col items-center justify-center space-y-2 h-[120px] border border-transparent dark:border-[#2D2438]">
             <span className="text-3xl">💎</span>
             <div className="text-center leading-tight">
                <span className="block text-2xl font-black text-black dark:text-[#F3F4F6]">{GEMS}</span>
                <span className="text-xs text-black dark:text-[#9CA3AF] font-bold">Total Gems</span>
             </div>
          </div>
          <div className="bg-white dark:bg-[#1C1625] p-6 rounded-[24px] shadow-sm flex flex-col items-center justify-center space-y-2 h-[120px] border border-transparent dark:border-[#2D2438]">
             <span className="text-3xl">🔥</span>
             <div className="text-center leading-tight">
                <span className="block text-2xl font-black text-black dark:text-[#F3F4F6]">{STREAK}</span>
                <span className="text-xs text-black dark:text-[#9CA3AF] font-bold">Day Streak</span>
             </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1C1625] rounded-[32px] p-6 shadow-md border border-gray-50 dark:border-[#2D2438]">
            <h3 className="font-extrabold text-black dark:text-[#F3F4F6] text-[18px] mb-6 px-1">Weekly Streak</h3>
            
            <div className="flex justify-between items-center mb-8 px-2">
                {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => {
                    const active = i < STREAK;
                    return (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <div className={cn(
                                "w-11 h-11 rounded-full flex items-center justify-center transition-all",
                                active 
                                  ? "bg-[#FC9502] text-white shadow-md" 
                                  : "bg-[#B7BBC3] text-gray-500"
                            )}>
                                {active ? <Check size={24} strokeWidth={4} /> : null}
                            </div>
                            <span className={cn(
                                "text-[14px] font-bold",
                                active ? "text-black dark:text-[#F3F4F6]" : "text-gray-400 dark:text-[#3D334D]"
                            )}>{day}</span>
                        </div>
                    );
                })}
            </div>

            <div className="bg-[#FFF0DC] dark:bg-[#2C1F10] p-3 rounded-2xl flex items-center justify-center gap-2 border border-[#FFE0B2] dark:border-[#2D2438]">
                <Star size={20} fill="#FC9502" className="text-[#FC9502]" />
                <p className="text-[13px] text-black dark:text-[#F3F4F6] font-bold">
                   2 Days Until Your Next Big Reward (+50) <span className="text-inherit">💎</span>
                </p>
            </div>
        </div>

        <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
                <h3 className="font-extrabold text-black dark:text-white text-[20px]">Achievements</h3>
                <button className="text-[14px] font-bold text-gray-400 dark:text-gray-500">View All</button>
            </div>

            <div className="space-y-3">
                <AchievementCard 
                    title="Grammar Master" 
                    desc="Completed 10 basic grammar practices."
                    icon="📚"
                    progress={100}
                    checked={true}
                    iconColor="bg-[#E8DDED]"
                />
                <AchievementCard 
                    title="7 Day Streak" 
                    desc="Maintain a week-long learning habit to unlock."
                    icon="🔥"
                    progress={70}
                    checked={false}
                    statusText="5/7"
                    iconColor="bg-[#FFF0DC]"
                />
                 <AchievementCard 
                    title="100 Lesson Club" 
                    desc="Finish 100 lessons in total to unlock."
                    icon="📖"
                    progress={15}
                    checked={false}
                    locked={true}
                    iconColor="bg-gray-100"
                />
            </div>
        </div>

        <div className="space-y-4">
            <h3 className="font-extrabold text-black dark:text-[#F3F4F6] text-[20px] px-1">Redeem Your Gems</h3>
            <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white dark:bg-[#1C1625] p-4 rounded-[28px] shadow-sm flex flex-col items-center gap-3 border border-gray-50 dark:border-[#2D2438]">
                     <div className="w-12 h-12 bg-gray-100 dark:bg-[#2D2438] rounded-full flex items-center justify-center overflow-hidden">
                        <Lightbulb className="text-yellow-500" fill="currentColor" />
                     </div>
                     <span className="text-[14px] font-bold text-black dark:text-[#F3F4F6]">Hint Unlock</span>
                 </div>
                 <div className="bg-white dark:bg-[#1C1625] p-4 rounded-[28px] shadow-sm flex flex-col items-center gap-3 border border-gray-50 dark:border-[#2D2438]">
                     <div className="w-12 h-12 bg-gray-100 dark:bg-[#2D2438] rounded-full flex items-center justify-center overflow-hidden">
                        <GraduationCap className="text-blue-500" />
                     </div>
                     <span className="text-[14px] font-bold text-black dark:text-[#F3F4F6]">Advanced Quiz</span>
                 </div>
            </div>
        </div>

      </div>
    </div>
  );
}

function AchievementCard({ 
    title, 
    desc, 
    icon, 
    progress, 
    checked, 
    statusText, 
    locked, 
    iconColor 
}: { 
    title: string, 
    desc: string, 
    icon: string, 
    progress: number, 
    checked?: boolean, 
    statusText?: string, 
    locked?: boolean,
    iconColor: string
}) {
    return (
        <div className="bg-white dark:bg-[#1C1625] p-4 rounded-[24px] shadow-sm border border-gray-50 dark:border-[#2D2438] flex items-center gap-4 relative">
            <div className={cn("w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0 dark:brightness-90", iconColor === "bg-gray-100" ? "dark:bg-[#2D2438]" : iconColor)}>
                {icon}
            </div>
            <div className="flex-1 space-y-1">
                <div className="flex justify-between items-center pr-4">
                    <h4 className={cn("text-[16px] font-extrabold", locked ? "text-gray-400 dark:text-[#3D334D]" : "text-black dark:text-[#F3F4F6]")}>{title}</h4>
                    {statusText && <span className="text-[11px] font-bold text-green-600 dark:text-green-500">{statusText}</span>}
                </div>
                <p className="text-[13px] text-gray-400 dark:text-[#9CA3AF] font-medium leading-tight mr-4">{desc}</p>
                
                <div className="h-1.5 w-full bg-gray-100 dark:bg-[#0F0A15] rounded-full mt-2 overflow-hidden mr-4">
                    <div 
                        className={cn("h-full rounded-full", checked || progress > 90 ? "bg-green-600" : locked ? "bg-gray-300 dark:bg-[#3D334D]" : "bg-green-600")} 
                        style={{ width: `${progress}%` }} 
                    />
                </div>
            </div>

            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {checked && (
                    <div className="bg-green-600 rounded-full p-1 border-2 border-white">
                        <Check size={12} strokeWidth={4} className="text-white" />
                    </div>
                )}
                {locked && (
                    <Lock size={18} className="text-gray-400" />
                )}
            </div>
        </div>
    );
}
