"use client";

import { User, Settings, LogOut, ChevronRight, Mail, Trophy, Target, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function Account() {
  const USER = {
    name: "Alex Johnson",
    email: "alex.j@example.com",
    avatar: "AJ",
    stats: {
      quizzes: 42,
      accuracy: 85,
      streak: 5,
      gems: 124
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-8 pb-24">
      <div className="flex justify-between items-start">
         <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <User className="text-violet-600" />
              Profile
            </h1>
            <p className="text-gray-500 text-sm">Manage your account and progress.</p>
         </div>
         <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
             <Settings size={20} />
         </button>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center space-y-4">
          <div className="w-24 h-24 bg-violet-100 rounded-full flex items-center justify-center text-3xl font-bold text-violet-600 border-4 border-white shadow-sm">
              {USER.avatar}
          </div>
          <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800">{USER.name}</h2>
              <div className="flex items-center justify-center gap-1 text-gray-400 text-sm mt-1">
                  <Mail size={12} />
                  <span>{USER.email}</span>
              </div>
          </div>
          <div className="w-full grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 mt-4">
               <div className="bg-gray-50 p-3 rounded-xl text-center">
                   <span className="block text-xl font-bold text-gray-800">{USER.stats.quizzes}</span>
                   <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Quizzes</span>
               </div>
               <div className="bg-gray-50 p-3 rounded-xl text-center">
                   <span className="block text-xl font-bold text-gray-800">{USER.stats.accuracy}%</span>
                   <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Accuracy</span>
               </div>
          </div>
      </div>

      <div className="space-y-4">
          <h3 className="font-bold text-gray-800 px-2">Performance stats</h3>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
               <div className="p-4 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                       <div className="bg-orange-50 p-2 rounded-lg text-orange-500">
                           <Flame size={20} />
                       </div>
                       <span className="font-medium text-gray-700">Current Streak</span>
                   </div>
                   <span className="font-bold text-gray-900">{USER.stats.streak} Days</span>
               </div>
               <div className="p-4 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                       <div className="bg-blue-50 p-2 rounded-lg text-blue-500">
                           <Trophy size={20} />
                       </div>
                       <span className="font-medium text-gray-700">Total Gems</span>
                   </div>
                   <span className="font-bold text-gray-900">{USER.stats.gems} 💎</span>
               </div>
               <div className="p-4 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                       <div className="bg-green-50 p-2 rounded-lg text-green-500">
                           <Target size={20} />
                       </div>
                       <span className="font-medium text-gray-700">Best Score</span>
                   </div>
                   <span className="font-bold text-gray-900">10/10</span>
               </div>
          </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
           <Link href="/login" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
               <span className="font-medium text-gray-700">Switch Account</span>
               <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
           </Link>
           <button className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors group text-red-600 border-t border-gray-50">
               <span className="font-medium flex items-center gap-2">
                   <LogOut size={18} /> Logout
               </span>
           </button>
      </div>
      
      <p className="text-center text-xs text-gray-400">Version 1.0.0 • Syntaxa Quiz</p>
    </div>
  );
}
