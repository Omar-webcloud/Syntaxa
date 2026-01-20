export type Question = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

export const MOCK_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "She ___ to the market yesterday.",
    options: ["go", "went", "gone", "going"],
    correctAnswer: 1,
    explanation:
      "Because 'yesterday' indicates the past tense, we use 'went', the past form of 'go'.",
  },
  {
    id: 2,
    question: "I have ___ waiting for you for two hours.",
    options: ["be", "been", "being", "is"],
    correctAnswer: 1,
    explanation:
      "The Present Perfect Continuous tense uses 'have/has been + ing'.",
  },
  {
    id: 3,
    question: "He is the ___ boy in the class.",
    options: ["smart", "smarter", "smartest", "more smart"],
    correctAnswer: 2,
    explanation:
      "We use the superlative form 'smartest' when comparing one against a group (the class).",
  },
  {
    id: 4,
    question: "They ___ playing football when it started raining.",
    options: ["are", "were", "have", "had"],
    correctAnswer: 1,
    explanation:
      "Past Continuous tense: 'were playing' describes an action happening at a specific time in the past.",
  },
  {
    id: 5,
    question: "If I ___ you, I would accept the offer.",
    options: ["was", "am", "were", "be"],
    correctAnswer: 2,
    explanation:
      "In hypothetical conditional sentences (Second Conditional), we use 'were' for all subjects.",
  },
];
