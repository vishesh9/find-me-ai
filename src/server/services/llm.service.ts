import type { ConfigRepository } from "../db/config.repository";
import { createLLMProvider } from "./llm/factory";

/**
 * Creates the LLM service by resolving the configured provider via the factory.
 * The service implements the same contract as ILLMProvider (generate(prompt) -> { text, provider }).
 */
export function createLLMService(configRepo: ConfigRepository) {
  const provider = createLLMProvider(configRepo);
  return {
    get name() {
      return provider.name;
    },
    generate: (prompt: string) => provider.generate(prompt),
  };
}

export type LLMService = ReturnType<typeof createLLMService>;

export type { ILLMProvider, GenerateResult, LLMProviderId } from "./llm/types";
