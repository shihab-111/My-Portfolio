import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
import connectDB from "./db.js";

import authRoutes from "./routes/auth.js";
import siteRoutes from "./routes/site.js";
import mediaRoutes from "./routes/media.js";

const app = express();

// On Vercel the front end and API share a domain, so CORS is only needed
// for local development (Vite on :5173 talking to Express on :4000).
const origins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

if (origins.length) {
  app.use(cors({ origin: origins }));
}

app.use(express.json({ limit: "2mb" }));

// In development, uploads are written to ./uploads and served from here.
// In production Vercel Blob serves them from its own CDN domain.
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  app.use(
    "/uploads",
    express.static(path.resolve("uploads"), {
      maxAge: "7d",
      setHeaders: (res) => res.set("Cross-Origin-Resource-Policy", "cross-origin"),
    })
  );
}

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Connect lazily, per request. On a warm lambda this resolves instantly
// from the cache; on a cold start it's the one await that matters.
app.use(async (_req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection failed:", err.message);
    res.status(503).json({
      error: "The database is unavailable. Try again in a moment.",
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/site", siteRoutes);
app.use("/api/media", mediaRoutes);

app.use("/api", (_req, res) => res.status(404).json({ error: "Not found." }));

app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || (err.name === "ValidationError" ? 400 : 500);
  res.status(status).json({ error: err.message || "Something went wrong." });
});

export default app;
