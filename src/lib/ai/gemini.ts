import { AICompletionRequest, AICompletionResponse, AIError } from "./types";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";
const TIMEOUT_MS = 15000; // Gemini can be slower; allow more time as fallback

function getModel(): string {
  return "gemini-flash-latest";
}

function stripCodeFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();
}

async function callGemini(
  request: AICompletionRequest,
  retryWithJsonReminder: boolean = false,
): Promise<AICompletionResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AIError("GEMINI_API_KEY is not configured", "gemini");
  }

  const model = getModel();
  const url = `${GEMINI_API_URL}/${model}:generateContent`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const systemInstruction = retryWithJsonReminder
    ? `${request.system}\n\nIMPORTANT: You MUST respond with ONLY valid JSON. No prose, no markdown, no code fences.`
    : request.system;

  try {
    const body: Record<string, unknown> = {
      system_instruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: [
        {
          parts: [{ text: request.prompt }],
        },
      ],
      generationConfig: {
        maxOutputTokens: request.maxTokens || 1024,
        temperature: 0.7,
        ...(request.jsonMode
          ? { responseMimeType: "application/json" }
          : {}),
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const status = response.status;
      const errBody = await response.text().catch(() => "");
      throw new AIError(
        `Gemini API error: ${status} ${errBody.slice(0, 200)}`,
        "gemini",
        status,
      );
    }

    const data = await response.json();
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const tokensUsed =
      (data.usageMetadata?.promptTokenCount || 0) +
      (data.usageMetadata?.candidatesTokenCount || 0);

    return { text, provider: "gemini", tokensUsed };
  } catch (err) {
    if (err instanceof AIError) throw err;
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new AIError("Gemini API timed out", "gemini", 408);
    }
    throw new AIError(
      `Gemini request failed: ${err instanceof Error ? err.message : String(err)}`,
      "gemini",
    );
  } finally {
    clearTimeout(timeout);
  }
}

export async function completeGemini(
  request: AICompletionRequest,
): Promise<AICompletionResponse> {
  const result = await callGemini(request);

  if (request.jsonMode) {
    const cleaned = stripCodeFences(result.text);
    try {
      JSON.parse(cleaned);
      return { ...result, text: cleaned };
    } catch {
      // Retry once with a stronger JSON reminder
      console.log("[Gemini] JSON parse failed, retrying with reminder");
      const retryResult = await callGemini(request, true);
      const retryCleaned = stripCodeFences(retryResult.text);
      try {
        JSON.parse(retryCleaned);
        return { ...retryResult, text: retryCleaned };
      } catch {
        throw new AIError(
          "Gemini returned invalid JSON after retry",
          "gemini",
        );
      }
    }
  }

  return result;
}
