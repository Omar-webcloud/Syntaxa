"use client";

import { useState } from "react";
import QuizGame from "@/components/QuizGame";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const [showQuiz, setShowQuiz] = useState(false);

  return (
    <main className="min-h-screen">
      {showQuiz ? (
        <QuizGame />
      ) : (
        <Dashboard onStartQuiz={() => setShowQuiz(true)} />
      )}
    </main>
  );
}
