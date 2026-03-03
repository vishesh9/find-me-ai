import express from "express";
import { createApiRouter } from "./routes/router";
import type { ApiDeps } from "./routes/router";

export function createApp(deps: ApiDeps) {
  const app = express();
  app.use(express.json());
  app.use("/api", createApiRouter(deps));
  return app;
}
