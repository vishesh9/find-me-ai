import { useState, useRef, useEffect } from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { brandMatches } from "../../lib/brand";

const TICK_STYLE = {
  fontSize: 10,
  fill: "currentColor",
  opacity: 0.5,
  fontFamily: "ui-monospace, monospace",
  textTransform: "uppercase" as const,
};

const X_AXIS_KEY = "xLabel";

export interface LineChartSeries {
  id: string;
  label: string;
  /** Key in each data row for this series' value */
  dataKey: string;
  color?: string;
  emphasis?: boolean;
}

export interface LineChartDataPoint {
  /** X-axis label (e.g. "Run 1 (22 Feb, 15:13)") */
  xLabel: string;
  [valueKey: string]: string | number;
}

export interface LineChartProps {
  /** One object per x point; must include xLabel and keys matching series[].dataKey */
  data: LineChartDataPoint[];
  series: LineChartSeries[];
  yDomain: { min: number; max: number };
  formatY?: (value: number) => string;
  /** When set, series with matching label get "Primary" badge in legend */
  primaryBrand?: string;
  height?: number;
  /** Accessibility label for the chart */
  ariaLabel?: string;
}

export function LineChart({
  data,
  series,
  yDomain,
  formatY = (v) => `${v}%`,
  primaryBrand,
  height = 280,
  ariaLabel,
}: LineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (typeof w === "number" && w > 0) setWidth(w);
    });
    ro.observe(el);
    const w = el.getBoundingClientRect().width;
    if (w > 0) setWidth(w);
    return () => ro.disconnect();
  }, [data]);

  const renderTooltip = (props: {
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
  }) => {
    const { payload, label } = props;
    if (!payload?.length || label == null) return null;
    return (
      <div
        className="border border-[#141414] bg-white px-3 py-2 shadow-sm font-mono text-[10px] uppercase"
        style={{ color: "inherit" }}
      >
        <div className="font-bold opacity-70 mb-1.5">{label}</div>
        {payload.map((p) => (
          <div key={p.name} className="flex justify-between gap-4">
            <span style={{ color: p.color }}>{p.name}</span>
            <span className="font-bold">{typeof p.value === "number" ? formatY(p.value) : p.value}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderLegend = (props: { payload?: Array<{ value: string; color: string }> }) => {
    const { payload = [] } = props;
    return (
      <div className="flex flex-wrap gap-4 mt-2 justify-center">
        {payload.map((entry) => {
          const isPrimary = primaryBrand != null && brandMatches(entry.value, primaryBrand);
          return (
            <div
              key={entry.value}
              className="flex items-center gap-2 text-[10px] uppercase font-bold opacity-90"
            >
              <span
                className="w-4 h-1 rounded-sm shrink-0"
                style={{
                  backgroundColor: entry.color,
                  opacity: isPrimary ? 1 : 0.7,
                }}
              />
              <span>{entry.value}</span>
              {isPrimary && (
                <span className="text-[8px] border border-current px-1 py-0.5 opacity-60">
                  Primary
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const { min: yMin, max: yMax } = yDomain;

  return (
    <div
      ref={containerRef}
      className="w-full outline-none **:outline-none **:focus:outline-none"
      aria-label={ariaLabel}
      role={ariaLabel ? "img" : undefined}
    >
      <RechartsLineChart
        className="outline-none **:outline-none"
        width={width}
        height={height}
        data={data}
        margin={{ top: 20, right: 48, bottom: 24, left: 36 }}
      >
        <CartesianGrid
          strokeDasharray="2 2"
          stroke="currentColor"
          strokeOpacity={0.1}
          vertical={false}
        />
        <XAxis
          dataKey={X_AXIS_KEY}
          tick={TICK_STYLE}
          axisLine={{ stroke: "#141414", strokeOpacity: 0.3 }}
          tickLine={false}
          interval={0}
        />
        <YAxis
          domain={[yMin, yMax]}
          tickFormatter={formatY}
          tick={TICK_STYLE}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip
          content={renderTooltip}
          cursor={{ stroke: "#141414", strokeOpacity: 0.2, strokeDasharray: "2 2" }}
        />
        <Legend content={renderLegend} wrapperStyle={{ marginBottom: 0, marginTop: 8 }} />
        {series.map((s) => (
          <Line
            key={s.id}
            type="monotone"
            dataKey={s.dataKey}
            name={s.label}
            stroke={s.color ?? "currentColor"}
            strokeWidth={s.emphasis ? 2.5 : 1.5}
            strokeOpacity={s.emphasis ? 1 : 0.85}
            dot={{ r: 3, strokeWidth: 1.5 }}
            activeDot={{ r: 5, strokeWidth: 2 }}
            connectNulls
          />
        ))}
      </RechartsLineChart>
    </div>
  );
}
