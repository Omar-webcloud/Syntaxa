"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, ArrowRight, RotateCcw, ArrowLeft, Sparkles, GraduationCap, Lightbulb } from "lucide-react";
import quizData from "@/data/quiz.json";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import { recordQuizCompleted, recordSkillPerformance, useUserStats } from "@/lib/userStats";
import type { WeakTopicsMap } from "@/lib/ai/types";

type QuizQuestion = {
  id: number;
  questionText: string;
  options: string[];
  answer: string;
};

type QuizTopic = "Tenses" | "Verbs" | "Articles" | "Prepositions";

interface QuizGameProps {
  onBack: () => void;
  aiGenerated?: boolean;
  weakTopics?: string[];
  advancedQuiz?: boolean;
  quizTopic?: string;
}

// Topic keywords used to map questions → lesson topics for weak-topic tracking
const TOPIC_KEYWORDS: Record<string, string[]> = {
  "Tenses": ["was", "were", "is", "are", "am", "has", "have", "had", "will", "shall", "going to", "been", "did", "does", "do", "verb+ing", "past", "present", "future", "tense", "continuous", "perfect"],
  "Articles & Preposition": ["a", "an", "the", "in", "on", "at", "of", "to", "for", "from", "with", "by", "since", "during", "between", "among", "preposition", "article"],
  "Sentence Structure": ["clause", "conjunction", "although", "because", "if", "who", "which", "that", "too", "enough", "so...that", "structure", "sentence"],
};

// Keep the dashboard topics tied to the curated question bank. Questions outside
// these groups remain available to the general daily quiz, but cannot leak into
// a focused topic quiz.
const TOPIC_QUESTION_IDS: Record<QuizTopic, number[]> = {
  Tenses: [1, 2, 3, 4, 5, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 36, 37, 38, 39, 40, 56, 57, 58, 59, 60, 91, 92, 93, 94, 95, 101, 102, 103, 104, 105],
  Verbs: [6, 7, 8, 9, 10, 46, 47, 48, 49, 50, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 81, 82, 83, 84, 85, 106, 107, 108, 109, 110],
  Articles: [26, 27, 28, 29, 30, 96, 97, 98, 99, 100, 111, 112, 113, 114, 115],
  Prepositions: [21, 22, 23, 24, 25, 31, 32, 33, 34, 35, 116, 117, 118, 119, 120],
};

const FALLBACK_TOPIC_IDS: Record<string, number[]> = {
  "Articles & Preposition": [...TOPIC_QUESTION_IDS.Articles, ...TOPIC_QUESTION_IDS.Prepositions],
  "Sentence Structure": [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 51, 52, 53, 54, 55, 76, 77, 78, 79, 80, 86, 87, 88, 89, 90],
};

function getStaticQuestionPool(topics: string[]) {
  const ids = new Set(topics.flatMap((topic) => TOPIC_QUESTION_IDS[topic as QuizTopic] || FALLBACK_TOPIC_IDS[topic] || []));
  return ids.size ? quizData.filter((question) => ids.has(question.id)) : quizData;
}

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

