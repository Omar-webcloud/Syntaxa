"use client";

import { useState } from "react";
import { PenTool, Check, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const PRACTICE_EXERCISES = [
  {
    type: "correction",
    question: "She don't like playing tennis.",
    answer: "She doesn't like playing tennis.",
    hint: "Think about the auxiliary verb for 'she' in present simple negative."
  },
  {
    type: "fill_blank",
    question: "I have ___ to London twice.",
    answer: "been",
    hint: "Past participle of 'be'."
  },
  {
    type: "correction",
    question: "He go to school every day.",
    answer: "He goes to school every day.",
    hint: "Third person singular adds 's' or 'es'."
  }
];

export default function Practice() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [showHint, setShowHint] = useState(false);

  const exercise = PRACTICE_EXERCISES[currentIndex];

  const checkAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    if (!userInput.trim()) return;

    const normalize = (s: string) => s.toLowerCase().trim().replace(/\.$/, "");
    
    if (normalize(userInput) === normalize(exercise.answer)) {
      setFeedback("correct");
    } else {
      setFeedback("incorrect");
    }
  };

  const nextExercise = () => {
    setFeedback(null);
    setUserInput("");
    setShowHint(false);
    setCurrentIndex((prev) => (prev + 1) % PRACTICE_EXERCISES.length);
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 pb-24">
       <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <PenTool className="text-violet-600" />
          Sentence Practice
        </h1>
        <p className="text-gray-500 text-sm">Improve your writing with interactive exercises.</p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Exercise {currentIndex + 1}/{PRACTICE_EXERCISES.length}
              </span>
              <span className={cn(
                  "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                  exercise.type === "correction" ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"
              )}>
                  {exercise.type === "correction" ? "Correct the Sentence" : "Fill in the Blank"}
              </span>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-8">
              <div className="text-center space-y-2">
                  <p className="text-gray-400 text-sm font-medium uppercase">Question</p>
                  <h3 className="text-2xl font-bold text-gray-800 leading-snug">
                      {exercise.question}
                  </h3>
              </div>

              <form onSubmit={checkAnswer} className="space-y-4">
                  <div className="relative">
                      <input 
                        type="text" 
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Type your answer here..."
                        className={cn(
                            "w-full p-4 rounded-xl border-2 outline-none transition-all text-center font-medium text-lg",
                            feedback === "correct" ? "border-green-500 bg-green-50 text-green-800" : 
                            feedback === "incorrect" ? "border-red-500 bg-red-50 text-red-800" :
                            "border-gray-200 focus:border-violet-500 focus:bg-white"
                        )}
                        disabled={feedback === "correct"}
                      />
                      {feedback === "correct" && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600">
                              <Check size={24} />
                          </div>
                      )}
                  </div>

                  <AnimatePresence>
                      {feedback === "incorrect" && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="text-center"
                          >
                            <p className="text-red-500 font-medium mb-2">Not quite right.</p>
                            {!showHint ? (
                                <button 
                                    type="button"
                                    onClick={() => setShowHint(true)}
                                    className="text-sm text-gray-500 underline hover:text-violet-600"
                                >
                                    Need a hint?
                                </button>
                            ) : (
                                <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded-lg inline-block px-4">
                                    💡 {exercise.hint}
                                </p>
                            )}
                          </motion.div>
                      )}
                  </AnimatePresence>

                  {!feedback ? (
                      <button 
                        type="submit"
                        className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-transform active:scale-95 shadow-lg"
                      >
                          Check Answer
                      </button>
                  ) : (
                       <button 
                        type="button"
                        onClick={nextExercise}
                        className={cn(
                            "w-full py-3.5 text-white rounded-xl font-bold shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2",
                            feedback === "correct" ? "bg-green-600 hover:bg-green-700" : "bg-gray-900 hover:bg-black"
                        )}
                      >
                          {feedback === "correct" ? "Next Exercise" : "Try Again / Skip"} 
                          {feedback === "correct" && <ArrowRight size={20} />}
                      </button>
                  )}
              </form>
               <AnimatePresence>
                {feedback === "incorrect" && (
                     <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center"
                     >
                         <button 
                            onClick={nextExercise}
                            className="text-gray-400 text-sm flex items-center justify-center gap-1 mx-auto hover:text-gray-600"
                         >
                             <RotateCcw size={14} /> Skip this question
                         </button>
                     </motion.div>
                )}
               </AnimatePresence>
          </div>
      </div>
    </div>
  );
}

}

function ArrowRight({ size, className }: { size?: number, className?: string }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    )
}
