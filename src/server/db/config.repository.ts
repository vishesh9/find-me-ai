import type { DatabaseInstance } from "./database";

export function createConfigRepository(db: DatabaseInstance) {
  return {
    get(key: string, defaultValue: string): string {
      const row = db.prepare("SELECT value FROM config WHERE key = ?").get(key) as { value: string } | undefined;
      return row ? row.value : (process.env[key] || defaultValue);
    },
  };
}

export type ConfigRepository = ReturnType<typeof createConfigRepository>;
