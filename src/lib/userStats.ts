"use client";

import { useState, useEffect } from "react";

export interface QuizHistoryItem {
  id: string;
  title: string;
  time: string;
  score: string;
  timestamp: number;
}

export interface UserStats {
  streak: number;
  lastActiveDate: string | null;
  quizzesCompleted: number;
  practicedWords: number;
  practicedCorrect: number;
  gems: number;
  timeSpentSeconds: number;
  weeklyActivity: boolean[]; // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
  quizHistory: QuizHistoryItem[];
  dictionaryLookups: number;
  writingChecks: number;
}

const STATS_STORAGE_KEY = "syntaxa_user_stats";
const STATS_SESSION_KEY = "syntaxa_session_activity";
const STATS_UPDATED_EVENT = "syntaxa_stats_updated";

export const DEFAULT_USER_STATS: UserStats = {
  streak: 0,
  lastActiveDate: null,
  quizzesCompleted: 0,
  practicedWords: 0,
  practicedCorrect: 0,
  gems: 0,
  timeSpentSeconds: 0,
  weeklyActivity: [false, false, false, false, false, false, false],
  quizHistory: [],
  dictionaryLookups: 0,
  writingChecks: 0,
};

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Convert Sunday=0..Saturday=6 to Monday=0..Sunday=6 index
function getDayOfWeekIndex(): number {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
}

export function getUserStats(): UserStats {
  if (typeof window === "undefined") {
    return DEFAULT_USER_STATS;
  }
  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY);
    if (!raw) return DEFAULT_USER_STATS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_USER_STATS,
      ...parsed,
    };
  } catch {
    return DEFAULT_USER_STATS;
  }
}

export function saveUserStats(stats: UserStats): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    sessionStorage.setItem(STATS_SESSION_KEY, JSON.stringify({
      lastUpdate: Date.now(),
      streak: stats.streak,
      gems: stats.gems,
    }));
    window.dispatchEvent(new Event(STATS_UPDATED_EVENT));
  } catch (err) {
    console.error("Failed to save user stats:", err);
  }
}

/**
 * Updates streak & weekly activity based on current activity.
 */
export function recordActivity(): UserStats {
  const stats = getUserStats();
  const today = getTodayString();
  const yesterday = getYesterdayString();
  const dayIdx = getDayOfWeekIndex();

  let newStreak = stats.streak;
  if (!stats.lastActiveDate) {
    newStreak = 1;
  } else if (stats.lastActiveDate === today) {
    // Already active today
    newStreak = Math.max(1, stats.streak);
  } else if (stats.lastActiveDate === yesterday) {
    // Consecutive day
    newStreak = stats.streak + 1;
  } else {
    // Streak broken
    newStreak = 1;
  }

  const newWeekly = [...stats.weeklyActivity];
  newWeekly[dayIdx] = true;

  const updated: UserStats = {
    ...stats,
    streak: newStreak,
    lastActiveDate: today,
    weeklyActivity: newWeekly,
  };

  saveUserStats(updated);
  return updated;
}

export function recordQuizCompleted(
  title: string,
  score: number,
  total: number,
): UserStats {
  const base = recordActivity();
  const earnedGems = Math.max(10, score * 5); // e.g. 10/10 -> 50 gems
  const historyItem: QuizHistoryItem = {
    id: `quiz_${Date.now()}`,
    title: title || "Quiz",
    time: "Today",
    score: `${score}/${total} Correct`,
    timestamp: Date.now(),
  };

  const updated: UserStats = {
    ...base,
    quizzesCompleted: base.quizzesCompleted + 1,
    gems: base.gems + earnedGems,
    quizHistory: [historyItem, ...(base.quizHistory || [])].slice(0, 20),
  };

  saveUserStats(updated);
  return updated;
}

export function recordPracticeWord(isCorrect: boolean): UserStats {
  const base = recordActivity();
  const updated: UserStats = {
    ...base,
    practicedWords: (base.practicedWords || 0) + 1,
    practicedCorrect: (base.practicedCorrect || 0) + (isCorrect ? 1 : 0),
    gems: isCorrect ? base.gems + 5 : base.gems,
  };
  saveUserStats(updated);
  return updated;
}

export function recordDictionaryLookup(): UserStats {
  const base = recordActivity();
  const updated: UserStats = {
    ...base,
    dictionaryLookups: base.dictionaryLookups + 1,
    gems: base.gems + 1,
  };
  saveUserStats(updated);
  return updated;
}

export function recordWritingCheck(): UserStats {
  const base = recordActivity();
  const updated: UserStats = {
    ...base,
    writingChecks: base.writingChecks + 1,
    gems: base.gems + 10,
  };
  saveUserStats(updated);
  return updated;
}

export function addTimeSpent(seconds: number): void {
  if (typeof window === "undefined" || seconds <= 0) return;
  const stats = getUserStats();
  const updated: UserStats = {
    ...stats,
    timeSpentSeconds: stats.timeSpentSeconds + seconds,
  };
  saveUserStats(updated);
}

export function formatTimeSpent(seconds: number): string {
  if (!seconds || seconds <= 0) return "0m";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${Math.max(1, minutes)}m`;
}

/**
 * Hook to reactively subscribe to live user stats
 */
export function useUserStats() {
  const [stats, setStats] = useState<UserStats>(DEFAULT_USER_STATS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStats(getUserStats());

    const handleUpdate = () => {
      setStats(getUserStats());
    };

    window.addEventListener(STATS_UPDATED_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    // Active time tracker interval (ticks every 10 seconds while tab is active)
    let elapsed = 0;
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        elapsed += 10;
        if (elapsed >= 30) {
          addTimeSpent(elapsed);
          elapsed = 0;
        }
      }
    }, 10000);

    return () => {
      if (elapsed > 0) {
        addTimeSpent(elapsed);
      }
      window.removeEventListener(STATS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const accuracy =
    stats.practicedWords > 0
      ? Math.round(((stats.practicedCorrect || 0) / stats.practicedWords) * 100)
      : 0;

  return {
    stats,
    accuracy,
    mounted,
    formatTimeSpent: () => formatTimeSpent(stats.timeSpentSeconds),
  };
}
