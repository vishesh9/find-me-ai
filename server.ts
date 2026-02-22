import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// Terminal log styling (ANSI codes; no-op if not a TTY)
const c = {
  dim: (s: string) => (process.stdout.isTTY ? `\x1b[90m${s}\x1b[0m` : s),
  green: (s: string) => (process.stdout.isTTY ? `\x1b[32m${s}\x1b[0m` : s),
  red: (s: string) => (process.stdout.isTTY ? `\x1b[31m${s}\x1b[0m` : s),
  yellow: (s: string) => (process.stdout.isTTY ? `\x1b[33m${s}\x1b[0m` : s),
  cyan: (s: string) => (process.stdout.isTTY ? `\x1b[36m${s}\x1b[0m` : s),
  bold: (s: string) => (process.stdout.isTTY ? `\x1b[1m${s}\x1b[0m` : s),
};
const log = {
  server: (msg: string) => console.log(c.cyan("◆"), c.bold("Server:"), msg),
  start: (msg: string) => console.log(c.yellow("▶"), c.bold("Run:"), msg),
  step: (prompt: string, run: number, total: number) =>
    console.log(c.dim("  │"), c.cyan("◇"), c.dim(`Prompt "${prompt.slice(0, 40)}${prompt.length > 40 ? "…" : ""}"`), c.dim(`Run ${run}/${total}`)),
  success: (msg: string) => console.log(c.green("  ✓"), c.dim(msg)),
  error: (msg: string, err?: string) => console.error(c.red("  ✗"), c.red(msg), err ? c.dim(err) : ""),
  done: (msg: string) => console.log(c.green("✔"), c.bold(msg)),
  clear: (msg: string) => console.log(c.yellow("🗑"), c.bold("Clear:"), msg),
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = 3000;
const db = new Database("visibility.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS responses (
    id TEXT PRIMARY KEY,
    prompt TEXT,
    response_text TEXT,
    run_number INTEGER,
    provider TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS analysis (
    id TEXT PRIMARY KEY,
    response_id TEXT,
    brand TEXT,
    mentioned BOOLEAN,
    total_mentions INTEGER,
    first_position INTEGER,
    in_first_paragraph BOOLEAN,
    score INTEGER,
    FOREIGN KEY(response_id) REFERENCES responses(id)
  );

  CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Helper to get config
function getConfig(key: string, defaultValue: string): string {
  const row = db.prepare("SELECT value FROM config WHERE key = ?").get(key) as { value: string } | undefined;
  return row ? row.value : (process.env[key] || defaultValue);
}

// LLM Provider Logic
async function callLLM(prompt: string) {
  const temperature = parseFloat(getConfig("TEMPERATURE", "0"));
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");
  const genAI = new GoogleGenAI({ apiKey });
  const result = await genAI.models.generateContent({ 
    model: getConfig("GEMINI_MODEL", "gemini-2.5-flash"),
    contents: [{ role: 'user', parts: [{ text: `Provide a structured, neutral, factual answer. No markdown formatting.\n\nQuestion: ${prompt}` }] }],
    config: { temperature }
  });
  return result.text || "";
}

// Analysis Logic
function analyzeResponse(text: string, brands: string[], primaryBrand: string) {
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
  const firstParagraph = paragraphs[0] || "";
  const lowerText = text.toLowerCase();
  
  const results = brands.map(brand => {
    const lowerBrand = brand.toLowerCase();
    const regex = new RegExp(brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = text.match(regex) || [];
    const totalMentions = matches.length;
    const mentioned = totalMentions > 0;
    const firstPosition = lowerText.indexOf(lowerBrand);
    const inFirstParagraph = firstParagraph.toLowerCase().includes(lowerBrand);
    
    return {
      brand,
      mentioned,
      totalMentions,
      firstPosition,
      inFirstParagraph
    };
  });

  // Scoring
  return results.map(res => {
    let score = 0;
    if (res.mentioned) {
      score += 1;
      if (res.inFirstParagraph) score += 3;
      if (res.totalMentions > 2) score += 2;
      
      // Check if mentioned before any competitor
      const competitors = results.filter(r => r.brand !== res.brand && r.mentioned);
      const isBeforeAll = competitors.every(comp => res.firstPosition < comp.firstPosition);
      if (res.mentioned && (competitors.length === 0 || isBeforeAll)) {
        score += 2;
      }
    }
    return { ...res, score };
  });
}

// API Routes
app.get("/api/results", (req, res) => {
  const responses = db.prepare("SELECT * FROM responses ORDER BY created_at DESC").all();
  const analysis = db.prepare("SELECT * FROM analysis").all();
  
  // Aggregate Leaderboard
  const brands = Array.from(new Set(analysis.map((a: any) => a.brand)));
  const leaderboard = brands.map(brand => {
    const brandAnalysis = analysis.filter((a: any) => a.brand === brand);
    const totalScore = brandAnalysis.reduce((sum: number, a: any) => sum + (Number(a.score) || 0), 0);
    const mentionCount = brandAnalysis.filter((a: any) => a.mentioned).length;
    const avgScore = brands.length > 0 && responses.length > 0 ? (totalScore as number) / ((responses.length as number) / (brands.length as number)) : 0;
    return {
      brand,
      totalScore,
      mentionCount,
      avgScore
    };
  });

  const totalAllScores = leaderboard.reduce((sum: number, b: any) => sum + (Number(b.totalScore) || 0), 0);
  const finalLeaderboard = leaderboard.map(b => ({
    ...b,
    shareOfVoice: totalAllScores > 0 ? (Number(b.totalScore) / totalAllScores) * 100 : 0
  })).sort((a, b) => Number(b.totalScore) - Number(a.totalScore));

  // Prompt Breakdown
  const prompts = Array.from(new Set(responses.map((r: any) => r.prompt)));
  const promptBreakdown = prompts.map(prompt => {
    const promptResponses = responses.filter((r: any) => r.prompt === prompt);
    const promptAnalysis = analysis.filter((a: any) => promptResponses.some((r: any) => r.id === a.response_id));
    
    const brandScores = brands.map(brand => {
      const score = promptAnalysis.filter((a: any) => a.brand === brand).reduce((sum: number, a: any) => sum + (Number(a.score) || 0), 0);
      return { brand, score };
    });

    return { prompt, brandScores };
  });

  res.json({ leaderboard: finalLeaderboard, promptBreakdown, rawResponses: responses });
});

app.post("/api/run", async (req, res) => {
  const { brands, primaryBrand, prompts, runsPerPrompt } = req.body;
  log.start(`${prompts.length} prompt(s), ${runsPerPrompt} run(s) each → ${prompts.length * runsPerPrompt} total LLM call(s)`);

  const results = [];
  for (const prompt of prompts) {
    for (let i = 0; i < runsPerPrompt; i++) {
      try {
        log.step(prompt, i + 1, runsPerPrompt);
        const responseText = await callLLM(prompt);
        const responseId = uuidv4();

        db.prepare("INSERT INTO responses (id, prompt, response_text, run_number, provider) VALUES (?, ?, ?, ?, ?)")
          .run(responseId, prompt, responseText, i + 1, "gemini");

        const analysis = analyzeResponse(responseText, brands, primaryBrand);
        for (const item of analysis) {
          db.prepare("INSERT INTO analysis (id, response_id, brand, mentioned, total_mentions, first_position, in_first_paragraph, score) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
            .run(uuidv4(), responseId, item.brand, item.mentioned ? 1 : 0, item.totalMentions, item.firstPosition, item.inFirstParagraph ? 1 : 0, item.score);
        }
        log.success(`Stored response + analysis (gemini)`);
        results.push({ prompt, run: i + 1, status: "success" });
      } catch (error: any) {
        log.error(`Prompt "${prompt.slice(0, 30)}${prompt.length > 30 ? "…" : ""}" run ${i + 1}/${runsPerPrompt}`, error.message);
        results.push({ prompt, run: i + 1, status: "error", error: error.message });
      }
    }
  }

  log.done("Run completed.");
  res.json({ results });
});

app.post("/api/clear", (req, res) => {
  db.prepare("DELETE FROM analysis").run();
  db.prepare("DELETE FROM responses").run();
  log.clear("All responses and analysis deleted.");
  res.json({ status: "ok" });
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    log.server(`http://localhost:${PORT}`);
  });
}

startServer();
