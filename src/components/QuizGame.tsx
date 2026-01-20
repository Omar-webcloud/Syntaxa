"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ArrowRight, Lightbulb, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_QUESTIONS } from "@/data/mockQuiz";

export default function QuizGame() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [gems, setGems] = useState(10);
  const [showExplanation, setShowExplanation] = useState(false);

  const MAX_QUESTIONS = 10;
  const question = MOCK_QUESTIONS[currentQuestionIndex % MOCK_QUESTIONS.length];

  const handleOptionClick = (index: number) => {
    if (selectedOption !== null) return;

    setSelectedOption(index);
    const correct = index === question.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setScore(score + 1);
    } else {
      setLives(Math.max(0, lives - 1));
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsCorrect(null);
    setShowExplanation(false);
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const progress = ((currentQuestionIndex) / MAX_QUESTIONS) * 100;

  if (currentQuestionIndex >= MAX_QUESTIONS) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-4xl">🏆</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quiz Completed!</h2>
          <p className="text-gray-500 mt-2">You scored {score} out of {MAX_QUESTIONS}</p>
        </div>
        <div className="bg-violet-50 p-4 rounded-xl w-full border border-violet-100">
          <p className="text-violet-700 font-medium">Rewards Earned</p>
          <div className="flex items-center justify-center gap-2 mt-2">
             <span className="text-2xl">💎</span>
             <span className="text-xl font-bold text-gray-800">{score === MAX_QUESTIONS ? 1 : 0}</span>
          </div>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="w-full bg-violet-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-violet-700 transition"
        >
          Play Again
        </button>
      </div>
    );
  }

  if (lives === 0) {
    return (
       <div className="flex flex-col items-center justify-center p-6 text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center shadow-lg">
          <Heart className="w-12 h-12 text-red-500" fill="currentColor" />
        </div>
         <div>
          <h2 className="text-2xl font-bold text-gray-800">Out of Lives!</h2>
          <p className="text-gray-500 mt-2">Don&apos;t worry, they refill soon.</p>
        </div>
         <button 
          onClick={() => window.location.reload()}
          className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-red-600 transition"
        >
          Restart Session
        </button>
       </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-6 pb-24">
      <div className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2">
            <div className="bg-red-50 p-1.5 rounded-lg">
                <Heart className="w-5 h-5 text-red-500" fill="currentColor" />
            </div>
            <span className="font-bold text-gray-700">{lives}</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="font-bold text-gray-700">{gems}</span>
            <div className="bg-blue-50 p-1.5 rounded-lg">
                <span className="text-lg">💎</span>
            </div>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs font-medium text-gray-400">
            <span>Question {currentQuestionIndex + 1}/{MAX_QUESTIONS}</span>
            <span>{score} Correct</span>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
                className="h-full bg-violet-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
            />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 min-h-[300px] flex flex-col justify-between"
        >
            <div className="space-y-4">
                <div className="flex justify-between items-start">
                    <span className="bg-violet-100 text-violet-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                        Fill in
                    </span>
                    <button className="text-yellow-500 hover:text-yellow-600 transition" onClick={() => {
                        if (gems > 0) {
                            setGems(prev => prev - 1);
                            setShowExplanation(true);
                        }
                    }}>
                         <div className="flex items-center gap-1">
                             <span className="text-xs font-bold text-yellow-600">{gems > 0 ? "Hint (-1💎)" : "No Gems"}</span>
                             <Lightbulb size={20} />
                         </div>
                    </button>
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 leading-relaxed">
                   {question.question.split("___").map((part, i, arr) => (
                       <span key={i}>
                           {part}
                           {i < arr.length - 1 && (
                               <span className="mx-1 px-3 py-1 border-b-2 border-dashed border-gray-300 text-gray-400 font-mono inline-block min-w-[50px] text-center">
                                   ?
                               </span>
                           )}
                       </span>
                   ))}
                </h3>
                   {showExplanation && (
                       <motion.div 
                           initial={{ opacity: 0, height: 0 }}
                           animate={{ opacity: 1, height: "auto" }}
                           className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-sm mt-2"
                       >
                           <strong>Hint:</strong> {question.explanation}
                       </motion.div>
                   )}
            </div>

            <div className="mt-8 space-y-3">
                {question.options.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrectOption = idx === question.correctAnswer;
                    const showResult = selectedOption !== null;

                    let buttonClass = "border-gray-200 hover:border-violet-300 hover:bg-violet-50";
                    if (showResult) {
                        if (isSelected && isCorrectOption) {
                            buttonClass = "border-green-500 bg-green-50 text-green-700";
                        } else if (isSelected && !isCorrectOption) {
                            buttonClass = "border-red-500 bg-red-50 text-red-700";
                        } else if (isCorrectOption) {
                             buttonClass = "border-green-500 bg-green-50 text-green-700 opacity-60";
                        } else {
                            buttonClass = "border-gray-100 opacity-50";
                        }
                    }

                    return (
                        <button
                            key={idx}
                            disabled={showResult}
                            onClick={() => handleOptionClick(idx)}
                            className={cn(
                                "w-full p-4 rounded-xl border-2 text-left font-medium transition-all duration-200 flex justify-between items-center group",
                                buttonClass
                            )}
                        >
                            <span className="group-hover:translate-x-1 transition-transform">{option}</span>
                            {showResult && isSelected && (
                                isCorrectOption 
                                ? <CheckCircle2 className="text-green-500" size={20} />
                                : <XCircle className="text-red-500" size={20} />
                            )}
                        </button>
                    )
                })}
            </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
          {selectedOption !== null && (
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                      "p-4 rounded-2xl flex flex-col gap-3",
                      isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  )}
              >
                  <div className="flex items-center gap-2 font-bold">
                      {isCorrect ? "Brilliant! 🎉" : "Not quite right..."}
                  </div>
                  <p className="text-sm opacity-90">
                      {question.explanation}
                  </p>
                   <button
                        onClick={handleNext}
                        className={cn(
                            "w-full py-3 rounded-xl font-bold shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-2 mt-2",
                            isCorrect ? "bg-green-600 text-white hover:bg-green-700" : "bg-red-600 text-white hover:bg-red-700"
                        )}
                    >
                        Continue <ArrowRight size={18} />
                    </button>
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}
