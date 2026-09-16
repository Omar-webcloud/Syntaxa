import { NextRequest, NextResponse } from "next/server";
import { complete } from "@/lib/ai";
import { checkRateLimit, getClientIP } from "@/lib/ai/rate-limit";
import { getCached, setCache, cacheKey, TTL } from "@/lib/ai/cache";
import type {
  SimplifyDefinitionRequest,
  SimplifyDefinitionResponse,
  APIErrorResponse,
} from "@/lib/ai/types";

const SYSTEM_PROMPT = `You are a dictionary editor writing definitions in the style of the Collins COBUILD dictionary. Rewrite each definition in simple, plain English suitable for an intermediate (CEFR B1) English learner. Explain each meaning using a full, natural sentence rather than a terse definition. Then give one short example sentence using the word naturally. Respond ONLY with JSON: {"senses": [{"partOfSpeech": "...", "simpleDefinition": "...", "example": "..."}]}`;

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json<APIErrorResponse>(
      { error: true, message: "Too many requests", fallback: true },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let body: SimplifyDefinitionRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<APIErrorResponse>(
      { error: true, message: "Invalid request body" },
      { status: 400 },
    );
  }

  const { word, definitions, partOfSpeech } = body;
  if (!word || !definitions?.length) {
    return NextResponse.json<APIErrorResponse>(
      { error: true, message: "Missing required fields" },
      { status: 400 },
    );
  }

  // Check cache (dictionary definitions don't change — long TTL)
  const key = cacheKey("simplify", word);
  const cached = getCached(key);
  if (cached) {
    return NextResponse.json<SimplifyDefinitionResponse>(JSON.parse(cached));
  }

  try {
    // Build a prompt with all senses
    const sensesText = definitions
      .map((def, i) => {
        const pos = partOfSpeech[i] || "unknown";
        return `${i + 1}. (${pos}) ${def}`;
      })
      .join("\n");

    const prompt = `Word: "${word}"

Original definitions:
${sensesText}

Rewrite each definition in simple English and provide an example sentence for each.`;

    const result = await complete({
      system: SYSTEM_PROMPT,
      prompt,
      jsonMode: true,
      maxTokens: 800,
    });

    const parsed = JSON.parse(result.text);

    const response: SimplifyDefinitionResponse = {
      word,
      senses: (parsed.senses || []).map(
        (s: { partOfSpeech?: string; simpleDefinition?: string; example?: string }, i: number) => ({
          partOfSpeech: s.partOfSpeech || partOfSpeech[i] || "unknown",
          simpleDefinition: s.simpleDefinition || definitions[i],
          example: s.example || "",
        }),
      ),
    };

    setCache(key, JSON.stringify(response), TTL.LONG);
    return NextResponse.json<SimplifyDefinitionResponse>(response);
  } catch (err) {
    console.error("[simplify-definition] AI failed:", err);
    return NextResponse.json<APIErrorResponse>(
      { error: true, message: "AI unavailable", fallback: true },
      { status: 503 },
    );
  }
}
