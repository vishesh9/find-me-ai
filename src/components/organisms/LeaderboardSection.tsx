import { motion } from "motion/react";
import type { LeaderboardItem } from "../../types/visibility";

interface LeaderboardSectionProps {
  leaderboard: LeaderboardItem[];
  primaryBrand: string;
}

export function LeaderboardSection({ leaderboard, primaryBrand }: LeaderboardSectionProps) {
  return (
    <section>
      <div className="flex items-end justify-between mb-6 border-b border-[#141414] pb-2">
        <h2 className="text-2xl font-bold tracking-tighter uppercase">Brand Leaderboard</h2>
        <span className="text-[10px] font-mono opacity-50 uppercase">
          Aggregated Visibility Score
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leaderboard.map((item, idx) => (
          <motion.div
            key={item.brand}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="border border-[#141414] p-6 relative overflow-hidden group hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors"
          >
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold tracking-tight">{item.brand}</h3>
                {item.brand === primaryBrand && (
                  <span className="text-[8px] border border-current px-1 py-0.5 font-bold uppercase">
                    Primary
                  </span>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] uppercase font-bold opacity-60">Total Score</span>
                  <span className="text-3xl font-mono font-bold leading-none">{item.totalScore}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] uppercase font-bold">
                    <span>Share of Voice</span>
                    <span>{item.shareOfVoice.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 bg-current/10 w-full">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.shareOfVoice}%` }}
                      className="h-full bg-current"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-current/20">
                  <div>
                    <span className="block text-[8px] uppercase font-bold opacity-60">Mentions</span>
                    <span className="text-sm font-mono">{item.mentionCount}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase font-bold opacity-60">Avg Score</span>
                    <span className="text-sm font-mono">{item.avgScore.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 text-8xl font-bold opacity-[0.03] pointer-events-none group-hover:opacity-[0.05]">
              {idx + 1}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
