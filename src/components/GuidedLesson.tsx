"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle, Clock, Send } from "lucide-react";
import quizData from "@/data/quiz.json";
import lessonData from "@/data/lesson.json";
import { getUserStats, recordSkillPerformance } from "@/lib/userStats";
import { formatReviewDate, getSkillMastery } from "@/lib/learningPlan";

type Step = "review" | "practice" | "writing" | "retest" | "complete";
type Question = { id: number; question: string; answer: string };

const keywords: Record<string, string[]> = {
  Tenses: ["is", "are", "was", "were", "has", "have", "had", "will", "yesterday", "now"],
  "Articles & Preposition": ["a/an", "the", " in", " on", " at", " for", " since", " of"],
  "Sentence Structure": ["if", "who", "which", "that", "too", "enough", "and", "but", "or"],
};

export default function GuidedLesson({ skill, onBack }: { skill: string; onBack: () => void }) {
  const [step, setStep] = useState<Step>("review");
  const [index, setIndex] = useState(0);
  const [writing, setWriting] = useState("");
  const [writingStatus, setWritingStatus] = useState<string | null>(null);
  const [before] = useState(() => getSkillMastery(getUserStats(), skill).mastery);
  const [after, setAfter] = useState<number | null>(null);
  const questions = useMemo<Question[]>(() => {
    const terms = keywords[skill] || [];
    const matches = quizData.filter((item) => terms.some((term) => item.question.toLowerCase().includes(term.toLowerCase())));
    return (matches.length >= 5 ? matches : quizData).slice(0, 5);
  }, [skill]);
  const lesson = lessonData.lessons.find((item) => item.topic === skill) || lessonData.lessons[0];

  const answer = (isCorrect: boolean) => {
    recordSkillPerformance(skill, isCorrect);
    if (index < questions.length - 1) setIndex((value) => value + 1);
    else { setIndex(0); setStep("writing"); }
  };

  const submitWriting = async () => {
    if (writing.trim().length < 10) return;
    setWritingStatus("Reviewing your sentences...");
    try {
      const response = await fetch("/api/ai/correct-writing", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: writing }),
      });
      setWritingStatus(response.ok ? "Writing reviewed. Nice work!" : "Writing saved. AI is unavailable right now.");
    } catch { setWritingStatus("Writing saved. AI is unavailable right now."); }
    setStep("retest");
    setIndex(0);
  };

  const finish = (isCorrect: boolean) => {
    recordSkillPerformance(skill, isCorrect);
    const updated = getSkillMastery(getUserStats(), skill);
    setAfter(Math.max(before, updated.mastery));
    setStep("complete");
  };

  if (step === "complete") {
    const improvement = Math.max(0, (after || before) - before);
    return <div className="min-h-screen bg-[#FDF9FF] dark:bg-[#0F0A15] p-6 pb-24 text-gray-900 dark:text-white">
      <button onClick={onBack} className="mb-8 flex items-center gap-2 font-bold text-gray-500"><ArrowLeft size={18} /> Dashboard</button>
      <div className="mx-auto max-w-lg space-y-6 rounded-[32px] bg-white p-7 shadow-sm dark:bg-[#1C1625]">
        <CheckCircle className="text-green-500" size={44} />
        <h1 className="text-2xl font-black">Today&apos;s plan complete</h1>
        <p className="text-gray-500">{skill}</p>
        <div className="rounded-2xl bg-[#F3EEF6] p-5 dark:bg-[#0F0A15]"><p className="text-sm font-bold text-gray-500">SESSION PERFORMANCE</p><p className="mt-2 text-3xl font-black">{before}% → {after || before}%</p><p className="mt-1 font-bold text-green-600">{improvement > 0 ? `+${improvement} percentage points in this session` : "Keep practicing to build consistency"}</p></div>
        <p className="font-medium text-gray-500">Next review: {formatReviewDate(getSkillMastery(getUserStats(), skill).nextReview)}</p>
        <button onClick={onBack} className="w-full rounded-2xl bg-[#8A56A4] py-4 font-bold text-white">View Progress</button>
      </div>
    </div>;
  }

  if (step === "review") return <Shell title={`Review ${skill}`} onBack={onBack}><p className="text-gray-500">{lesson.title}</p><div className="space-y-3">{lesson.patterns.slice(0, 4).map((pattern) => <div key={pattern.id} className="rounded-2xl bg-[#F3EEF6] p-4 dark:bg-[#0F0A15]"><p className="font-black">{pattern.pattern}</p><p className="mt-1 text-sm text-gray-500">{("use" in pattern ? pattern.use : "rule" in pattern ? pattern.rule : pattern.type)} · {pattern.example}</p></div>)}</div><NextButton onClick={() => setStep("practice")}>Practice 5 questions</NextButton></Shell>;
  if (step === "writing") return <Shell title="Write 3 sentences" onBack={onBack}><p className="text-gray-500">Use <strong>{skill}</strong> in three short sentences.</p><textarea value={writing} onChange={(event) => setWriting(event.target.value)} rows={6} className="w-full rounded-2xl border-2 border-[#E8DDED] bg-[#F3EEF6] p-4 outline-none focus:border-[#8A56A4] dark:border-[#2D2438] dark:bg-[#0F0A15]" placeholder="Write your sentences here..." /><p className="text-right text-sm text-gray-400">{writing.trim().split(/\s+/).filter(Boolean).length} words</p>{writingStatus && <p className="text-sm font-bold text-[#8A56A4]">{writingStatus}</p>}<NextButton onClick={submitWriting} disabled={writing.trim().length < 10}><Send size={18} /> Check writing</NextButton></Shell>;
  const question = questions[index];
  return <Shell title={step === "practice" ? "Practice" : `Retest ${skill}`} onBack={onBack}><div className="flex items-center justify-between text-sm font-bold text-gray-500"><span>{index + 1} of {questions.length}</span><span>{step === "practice" ? "Targeted practice" : "Measure improvement"}</span></div><div className="rounded-2xl bg-[#F3EEF6] p-5 text-lg font-bold dark:bg-[#0F0A15]">{question.question}</div><div className="grid grid-cols-2 gap-3">{question.question.match(/\((.*?)\)/)?.[1].split("/").map((option) => <button key={option} onClick={() => step === "practice" ? answer(option.trim() === question.answer) : finish(option.trim() === question.answer)} className="rounded-2xl border-2 border-[#E8DDED] p-4 font-bold hover:border-[#8A56A4] dark:border-[#2D2438]">{option.trim()}</button>)}</div><p className="flex items-center gap-2 text-sm text-gray-400"><Clock size={16} /> About 4 minutes</p></Shell>;
}

function Shell({ title, onBack, children }: { title: string; onBack: () => void; children: React.ReactNode }) { return <div className="min-h-screen bg-[#FDF9FF] dark:bg-[#0F0A15] p-6 pb-24 text-gray-900 dark:text-white"><button onClick={onBack} className="mb-8 flex items-center gap-2 font-bold text-gray-500"><ArrowLeft size={18} /> Dashboard</button><div className="mx-auto max-w-lg space-y-6 rounded-[32px] bg-white p-7 shadow-sm dark:bg-[#1C1625]"><p className="text-sm font-black uppercase tracking-wider text-[#8A56A4]">My learning plan</p><h1 className="text-2xl font-black">{title}</h1>{children}</div></div>; }
function NextButton({ onClick, children, disabled = false }: { onClick: () => void; children: React.ReactNode; disabled?: boolean }) { return <button onClick={onClick} disabled={disabled} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#8A56A4] py-4 font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300">{children}</button>; }
