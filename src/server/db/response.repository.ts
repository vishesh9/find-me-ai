import type { DatabaseInstance } from "./database";

export interface ResponseRow {
  id: string;
  run_id: string | null;
  prompt: string;
  response_text: string;
  run_number: number;
  provider: string;
  created_at: string;
}

export function createResponseRepository(db: DatabaseInstance) {
  return {
    insert(row: {
      id: string;
      run_id: string | null;
      prompt: string;
      response_text: string;
      run_number: number;
      provider: string;
    }) {
      db.prepare(
        "INSERT INTO responses (id, run_id, prompt, response_text, run_number, provider) VALUES (?, ?, ?, ?, ?, ?)"
      ).run(
        row.id,
        row.run_id ?? null,
        row.prompt,
        row.response_text,
        row.run_number,
        row.provider
      );
    },

    getByRunId(runId: string): ResponseRow[] {
      return db
        .prepare("SELECT * FROM responses WHERE run_id = ? ORDER BY created_at DESC")
        .all(runId) as ResponseRow[];
    },

    getLegacy(): ResponseRow[] {
      return db
        .prepare("SELECT * FROM responses WHERE run_id IS NULL ORDER BY created_at DESC")
        .all() as ResponseRow[];
    },

    deleteAll() {
      db.prepare("DELETE FROM responses").run();
    },
  };
}

export type ResponseRepository = ReturnType<typeof createResponseRepository>;
