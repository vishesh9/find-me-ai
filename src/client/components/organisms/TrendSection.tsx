import { motion } from "motion/react";
import type { Trend } from "../../../types/visibility";
import { brandMatches } from "../../lib/brand";
import { LineChart } from "../molecules/LineChart";
import type { LineChartDataPoint, LineChartSeries } from "../molecules/LineChart";

/** Distinct colors for trend lines (accessible on light background). Primary uses first. */
const TREND_PALETTE = [
  "#0f172a",
  "#b91c1c",
  "#166534",
  "#1e40af",
  "#7c2d12",
  "#4c1d95",
  "#0e7490",
  "#a16207",
  "#be123c",
  "#0d9488",
];

interface TrendSectionProps {
  trend: Trend | null;
  /** Fallback when trend.primaryBrand is not set (e.g. legacy). */
  primaryBrandFallback: string;
}

function formatBatchLabel(index: number, created_at: string, isLast: boolean): string {
  try {
    const d = new Date(created_at);
    if (isNaN(d.getTime())) return `Run ${index + 1}`;
    const base = `Run ${index + 1} (${d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })})`;
    return isLast ? `${base} · Current` : base;
  } catch {
    return `Run ${index + 1}`;
  }
}

export function TrendSection({ trend, primaryBrandFallback }: TrendSectionProps) {
  const primaryBrand = trend?.primaryBrand ?? primaryBrandFallback;

  if (!trend || trend.batches.length < 2) {
    return (
      <section>
        <div className="flex items-end justify-between mb-6 border-b border-[#141414] pb-2">
          <h2 className="text-2xl font-bold tracking-tighter uppercase">
            Trend over time
          </h2>
          <span className="text-[10px] font-mono opacity-50 uppercase">
            Primary brand score per run
          </span>
        </div>
        <div className="border border-[#141414] p-6 bg-white/50">
          <p className="text-sm font-mono opacity-60">
            Run at least 2 times to see trend over time.
          </p>
        </div>
      </section>
    );
  }

  const batches = trend.batches;
  const seriesWithData = trend.series.filter((s) => s.data.length > 0);
  if (seriesWithData.length === 0) {
    return (
      <section>
        <div className="flex items-end justify-between mb-6 border-b border-[#141414] pb-2">
          <h2 className="text-2xl font-bold tracking-tighter uppercase">
            Trend over time
          </h2>
          <span className="text-[10px] font-mono opacity-50 uppercase">
            Primary brand score per run
          </span>
        </div>
        <div className="border border-[#141414] p-6 bg-white/50">
          <p className="text-sm font-mono opacity-60">No series data yet.</p>
        </div>
      </section>
    );
  }

  const lastIndex = batches.length - 1;
  const chartData: LineChartDataPoint[] = batches.map((b, i) => {
    const row: LineChartDataPoint = {
      xLabel: formatBatchLabel(i, b.created_at, i === lastIndex),
    };
    for (const s of seriesWithData) {
      const pt = s.data.find((d) => d.batchId === b.id);
      row[s.brand] = pt ? pt.totalScore : 0;
    }
    return row;
  });

  const chartSeries: LineChartSeries[] = seriesWithData.map((s, idx) => ({
    id: s.brand,
    label: s.brand,
    dataKey: s.brand,
    color: TREND_PALETTE[idx % TREND_PALETTE.length],
    emphasis: brandMatches(s.brand, primaryBrand),
  }));

  const maxScore = Math.max(
    1,
    ...seriesWithData.flatMap((s) => s.data.map((d) => d.totalScore)),
  );

  return (
    <section>
      <div className="flex items-end justify-between mb-6 border-b border-[#141414] pb-2">
        <h2 className="text-2xl font-bold tracking-tighter uppercase">
          Trend over time
        </h2>
        <span className="text-[10px] font-mono opacity-50 uppercase">
          Score per run · each point = one run
        </span>
      </div>
      <div className="border border-[#141414] p-6 bg-white/50 w-full min-w-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <LineChart
            data={chartData}
            series={chartSeries}
            yDomain={{ min: 0, max: maxScore }}
            formatY={(v) => String(Math.round(v))}
            primaryBrand={primaryBrand}
            ariaLabel="Primary brand score trend by run"
          />
        </motion.div>
      </div>
    </section>
  );
}
