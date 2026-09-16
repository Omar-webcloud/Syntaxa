import { NextRequest, NextResponse } from "next/server";
import { complete } from "@/lib/ai";
import { checkRateLimit, getClientIP } from "@/lib/ai/rate-limit";
import { getCached, setCache, cacheKey, TTL } from "@/lib/ai/cache";
import type {
  TranslateRequest,
  TranslateResponse,
  TranslateDirection,
  APIErrorResponse,
} from "@/lib/ai/types";

const SYSTEM_PROMPTS: Record<TranslateDirection, string> = {
  "en-ko": `You are a professional English-Korean translator. Translate the English word or phrase into natural, commonly used Korean. If it's a single word, include its most common Hangul translation, a Revised Romanization reading, and one short example sentence in English with its Korean translation. Note whether the word is more formal/casual if relevant. Respond ONLY with JSON: {"translated": "...", "romanization": "...", "example": {"source": "English example sentence", "target": "Korean translation of the example"}, "notes": "optional usage note"}`,

  "ko-en": `You are a professional Korean-English translator. Translate the Korean word or phrase into natural English. If it's a single word, include its most common English translation and one short example sentence in Korean with its English translation. Note the register (formal/casual) if relevant. Respond ONLY with JSON: {"translated": "...", "example": {"source": "Korean example sentence", "target": "English translation of the example"}, "notes": "optional usage note"}`,

  "en-bn": `You are a professional English-Bangla translator. Translate the English word or phrase into natural Bangla. If it's a single word, include its most common Bangla translation written in Bengali script, and one short example sentence in English with its Bangla translation. Respond ONLY with JSON: {"translated": "...", "example": {"source": "English example sentence", "target": "Bangla translation of the example"}, "notes": "optional usage note"}`,

  "bn-en": `You are a professional Bangla-English translator. Translate the Bangla word or phrase into natural English. If it's a single word, include its most common English translation and one short example sentence in Bangla with its English translation. Respond ONLY with JSON: {"translated": "...", "example": {"source": "Bangla example sentence", "target": "English translation of the example"}, "notes": "optional usage note"}`,
};

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json<APIErrorResponse>(
      { error: true, message: "Too many requests", fallback: true },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let body: TranslateRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<APIErrorResponse>(
      { error: true, message: "Invalid request body" },
      { status: 400 },
    );
  }

  const { text, direction } = body;
  if (!text?.trim() || !direction || !SYSTEM_PROMPTS[direction]) {
    return NextResponse.json<APIErrorResponse>(
      { error: true, message: "Missing or invalid fields" },
      { status: 400 },
    );
  }

  // Check cache
  const key = cacheKey("translate", direction, text);
  const cached = getCached(key);
  if (cached) {
    return NextResponse.json<TranslateResponse>(JSON.parse(cached));
  }

  try {
    const prompt = `Translate: "${text.trim()}"`;

    const result = await complete({
      system: SYSTEM_PROMPTS[direction],
      prompt,
      jsonMode: true,
      maxTokens: 400,
    });

    const parsed = JSON.parse(result.text) as TranslateResponse;

    if (!parsed.translated) {
      throw new Error("Missing translated field in AI response");
    }

    setCache(key, JSON.stringify(parsed), TTL.LONG);
    return NextResponse.json<TranslateResponse>(parsed);
  } catch (err) {
    console.error("[translate] AI failed:", err);
    return NextResponse.json<APIErrorResponse>(
      { error: true, message: "Translation unavailable", fallback: true },
      { status: 503 },
    );
  }
}
