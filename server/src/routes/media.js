import { Router } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import Media from "../models/Media.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

/**
 * Two storage backends:
 *
 *  - Vercel Blob, used whenever BLOB_READ_WRITE_TOKEN is present. Vercel's
 *    filesystem is read-only apart from /tmp, and /tmp is wiped between
 *    invocations, so uploads must go to object storage.
 *  - Local disk, used in development so you don't need a Blob store to run
 *    the project on your machine.
 */
const USE_BLOB = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const UPLOAD_DIR = path.resolve("uploads");

// Vercel caps a serverless request body at 4.5 MB.
const MAX_BYTES = USE_BLOB ? 4 * 1024 * 1024 : 12 * 1024 * 1024;

const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) {
      return cb(new Error("Upload a PNG, JPG, WEBP, GIF, AVIF or SVG image."));
    }
    cb(null, true);
  },
});

function safeName(originalName) {
  const ext = path.extname(originalName || "").toLowerCase().slice(0, 10);
  return `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
}

async function store(file) {
  const filename = safeName(file.originalname);

  if (USE_BLOB) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`portfolio/${filename}`, file.buffer, {
      access: "public",
      contentType: file.mimetype,
    });
    return { filename, url: blob.url, blobUrl: blob.url };
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, filename), file.buffer);
  const base = (process.env.PUBLIC_URL || "").replace(/\/$/, "");
  return { filename, url: `${base}/uploads/${filename}` };
}

async function destroy(doc) {
  if (doc.blobUrl) {
    const { del } = await import("@vercel/blob");
    await del(doc.blobUrl);
    return;
  }
  await fs.rm(path.join(UPLOAD_DIR, doc.filename), { force: true });
}

router.get("/", requireAuth, async (_req, res) => {
  const items = await Media.find().sort({ createdAt: -1 }).limit(300);
  res.json(items);
});

router.post("/", requireAuth, (req, res, next) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      const tooBig = err.code === "LIMIT_FILE_SIZE";
      return res.status(400).json({
        error: tooBig
          ? `That file is over ${Math.round(MAX_BYTES / 1024 / 1024)} MB. Compress it and try again.`
          : err.message,
      });
    }
    if (!req.file) return res.status(400).json({ error: "Choose a file to upload." });

    try {
      const stored = await store(req.file);
      const doc = await Media.create({
        ...stored,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        label: req.body.label || "",
      });
      res.status(201).json(doc);
    } catch (e) {
      next(e);
    }
  });
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const doc = await Media.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "That file no longer exists." });

    await destroy(doc);
    await doc.deleteOne();
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
