import type { DatabaseInstance } from "./database";

export interface DiscoveryCacheRow {
  brand_key: string;
  category: string;
  competitors_json: string;
  prompts_json: string;
  created_at: string;
}

export interface DiscoveryResult {
  category: string;
  competitors: string[];
  prompts: string[];
}

export function createDiscoveryRepository(db: DatabaseInstance) {
  return {
    get(brandKey: string): DiscoveryResult | null {
      const row = db
        .prepare(
          "SELECT brand_key, category, competitors_json, prompts_json FROM discovery_cache WHERE brand_key = ?"
        )
        .get(brandKey) as DiscoveryCacheRow | undefined;
      if (!row) return null;
      try {
        return {
          category: row.category,
          competitors: JSON.parse(row.competitors_json) as string[],
          prompts: JSON.parse(row.prompts_json) as string[],
        };
      } catch {
        return null;
      }
    },

    insert(
      brandKey: string,
      category: string,
      competitors: string[],
      prompts: string[]
    ): void {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO discovery_cache (brand_key, category, competitors_json, prompts_json)
        VALUES (?, ?, ?, ?)
      `);
      stmt.run(
        brandKey,
        category,
        JSON.stringify(competitors),
        JSON.stringify(prompts)
      );
    },
  };
}

export type DiscoveryRepository = ReturnType<typeof createDiscoveryRepository>;
