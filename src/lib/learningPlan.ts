import type { SkillMastery, UserStats } from "./userStats";

export const LEARNING_SKILLS = ["Tenses", "Articles & Preposition", "Sentence Structure"];

export type LearningStepType = "review" | "practice" | "writing" | "retest" | "vocabulary";

export interface LearningPlan {
  level: string | null;
  overallProgress: number;
  weakestAreas: { skill: string; mastery: number }[];
  today: {
    skill: string;
    estimatedMinutes: number;
    steps: { type: LearningStepType; title: string; completed: boolean }[];
  };
}

export function getSkillMastery(stats: UserStats, skill: string): SkillMastery {
  return stats.skillMastery[skill] || {
    skill, attempts: 0, correct: 0, accuracy: 0, mastery: 0,
    lastPracticed: null, nextReview: null, recentResults: [],
  };
}

export function getEstimatedLevel(stats: UserStats): string | null {
  const attempts = Object.values(stats.skillMastery).reduce((sum, skill) => sum + skill.attempts, 0);
  if (attempts < 10) return null;
  const progress = Object.values(stats.skillMastery).reduce((sum, skill) => sum + skill.mastery, 0) /
    Math.max(1, Object.values(stats.skillMastery).length);
  if (progress >= 85) return "C1 · Advanced";
  if (progress >= 70) return "B2 · Upper-intermediate";
  if (progress >= 55) return "B1 · Intermediate";
  if (progress >= 35) return "A2 · Elementary";
  return "A1 · Beginner";
}

export function buildLearningPlan(stats: UserStats): LearningPlan {
  const skills = LEARNING_SKILLS.map((skill) => getSkillMastery(stats, skill));
  const practiced = skills.filter((skill) => skill.attempts > 0);
  const overallProgress = practiced.length
    ? Math.round(practiced.reduce((sum, skill) => sum + skill.mastery, 0) / practiced.length)
    : 0;
  const weakestAreas = skills
    .filter((skill) => skill.attempts > 0)
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, 3)
    .map((skill) => ({ skill: skill.skill, mastery: skill.mastery }));
  const now = Date.now();
  const priority = [...skills].sort((a, b) => {
    const aDue = a.nextReview && a.nextReview <= now ? 20 : 0;
    const bDue = b.nextReview && b.nextReview <= now ? 20 : 0;
    const aRecent = a.recentResults.slice(-4).filter((result) => !result).length * 5;
    const bRecent = b.recentResults.slice(-4).filter((result) => !result).length * 5;
    return (bDue + bRecent - b.mastery) - (aDue + aRecent - a.mastery);
  })[0];
  const skill = priority?.skill || "Tenses";
  return {
    level: getEstimatedLevel(stats),
    overallProgress,
    weakestAreas,
    today: {
      skill,
      estimatedMinutes: 12,
      steps: [
        { type: "review", title: `Review ${skill}`, completed: false },
        { type: "practice", title: "Practice 5 questions", completed: false },
        { type: "writing", title: "Write 3 sentences", completed: false },
        { type: "retest", title: `Retest ${skill}`, completed: false },
        { type: "vocabulary", title: "Learn 5 vocabulary words", completed: false },
      ],
    },
  };
}

export function formatReviewDate(timestamp: number | null): string {
  if (!timestamp) return "After this lesson";
  const days = Math.max(0, Math.ceil((timestamp - Date.now()) / (24 * 60 * 60 * 1000)));
  return days <= 0 ? "Due today" : days === 1 ? "Tomorrow" : `In ${days} days`;
}
