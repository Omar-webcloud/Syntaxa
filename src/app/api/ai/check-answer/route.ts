import { NextRequest, NextResponse } from "next/server";
import { complete } from "@/lib/ai";
import { checkRateLimit, getClientIP } from "@/lib/ai/rate-limit";
import { getCached, setCache, cacheKey, TTL } from "@/lib/ai/cache";
import type {
  CheckAnswerRequest,
  CheckAnswerResponse,
  APIErrorResponse,
} from "@/lib/ai/types";

const SYSTEM_PROMPT = `You are a strict but encouraging English grammar tutor. Given a fill-in-the-blank sentence, the expected answer, and a student's answer, decide if the student's answer is grammatically and semantically acceptable (accept valid synonyms, contractions, and minor spelling variants; reject wrong tense/form/meaning). Respond ONLY with JSON: {"isCorrect": boolean, "explanation": "one or two short sentences explaining the grammar rule, written for an intermediate English learner", "correctedAnswer": "the correct answer if student was wrong, omit if correct"}.`;

export async function POST(request: NextRequest) {
  // Rate limit
  const ip = getClientIP(request);
  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json<APIErrorResponse>(
      { error: true, message: "Too many requests", fallback: true },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfter) },
      },
    );
  }

  // Parse body
  let body: CheckAnswerRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<APIErrorResponse>(
      { error: true, message: "Invalid request body" },
      { status: 400 },
    );
  }

  const { question, expectedAnswer, userAnswer } = body;
  if (!question || !expectedAnswer || !userAnswer) {
    return NextResponse.json<APIErrorResponse>(
      { error: true, message: "Missing required fields" },
      { status: 400 },
    );
  }

  // Check cache
  const key = cacheKey("check-answer", question, expectedAnswer, userAnswer);
  const cached = getCached(key);
  if (cached) {
    return NextResponse.json<CheckAnswerResponse>(JSON.parse(cached));
  }

  // Call AI
  try {
    const prompt = `Sentence: "${question}"
Expected answer: "${expectedAnswer}"
Student's answer: "${userAnswer}"

Judge whether the student's answer is acceptable for the blank.`;

    const result = await complete({
      system: SYSTEM_PROMPT,
      prompt,
      jsonMode: true,
      maxTokens: 200,
    });

    const parsed = JSON.parse(result.text) as CheckAnswerResponse;

    // Validate response shape
    if (typeof parsed.isCorrect !== "boolean" || typeof parsed.explanation !== "string") {
      throw new Error("Invalid AI response shape");
    }

    // Cache successful response
    setCache(key, JSON.stringify(parsed), TTL.SHORT);

    return NextResponse.json<CheckAnswerResponse>(parsed);
  } catch (err) {
    console.error("[check-answer] AI failed:", err);
    return NextResponse.json<APIErrorResponse>(
      { error: true, message: "AI unavailable", fallback: true },
      { status: 503 },
    );
  }
}
