// ─── AI Provider Types ─────────────────────────────────────────────

export interface AICompletionRequest {
  system: string;
  prompt: string;
  jsonMode?: boolean;
  maxTokens?: number;
}

export interface AICompletionResponse {
  text: string;
  provider: "groq" | "gemini";
  tokensUsed?: number;
}

export class AIError extends Error {
  constructor(
    message: string,
    public readonly provider?: "groq" | "gemini" | "both",
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "AIError";
  }
}

// ─── Check Answer (Practice) ───────────────────────────────────────

export interface CheckAnswerRequest {
  question: string;
  expectedAnswer: string;
  userAnswer: string;
}

export interface CheckAnswerResponse {
  isCorrect: boolean;
  explanation: string;
  correctedAnswer?: string;
}

// ─── Generate Quiz ─────────────────────────────────────────────────

export interface GenerateQuizRequest {
  weakTopics: string[];
  count: number;
}

export interface GenerateQuizQuestion {
  id: number;
  question: string;
  answer: string;
}

export type GenerateQuizResponse = GenerateQuizQuestion[];

// ─── Correct Writing (Writing Coach) ───────────────────────────────

export interface CorrectWritingRequest {
  text: string;
}

export interface WritingIssue {
  original: string;
  fixed: string;
  explanation: string;
}

export interface CorrectWritingResponse {
  corrected: string;
  hasErrors: boolean;
  issues: WritingIssue[];
}

// ─── Simplify Definition (Dictionary) ──────────────────────────────

export interface SimplifyDefinitionRequest {
  word: string;
  definitions: string[];
  partOfSpeech: string[];
}

export interface SimplifiedSense {
  partOfSpeech: string;
  simpleDefinition: string;
  example: string;
}

export interface SimplifyDefinitionResponse {
  word: string;
  senses: SimplifiedSense[];
}

// ─── Translate (Dictionary) ────────────────────────────────────────

export type TranslateDirection = "en-ko" | "ko-en" | "en-bn" | "bn-en";

export interface TranslateRequest {
  text: string;
  direction: TranslateDirection;
}

export interface TranslateResponse {
  translated: string;
  romanization?: string;
  notes?: string;
  example?: {
    source: string;
    target: string;
  };
}

// ─── Weak Topic Tracking ───────────────────────────────────────────

export interface WeakTopicStats {
  wrong: number;
  total: number;
}

export type WeakTopicsMap = Record<string, WeakTopicStats>;

// ─── API Error Response ────────────────────────────────────────────

export interface APIErrorResponse {
  error: true;
  message: string;
  fallback?: boolean;
}
