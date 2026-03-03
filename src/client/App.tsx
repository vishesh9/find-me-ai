import React, { useState } from "react";
import { useVisibility } from "./hooks/useVisibility";
import { MainLayout } from "./components/templates/MainLayout";
import { AppHeader } from "./components/organisms/AppHeader";
import { AppFooter } from "./components/organisms/AppFooter";
import { ConfigForm } from "./components/organisms/ConfigForm";
import { ConfirmModal } from "./components/organisms/ConfirmModal";
import { RunSummary } from "./components/organisms/RunSummary";
import { LeaderboardSection } from "./components/organisms/LeaderboardSection";
import { TrendSection } from "./components/organisms/TrendSection";
import { PromptBreakdownSection } from "./components/organisms/PromptBreakdownSection";
import { RawDataLogSection } from "./components/organisms/RawDataLogSection";
import { EmptyState } from "./components/organisms/EmptyState";

export default function App() {
  const [showClearModal, setShowClearModal] = useState(false);
  const {
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
  } = useVisibility();

  return (
    <>
      <ConfirmModal
        open={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={clearData}
        title="Clear all data"
        message="Are you sure you want to clear all runs, responses and analysis? This cannot be undone."
        confirmLabel="Clear all"
        cancelLabel="Cancel"
        variant="destructive"
      />
      <MainLayout
        header={
          <AppHeader
            onClear={() => setShowClearModal(true)}
            onExport={exportJSON}
            hasResults={results !== null}
          />
        }
        sidebar={
          <ConfigForm
            primaryBrand={primaryBrand}
            setPrimaryBrand={setPrimaryBrand}
            competitors={competitors}
            setCompetitors={setCompetitors}
            prompts={prompts}
            setPrompts={setPrompts}
            runsPerPrompt={runsPerPrompt}
            setRunsPerPrompt={setRunsPerPrompt}
            loading={loading}
            error={error}
            onRun={run}
          />
        }
        footer={
          <AppFooter responseCount={results?.rawResponses.length ?? null} />
        }
      >
        {!results ? (
          <EmptyState />
        ) : (
          <div className="space-y-12">
            {results.runInfo && (
              <RunSummary runInfo={results.runInfo} primaryBrand={primaryBrand} />
            )}
            <LeaderboardSection
              leaderboard={results.leaderboard}
              primaryBrand={results.runInfo?.primaryBrand ?? primaryBrand}
              runCreatedAt={results.runInfo?.createdAt ?? null}
            />
            <TrendSection
              trend={trend}
              primaryBrandFallback={primaryBrand}
            />
            <PromptBreakdownSection promptBreakdown={results.promptBreakdown} />
            <RawDataLogSection rawResponses={results.rawResponses} />
          </div>
        )}
      </MainLayout>
    </>
  );
}
