import type { LLMService } from "./llm.service";
import type { DiscoveryRepository } from "../db/discovery.repository";

export interface DiscoveryResult {
  category: string;
  competitors: string[];
  prompts: string[];
}

function normalizeBrandKey(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function stripMarkdownJson(text: string): string {
  let s = text.trim();
  const codeBlock = s.match(/^```(?:json)?\s*([\s\S]*?)```$/m);
  if (codeBlock) s = codeBlock[1].trim();
  return s;
}

const DISCOVERY_PROMPT = `You are a market analyst. Given the following brand (name or website), respond with only a single JSON object. No markdown, no explanation, no other text.

Use this exact structure:
{"category": "one short phrase e.g. CRM software", "competitors": ["Brand A", "Brand B", ...], "prompts": ["Best X for small business", "Affordable X in India", ...]}

Rules:
- category: one short phrase describing the market (e.g. CRM software, project management tools).
- competitors: array of 5 to 7 well-known competitor brands in that market. Use exact brand names people would search for.
- prompts: array of 2 to 3 short search-style questions a buyer might ask an AI assistant (e.g. Best CRM for small business, Top project management tools for startups). Each prompt should be one natural question.

Brand to analyze: `;

export function createDiscoveryService(
  llmService: LLMService,
  discoveryRepo: DiscoveryRepository
) {
  return {
    async discoverFromBrand(brandInput: string): Promise<DiscoveryResult> {
      const brandKey = normalizeBrandKey(brandInput);
      if (!brandKey) {
        throw new Error("Brand input is required.");
      }

      const cached = discoveryRepo.get(brandKey);
      if (cached) {
        return cached;
      }

      const fullPrompt = DISCOVERY_PROMPT + brandInput.trim();
      const { text } = await llmService.generate(fullPrompt);
      const raw = stripMarkdownJson(text);

      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        throw new Error(
          "Discovery failed: could not parse response. Try again or use Advanced to enter competitors and prompts manually."
        );
      }

      if (
        !parsed ||
        typeof parsed !== "object" ||
        !("category" in parsed) ||
        !("competitors" in parsed) ||
        !("prompts" in parsed)
      ) {
        throw new Error(
          "Discovery failed: invalid response shape. Try again or use Advanced to enter competitors and prompts manually."
        );
      }

      const category = String((parsed as { category?: unknown }).category ?? "")
        .trim();
      const competitors = Array.isArray((parsed as { competitors?: unknown }).competitors)
        ? ((parsed as { competitors: unknown[] }).competitors
          .map((c) => (typeof c === "string" ? c : String(c)).trim())
          .filter(Boolean))
        : [];
      const prompts = Array.isArray((parsed as { prompts?: unknown }).prompts)
        ? ((parsed as { prompts: unknown[] }).prompts
          .map((p) => (typeof p === "string" ? p : String(p)).trim())
          .filter(Boolean))
        : [];

      if (!category) {
        throw new Error(
          "Discovery failed: missing category. Try again or use Advanced."
        );
      }
      if (competitors.length === 0) {
        throw new Error(
          "Discovery failed: no competitors found. Use Advanced to enter competitors and prompts manually."
        );
      }
      if (prompts.length === 0) {
        throw new Error(
          "Discovery failed: no prompts generated. Use Advanced to enter prompts manually."
        );
      }

      discoveryRepo.insert(brandKey, category, competitors, prompts);
      return { category, competitors, prompts };
    },
  };
}

export type DiscoveryService = ReturnType<typeof createDiscoveryService>;
