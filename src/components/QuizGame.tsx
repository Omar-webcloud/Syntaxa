"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, ArrowRight, RotateCcw, ArrowLeft, Sparkles } from "lucide-react";
import quizData from "@/data/quiz.json";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import type { WeakTopicsMap } from "@/lib/ai/types";

type QuizQuestion = {
  id: number;
  questionText: string;
  options: string[];
  answer: string;
};

interface QuizGameProps {
  onBack: () => void;
  aiGenerated?: boolean;
  weakTopics?: string[];
}

// Topic keywords used to map questions → lesson topics for weak-topic tracking
const TOPIC_KEYWORDS: Record<string, string[]> = {
  "Tenses": ["was", "were", "is", "are", "am", "has", "have", "had", "will", "shall", "going to", "been", "did", "does", "do", "verb+ing", "past", "present", "future", "tense", "continuous", "perfect"],
  "Articles & Preposition": ["a", "an", "the", "in", "on", "at", "of", "to", "for", "from", "with", "by", "since", "during", "between", "among", "preposition", "article"],
  "Sentence Structure": ["clause", "conjunction", "although", "because", "if", "who", "which", "that", "too", "enough", "so...that", "structure", "sentence"],
};

function guessQuestionTopic(question: string): string {
  const q = question.toLowerCase();
  let bestTopic = "General";
  let bestScore = 0;

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (q.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestTopic = topic;
    }
  }

  return bestTopic;
}

