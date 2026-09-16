import { AICompletionRequest, AICompletionResponse, AIError } from "./types";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const TIMEOUT_MS = 8000;

function getModel(maxTokens?: number): string {
  // Use the fast 20b model for low-token requests, 120b for general requests
  if (maxTokens && maxTokens < 200) {
    return "openai/gpt-oss-20b";
  }
  return "openai/gpt-oss-120b";
}

function stripCodeFences(text: string): string {
  // Remove ```json ... ``` or ``` ... ``` wrappers
  return text
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();
}

async function callGroq(
  request: AICompletionRequest,
  retryWithJsonReminder: boolean = false,
): Promise<AICompletionResponse> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new AIError("GROQ_API_KEY is not configured", "groq");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const systemPrompt = retryWithJsonReminder
    ? `${request.system}\n\nIMPORTANT: You MUST respond with ONLY valid JSON. No prose, no markdown, no code fences.`
    : request.system;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: getModel(request.maxTokens),
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: request.prompt },
        ],
        max_tokens: Math.max(request.maxTokens || 1024, 1024),
        temperature: 0.7,
        ...(request.jsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const status = response.status;
      const body = await response.text().catch(() => "");
      throw new AIError(
        `Groq API error: ${status} ${body.slice(0, 200)}`,
        "groq",
        status,
      );
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";
    const tokensUsed = data.usage?.total_tokens;

    return { text, provider: "groq", tokensUsed };
  } catch (err) {
    if (err instanceof AIError) throw err;
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new AIError("Groq API timed out", "groq", 408);
    }
    throw new AIError(
      `Groq request failed: ${err instanceof Error ? err.message : String(err)}`,
      "groq",
    );
  } finally {
    clearTimeout(timeout);
  }
}

export async function completeGroq(
  request: AICompletionRequest,
): Promise<AICompletionResponse> {
  const result = await callGroq(request);

  if (request.jsonMode) {
    const cleaned = stripCodeFences(result.text);
    try {
      JSON.parse(cleaned);
      return { ...result, text: cleaned };
    } catch {
      // Retry once with a stronger JSON reminder
      console.log("[Groq] JSON parse failed, retrying with reminder");
      const retryResult = await callGroq(request, true);
      const retryCleaned = stripCodeFences(retryResult.text);
      try {
        JSON.parse(retryCleaned);
        return { ...retryResult, text: retryCleaned };
      } catch {
        throw new AIError("Groq returned invalid JSON after retry", "groq");
      }
    }
  }

  return result;
}
