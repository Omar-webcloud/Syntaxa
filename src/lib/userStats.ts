"use client";

import { useState, useEffect } from "react";

export interface QuizHistoryItem {
  id: string;
  title: string;
  time: string;
  score: string;
  timestamp: number;
}

export interface SkillMastery {
  skill: string;
  attempts: number;
  correct: number;
  accuracy: number;
  mastery: number;
  lastPracticed: number | null;
  nextReview: number | null;
  recentResults: boolean[];
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
  skillMastery: Record<string, SkillMastery>;
  hintUnlocked: boolean;
  advancedQuizUnlocked: boolean;
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
  skillMastery: {},
  hintUnlocked: false,
  advancedQuizUnlocked: false,
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
    const merged: UserStats = {
      ...DEFAULT_USER_STATS,
      ...parsed,
      skillMastery: parsed.skillMastery || {},
      hintUnlocked: parsed.hintUnlocked === true,
      advancedQuizUnlocked: parsed.advancedQuizUnlocked === true,
    };
    // Migrate the original weak-topic tracker into the richer mastery model.
    if (Object.keys(merged.skillMastery).length === 0) {
      const weakRaw = localStorage.getItem("syntaxa_weak_topics");
      if (weakRaw) {
        const weakMap = JSON.parse(weakRaw) as Record<string, { wrong: number; total: number }>;
        for (const [skill, topic] of Object.entries(weakMap)) {
          if (!topic || topic.total <= 0) continue;
          const accuracy = Math.round(((topic.total - topic.wrong) / topic.total) * 100);
          merged.skillMastery[skill] = {
            skill, attempts: topic.total, correct: topic.total - topic.wrong,
            accuracy, mastery: Math.max(0, Math.min(100, Math.round(accuracy * 0.8))),
            lastPracticed: null, nextReview: Date.now(), recentResults: [],
          };
        }
      }
    }
    return merged;
  } catch {
    return DEFAULT_USER_STATS;
  }
}

export type GemReward = "hint" | "advancedQuiz";

const GEM_REWARD_COSTS: Record<GemReward, number> = {
  hint: 100,
  advancedQuiz: 150,
};

export function redeemGemReward(reward: GemReward): {
  success: boolean;
  stats: UserStats;
  message: string;
} {
  const stats = getUserStats();
  const alreadyUnlocked = reward === "hint" ? stats.hintUnlocked : stats.advancedQuizUnlocked;
  if (alreadyUnlocked) {
    return { success: true, stats, message: "Already unlocked" };
  }

  const cost = GEM_REWARD_COSTS[reward];
  if (stats.gems < cost) {
    return { success: false, stats, message: `You need ${cost - stats.gems} more gems` };
  }

  const updated: UserStats = {
    ...stats,
    gems: stats.gems - cost,
    hintUnlocked: reward === "hint" ? true : stats.hintUnlocked,
    advancedQuizUnlocked: reward === "advancedQuiz" ? true : stats.advancedQuizUnlocked,
  };
  saveUserStats(updated);
  return { success: true, stats: updated, message: "Unlocked" };
}

export function recordSkillPerformance(skill: string, correct: boolean): UserStats {
  const base = getUserStats();
  const previous = base.skillMastery[skill] || {
    skill,
    attempts: 0,
    correct: 0,
    accuracy: 0,
    mastery: 0,
    lastPracticed: null,
    nextReview: null,
    recentResults: [],
  };
  const attempts = previous.attempts + 1;
  const accuracy = Math.round(((previous.correct + (correct ? 1 : 0)) / attempts) * 100);
  const recentResults = [...previous.recentResults, correct].slice(-8);
  const recentAccuracy = recentResults.length
    ? (recentResults.filter(Boolean).length / recentResults.length) * 100
    : accuracy;
  const experience = Math.min(20, attempts * 2);
  const mastery = Math.max(0, Math.min(100, Math.round(accuracy * 0.65 + experience + recentAccuracy * 0.15)));
  const intervalDays = mastery < 45 ? 1 : mastery < 65 ? 3 : mastery < 85 ? 7 : 14;
  const now = Date.now();
  const nextReview = now + intervalDays * 24 * 60 * 60 * 1000;
  const updated: UserStats = {
    ...base,
    skillMastery: {
      ...base.skillMastery,
      [skill]: {
        ...previous,
        attempts,
        correct: previous.correct + (correct ? 1 : 0),
        accuracy,
        mastery,
        lastPracticed: now,
        nextReview,
        recentResults,
      },
    },
  };
  saveUserStats(updated);
  return updated;
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

export function resetUserStats(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STATS_STORAGE_KEY);
    sessionStorage.removeItem(STATS_SESSION_KEY);
    localStorage.removeItem("syntaxa_weak_topics");
    window.dispatchEvent(new Event(STATS_UPDATED_EVENT));
  } catch (err) {
    console.error("Failed to reset user stats:", err);
  }
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
