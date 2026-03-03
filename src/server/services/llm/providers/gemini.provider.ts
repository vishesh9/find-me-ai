import { GoogleGenAI } from "@google/genai";
import type { ConfigRepository } from "../../../db/config.repository";
import { getSystemInstructions } from "../../../lib/instructions";
import type { GenerateResult, ILLMProvider } from "../types";

export function createGeminiProvider(configRepo: ConfigRepository): ILLMProvider {
  return {
    name: "gemini",
    async generate(prompt: string): Promise<GenerateResult> {
      const apiKey = configRepo.get("GEMINI_API_KEY", "");
      const model = configRepo.get("GEMINI_MODEL", "gemini-2.5-flash");
      const temperature = parseFloat(configRepo.get("TEMPERATURE", "0"));
      const systemInstruction = getSystemInstructions(configRepo);

      if (!apiKey) throw new Error("GEMINI_API_KEY not set for provider 'gemini'");

      const genAI = new GoogleGenAI({ apiKey });
      const result = await genAI.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          temperature,
          ...(systemInstruction ? { systemInstruction } : {}),
        },
      });

      return {
        text: result.text ?? "",
        provider: "gemini",
      };
    },
  };
}
