import OpenAI from "openai";
import type { ConfigRepository } from "../../../db/config.repository";
import { getSystemInstructions } from "../../../lib/instructions";
import type { GenerateResult, ILLMProvider } from "../types";

export function createOpenAIProvider(configRepo: ConfigRepository): ILLMProvider {
  return {
    name: "openai",
    async generate(prompt: string): Promise<GenerateResult> {
      const apiKey = configRepo.get("OPENAI_API_KEY", "");
      const model = configRepo.get("OPENAI_MODEL", "gpt-4o-mini");
      const temperature = parseFloat(configRepo.get("TEMPERATURE", "0"));
      const systemInstruction = getSystemInstructions(configRepo);

      if (!apiKey) throw new Error("OPENAI_API_KEY not set for provider 'openai'");

      const openai = new OpenAI({ apiKey });
      const messages = systemInstruction
        ? [
            { role: "system" as const, content: systemInstruction },
            { role: "user" as const, content: prompt },
          ]
        : [{ role: "user" as const, content: prompt }];

      const completion = await openai.chat.completions.create({
        model,
        temperature,
        messages,
      });

      const text = completion.choices[0]?.message?.content ?? "";
      return { text, provider: "openai" };
    },
  };
}
