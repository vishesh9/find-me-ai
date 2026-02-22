import express from "express";
import { createApiRouter } from "./routes";
import type { ApiDeps } from "./routes";

export function createApp(deps: ApiDeps) {
  const app = express();
  app.use(express.json());
  app.use("/api", createApiRouter(deps));
  return app;
}
