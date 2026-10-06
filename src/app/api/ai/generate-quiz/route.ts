import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { complete } from "@/lib/ai";
import { checkRateLimit, getClientIP } from "@/lib/ai/rate-limit";
import { getCached, setCache, cacheKey, TTL } from "@/lib/ai/cache";
import type { GenerateQuizRequest, APIErrorResponse } from "@/lib/ai/types";

const QuizQuestionSchema = z.object({
  id: z.number(),
  question: z.string().trim().min(8),
  answer: z.string().trim().min(1),
}).superRefine((question, context) => {
  const optionGroups = [...question.question.matchAll(/\(([^()]*)\)/g)];
  const blanks = (question.question.match(/___/g) || []).length;

  if (blanks !== 1) {
    context.addIssue({ code: "custom", message: "Question must contain exactly one ___ blank", path: ["question"] });
  }
  if (optionGroups.length !== 1) {
    context.addIssue({ code: "custom", message: "Question must contain exactly one option group", path: ["question"] });
    return;
  }

  const options = optionGroups[0][1].split("/").map((option) => option.trim()).filter(Boolean);
  if (options.length < 2 || options.length > 4 || new Set(options.map((option) => option.toLowerCase())).size !== options.length) {
    context.addIssue({ code: "custom", message: "Question must contain 2–4 unique slash-separated options", path: ["question"] });
  }
  if (!options.some((option) => option.toLowerCase() === question.answer.toLowerCase())) {
    context.addIssue({ code: "custom", message: "Answer must match one of the options", path: ["answer"] });
  }
});

const QuizResponseSchema = z.array(QuizQuestionSchema).length(10);

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

  const { weakTopics } = body;
  if (!weakTopics || !Array.isArray(weakTopics) || weakTopics.length === 0) {
    return NextResponse.json<APIErrorResponse>(
      { error: true, message: "weakTopics must be a non-empty array" },
      { status: 400 },
    );
  }

  const questionCount = 10;
  // Check cache. Do not mutate the request's topic array while building the key.
  const key = cacheKey("quiz", ...[...weakTopics].sort(), String(questionCount));
  const cached = getCached(key);
  if (cached) {
    return NextResponse.json(JSON.parse(cached));
  }

  try {
    const topicsList = weakTopics.join(", ");
    const prompt = `Generate exactly ${questionCount} English grammar multiple-choice questions focused on these topics: ${topicsList}. Each question must contain exactly one ___ blank and exactly one parenthesized option group with 2–4 unique slash-separated options. The answer must be exactly one of those options. Make the completed sentence natural and grammatically correct. Do not include Markdown, explanations, bold text, extra parentheses, or answer choices outside the question text.`;

    const result = await complete({
      system: SYSTEM_PROMPT,
      prompt,
      jsonMode: true,
      maxTokens: 2200,
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
