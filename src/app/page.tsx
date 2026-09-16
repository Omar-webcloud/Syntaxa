"use client";

import { useState } from "react";
import QuizGame from "@/components/QuizGame";
import Dashboard from "@/components/Dashboard";

interface QuizOptions {
  aiGenerated?: boolean;
  weakTopics?: string[];
}

export default function Home() {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizOptions, setQuizOptions] = useState<QuizOptions>({});

  const handleStartQuiz = (options?: QuizOptions) => {
    setQuizOptions(options || {});
    setShowQuiz(true);
  };

  return (
    <main className="min-h-screen">
      {showQuiz ? (
        <QuizGame
          onBack={() => {
            setShowQuiz(false);
            setQuizOptions({});
          }}
          aiGenerated={quizOptions.aiGenerated}
          weakTopics={quizOptions.weakTopics}
        />
      ) : (
        <Dashboard onStartQuiz={handleStartQuiz} />
      )}
    </main>
  );
}
