import { Router } from "express";
import { createResultsHandler, createTrendHandler } from "./results";
import { createRunHandler } from "./run";
import { createClearHandler } from "./clear";
import type { ResultsService } from "../services/results.service";
import type { LLMService } from "../services/llm.service";
import type { RunRepository } from "../db/run.repository";
import type { ResponseRepository } from "../db/response.repository";
import type { AnalysisRepository } from "../db/analysis.repository";

export interface ApiDeps {
  resultsService: ResultsService;
  llmService: LLMService;
  runRepo: RunRepository;
  responseRepo: ResponseRepository;
  analysisRepo: AnalysisRepository;
}

export function createApiRouter(deps: ApiDeps) {
  const router = Router();

  router.get("/results", createResultsHandler(deps.resultsService));
  router.get("/results/trend", createTrendHandler(deps.resultsService));
  router.post("/run", createRunHandler(deps));
  router.post("/clear", createClearHandler(deps));

  return router;
}
