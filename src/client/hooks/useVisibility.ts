import { useState, useEffect, useCallback } from "react";
import type { Results, Trend } from "../../types/visibility";

export function useVisibility() {
  const [primaryBrand, setPrimaryBrand] = useState("Zoho CRM");
  const [competitors, setCompetitors] = useState("HubSpot, Freshsales, Salesforce, Pipedrive");
  const [prompts, setPrompts] = useState("Best CRM for Indian startups\nAffordable CRM for small businesses in India");
  const [runsPerPrompt, setRunsPerPrompt] = useState(3);

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
    } catch (err: unknown) {
      console.error("Failed to fetch results", err);
      setError("Could not load previous results. Check server connection.");
    }
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const brandList = [primaryBrand, ...competitors.split(",").map((c) => c.trim())].filter(Boolean);
      const promptList = prompts.split("\n").map((p) => p.trim()).filter(Boolean);

      if (brandList.length === 0 || promptList.length === 0) {
        throw new Error("Please provide at least one brand and one prompt.");
      }

      const response = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brands: brandList,
          primaryBrand,
          prompts: promptList,
          runsPerPrompt,
        }),
      });

      const data = await response.json();

      const failures = data.results.filter((r: { status: string }) => r.status === "error");
      if (failures.length > 0) {
        setError(`Completed with ${failures.length} errors. Check console for details.`);
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
