/**
 * Contract for LLM providers (interface + factory pattern).
 * Implementations (Gemini, OpenAI, etc.) satisfy this interface.
 */
export interface GenerateResult {
  text: string;
  provider: string;
}

export interface ILLMProvider {
  readonly name: string;
  generate(prompt: string): Promise<GenerateResult>;
}

export type LLMProviderId = "gemini" | "openai";
