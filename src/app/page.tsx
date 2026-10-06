"use client";

import { useState } from "react";
import QuizGame from "@/components/QuizGame";
import Dashboard from "@/components/Dashboard";
import GuidedLesson from "@/components/GuidedLesson";

interface QuizOptions {
  aiGenerated?: boolean;
  weakTopics?: string[];
}

export default function Home() {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizOptions, setQuizOptions] = useState<QuizOptions>({});
  const [lessonSkill, setLessonSkill] = useState<string | null>(null);

  const handleStartQuiz = (options?: QuizOptions) => {
    setQuizOptions(options || {});
    setShowQuiz(true);
  };

  return (
    <main className="min-h-screen">
      {lessonSkill ? (
        <GuidedLesson skill={lessonSkill} onBack={() => setLessonSkill(null)} />
      ) : showQuiz ? (
        <QuizGame
          onBack={() => {
            setShowQuiz(false);
            setQuizOptions({});
          }}
          aiGenerated={quizOptions.aiGenerated}
          weakTopics={quizOptions.weakTopics}
        />
      ) : (
        <Dashboard onStartQuiz={handleStartQuiz} onStartLesson={setLessonSkill} />
      )}
    </main>
  );
}
