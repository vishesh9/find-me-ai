import { BarChart3 } from "lucide-react";

export function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center opacity-30 space-y-4">
      <BarChart3 className="w-16 h-16 stroke-[1px]" />
      <p className="font-serif italic text-center max-w-sm">
        Enter your brand above and run analysis to see how you rank when people ask AI for recommendations.
      </p>
    </div>
  );
}
