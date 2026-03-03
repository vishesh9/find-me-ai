import { useState, useEffect, useCallback } from "react";
import type { Results, Trend } from "../../types/visibility";

export function useVisibility() {
  const [primaryBrand, setPrimaryBrand] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [prompts, setPrompts] = useState("");
  const [runsPerPrompt, setRunsPerPrompt] = useState(2);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Results | null>(null);
  const [trend, setTrend] = useState<Trend | null>(null);

  const fetchResults = useCallback(async () => {
    try {
      const [resData, resTrend] = await Promise.all([
        fetch("/api/results"),
        fetch("/api/results/trend").catch(() => null),
      ]);
      if (!resData.ok) throw new Error("Failed to fetch results");
      const data = await resData.json();
      setResults(data);
      if (resTrend?.ok) {
        const trendData = await resTrend.json();
        setTrend(trendData);
      } else {
        setTrend(null);
      }
      setError(null);
    } catch (err: unknown) {
      console.error("Failed to fetch results", err);
      setError("Could not load previous results. Check server connection.");
    }
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  useEffect(() => {
    const info = results?.runInfo;
    if (
      !info?.discoveredCompetitors?.length ||
      !info?.discoveredPrompts?.length
    )
      return;
    setCompetitors((prev) =>
      prev.trim() ? prev : info.discoveredCompetitors!.join(", ")
    );
    setPrompts((prev) =>
      prev.trim() ? prev : info.discoveredPrompts!.join("\n")
    );
  }, [
    results?.runInfo?.discoveredCompetitors,
    results?.runInfo?.discoveredPrompts,
  ]);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const primaryTrimmed = primaryBrand.trim();
      const competitorList = competitors.split(",").map((c) => c.trim()).filter(Boolean);
      const promptList = prompts.split("\n").map((p) => p.trim()).filter(Boolean);
      const useAdvanced = primaryTrimmed && competitorList.length > 0 && promptList.length > 0;

      if (!primaryTrimmed) {
        throw new Error("Please enter your brand (name or website).");
      }
      if (useAdvanced) {
        const brandList = [primaryTrimmed, ...competitorList];
        const response = await fetch("/api/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brands: brandList,
            primaryBrand: primaryTrimmed,
            prompts: promptList,
            runsPerPrompt,
          }),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Run failed.");
        }
        const data = await response.json();
        const failures = (data.results || []).filter((r: { status: string }) => r.status === "error");
        if (failures.length > 0) {
          setError(`Completed with ${failures.length} errors. Check console for details.`);
        }
      } else {
        const response = await fetch("/api/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            primaryBrand: primaryTrimmed,
            runsPerPrompt,
          }),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Run failed.");
        }
        const data = await response.json();
        const failures = (data.results || []).filter((r: { status: string }) => r.status === "error");
        if (failures.length > 0) {
          setError(`Completed with ${failures.length} errors. Check console for details.`);
        }
      }

      await fetchResults();
    } catch (err: unknown) {
      console.error("Run failed", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred during the analysis run."
      );
    } finally {
      setLoading(false);
    }
  }, [primaryBrand, competitors, prompts, runsPerPrompt, fetchResults]);

  const clearData = useCallback(async () => {
    await fetch("/api/clear", { method: "POST" });
    setResults(null);
    setTrend(null);
  }, []);

  const exportJSON = useCallback(() => {
    if (!results) return;
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "visibility_results.json";
    a.click();
  }, [results]);

  return {
    primaryBrand,
    setPrimaryBrand,
    competitors,
    setCompetitors,
    prompts,
    setPrompts,
    runsPerPrompt,
    setRunsPerPrompt,
    results,
    trend,
    loading,
    error,
    run,
    clearData,
    exportJSON,
  };
}
