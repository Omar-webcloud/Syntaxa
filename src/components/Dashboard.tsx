"use client";

import { useAuth } from "@/lib/AuthContext";
import { Clock, HelpCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface DashboardProps {
  onStartQuiz: () => void;
}

export default function Dashboard({ onStartQuiz }: DashboardProps) {
  const { user, isAuthenticated } = useAuth();

  const topics = [
    { name: "Tenses", color: "bg-[#F3EEF6]" },
    { name: "Verbs", color: "bg-[#F3EEF6]" },
    { name: "Articles", color: "bg-[#F3EEF6]" },
    { name: "Prepositions", color: "bg-[#F3EEF6]" },
  ];

  const history = [
    { title: "Prepositions", time: "Yesterday", score: "8/10 Correct" },
    { title: "Articles", time: "20th January", score: "9/10 Correct" },
    { title: "Verbs", time: "19th January", score: "7/10 Correct" },
  ];

  return (
    <div className="min-h-screen bg-[#FDF9FF] dark:bg-[#0F0A15] p-6 pb-24 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-gray-900 dark:text-gray-300 font-semibold">
            Welcome {isAuthenticated ? `Back, ${user?.username}!` : "to Syntaxa!"}
          </p>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Your Daily Quiz</h1>
        </div>
        {!isAuthenticated && (
          <div className="flex gap-2">
            <Link href="/signup" className="px-1 py-1 min-[353px]:px-3 min-[353px]:py-1.5 min-[400px]:px-2 min-[400px]:py-2 rounded border border-[#8A56A4] text-[#8A56A4] text-xs min-[400px]:text-sm font-bold">Sign Up</Link>
            <Link href="/login" className="px-1 py-1 min-[353px]:px-3 min-[353px]:py-1.5 min-[400px]:px-2 min-[400px]:py-2 rounded bg-[#8A56A4] text-white text-xs min-[400px]:text-sm font-semibold">Log In</Link>
          </div>
        )}
      </div>

      {/* Hero Quiz Card */}
      <div className="bg-white dark:bg-[#1C1625] rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
        <div className="flex justify-end">
          <div className="flex items-center gap-1 bg-[#E8F8FF] dark:bg-[#1A2E35] px-3 py-1.5 rounded-full">
            <span className="text-blue-500">💎</span>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">+30</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#FFF9E5] dark:bg-[#2D2A1F] rounded-2xl flex items-center justify-center text-3xl">
            📝
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">Mastering Verbs</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Present Continuous and Past Continuous</p>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#8A56A4] rounded-full flex items-center justify-center">
                <HelpCircle size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">10 Questions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#40C4FF] rounded-full flex items-center justify-center">
                <Clock size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">5 Mins</span>
          </div>
        </div>

        <button 
          onClick={onStartQuiz}
          className="w-full py-4 bg-gradient-to-r from-[#8A56A4] to-[#A87BC7] text-white rounded-2xl font-bold text-lg shadow-lg shadow-purple-100 dark:shadow-none active:scale-[0.98] transition-all"
        >
          Start Quiz
        </button>
      </div>
      
      <p className="text-center text-xs font-medium text-gray-400 italic">Ready for Your Daily Quiz? Keep It Up!</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#1C1625] p-5 rounded-3xl border border-gray-100 dark:border-gray-800 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/10 rounded-2xl flex items-center justify-center text-2xl">
            🔥
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">5</p>
            <p className="text-xs font-bold text-gray-500 uppercase">Day Streak</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#1C1625] p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-1">
          <div className="flex justify-between items-center">
             <p className="text-sm font-bold text-gray-900 dark:text-white">This Week</p>
             <p className="text-xs font-bold text-[#8A56A4]">5/7</p>
          </div>
          <div className="flex justify-between">
            {[1, 2, 3, 4, 5, 0, 0].map((active, i) => (
              <div 
                key={i} 
                className={cn(
                    "w-2 h-2 rounded-full",
                    active ? "bg-[#8A56A4]" : "bg-gray-200 dark:bg-gray-700"
                )} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Explore Topics */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-black text-gray-900 dark:text-white">Explore Quiz Topics</h3>
          <ArrowRight size={20} className="text-gray-900 dark:text-white" />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {topics.map((topic) => (
            <button 
              key={topic.name} 
              className="px-6 py-3 bg-[#F3EEF6] dark:bg-[#1C1625] rounded-2xl text-gray-900 dark:text-white font-bold whitespace-nowrap active:scale-95 transition-all outline-none"
            >
              {topic.name}
            </button>
          ))}
        </div>
      </div>

      {/* Recent History */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-gray-900 dark:text-white">Recent History</h3>
        <div className="space-y-3">
          {history.map((item, i) => (
            <div key={i} className="bg-white dark:bg-[#1C1625] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex justify-between items-center">
               <p className="font-bold text-gray-900 dark:text-white">{item.title}</p>
               <div className="text-right">
                 <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{item.time}. {item.score}</p>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
