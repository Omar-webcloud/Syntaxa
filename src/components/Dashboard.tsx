"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Clock, HelpCircle, ArrowRight, Sparkles } from "lucide-react";
import { cn, getAvatarUrl } from "@/lib/utils";
import { useUserStats } from "@/lib/userStats";
import type { WeakTopicsMap } from "@/lib/ai/types";
import Link from "next/link";
import Image from "next/image";

interface QuizStartOptions {
  aiGenerated?: boolean;
  weakTopics?: string[];
}

interface DashboardProps {
  onStartQuiz: (options?: QuizStartOptions) => void;
}

export default function Dashboard({ onStartQuiz }: DashboardProps) {
  const { user } = useAuth();
  const { stats } = useUserStats();
  const [weakTopicNames] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("syntaxa_weak_topics");
      if (stored) {
        const weakMap: WeakTopicsMap = JSON.parse(stored);
        return Object.entries(weakMap)
          .filter(([, s]) => s.total > 0 && s.wrong / s.total > 0.3)
          .map(([topic]) => topic);
      }
    } catch {
      // ignore
    }
    return [];
  });
  const weakTopicsAvailable = weakTopicNames.length > 0;

  const topics = [
    { name: "Tenses", color: "bg-[#F3EEF6]" },
    { name: "Verbs", color: "bg-[#F3EEF6]" },
    { name: "Articles", color: "bg-[#F3EEF6]" },
    { name: "Prepositions", color: "bg-[#F3EEF6]" },
  ];

  const activeDaysThisWeek = stats.weeklyActivity.filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#FDF9FF] dark:bg-[#0F0A15] p-6 pb-24 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <p className="text-gray-900 dark:text-gray-300 font-semibold">
            Welcome Back, {user?.username || "Learner"}!
          </p>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Your Daily Quiz</h1>
        </div>
        <Link
          href="/account"
          className="w-12 h-12 rounded-2xl overflow-hidden bg-[#E5CCFA] dark:bg-[#2A2035] border-2 border-white dark:border-[#2D2438] shadow-sm hover:scale-105 active:scale-95 transition-transform shrink-0"
          title="Account & Profile"
        >
          <Image
            src={getAvatarUrl(user?.avatar || user?.username)}
            alt="Avatar"
            width={48}
            height={48}
            className="w-full h-full object-cover"
            unoptimized
          />
        </Link>
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

        <div className="space-y-3">
          <button 
            onClick={() => onStartQuiz()}
            className="w-full py-4 bg-gradient-to-r from-[#8A56A4] to-[#A87BC7] text-white rounded-2xl font-bold text-lg shadow-lg shadow-purple-100 dark:shadow-none active:scale-[0.98] transition-all"
          >
            Start Quiz
          </button>

          {weakTopicsAvailable && (
            <button
              onClick={() => onStartQuiz({ aiGenerated: true, weakTopics: weakTopicNames })}
              className="w-full py-4 bg-transparent border-2 border-[#FC9502] text-[#FC9502] rounded-2xl font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:bg-[#FC9502]/5"
            >
              <Sparkles size={18} />
              Generate AI Quiz for Weak Spots
            </button>
          )}
        </div>
      </div>
      
      <p className="text-center text-xs font-medium text-gray-400 italic">Ready for Your Daily Quiz? Keep It Up!</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#1C1625] p-5 rounded-3xl border border-gray-100 dark:border-gray-800 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/10 rounded-2xl flex items-center justify-center text-2xl">
            🔥
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">{stats.streak}</p>
            <p className="text-xs font-bold text-gray-500 uppercase">Day Streak</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#1C1625] p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-1">
          <div className="flex justify-between items-center">
             <p className="text-sm font-bold text-gray-900 dark:text-white">This Week</p>
             <p className="text-xs font-bold text-[#8A56A4]">{activeDaysThisWeek}/7</p>
          </div>
          <div className="flex justify-between">
            {stats.weeklyActivity.map((active, i) => (
              <div 
                key={i} 
                className={cn(
                    "w-2 h-2 rounded-full transition-colors",
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
              onClick={() => onStartQuiz()}
              className="px-6 py-3 bg-[#F3EEF6] dark:bg-[#1C1625] rounded-2xl text-gray-900 dark:text-white font-bold whitespace-nowrap active:scale-95 transition-all outline-none hover:bg-[#E8DDED] dark:hover:bg-[#2D2438]"
            >
              {topic.name}
            </button>
          ))}
        </div>
      </div>

      {/* Recent History */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-gray-900 dark:text-white">Recent History</h3>
        {stats.quizHistory && stats.quizHistory.length > 0 ? (
          <div className="space-y-3">
            {stats.quizHistory.slice(0, 5).map((item) => (
              <div key={item.id} className="bg-white dark:bg-[#1C1625] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex justify-between items-center">
                 <p className="font-bold text-gray-900 dark:text-white">{item.title}</p>
                 <div className="text-right">
                   <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{item.time}. {item.score}</p>
                 </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1C1625] p-6 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-center space-y-1">
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">No quiz history yet</p>
            <p className="text-xs text-gray-400">Complete your first daily quiz to start tracking your streak and progress!</p>
          </div>
        )}
      </div>
    </div>
  );
}
