import express, { RequestHandler } from "express";
import cors from "cors";

// Basic Express server used in development via Vite's expressPlugin in vite.config.ts
// This should match the expectations from AGENTS.md: API routes under /api/* when added.

export function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Health check / ping endpoint
  const pingHandler: RequestHandler = (_req, res) => {
    res.json({ ok: true, message: "gena-code dev server running" });
  };

  app.get("/api/ping", pingHandler);

  return app;
}
