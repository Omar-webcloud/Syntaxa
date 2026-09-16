import { AICompletionRequest, AICompletionResponse, AIError } from "./types";
import { completeGroq } from "./groq";
import { completeGemini } from "./gemini";

/**
 * Unified AI completion function.
 * Tries Groq first, falls back to Gemini on error/rate-limit/timeout.
 * Returns normalized response with provider info.
 */
export async function complete(
  request: AICompletionRequest,
): Promise<AICompletionResponse> {
  // Try Groq first (faster, lower latency)
  try {
    const result = await completeGroq(request);
    console.log(
      `[AI] Served by Groq (${result.tokensUsed ?? "?"} tokens)`,
    );
    return result;
  } catch (groqError) {
    const isRateLimit =
      groqError instanceof AIError && groqError.statusCode === 429;
    const isTimeout =
      groqError instanceof AIError && groqError.statusCode === 408;
    const errorType = isRateLimit
      ? "rate-limited"
      : isTimeout
        ? "timed out"
        : "errored";

    console.log(
      `[AI] Groq ${errorType}, falling back to Gemini: ${groqError instanceof Error ? groqError.message : String(groqError)}`,
    );

    // Fall back to Gemini
    try {
      const result = await completeGemini(request);
      console.log(
        `[AI] Served by Gemini (${result.tokensUsed ?? "?"} tokens)`,
      );
      return result;
    } catch (geminiError) {
      console.error(
        `[AI] Both providers failed. Groq: ${groqError instanceof Error ? groqError.message : String(groqError)}. Gemini: ${geminiError instanceof Error ? geminiError.message : String(geminiError)}`,
      );
      throw new AIError(
        "Both AI providers are currently unavailable",
        "both",
      );
    }
  }
}

export { AIError } from "./types";
export type {
  AICompletionRequest,
  AICompletionResponse,
} from "./types";
