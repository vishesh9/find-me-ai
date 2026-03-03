import type { DatabaseInstance } from "./database";

export interface RunRow {
  id: string;
  user_id: string | null;
  runs_per_prompt: number;
  created_at: string;
  inferred_category?: string | null;
  discovery_mode?: number;
}

export interface RunBrandRow {
  run_id: string;
  brand: string;
  is_primary: number;
  is_discovered?: number;
}

export interface InsertRunOptions {
  inferredCategory?: string | null;
  discoveryMode?: number;
}

export function createRunRepository(db: DatabaseInstance) {
  return {
    insert(
      runId: string,
      runsPerPrompt: number,
      brands: { brand: string; isPrimary: boolean; isDiscovered?: boolean }[],
      prompts: string[],
      options?: InsertRunOptions
    ) {
      const inferredCategory = options?.inferredCategory ?? null;
      const discoveryMode = options?.discoveryMode ?? 0;

      db.prepare(
        "INSERT INTO runs (id, user_id, runs_per_prompt, inferred_category, discovery_mode) VALUES (?, ?, ?, ?, ?)"
      ).run(runId, null, runsPerPrompt, inferredCategory, discoveryMode);

      const insertBrand = db.prepare(
        "INSERT INTO run_brands (run_id, brand, is_primary, is_discovered) VALUES (?, ?, ?, ?)"
      );
      for (const { brand, isPrimary, isDiscovered } of brands) {
        insertBrand.run(runId, brand, isPrimary ? 1 : 0, isDiscovered ? 1 : 0);
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
