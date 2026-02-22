import type { Request, Response } from "express";
import type { ResultsService } from "../services/results.service";

export function createResultsHandler(resultsService: ResultsService) {
  return (_req: Request, res: Response) => {
    const data = resultsService.getResults();
    res.json(data);
  };
}

export function createTrendHandler(resultsService: ResultsService) {
  return (_req: Request, res: Response) => {
    const data = resultsService.getTrend();
    res.json(data);
  };
}
