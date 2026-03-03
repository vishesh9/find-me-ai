import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { log } from "../lib/logger";
import type { LLMService } from "../services/llm.service";
import type { DiscoveryService } from "../services/discovery.service";
import { analyzeResponse } from "../services/analysis.service";
import type { RunRepository } from "../db/run.repository";
import type { ResponseRepository } from "../db/response.repository";
import type { AnalysisRepository } from "../db/analysis.repository";

export interface RunDeps {
  llmService: LLMService;
  discoveryService: DiscoveryService;
  runRepo: RunRepository;
  responseRepo: ResponseRepository;
  analysisRepo: AnalysisRepository;
}

export function createRunHandler(deps: RunDeps) {
  const { llmService, discoveryService, runRepo, responseRepo, analysisRepo } = deps;

  return async (req: Request, res: Response) => {
    const { brands, primaryBrand, prompts, runsPerPrompt } = req.body;
    const primary = String(primaryBrand ?? req.body.brand ?? "").trim();
    const hasPrompts =
      (Array.isArray(prompts) && prompts.length > 0) ||
      (typeof prompts === "string" && String(prompts).trim().length > 0);
    const hasBrands = Array.isArray(brands) && brands.length > 0;
    const useDiscovery = primary.length > 0 && !hasPrompts && !hasBrands;

    let brandList: string[];
    let promptList: string[];
    let runsPerPromptNum: number;
    let inferredCategory: string | null = null;
    let discoveryMode = 0;
    let runBrands: { brand: string; isPrimary: boolean; isDiscovered?: boolean }[];

    if (useDiscovery) {
      try {
        const discovered = await discoveryService.discoverFromBrand(primary);
        if (discovered.competitors.length === 0 || discovered.prompts.length === 0) {
          res.status(400).json({
            error:
              "Discovery returned no competitors or prompts. Use Advanced to enter them manually.",
          });
          return;
        }
        brandList = [primary, ...discovered.competitors];
        promptList = discovered.prompts;
        inferredCategory = discovered.category;
        discoveryMode = 1;
        runBrands = brandList.map((b) => ({
          brand: b,
          isPrimary: b === primary,
          isDiscovered: b !== primary,
        }));
        runsPerPromptNum = Number(runsPerPrompt) || 1;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        log.error("Discovery failed", message);
        res.status(500).json({
          error:
            message ||
            "Discovery failed; try again or use Advanced to enter competitors and prompts manually.",
        });
        return;
      }
    } else {
      brandList = Array.isArray(brands) ? brands : [primary].filter(Boolean);
      promptList = Array.isArray(prompts)
        ? prompts
        : String(prompts ?? "")
            .split("\n")
            .map((p: string) => p.trim())
            .filter(Boolean);
      runsPerPromptNum = Number(runsPerPrompt) || 1;

      if (brandList.length === 0 || promptList.length === 0) {
        res.status(400).json({
          error: "At least one brand and one prompt are required.",
        });
        return;
      }

      runBrands = brandList.map((b: string) => ({
        brand: String(b).trim(),
        isPrimary: String(b).trim() === primary,
        isDiscovered: false,
      }));
    }

    const primaryBrandResolved = primary || brandList[0] || "";

    log.start(
      `${promptList.length} prompt(s), ${runsPerPromptNum} run(s) each → ${promptList.length * runsPerPromptNum} total LLM call(s)`
    );

    const runId = uuidv4();
    runRepo.insert(runId, runsPerPromptNum, runBrands, promptList, {
      inferredCategory,
      discoveryMode,
    });

    const results: { prompt: string; run: number; status: string; error?: string }[] = [];

    for (const prompt of promptList) {
      for (let i = 0; i < runsPerPromptNum; i++) {
        try {
          log.step(prompt, i + 1, runsPerPromptNum);
          const { text: responseText, provider } = await llmService.generate(prompt);
          const responseId = uuidv4();

          responseRepo.insert({
            id: responseId,
            run_id: runId,
            prompt,
            response_text: responseText,
            run_number: i + 1,
            provider,
          });

          const analysis = analyzeResponse(responseText, brandList, primaryBrandResolved);
          for (const item of analysis) {
            analysisRepo.insert({
              id: uuidv4(),
              response_id: responseId,
              brand: item.brand,
              mentioned: item.mentioned,
              total_mentions: item.totalMentions,
              first_position: item.firstPosition,
              in_first_paragraph: item.inFirstParagraph,
              score: item.score,
            });
          }
          log.success(`Stored response + analysis (${provider})`);
          results.push({ prompt, run: i + 1, status: "success" });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : String(error);
          log.error(
            `Prompt "${prompt.slice(0, 30)}${prompt.length > 30 ? "…" : ""}" run ${i + 1}/${runsPerPromptNum}`,
            message
          );
          results.push({ prompt, run: i + 1, status: "error", error: message });
        }
      }
    }

    log.done("Run completed.");
    res.json({ results });
  };
}
