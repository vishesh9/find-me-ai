import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { log } from "../lib/logger";
import type { LLMService } from "../services/llm.service";
import { analyzeResponse } from "../services/analysis.service";
import type { RunRepository } from "../db/run.repository";
import type { ResponseRepository } from "../db/response.repository";
import type { AnalysisRepository } from "../db/analysis.repository";

export interface RunDeps {
  llmService: LLMService;
  runRepo: RunRepository;
  responseRepo: ResponseRepository;
  analysisRepo: AnalysisRepository;
}

export function createRunHandler(deps: RunDeps) {
  const { llmService, runRepo, responseRepo, analysisRepo } = deps;

  return async (req: Request, res: Response) => {
    const { brands, primaryBrand, prompts, runsPerPrompt } = req.body;

    const brandList = Array.isArray(brands) ? brands : [primaryBrand].filter(Boolean);
    const promptList = Array.isArray(prompts) ? prompts : String(prompts ?? "").split("\n").map((p: string) => p.trim()).filter(Boolean);
    const runsPerPromptNum = Number(runsPerPrompt) || 1;

    if (brandList.length === 0 || promptList.length === 0) {
      res.status(400).json({ error: "At least one brand and one prompt are required." });
      return;
    }

    log.start(
      `${promptList.length} prompt(s), ${runsPerPromptNum} run(s) each → ${promptList.length * runsPerPromptNum} total LLM call(s)`
    );

    const runId = uuidv4();
    const runBrands = brandList.map((b: string) => ({
      brand: String(b).trim(),
      isPrimary: String(b).trim() === String(primaryBrand).trim(),
    }));

    runRepo.insert(runId, runsPerPromptNum, runBrands, promptList);

    const results: { prompt: string; run: number; status: string; error?: string }[] = [];

    for (const prompt of promptList) {
      for (let i = 0; i < runsPerPromptNum; i++) {
        try {
          log.step(prompt, i + 1, runsPerPromptNum);
          const responseText = await llmService.generate(prompt);
          const responseId = uuidv4();

          responseRepo.insert({
            id: responseId,
            run_id: runId,
            prompt,
            response_text: responseText,
            run_number: i + 1,
            provider: "gemini",
          });

          const analysis = analyzeResponse(responseText, brandList, primaryBrand);
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
          log.success("Stored response + analysis (gemini)");
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
