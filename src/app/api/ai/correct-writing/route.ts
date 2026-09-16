import { NextRequest, NextResponse } from "next/server";
import { complete } from "@/lib/ai";
import { checkRateLimit, getClientIP } from "@/lib/ai/rate-limit";
import type {
  CorrectWritingRequest,
  CorrectWritingResponse,
  APIErrorResponse,
} from "@/lib/ai/types";

const SYSTEM_PROMPT = `You are an English writing tutor. Correct the grammar, spelling, and word choice in the student's text while preserving their intended meaning and voice. Respond ONLY with JSON: {"corrected": "the full corrected text", "hasErrors": boolean, "issues": [{"original": "exact phrase from input", "fixed": "corrected phrase", "explanation": "short reason, written for an intermediate learner"}]}. If the text has no errors, return hasErrors: false and an empty issues array.`;

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json<APIErrorResponse>(
      { error: true, message: "Too many requests", fallback: true },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let body: CorrectWritingRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<APIErrorResponse>(
      { error: true, message: "Invalid request body" },
      { status: 400 },
    );
  }

  const { text } = body;
  if (!text || text.trim().length < 10) {
    return NextResponse.json<APIErrorResponse>(
      { error: true, message: "Text must be at least 10 characters" },
      { status: 400 },
    );
  }

  try {
    const prompt = `Student's text:\n"${text.trim()}"

Correct the grammar, spelling, and word choice. List each specific issue.`;

    const result = await complete({
      system: SYSTEM_PROMPT,
      prompt,
      jsonMode: true,
      maxTokens: 600,
    });

    const parsed = JSON.parse(result.text) as CorrectWritingResponse;

    if (typeof parsed.hasErrors !== "boolean" || !Array.isArray(parsed.issues)) {
      throw new Error("Invalid AI response shape");
    }

    return NextResponse.json<CorrectWritingResponse>(parsed);
  } catch (err) {
    console.error("[correct-writing] AI failed:", err);
    return NextResponse.json<APIErrorResponse>(
      { error: true, message: "AI unavailable", fallback: true },
      { status: 503 },
    );
  }
}
