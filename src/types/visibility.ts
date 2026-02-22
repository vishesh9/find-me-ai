export interface LeaderboardItem {
  brand: string;
  totalScore: number;
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

export interface Results {
  leaderboard: LeaderboardItem[];
  promptBreakdown: PromptBreakdown[];
  rawResponses: RawResponse[];
}
