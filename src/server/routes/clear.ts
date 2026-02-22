import type { Request, Response } from "express";
import { log } from "../lib/logger";
import type { RunRepository } from "../db/run.repository";
import type { ResponseRepository } from "../db/response.repository";
import type { AnalysisRepository } from "../db/analysis.repository";

export interface ClearDeps {
  runRepo: RunRepository;
  responseRepo: ResponseRepository;
  analysisRepo: AnalysisRepository;
}

export function createClearHandler(deps: ClearDeps) {
  const { runRepo, responseRepo, analysisRepo } = deps;

  return (_req: Request, res: Response) => {
    analysisRepo.deleteAll();
    responseRepo.deleteAll();
    runRepo.deleteAll();
    log.clear("All runs, responses and analysis deleted.");
    res.json({ status: "ok" });
  };
}
