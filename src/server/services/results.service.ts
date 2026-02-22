import { MAX_SCORE_PER_RESPONSE } from "./analysis.service";
import type { RunRepository } from "../db/run.repository";
import type { ResponseRepository } from "../db/response.repository";
import type { AnalysisRepository } from "../db/analysis.repository";
import type {
  LeaderboardItem,
  PromptBreakdown,
  RawResponse,
  Results,
  RunInfo,
  Trend,
  TrendDataPoint,
  TrendSeries,
} from "../../types/visibility";

const NORMALIZED_MAX = MAX_SCORE_PER_RESPONSE;

function computeLeaderboard(
  responses: { id: string }[],
  analysis: { response_id: string; brand: string; score: number; mentioned: number }[]
): LeaderboardItem[] {
  const responseCount = responses.length;
  const rawMaxPossible = responseCount * MAX_SCORE_PER_RESPONSE;

  const brands = Array.from(new Set(analysis.map((a) => a.brand)));
  const leaderboard = brands.map((brand) => {
    const brandAnalysis = analysis.filter((a) => a.brand === brand);
    const rawTotal = brandAnalysis.reduce((sum, a) => sum + (Number(a.score) || 0), 0);
    const totalScore =
      rawMaxPossible > 0 ? (rawTotal * NORMALIZED_MAX) / rawMaxPossible : 0;
    const mentionCount = brandAnalysis.filter((a) => a.mentioned).length;
    const avgScore =
      brands.length > 0 && responseCount > 0
        ? totalScore / (responseCount / brands.length)
        : 0;
    return {
      brand,
      totalScore,
      maxPossibleScore: NORMALIZED_MAX,
      mentionCount,
      avgScore,
    };
  });
  const totalAllScores = leaderboard.reduce((sum, b) => sum + (Number(b.totalScore) || 0), 0);
  return leaderboard
    .map((b) => ({
      ...b,
      shareOfVoice: totalAllScores > 0 ? (Number(b.totalScore) / totalAllScores) * 100 : 0,
    }))
    .sort((a, b) => Number(b.totalScore) - Number(a.totalScore)) as LeaderboardItem[];
}

export function createResultsService(
  runRepo: RunRepository,
  responseRepo: ResponseRepository,
  analysisRepo: AnalysisRepository
) {
  return {
    getResults(): Results {
      const latestRun = runRepo.getLatest();
      const responses = latestRun
        ? responseRepo.getByRunId(latestRun.id)
        : responseRepo.getLegacy();

      if (responses.length === 0) {
        return {
          leaderboard: [],
          promptBreakdown: [],
          rawResponses: [],
          runInfo: latestRun
            ? { runId: latestRun.id, createdAt: latestRun.created_at }
            : undefined,
        };
      }

      const responseIds = new Set(responses.map((r) => r.id));
      const analysis = analysisRepo
        .getAll()
        .filter((a) => responseIds.has(a.response_id));

      const finalLeaderboard = computeLeaderboard(responses, analysis);

      const prompts = Array.from(new Set(responses.map((r) => r.prompt)));
      const brands = Array.from(new Set(analysis.map((a) => a.brand)));
      const promptBreakdown: PromptBreakdown[] = prompts.map((prompt) => {
        const promptResponses = responses.filter((r) => r.prompt === prompt);
        const promptAnalysis = analysis.filter((a) =>
          promptResponses.some((r) => r.id === a.response_id)
        );
        const brandScores = brands.map((brand) => {
          const score = promptAnalysis
            .filter((a) => a.brand === brand)
            .reduce((sum, a) => sum + (Number(a.score) || 0), 0);
          return { brand, score };
        });
        return { prompt, brandScores };
      });

      let runInfo: RunInfo | undefined;
      if (latestRun) {
        const runBrands = runRepo.getBrandsByRunId(latestRun.id);
        const primary = runBrands.find((r) => r.is_primary === 1);
        runInfo = {
          runId: latestRun.id,
          createdAt: latestRun.created_at,
          primaryBrand: primary?.brand,
        };
      }

      return {
        leaderboard: finalLeaderboard,
        promptBreakdown,
        rawResponses: responses as RawResponse[],
        runInfo,
      };
    },

    getTrend(): Trend {
      const allBatches = runRepo.getAll();
      const allAnalysis = analysisRepo.getAll();

      if (allBatches.length === 0) return { batches: [], series: [] };

      const latestRun = runRepo.getLatest();
      const primaryRow = latestRun
        ? runRepo.getBrandsByRunId(latestRun.id).find((r) => r.is_primary === 1)
        : undefined;
      const primaryBrand = primaryRow?.brand;
      if (!primaryBrand) return { batches: [], series: [], primaryBrand: undefined };

      const batchesWithPrimary = allBatches.filter((batch) =>
        runRepo.getBrandsByRunId(batch.id).some((r) => r.brand === primaryBrand)
      );

      const data: TrendDataPoint[] = [];
      for (const batch of batchesWithPrimary) {
        const batchResponses = responseRepo.getByRunId(batch.id);
        if (batchResponses.length === 0) continue;

        const responseIds = new Set(batchResponses.map((r) => r.id));
        const batchAnalysis = allAnalysis.filter((a) => responseIds.has(a.response_id));
        const leaderboard = computeLeaderboard(batchResponses, batchAnalysis);
        const item = leaderboard.find((b) => b.brand === primaryBrand);

        data.push({
          batchId: batch.id,
          created_at: batch.created_at,
          shareOfVoice: item?.shareOfVoice ?? 0,
          totalScore: item?.totalScore ?? 0,
        });
      }

      return {
        batches: batchesWithPrimary.map((b) => ({ id: b.id, created_at: b.created_at })),
        series: [{ brand: primaryBrand, data }],
        primaryBrand,
      };
    },
  };
}

export type ResultsService = ReturnType<typeof createResultsService>;
