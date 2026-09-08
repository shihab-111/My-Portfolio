import { Router } from "express";
import Site from "../models/Site.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

/** Public: everything the landing page needs, in one request. */
router.get("/", async (_req, res) => {
  const site = await Site.getSingleton();
  const data = site.toObject();

  // Hide unpublished projects from the public payload.
  data.projects.items = (data.projects.items || [])
    .filter((p) => p.published !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  data.services.items = (data.services.items || []).sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  res.json(data);
});

/** Admin: the raw document, including unpublished items. */
router.get("/admin", requireAuth, async (_req, res) => {
  const site = await Site.getSingleton();
  res.json(site.toObject());
});

/**
 * Admin: patch any subset of the document. Sections not present in the body
 * are left untouched, so the panel can save one tab at a time.
 */
const EDITABLE = [
  "meta",
  "theme",
  "nav",
  "hero",
  "marquee",
  "about",
  "services",
  "projects",
];

router.put("/", requireAuth, async (req, res) => {
  const site = await Site.getSingleton();

  for (const key of EDITABLE) {
    if (req.body[key] === undefined) continue;
    site.set(key, req.body[key]);
  }

  try {
    await site.save();
    res.json(site.toObject());
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ---------- list helpers: services & projects ---------- */

const LISTS = {
  services: "services.items",
  projects: "projects.items",
};

function resolveList(site, listName) {
  const path = LISTS[listName];
  if (!path) return null;
  return site.get(path);
}

router.post("/:list/items", requireAuth, async (req, res) => {
  const { list } = req.params;
  if (!LISTS[list]) return res.status(404).json({ error: "Unknown section." });

  const site = await Site.getSingleton();
  const items = resolveList(site, list);
  items.push({ ...req.body, order: req.body.order ?? items.length });

  try {
    await site.save();
    res.status(201).json(items[items.length - 1]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:list/items/:id", requireAuth, async (req, res) => {
  const { list, id } = req.params;
  if (!LISTS[list]) return res.status(404).json({ error: "Unknown section." });

  const site = await Site.getSingleton();
  const item = resolveList(site, list).id(id);
  if (!item) return res.status(404).json({ error: "That item no longer exists." });

  item.set(req.body);

  try {
    await site.save();
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:list/items/:id", requireAuth, async (req, res) => {
  const { list, id } = req.params;
  if (!LISTS[list]) return res.status(404).json({ error: "Unknown section." });

  const site = await Site.getSingleton();
  const item = resolveList(site, list).id(id);
  if (!item) return res.status(404).json({ error: "That item no longer exists." });

  item.deleteOne();
  await site.save();
  res.json({ ok: true });
});

/** Body: { ids: [...] } in the desired display order. */
router.post("/:list/reorder", requireAuth, async (req, res) => {
  const { list } = req.params;
  if (!LISTS[list]) return res.status(404).json({ error: "Unknown section." });

  const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
  const site = await Site.getSingleton();
  const items = resolveList(site, list);

  ids.forEach((id, index) => {
    const item = items.id(id);
    if (item) item.order = index;
  });

  await site.save();
  res.json({ ok: true });
});

export default router;
