import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { complete } from "@/lib/ai";
import { checkRateLimit, getClientIP } from "@/lib/ai/rate-limit";
import { getCached, setCache, cacheKey, TTL } from "@/lib/ai/cache";
import type { GenerateQuizRequest, APIErrorResponse } from "@/lib/ai/types";

// Zod schema matching the quiz.json shape
const QuizQuestionSchema = z.object({
  id: z.number(),
  question: z.string(),
  answer: z.string(),
});

const QuizResponseSchema = z.array(QuizQuestionSchema).min(1).max(15);

const SYSTEM_PROMPT = `Generate English grammar multiple-choice questions. Each question must be a single sentence with a blank shown as ___, followed by options in parentheses with a slash separator, and exactly one correct answer. Format as JSON array: [{"id": number, "question": "She ___ (go/goes/going) to school every day.", "answer": "goes"}]. Vary difficulty across CEFR A2–B1. Respond ONLY with the JSON array, no prose.`;

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const limit = checkRateLimit(ip, 10); // Stricter limit for quiz generation
  if (!limit.allowed) {
    return NextResponse.json<APIErrorResponse>(
      { error: true, message: "Too many requests", fallback: true },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let body: GenerateQuizRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<APIErrorResponse>(
      { error: true, message: "Invalid request body" },
      { status: 400 },
    );
  }

  const { weakTopics, count = 10 } = body;
  if (!weakTopics || !Array.isArray(weakTopics) || weakTopics.length === 0) {
    return NextResponse.json<APIErrorResponse>(
      { error: true, message: "weakTopics must be a non-empty array" },
      { status: 400 },
    );
  }

  // Check cache
  const key = cacheKey("quiz", ...weakTopics.sort(), String(count));
  const cached = getCached(key);
  if (cached) {
    return NextResponse.json(JSON.parse(cached));
  }

  try {
    const topicsList = weakTopics.join(", ");
    const prompt = `Generate ${count} English grammar multiple-choice questions focused on these topics: ${topicsList}. Each question must have options in parentheses within the question text.`;

    const result = await complete({
      system: SYSTEM_PROMPT,
      prompt,
      jsonMode: true,
      maxTokens: 1500,
    });

    const parsed = JSON.parse(result.text);
    const validated = QuizResponseSchema.parse(parsed);

    // Re-assign IDs to ensure they're sequential
    const questions = validated.map((q, i) => ({
      ...q,
      id: i + 1,
    }));

    setCache(key, JSON.stringify(questions), TTL.SHORT);
    return NextResponse.json(questions);
  } catch (err) {
    console.error("[generate-quiz] Failed:", err);

    // Distinguish validation errors from AI errors
    if (err instanceof z.ZodError) {
      return NextResponse.json<APIErrorResponse>(
        { error: true, message: "AI generated invalid quiz format", fallback: true },
        { status: 422 },
      );
    }

    return NextResponse.json<APIErrorResponse>(
      { error: true, message: "AI unavailable", fallback: true },
      { status: 503 },
    );
  }
}
