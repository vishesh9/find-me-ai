import Database from "better-sqlite3";

export function createDatabase(dbPath: string = "visibility.db") {
  const db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS runs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      runs_per_prompt INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS run_brands (
      run_id TEXT NOT NULL,
      brand TEXT NOT NULL,
      is_primary INTEGER NOT NULL,
      PRIMARY KEY (run_id, brand),
      FOREIGN KEY (run_id) REFERENCES runs(id)
    );

    CREATE TABLE IF NOT EXISTS run_prompts (
      run_id TEXT NOT NULL,
      prompt_index INTEGER NOT NULL,
      prompt_text TEXT NOT NULL,
      PRIMARY KEY (run_id, prompt_index),
      FOREIGN KEY (run_id) REFERENCES runs(id)
    );

    CREATE TABLE IF NOT EXISTS responses (
      id TEXT PRIMARY KEY,
      run_id TEXT,
      prompt TEXT,
      response_text TEXT,
      run_number INTEGER,
      provider TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (run_id) REFERENCES runs(id)
    );

    CREATE TABLE IF NOT EXISTS analysis (
      id TEXT PRIMARY KEY,
      response_id TEXT NOT NULL,
      brand TEXT NOT NULL,
      mentioned INTEGER NOT NULL,
      total_mentions INTEGER NOT NULL,
      first_position INTEGER NOT NULL,
      in_first_paragraph INTEGER NOT NULL,
      score INTEGER NOT NULL,
      FOREIGN KEY (response_id) REFERENCES responses(id)
    );

    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // Migration: add run_id to responses if table existed without it
  const columns = db.prepare("PRAGMA table_info(responses)").all() as { name: string }[];
  if (!columns.some((c) => c.name === "run_id")) {
    db.exec("ALTER TABLE responses ADD COLUMN run_id TEXT");
  }

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_responses_run_id ON responses(run_id);
    CREATE INDEX IF NOT EXISTS idx_runs_created_at ON runs(created_at);
  `);

  return db;
}

export type DatabaseInstance = ReturnType<typeof createDatabase>;
