import { GoogleGenAI } from "@google/genai";
import type { ConfigRepository } from "../db/config.repository";

export function createLLMService(
  apiKey: string,
  configRepo: ConfigRepository
) {
  return {
    async generate(prompt: string): Promise<string> {
      const temperature = parseFloat(configRepo.get("TEMPERATURE", "0"));
      const model = configRepo.get("GEMINI_MODEL", "gemini-2.5-flash");

      if (!apiKey) throw new Error("GEMINI_API_KEY not set");
      const genAI = new GoogleGenAI({ apiKey });
      const result = await genAI.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Provide a structured, neutral, factual answer. No markdown formatting.\n\nQuestion: ${prompt}`,
              },
            ],
          },
        ],
        config: { temperature },
      });
      return result.text || "";
    },
  };
}

export type LLMService = ReturnType<typeof createLLMService>;
