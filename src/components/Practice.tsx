"use client";

import { useState, useEffect } from "react";
import { BarChart, Lightbulb, Type, Layers, Layout, CheckCircle, XCircle, ArrowRight, X, Loader2, PenLine } from "lucide-react";
import sentencesData from "@/data/practice-sentence.json";
import lessonsData from "@/data/lesson.json";
import { cn } from "@/lib/utils";
import Image from "next/image";
import WritingCoach from "./WritingCoach";
import { useUserStats, recordPracticeWord } from "@/lib/userStats";

type LessonPattern = {
  id: number;
  pattern: string;
  rule?: string;
  tense?: string;
  type?: string;
  use?: string;
  example: string;
};

type Lesson = {
  topic: string;
  title: string;
  patterns: LessonPattern[];
};

type PracticeMode = "sentence" | "writing";

export default function Practice() {
  const [userInput, setUserInput] = useState("");
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [checking, setChecking] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [mode, setMode] = useState<PracticeMode>("sentence");

  const { stats, accuracy, mounted } = useUserStats();

  const pickRandomSentence = () => {
    const randomIndex = Math.floor(Math.random() * sentencesData.length);
    setCurrentSentenceIndex(randomIndex);
    setUserInput("");
    setFeedback(null);
    setAiExplanation(null);
  };

  useEffect(() => {
    pickRandomSentence();
  }, []);

  const handleCheckAnswer = async () => {
    if (feedback !== null) {
        pickRandomSentence();
        return;
    }

    if (!userInput.trim()) return;

    const currentSentence = sentencesData[currentSentenceIndex];
    
    const normalize = (str: string) => str.toLowerCase().replace(/[.,?!]/g, '').replace(/\s+/g, ' ').trim();
    const cleanAnswer = currentSentence.answer.replace(/\*\*/g, '');
    
    let targetWord = "";
    
    const boldMatch = currentSentence.answer.match(/\*\*(.*?)\*\*/);
    if (boldMatch) {
        targetWord = boldMatch[1];
    } else {
        const questionParts = normalize(currentSentence.question.replace(/___.*?\(.*?\)|___/g, '')).split(' ');
        const answerParts = normalize(cleanAnswer).split(' ');
        const diffWords = answerParts.filter((word: string) => !questionParts.includes(word));
        if (diffWords.length > 0) {
            targetWord = diffWords.join(' ');
        }
    }

    const normInput = normalize(userInput);
    const isLocalMatch = normInput === normalize(cleanAnswer) || (targetWord && normInput === normalize(targetWord));
    
    // Fast path: exact match — no API call needed
    if (isLocalMatch) {
      setFeedback("correct");
      setAiExplanation(null);
      recordPracticeWord(true);
      return;
    }

    // Slow path: ask AI to judge
    setChecking(true);
    try {
      const res = await fetch("/api/ai/check-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentSentence.question,
          expectedAnswer: cleanAnswer,
          userAnswer: userInput.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.isCorrect) {
          setFeedback("correct");
          recordPracticeWord(true);
        } else {
          setFeedback("incorrect");
          recordPracticeWord(false);
        }
        setAiExplanation(data.explanation || null);
      } else {
        // API failed — fall back to local result (already know it's not a match)
        setFeedback("incorrect");
        setAiExplanation(null);
        recordPracticeWord(false);
      }
    } catch {
      // Network error — fall back silently
      setFeedback("incorrect");
      setAiExplanation(null);
      recordPracticeWord(false);
    } finally {
      setChecking(false);
    }
  };

  if (!mounted) return null;
  const currentSentence = sentencesData[currentSentenceIndex];

  return (
    <div className="min-h-screen bg-[#F3EEF6] dark:bg-[#0F0A15] font-sans text-black dark:text-[#F3F4F6] flex flex-col items-center pb-24 transition-colors duration-300">
      <div className="w-full max-w-[412px] md:max-w-[768px] p-6 space-y-6">
        
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111] dark:text-[#F3F4F6]">Sentence Practice</h1>
          <p className="text-gray-500 dark:text-[#9CA3AF] font-medium tracking-tight">Improve Your Writing with Interactive Exercise.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#1C1625] p-4 rounded-[28px] shadow-sm flex flex-col items-center justify-center space-y-1 h-[100px] border border-transparent dark:border-[#2D2438]">
             <div className="flex items-center gap-2">
                <Image src="/book.svg" alt="Book" width={16} height={16} className="w-[16px] h-[16px] object-contain" />
                <span className="text-base sm:text-[18px] font-black text-black dark:text-[#F3F4F6]">{stats.practicedWords} {stats.practicedWords === 1 ? "Word" : "Words"}</span>
             </div>
             <span className="text-[13px] text-[#000000] dark:text-[#9CA3AF] uppercase tracking-tight">Words Practiced</span>
          </div>
          <div className="bg-white dark:bg-[#1C1625] p-4 rounded-[28px] shadow-sm flex flex-col items-center justify-center space-y-1 h-[100px] border border-transparent dark:border-[#2D2438]">
             <div className="flex items-center gap-2">
                <BarChart size={16} className="text-[#8A56A4]" fill="#8A56A4" />
                <span className="text-base sm:text-[18px] font-black text-black dark:text-[#F3F4F6]">{accuracy}%</span>
             </div>
             <span className="text-[13px] text-[#000000] dark:text-[#9CA3AF] uppercase tracking-tight">Average Accuracy</span>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-white dark:bg-[#1C1625] rounded-[20px] p-1.5 border border-gray-100 dark:border-[#2D2438] shadow-sm">
          <button
            onClick={() => setMode("sentence")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] text-[14px] font-bold transition-all duration-200",
              mode === "sentence"
                ? "bg-[#8A56A4] text-white shadow-md"
                : "text-gray-500 dark:text-[#9CA3AF] hover:text-[#8A56A4]"
            )}
          >
            <Lightbulb size={16} />
            Correct Sentence
          </button>
          <button
            onClick={() => setMode("writing")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] text-[14px] font-bold transition-all duration-200",
              mode === "writing"
                ? "bg-[#8A56A4] text-white shadow-md"
                : "text-gray-500 dark:text-[#9CA3AF] hover:text-[#8A56A4]"
            )}
          >
            <PenLine size={16} />
            Free Writing
          </button>
        </div>

        {mode === "writing" ? (
          <WritingCoach />
        ) : (
          <div className="bg-white dark:bg-[#1C1625] rounded-[40px] p-8 shadow-xl space-y-6 border border-gray-50 dark:border-[#2D2438] flex flex-col items-center text-center">
            <span className="bg-transparent text-[#8A56A4] dark:text-[#A87BC7]   dark:border-[#A87BC7] text-[13px] font-black px-4 py-1.5 rounded-[10px] uppercase tracking-wide">
                Correct The Sentence
            </span>

            <div className="space-y-4 w-full">
                <p className="text-[16px] text-black dark:text-[#F3F4F6] font-black uppercase tracking-wider opacity-60">Question</p>
                <h3 className="text-[20px] sm:text-[24px] font-black leading-tight text-black dark:text-[#F3F4F6]">
                    {currentSentence.question}
                </h3>
            </div>

            <div className="w-full space-y-4 pt-2">
                <div className="relative">
                    <input 
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !checking && handleCheckAnswer()}
                        disabled={feedback !== null || checking}
                        placeholder="Type Your Answer Here..."
                        className={cn(
                          "w-full h-[64px] bg-[#F3EEF6] dark:bg-[#0F0A15] border-2 rounded-[24px] px-6 pr-12 text-center text-[16px] font-bold outline-none transition-colors",
                          feedback === "correct" 
                            ? "border-green-500 text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-950/20" 
                            : feedback === "incorrect"
                              ? "border-red-500 text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-950/20"
                              : "border-[#E8DDED] dark:border-[#2D2438] text-[#8A56A4] dark:text-[#A87BC7] focus:border-[#8A56A4]"
                        )}
                    />
                    {feedback === "correct" && (
                        <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" />
                    )}
                    {feedback === "incorrect" && (
                        <XCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500" />
                    )}
                </div>
                
                {feedback === "incorrect" && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-[20px] text-[14px] font-bold text-left border border-red-100 dark:border-red-900/30">
                        <span className="block text-red-400 dark:text-red-500 text-[12px] uppercase mb-1">Correct Answer</span>
                        {currentSentence.answer.replace(/\*\*/g, '')}
                    </div>
                )}

                {feedback === "correct" && aiExplanation && (
                    <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-[20px] text-[14px] font-medium text-left border border-green-100 dark:border-green-900/30">
                        <span className="flex items-center gap-1.5 text-green-500 dark:text-green-400 text-[12px] uppercase font-bold mb-1">
                          <Lightbulb size={14} /> Grammar Note
                        </span>
                        {aiExplanation}
                    </div>
                )}

                {feedback === "incorrect" && aiExplanation && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 p-4 rounded-[20px] text-[14px] font-medium text-left border border-amber-100 dark:border-amber-900/30">
                        <span className="flex items-center gap-1.5 text-amber-500 dark:text-amber-400 text-[12px] uppercase font-bold mb-1">
                          <Lightbulb size={14} /> Why?
                        </span>
                        {aiExplanation}
                    </div>
                )}

                <button 
                  onClick={handleCheckAnswer}
                  disabled={checking}
                  className={cn(
                    "w-full h-[64px] text-white rounded-[24px] text-base sm:text-[18px] font-bold shadow-lg dark:shadow-none active:scale-95 transition-all flex items-center justify-center gap-2",
                    checking
                      ? "bg-[#8A56A4] opacity-80 cursor-wait"
                      : feedback !== null 
                        ? "bg-[#111] dark:bg-white text-white dark:text-black hover:opacity-90 shadow-gray-200" 
                        : "bg-[#8A56A4] shadow-purple-200"
                  )}
                >
                    {checking ? (
                        <><Loader2 size={20} className="animate-spin" /> Checking...</>
                    ) : feedback !== null ? (
                        <>Continue <ArrowRight size={20} /></>
                    ) : (
                        "Check Answer"
                    )}
                </button>
            </div>
          </div>
        )}

        <div className="space-y-4 pb-4">
            <h3 className="text-lg sm:text-[20px] font-black px-2 text-black dark:text-[#F3F4F6]">Practice Exercises</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ExerciseCategory 
                    icon={<Lightbulb size={24} />} 
                    title="Error Correction" 
                    desc="Identify and Fix Common Mistakes."
                    onClick={() => { setMode("sentence"); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                />
                <ExerciseCategory 
                    icon={<Type size={24} />} 
                    title="Tenses" 
                    desc="Practice All Forms Present, Past and Future."
                    onClick={() => setSelectedLesson(lessonsData.lessons.find((l: Lesson) => l.topic === "Tenses") || null)}
                />
                <ExerciseCategory 
                    icon={<Layers size={24} />} 
                    title="Articles & Preposition" 
                    desc="Master the use of articles and prepositions."
                    onClick={() => setSelectedLesson(lessonsData.lessons.find((l: Lesson) => l.topic === "Articles & Preposition") || null)}
                />
                <ExerciseCategory 
                    icon={<Layout size={24} />} 
                    title="Sentence Structure" 
                    desc="Learn to build complex sentences correctly."
                    onClick={() => setSelectedLesson(lessonsData.lessons.find((l: Lesson) => l.topic === "Sentence Structure") || null)}
                />
            </div>
        </div>

      </div>

      {selectedLesson && (
        <div className="fixed inset-0 z-60 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-6 transition-all">
            <div className="w-full max-w-[412px] md:max-w-[768px] bg-white dark:bg-[#1C1625] h-[85vh] sm:h-[80vh] rounded-t-[32px] sm:rounded-[32px] flex flex-col shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-300">
                <div className="p-6 border-b border-gray-100 dark:border-[#2D2438] flex justify-between items-center shrink-0">
                    <div className="space-y-1">
                        <h2 className="text-xl sm:text-2xl font-black text-black dark:text-[#F3F4F6]">{selectedLesson.topic}</h2>
                        <p className="text-[13px] font-bold text-gray-500 dark:text-[#9CA3AF] uppercase tracking-wider">{selectedLesson.title}</p>
                    </div>
                    <button 
                        onClick={() => setSelectedLesson(null)} 
                        className="w-10 h-10 shrink-0 bg-gray-100 dark:bg-[#2D2438] rounded-full flex items-center justify-center text-gray-500 dark:text-[#9CA3AF] hover:bg-gray-200 dark:hover:bg-[#3D334D] transition-colors active:scale-95"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 pb-24 space-y-4">
                    {selectedLesson.patterns.map((pattern: LessonPattern) => (
                        <div key={pattern.id} className="bg-[#F3EEF6] dark:bg-[#0F0A15] border border-[#E8DDED] dark:border-[#2D2438] p-5 rounded-[24px] space-y-3">
                            <div className="flex justify-between items-start gap-4">
                                <h3 className="text-[16px] sm:text-[18px] font-black leading-tight text-[#8A56A4] dark:text-[#A87BC7]">{pattern.pattern}</h3>
                                <span className="shrink-0 bg-white dark:bg-[#1C1625] px-3 py-1 rounded-[10px] text-[11px] font-bold text-black dark:text-[#F3F4F6] shadow-sm border border-gray-100 dark:border-[#2D2438]">
                                    {pattern.tense || pattern.rule || pattern.type}
                                </span>
                            </div>
                            {pattern.use && (
                                <p className="text-[14px] text-gray-600 dark:text-[#9CA3AF] font-medium leading-tight">
                                    <span className="font-bold text-black dark:text-white">Use: </span>{pattern.use}
                                </p>
                            )}
                            <div className="bg-white dark:bg-[#1C1625] p-4 rounded-[16px] border-l-4 border-green-500 dark:border-green-600 shadow-sm mt-3">
                                <p className="text-[14px] font-bold text-black dark:text-[#F3F4F6]">
                                    &quot;{pattern.example}&quot;
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

    </div>
  );
}

function ExerciseCategory({ icon, title, desc, onClick }: { icon: React.ReactNode, title: string, desc: string, onClick?: () => void }) {
    return (
        <div 
            onClick={onClick}
            className="bg-[#E8DDED] dark:bg-[#1C1625] p-5 rounded-[28px] shadow-sm flex flex-col gap-3 min-h-[160px] border border-transparent dark:border-[#2D2438] cursor-pointer hover:border-[#8A56A4] dark:hover:border-[#A87BC7] transition-all active:scale-95"
        >
            <div className="text-black dark:text-[#A87BC7]">
                {icon}
            </div>
            <div className="space-y-1">
                <h4 className="text-[16px] font-semibold leading-tight text-black dark:text-[#F3F4F6]">{title}</h4>
                <p className="text-[12px] text-gray-600 dark:text-[#9CA3AF] font-medium leading-tight">
                    {desc}
                </p>
            </div>
        </div>
    );
}
