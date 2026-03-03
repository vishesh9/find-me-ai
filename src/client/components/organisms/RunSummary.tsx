import type { RunInfo } from "../../../types/visibility";

interface RunSummaryProps {
  runInfo: RunInfo;
  primaryBrand: string;
}

export function RunSummary({ runInfo, primaryBrand }: RunSummaryProps) {
  const brand = runInfo.primaryBrand ?? primaryBrand;
  const hasDiscovery =
    runInfo.inferredCategory ||
    (runInfo.discoveredCompetitors && runInfo.discoveredCompetitors.length > 0);

  if (!hasDiscovery) return null;

  const competitorText =
    (runInfo.discoveredCompetitors?.length ?? 0) > 0
      ? runInfo.discoveredCompetitors!.join(", ")
      : "";
  const categoryText = runInfo.inferredCategory ?? "this space";
  const queryCount = runInfo.discoveredPrompts?.length ?? 0;
  const queryLabel = queryCount === 1 ? "1 query" : `${queryCount} queries`;

  return (
    <section className="mb-6 p-4 border border-[#141414] bg-[#141414]/5">
      <p className="text-xs font-mono uppercase opacity-70">
        Compared <strong className="opacity-100">{brand}</strong>
        {competitorText && (
          <>
            {" "}
            to {competitorText}
          </>
        )}{" "}
        in {categoryText}. {queryLabel} run.
      </p>
    </section>
  );
}
