"use client";

import { Trophy, Flame, Zap, Lock, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Rewards() {
  const GEMS = 124;
  const STREAK = 5;

  return (
    <div className="max-w-md mx-auto p-4 space-y-8 pb-24">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Trophy className="text-violet-600" />
          Rewards & Store
        </h1>
        <p className="text-gray-500 text-sm">Keep your streak alive to earn more!</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-2xl">
                💎
            </div>
            <div className="text-center">
                <span className="block text-2xl font-black text-gray-800">{GEMS}</span>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Gems</span>
            </div>
        </div>
         <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
                <Flame className="text-orange-500 fill-orange-500" />
            </div>
            <div className="text-center">
                <span className="block text-2xl font-black text-gray-800">{STREAK}</span>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Day Streak</span>
            </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
          <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800 text-lg">Weekly Streak</h3>
              <span className="text-sm text-gray-400">Target: 7 Days</span>
          </div>
          <div className="flex justify-between items-center">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => {
                  const active = i < STREAK;
                  const isToday = i === STREAK - 1;
                  return (
                      <div key={i} className="flex flex-col items-center gap-2">
                          <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all",
                              active 
                                ? "bg-orange-500 border-orange-500 text-white shadow-md scale-110"
                                : "bg-gray-50 border-gray-100 text-gray-300"
                          )}>
                              {active ? <CheckIcon size={16} /> : null}
                          </div>
                          <span className={cn(
                              "text-xs font-medium",
                              active ? "text-orange-500" : "text-gray-300"
                          )}>{day}</span>
                      </div>
                  );
              })}
          </div>
          <div className="mt-6 bg-orange-50 p-4 rounded-xl flex items-center gap-3">
              <Star className="text-orange-500 fill-orange-500" size={20} />
              <p className="text-sm text-orange-800 font-medium">
                  2 days until your next <span className="font-bold">Big Reward (+50 💎)</span>
              </p>
          </div>
      </div>

      <div className="space-y-4">
          <h3 className="font-bold text-gray-800 text-xl px-2">Gem Store</h3>
          
          <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between group cursor-pointer hover:border-violet-200 transition-colors">
              <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center">
                      <Zap className="text-red-500 fill-red-500" size={24} />
                  </div>
                  <div>
                      <h4 className="font-bold text-gray-800 group-hover:text-violet-600 transition-colors">Refill Lives</h4>
                      <p className="text-xs text-gray-400">Restore 5 hearts instantly</p>
                  </div>
              </div>
              <button className="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-1 group-hover:bg-violet-600 transition-colors">
                  50 💎
              </button>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between opacity-60">
              <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Lock className="text-gray-400" size={24} />
                  </div>
                   <div>
                      <h4 className="font-bold text-gray-800">Pro Theme</h4>
                      <p className="text-xs text-gray-400">Dark mode & custom colors</p>
                  </div>
              </div>
              <button disabled className="bg-gray-200 text-gray-500 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-1">
                  Locked
              </button>
          </div>
      </div>
    </div>
  );
}

function CheckIcon({ size }: { size: number }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    )
}
