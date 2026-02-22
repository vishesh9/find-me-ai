import { Search } from "lucide-react";
import type { PromptBreakdown } from "../../../types/visibility";

interface PromptBreakdownSectionProps {
  promptBreakdown: PromptBreakdown[];
}

export function PromptBreakdownSection({ promptBreakdown }: PromptBreakdownSectionProps) {
  return (
    <section>
      <div className="flex items-end justify-between mb-6 border-b border-[#141414] pb-2">
        <h2 className="text-2xl font-bold tracking-tighter uppercase">Prompt Breakdown</h2>
        <span className="text-[10px] font-mono opacity-50 uppercase">
          Score per Brand per Prompt
        </span>
      </div>
      <div className="space-y-4">
        {promptBreakdown.map((item, idx) => (
          <div key={idx} className="border border-[#141414] p-4 bg-white/50">
            <div className="flex items-center gap-3 mb-4">
              <Search className="w-4 h-4 opacity-40" />
              <h4 className="font-serif italic text-lg">{item.prompt}</h4>
            </div>
            <div className="flex flex-wrap gap-6">
              {item.brandScores.map((bs, bidx) => (
                <div key={bidx} className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase opacity-60">{bs.brand}:</span>
                  <span className="font-mono font-bold">{bs.score}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