export default function QuizGame({ onBack, aiGenerated = false, weakTopics = [], advancedQuiz = false, quizTopic }: QuizGameProps) {
  const { user, isAuthenticated } = useAuth();
  const { stats } = useUserStats();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [isAiQuiz, setIsAiQuiz] = useState(false);
  const [quizRunId, setQuizRunId] = useState("");
  const [completionRecorded, setCompletionRecorded] = useState(false);
  // Track per-question results for weak-topic logging
  const [questionResults, setQuestionResults] = useState<Array<{ questionText: string; correct: boolean }>>([]);
  const [showHint, setShowHint] = useState(false);

  const MAX_QUESTIONS = 10;
  const createQuizRunId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const normalizedQuizTopic = quizTopic && quizTopic in TOPIC_QUESTION_IDS
    ? quizTopic as QuizTopic
    : undefined;
  const quizStorageKey = normalizedQuizTopic
    ? `syntaxa_topic_quiz_state_${normalizedQuizTopic.toLowerCase()}`
    : aiGenerated
      ? `syntaxa_ai_quiz_state_${[...weakTopics].sort().join("-").toLowerCase() || "custom"}`
      : advancedQuiz ? "syntaxa_advanced_quiz_state" : "syntaxa_quiz_state";

  const processRawQuestions = (
    rawQuestions: Array<{ id: number; question: string; answer: string }>,
    answerPool: Array<{ answer: string }> = quizData,
  ) => {
    const allAnswers = Array.from(
      new Set([...answerPool, ...rawQuestions].map((q) => q.answer)),
    );

    return rawQuestions.map((q) => {
      let options: string[] = [];
      const matches = [...q.question.matchAll(/\(([^()]*)\)/g)];
      let questionText = q.question;

      if (matches.length === 1 && q.question.includes("___")) {
        options = matches[0][1].split("/").map((s) => s.trim()).filter(Boolean);
        questionText = q.question.replace(/\s*\([^()]*\)/, "").trim();
      } else {
        throw new Error("Quiz question has an invalid format");
      }

      if (options.length < 2 || options.length > 4 || new Set(options.map((option) => option.toLowerCase())).size !== options.length) {
        throw new Error("Quiz question has an invalid option set");
      }
      const matchingAnswer = options.find((option) => option.toLowerCase() === q.answer.trim().toLowerCase());
      if (!matchingAnswer) {
        throw new Error("Quiz answer does not match its options");
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
        answer: matchingAnswer,
      };
    });
  };

  const initQuizFromStatic = (focusTopics: string[] = []) => {
    const sourceQuestions = normalizedQuizTopic
      ? getStaticQuestionPool([normalizedQuizTopic])
      : getStaticQuestionPool(focusTopics);
    const shuffled = [...sourceQuestions]
      .sort(() => 0.5 - Math.random())
      .slice(0, MAX_QUESTIONS);
    const processed = processRawQuestions(shuffled, sourceQuestions);
    setQuestions(processed);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setFeedback(null);
    setQuizFinished(false);
    setIsAiQuiz(false);
    setQuizRunId(createQuizRunId());
    setCompletionRecorded(false);
    setQuestionResults([]);
    setShowHint(false);
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
        setQuizRunId(createQuizRunId());
        setCompletionRecorded(false);
        setQuestionResults([]);
        setShowHint(false);
        setGenerating(false);
        return;
      }
    } catch (err) {
      console.error("AI quiz generation failed:", err);
    }

    // Fallback to a curated quiz targeting the same weak topics.
    toast.error("Couldn't generate a custom quiz, here's one from our question bank");
    initQuizFromStatic(weakTopics);
    setGenerating(false);
  };

  useEffect(() => {
    setMounted(true);
    const savedState = localStorage.getItem(quizStorageKey);
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
        setQuizRunId(parsed.quizRunId || `legacy_${quizStorageKey}`);
        setCompletionRecorded(parsed.completionRecorded === true);
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
      localStorage.setItem(quizStorageKey, JSON.stringify({
        questions,
        currentQuestionIndex,
        score,
        selectedOption,
        feedback,
        quizFinished,
        isAiQuiz,
        quizRunId,
        completionRecorded,
        questionResults,
      }));
    }
  }, [questions, currentQuestionIndex, score, selectedOption, feedback, quizFinished, mounted, isAiQuiz, quizRunId, completionRecorded, questionResults, quizStorageKey]);

  // Log weak topics and dynamic stats on quiz completion
  useEffect(() => {
    if (!quizFinished || questionResults.length === 0 || completionRecorded || !quizRunId) return;

    try {
      const completionKey = `syntaxa_completed_quiz_${quizStorageKey}_${quizRunId}`;
      if (localStorage.getItem(completionKey)) {
        setCompletionRecorded(true);
        return;
      }
      localStorage.setItem(completionKey, "1");
      const topicName = isAiQuiz ? "AI Practice Quiz" : "Daily Grammar Quiz";
      recordQuizCompleted(topicName, score, MAX_QUESTIONS, quizRunId);

      const stored = localStorage.getItem("syntaxa_weak_topics");
      const weakMap: WeakTopicsMap = stored ? JSON.parse(stored) : {};

      for (const result of questionResults) {
        const topic = guessQuestionTopic(result.questionText);
        recordSkillPerformance(topic, result.correct);
        if (!weakMap[topic]) {
          weakMap[topic] = { wrong: 0, total: 0 };
        }
        weakMap[topic].total += 1;
        if (!result.correct) {
          weakMap[topic].wrong += 1;
        }
      }

      localStorage.setItem("syntaxa_weak_topics", JSON.stringify(weakMap));
      setCompletionRecorded(true);
    } catch (err) {
      console.error("Failed to save quiz results:", err);
    }
  }, [quizFinished, questionResults, score, isAiQuiz, completionRecorded, quizRunId, quizStorageKey]);

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
        setShowHint(false);
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
            {advancedQuiz ? (
              <span className="flex items-center gap-2">
                <GraduationCap size={24} className="text-[#FC9502]" />
                Advanced Quiz
              </span>
            ) : isAiQuiz ? (
              <span className="flex items-center gap-2">
                <Sparkles size={24} className="text-[#FC9502]" />
                AI-Generated Quiz
              </span>
            ) : (
              normalizedQuizTopic ? `${normalizedQuizTopic} Quiz` : "Your Daily Quiz"
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
                        <button
                          type="button"
                          onClick={() => stats.hintUnlocked && setShowHint((visible) => !visible)}
                          disabled={!stats.hintUnlocked}
                          className={cn("flex items-center gap-1.5 transition-opacity", stats.hintUnlocked ? "cursor-pointer hover:opacity-80" : "cursor-not-allowed opacity-60")}
                        >
                          <Lightbulb size={16} className={stats.hintUnlocked ? "text-[#FC9502]" : "text-gray-400"} />
                          <span className="text-[14px] font-bold text-[#FC9502]">{stats.hintUnlocked ? "Hint" : "Hint locked"}</span>
                          {!stats.hintUnlocked && <span className="text-xs text-gray-400">(Rewards)</span>}
                        </button>
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
                    {showHint && stats.hintUnlocked && feedback === null && (
                      <div className="rounded-2xl bg-[#FFF9E5] px-4 py-3 text-sm font-medium text-gray-700 dark:bg-[#2D2A1F] dark:text-gray-300">
                        Hint: look for the grammar clue in the sentence, such as the subject or time expression.
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
