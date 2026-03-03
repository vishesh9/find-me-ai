import type { ConfigRepository } from "../../db/config.repository";
import { createGeminiProvider } from "./providers/gemini.provider";
import { createOpenAIProvider } from "./providers/openai.provider";
import type { ILLMProvider, LLMProviderId } from "./types";

const PROVIDER_MAP: Record<
  LLMProviderId,
  (configRepo: ConfigRepository) => ILLMProvider
> = {
  gemini: createGeminiProvider,
  openai: createOpenAIProvider,
};

/**
 * Factory: returns the LLM provider implementation for the configured LLM_PROVIDER.
 * Add new providers in providers/ implementing ILLMProvider, then register here.
 */
export function createLLMProvider(configRepo: ConfigRepository): ILLMProvider {
  const id = (configRepo.get("LLM_PROVIDER", "gemini") || "gemini").toLowerCase() as LLMProviderId;
  const factory = PROVIDER_MAP[id];
  if (!factory) {
    const allowed = Object.keys(PROVIDER_MAP).join(", ");
    throw new Error(`Unknown LLM_PROVIDER "${id}". Supported: ${allowed}`);
  }
  return factory(configRepo);
}
