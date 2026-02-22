import type { DatabaseInstance } from "./database";

export interface AnalysisRow {
  id: string;
  response_id: string;
  brand: string;
  mentioned: number;
  total_mentions: number;
  first_position: number;
  in_first_paragraph: number;
  score: number;
}

export function createAnalysisRepository(db: DatabaseInstance) {
  return {
    insert(row: {
      id: string;
      response_id: string;
      brand: string;
      mentioned: boolean;
      total_mentions: number;
      first_position: number;
      in_first_paragraph: boolean;
      score: number;
    }) {
      db.prepare(
        "INSERT INTO analysis (id, response_id, brand, mentioned, total_mentions, first_position, in_first_paragraph, score) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      ).run(
        row.id,
        row.response_id,
        row.brand,
        row.mentioned ? 1 : 0,
        row.total_mentions,
        row.first_position,
        row.in_first_paragraph ? 1 : 0,
        row.score
      );
    },

    getAll(): AnalysisRow[] {
      return db.prepare("SELECT * FROM analysis").all() as AnalysisRow[];
    },

    deleteAll() {
      db.prepare("DELETE FROM analysis").run();
    },
  };
}

export type AnalysisRepository = ReturnType<typeof createAnalysisRepository>;