export default function QuizGame({ onBack, aiGenerated = false, weakTopics = [] }: QuizGameProps) {
  const { user, isAuthenticated } = useAuth();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [isAiQuiz, setIsAiQuiz] = useState(false);
  // Track per-question results for weak-topic logging
  const [questionResults, setQuestionResults] = useState<Array<{ questionText: string; correct: boolean }>>([]);

  const MAX_QUESTIONS = 10;

  const processRawQuestions = (rawQuestions: Array<{ id: number; question: string; answer: string }>) => {
    const allAnswers = Array.from(
      new Set([...quizData, ...rawQuestions].map((q) => q.answer)),
    );

    return rawQuestions.map((q) => {
      let options: string[] = [];
      const match = q.question.match(/\((.*?)\)/);
      let questionText = q.question;

      if (match) {
        options = match[1].split("/").map((s) => s.trim());
        questionText = q.question.replace(/\s*\(.*?\)/, "");
      }

      if (!options.includes(q.answer)) {
        options.push(q.answer);
      }

      while (options.length < 4) {
        const randomAnswer =
          allAnswers[Math.floor(Math.random() * allAnswers.length)];
        if (!options.includes(randomAnswer)) {
          options.push(randomAnswer);
        }
      }

      options = options.slice(0, 4).sort(() => 0.5 - Math.random());

      return {
        id: q.id,
        questionText,
        options,
        answer: q.answer,
      };
    });
  };

  const initQuizFromStatic = () => {
    const shuffled = [...quizData]
      .sort(() => 0.5 - Math.random())
      .slice(0, MAX_QUESTIONS);
    const processed = processRawQuestions(shuffled);
    setQuestions(processed);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setFeedback(null);
    setQuizFinished(false);
    setIsAiQuiz(false);
    setQuestionResults([]);
  };

  const initQuizFromAI = async (topics: string[]) => {
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weakTopics: topics, count: MAX_QUESTIONS }),
      });

      if (res.ok) {
        const rawQuestions = await res.json();
        const processed = processRawQuestions(rawQuestions);
        setQuestions(processed);
        setCurrentQuestionIndex(0);
        setScore(0);
        setSelectedOption(null);
        setFeedback(null);
        setQuizFinished(false);
        setIsAiQuiz(true);
        setQuestionResults([]);
        return;
      }
    } catch (err) {
      console.error("AI quiz generation failed:", err);
    }

    // Fallback to static
    toast.error("Couldn't generate a custom quiz, here's one from our question bank");
    initQuizFromStatic();
    setGenerating(false);
  };

  useEffect(() => {
    setMounted(true);
    const savedState = localStorage.getItem("syntaxa_quiz_state");
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setQuestions(parsed.questions);
        setCurrentQuestionIndex(parsed.currentQuestionIndex);
        setScore(parsed.score);
        setSelectedOption(parsed.selectedOption);
        setFeedback(parsed.feedback);
        setQuizFinished(parsed.quizFinished);
        setIsAiQuiz(parsed.isAiQuiz || false);
        setQuestionResults(parsed.questionResults || []);
        return;
      } catch (e) {
         console.error(e);
      }
    }

    if (aiGenerated && weakTopics.length > 0) {
      initQuizFromAI(weakTopics);
    } else {
      initQuizFromStatic();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mounted && questions.length > 0) {
      localStorage.setItem("syntaxa_quiz_state", JSON.stringify({
        questions,
        currentQuestionIndex,
        score,
        selectedOption,
        feedback,
        quizFinished,
        isAiQuiz,
        questionResults,
      }));
    }
  }, [questions, currentQuestionIndex, score, selectedOption, feedback, quizFinished, mounted, isAiQuiz, questionResults]);

  // Log weak topics on quiz completion
  useEffect(() => {
    if (!quizFinished || questionResults.length === 0) return;

    try {
      const stored = localStorage.getItem("syntaxa_weak_topics");
      const weakMap: WeakTopicsMap = stored ? JSON.parse(stored) : {};

      for (const result of questionResults) {
        const topic = guessQuestionTopic(result.questionText);
        if (!weakMap[topic]) {
          weakMap[topic] = { wrong: 0, total: 0 };
        }
        weakMap[topic].total += 1;
        if (!result.correct) {
          weakMap[topic].wrong += 1;
        }
      }

      localStorage.setItem("syntaxa_weak_topics", JSON.stringify(weakMap));
    } catch (err) {
      console.error("Failed to save weak topics:", err);
    }
  }, [quizFinished, questionResults]);

  if (!mounted || (questions.length === 0 && !generating)) return null;

  if (generating) {
    return (
      <div className="min-h-screen bg-[#F3EEF6] dark:bg-[#0F0A15] font-sans text-black dark:text-[#F3F4F6] flex flex-col items-center justify-center pb-24 transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-[#F0E4FF] dark:bg-[#2D1F3D] rounded-full flex items-center justify-center">
            <Sparkles className="text-[#8A56A4] dark:text-[#A87BC7] animate-pulse" size={32} />
          </div>
          <p className="text-lg font-bold text-[#8A56A4] dark:text-[#A87BC7]">Generating your quiz...</p>
          <p className="text-sm text-gray-500 dark:text-[#9CA3AF]">Creating questions tailored to your weak spots</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / MAX_QUESTIONS) * 100;

  const handleAction = () => {
    if (feedback !== null) {
      // Record this question's result
      const isCorrect = feedback === "correct";
      setQuestionResults((prev) => [
        ...prev,
        { questionText: currentQ.questionText, correct: isCorrect },
      ]);

      if (currentQuestionIndex + 1 >= MAX_QUESTIONS) {
        setQuizFinished(true);
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedOption(null);
        setFeedback(null);
      }
      return;
    }

    if (selectedOption === null) return;

    if (currentQ.options[selectedOption] === currentQ.answer) {
      setScore(prev => prev + 1);
      setFeedback("correct");
    } else {
      setFeedback("incorrect");
    }
  };

  const handlePlayAgain = () => {
    if (isAiQuiz && weakTopics && weakTopics.length > 0) {
      initQuizFromAI(weakTopics);
    } else {
      initQuizFromStatic();
    }
  };

  return (
    <div className="min-h-screen bg-[#F3EEF6] dark:bg-[#0F0A15] font-sans text-black dark:text-[#F3F4F6] flex flex-col items-center pb-24 transition-colors duration-300">
      <div className="w-full max-w-[412px] md:max-w-[768px] p-6 space-y-6">
        
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white dark:bg-[#1C1625] flex items-center justify-center shadow-sm border border-gray-100 dark:border-[#2D2438] active:scale-95 transition-all mb-2"
        >
          <ArrowLeft size={20} className="text-[#8A56A4] dark:text-[#A87BC7]" />
        </button>

        <div className="space-y-1">
          <p className="text-base sm:text-[18px] font-semibold text-[#111] dark:text-[#9CA3AF] opacity-80">
            Welcome {isAuthenticated ? `Back, ${user?.username}!` : "to Syntaxa!"}
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111] dark:text-[#F3F4F6]">
            {isAiQuiz ? (
              <span className="flex items-center gap-2">
                <Sparkles size={24} className="text-[#FC9502]" />
                AI-Generated Quiz
              </span>
            ) : (
              "Your Daily Quiz"
            )}
          </h1>
        </div>

        {!quizFinished ? (
          <>
            <div className="space-y-3">
              <div className="flex justify-between text-[14px] font-bold text-gray-500 dark:text-[#9CA3AF]">
                 <span>Question {currentQuestionIndex + 1}/{MAX_QUESTIONS}</span>
                 <span>{score} Corrects</span>
              </div>
              <div className="h-[12px] w-full bg-[#FFE0B2] dark:bg-[#2C1F10] rounded-full overflow-hidden border border-transparent dark:border-[#2D2438]">
                 <div 
                    className="h-full bg-[#FC9502] rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }} 
                 />
              </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div 
                    key={currentQ.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white dark:bg-[#1C1625] rounded-[40px] p-6 sm:p-8 shadow-xl space-y-8 mt-10 border border-gray-50 dark:border-[#2D2438]"
                >
                    <div className="flex justify-between items-center">
                        <span className="bg-[#F0E4FF] dark:bg-[#2D1F3D] text-[#8A56A4] dark:text-[#A87BC7] text-[14px] font-bold px-4 py-1.5 rounded-full">
                            Fill In
                        </span>
                        <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity">
                            <span className="text-[14px] font-bold text-[#FC9502]">Hint (-5)</span>
                            <span className="text-xl">💎</span>
                        </div>
                    </div>

                    <h3 className="text-[20px] sm:text-[22px] font-black leading-tight text-black dark:text-[#F3F4F6]">
                        {currentQ.questionText}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {currentQ.options.map((option, idx) => {
                            let optionClass = "border-[#E8DDED] dark:border-[#2D2438] text-black dark:text-white bg-transparent";
                            
                            if (feedback === null) {
                                if (selectedOption === idx) {
                                    optionClass = "border-[#8A56A4] bg-[#F0E4FF] dark:bg-[#2D1F3D] text-[#8A56A4] dark:text-[#A87BC7]";
                                } else {
                                    optionClass += " hover:border-[#8A56A4]";
                                }
                            } else {
                                if (option === currentQ.answer) {
                                    optionClass = "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-500";
                                } else if (selectedOption === idx && option !== currentQ.answer) {
                                    optionClass = "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-500";
                                } else {
                                    optionClass = "border-gray-100 dark:border-[#2D2438] opacity-50";
                                }
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedOption(idx)}
                                    disabled={feedback !== null}
                                    className={cn(
                                        "w-full h-[60px] rounded-[24px] border-2 text-center text-base sm:text-[18px] font-medium transition-all duration-200 relative",
                                        optionClass
                                    )}
                                >
                                    {option}
                                    {feedback !== null && option === currentQ.answer && (
                                        <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                                    )}
                                    {feedback !== null && selectedOption === idx && option !== currentQ.answer && (
                                        <XCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    {feedback === "incorrect" && (
                        <div className="mt-4 text-center">
                            <span className="text-[14px] font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-full">
                                Keep trying! The correct answer was {currentQ.answer}.
                            </span>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            <div className="pt-6">
                <button 
                    onClick={handleAction}
                    disabled={feedback === null && selectedOption === null}
                    className={cn(
                        "w-full h-[64px] text-white rounded-[24px] text-base sm:text-[18px] font-bold shadow-lg transition-all flex items-center justify-center gap-2",
                        feedback === null && selectedOption === null
                            ? "bg-gray-300 dark:bg-[#2D2438] text-gray-500 dark:text-gray-400 shadow-none cursor-not-allowed"
                            : feedback !== null 
                                ? "bg-[#111] dark:bg-white text-white dark:text-black hover:opacity-90 dark:shadow-none shadow-gray-200 active:scale-95"
                                : "bg-[#8A56A4] shadow-purple-200 dark:shadow-none hover:bg-[#7D4D95] active:scale-95"
                    )}
                >
                    {feedback !== null ? (
                        <>Continue <ArrowRight size={20} /></>
                    ) : (
                        "Check Answer"
                    )}
                </button>
            </div>
          </>
        ) : (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-[#1C1625] rounded-[40px] p-8 shadow-xl text-center space-y-6 mt-10 border border-gray-50 dark:border-[#2D2438]"
            >
                <div>
                    <span className="text-6xl mb-4 block">{score >= 8 ? '🏆' : score >= 5 ? '🌟' : '📚'}</span>
                    <h2 className="text-2xl sm:text-3xl font-black text-black dark:text-white">Quiz Completed!</h2>
                    <p className="text-gray-500 dark:text-[#9CA3AF] mt-2 font-medium">You scored {score} out of {MAX_QUESTIONS}</p>
                </div>
                
                <div className="flex items-center justify-center gap-2 text-[#8A56A4] dark:text-[#A87BC7] font-bold text-[18px]">
                    Accuracy: {Math.round((score / MAX_QUESTIONS) * 100)}%
                </div>

                <div className="space-y-3">
                    <button 
                        onClick={handlePlayAgain}
                        className="w-full h-[60px] bg-[#8A56A4] text-white rounded-[24px] text-base sm:text-[18px] font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-purple-200 dark:shadow-none"
                    >
                        <RotateCcw size={20} /> Play Again
                    </button>

                    <button 
                        onClick={onBack}
                        className="w-full h-[60px] bg-transparent border-2 border-gray-100 dark:border-[#2D2438] text-gray-900 dark:text-white rounded-[24px] text-base sm:text-[18px] font-bold flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-gray-50 dark:hover:bg-[#2D2438]/50"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </motion.div>
        )}

      </div>
    </div>
  );
}
