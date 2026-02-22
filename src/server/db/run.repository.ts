import type { DatabaseInstance } from "./database";

export interface RunRow {
  id: string;
  user_id: string | null;
  runs_per_prompt: number;
  created_at: string;
}

export interface RunBrandRow {
  run_id: string;
  brand: string;
  is_primary: number;
}

export function createRunRepository(db: DatabaseInstance) {
  return {
    insert(
      runId: string,
      runsPerPrompt: number,
      brands: { brand: string; isPrimary: boolean }[],
      prompts: string[]
    ) {
      db.prepare(
        "INSERT INTO runs (id, user_id, runs_per_prompt) VALUES (?, ?, ?)"
      ).run(runId, null, runsPerPrompt);

      const insertBrand = db.prepare(
        "INSERT INTO run_brands (run_id, brand, is_primary) VALUES (?, ?, ?)"
      );
      for (const { brand, isPrimary } of brands) {
        insertBrand.run(runId, brand, isPrimary ? 1 : 0);
      }

      const insertPrompt = db.prepare(
        "INSERT INTO run_prompts (run_id, prompt_index, prompt_text) VALUES (?, ?, ?)"
      );
      prompts.forEach((prompt_text, prompt_index) => {
        insertPrompt.run(runId, prompt_index, prompt_text);
      });
    },

    getLatest(): RunRow | null {
      const row = db
        .prepare("SELECT * FROM runs ORDER BY created_at DESC LIMIT 1")
        .get() as RunRow | undefined;
      return row ?? null;
    },

    /** All runs in chronological order (for trend). */
    getAll(): RunRow[] {
      return db.prepare("SELECT * FROM runs ORDER BY created_at ASC").all() as RunRow[];
    },

    /** Brands for a run (primary first), for filtering trend to current run's set. */
    getBrandsByRunId(runId: string): RunBrandRow[] {
      return db
        .prepare("SELECT * FROM run_brands WHERE run_id = ? ORDER BY is_primary DESC, brand ASC")
        .all(runId) as RunBrandRow[];
    },

    deleteAll() {
      db.prepare("DELETE FROM run_brands").run();
      db.prepare("DELETE FROM run_prompts").run();
      db.prepare("DELETE FROM runs").run();
    },
  };
}

export type RunRepository = ReturnType<typeof createRunRepository>;
