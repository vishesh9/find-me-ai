export interface LeaderboardItem {
  brand: string;
  totalScore: number;
  /** Max possible total score in this run (responseCount × max per response). */
  maxPossibleScore: number;
  mentionCount: number;
  avgScore: number;
  shareOfVoice: number;
}

export interface PromptBreakdown {
  prompt: string;
  brandScores: { brand: string; score: number }[];
}

export interface RawResponse {
  id: string;
  prompt: string;
  response_text: string;
  run_number: number;
  provider: string;
  created_at: string;
}

export interface RunInfo {
  runId: string;
  createdAt: string;
  /** Primary brand for this run (from run_brands.is_primary). */
  primaryBrand?: string;
}

export interface Results {
  leaderboard: LeaderboardItem[];
  promptBreakdown: PromptBreakdown[];
  rawResponses: RawResponse[];
  /** When set, results are for this run only. */
  runInfo?: RunInfo;
}

export interface TrendDataPoint {
  batchId: string;
  created_at: string;
  shareOfVoice: number;
  totalScore: number;
}

export interface TrendSeries {
  brand: string;
  data: TrendDataPoint[];
}

export interface Trend {
  batches: { id: string; created_at: string }[];
  series: TrendSeries[];
  /** Primary brand for the latest run (from run_brands.is_primary). */
  primaryBrand?: string;
}
