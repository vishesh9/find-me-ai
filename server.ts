import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import express from "express";

import { config } from "./src/server/config";
import { createDatabase } from "./src/server/db/database";
import { createConfigRepository } from "./src/server/db/config.repository";
import { createRunRepository } from "./src/server/db/run.repository";
import { createResponseRepository } from "./src/server/db/response.repository";
import { createAnalysisRepository } from "./src/server/db/analysis.repository";
import { createLLMService } from "./src/server/services/llm.service";
import { createResultsService } from "./src/server/services/results.service";
import { createApp } from "./src/server/app";
import { log } from "./src/server/lib/logger";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database and repositories
const db = createDatabase(config.dbPath);
const configRepo = createConfigRepository(db);
const runRepo = createRunRepository(db);
const responseRepo = createResponseRepository(db);
const analysisRepo = createAnalysisRepository(db);

// Services
const llmService = createLLMService(config.gemini.apiKey, configRepo);
const resultsService = createResultsService(runRepo, responseRepo, analysisRepo);

// Express app and API
const app = createApp({
  resultsService,
  llmService,
  runRepo,
  responseRepo,
  analysisRepo,
});

// Vite (dev) or static (production)
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(config.port, "0.0.0.0", () => {
    log.server(`http://localhost:${config.port}`);
  });
}

startServer();
