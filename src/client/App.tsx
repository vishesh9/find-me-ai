import React, { useState } from "react";
import { useVisibility } from "./hooks/useVisibility";
import { MainLayout } from "./components/templates";
import {
  AppHeader,
  AppFooter,
  ConfigForm,
  ConfirmModal,
  LeaderboardSection,
  TrendSection,
  PromptBreakdownSection,
  RawDataLogSection,
  EmptyState,
} from "./components/organisms";

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
