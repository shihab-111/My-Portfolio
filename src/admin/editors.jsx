import { useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, GripVertical } from "lucide-react";
import {
  Field,
  Input,
  Textarea,
  Button,
  Card,
  ImageField,
} from "./ui.jsx";

/* Small helper: immutably update one key of a section. */
const set = (obj, key, value) => ({ ...obj, [key]: value });

/* ------------------------------- general ------------------------------- */

export function GeneralEditor({ draft, update }) {
  const meta = draft.meta || {};
  const theme = draft.theme || {};
  const nav = draft.nav || [];

  const setNav = (next) => update("nav", next);

  return (
    <>
      <Card title="Page details">
        <Field label="Browser tab title">
          <Input
            value={meta.pageTitle || ""}
            onChange={(e) => update("meta", set(meta, "pageTitle", e.target.value))}
          />
        </Field>
        <Field label="Description" hint="Used by search engines and link previews.">
          <Textarea
            rows={2}
            value={meta.description || ""}
            onChange={(e) => update("meta", set(meta, "description", e.target.value))}
          />
        </Field>
      </Card>

      <Card title="Colours">
        <div className="grid sm:grid-cols-2 gap-x-5">
          {[
            ["background", "Page background"],
            ["textColor", "Text on dark"],
            ["surface", "Services panel"],
            ["gradientFrom", "Heading gradient, top"],
            ["gradientTo", "Heading gradient, bottom"],
          ].map(([key, label]) => (
            <Field key={key} label={label}>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={theme[key] || "#000000"}
                  onChange={(e) => update("theme", set(theme, key, e.target.value))}
                  className="h-10 w-12 shrink-0 rounded border border-mist/20 bg-transparent"
                />
                <Input
                  value={theme[key] || ""}
                  onChange={(e) => update("theme", set(theme, key, e.target.value))}
                />
              </div>
            </Field>
          ))}
        </div>
      </Card>

      <Card
        title="Navigation links"
        actions={
          <Button onClick={() => setNav([...nav, { label: "New link", href: "#" }])}>
            <Plus size={14} className="inline -mt-0.5 mr-1" />
            Add link
          </Button>
        }
      >
        {nav.length === 0 ? (
          <p className="text-mist/50 text-sm">No links yet.</p>
        ) : (
          nav.map((link, i) => (
            <div key={i} className="flex gap-2 items-start mb-3">
              <Input
                value={link.label}
                placeholder="Label"
                onChange={(e) => {
                  const next = [...nav];
                  next[i] = { ...link, label: e.target.value };
                  setNav(next);
                }}
              />
              <Input
                value={link.href || ""}
                placeholder="#about"
                onChange={(e) => {
                  const next = [...nav];
                  next[i] = { ...link, href: e.target.value };
                  setNav(next);
                }}
              />
              <Button
                variant="danger"
                className="shrink-0"
                onClick={() => setNav(nav.filter((_, j) => j !== i))}
                aria-label="Remove link"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))
        )}
      </Card>
    </>
  );
}

/* -------------------------------- hero -------------------------------- */

export function HeroEditor({ draft, update }) {
  const hero = draft.hero || {};
  const u = (key, value) => update("hero", set(hero, key, value));

  return (
    <Card title="Hero section">
      <Field
        label="Heading"
        hint="Shown very large across the screen. Keep it short so it fits on one line."
      >
        <Input value={hero.heading || ""} onChange={(e) => u("heading", e.target.value)} />
      </Field>
      <Field label="Tagline" hint="The small paragraph in the bottom-left corner.">
        <Textarea
          rows={2}
          value={hero.tagline || ""}
          onChange={(e) => u("tagline", e.target.value)}
        />
      </Field>
      <ImageField
        label="Portrait image"
        value={hero.portraitUrl}
        onChange={(v) => u("portraitUrl", v)}
        hint="A PNG with a transparent background works best."
      />
      <div className="grid sm:grid-cols-2 gap-x-5">
        <Field label="Button text">
          <Input value={hero.ctaLabel || ""} onChange={(e) => u("ctaLabel", e.target.value)} />
        </Field>
        <Field label="Button link">
          <Input value={hero.ctaHref || ""} onChange={(e) => u("ctaHref", e.target.value)} />
        </Field>
      </div>
    </Card>
  );
}

/* ------------------------------- marquee ------------------------------- */

export function MarqueeEditor({ draft, update }) {
  const marquee = draft.marquee || {};
  const images = marquee.images || [];
  const u = (key, value) => update("marquee", set(marquee, key, value));

  const setImage = (i, value) => {
    const next = [...images];
    next[i] = value;
    u("images", next);
  };

  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[i], next[j]] = [next[j], next[i]];
    u("images", next);
  };

  return (
    <>
      <Card title="Scrolling rows">
        <div className="grid sm:grid-cols-2 gap-x-5">
          <Field
            label="Images in the top row"
            hint={`The remaining ${Math.max(images.length - (marquee.rowSplit ?? 0), 0)} go in the bottom row.`}
          >
            <Input
              type="number"
              min={0}
              max={images.length}
              value={marquee.rowSplit ?? 11}
              onChange={(e) => u("rowSplit", Number(e.target.value))}
            />
          </Field>
          <Field label="Scroll speed" hint="0.3 is the default. Higher moves faster.">
            <Input
              type="number"
              step="0.05"
              value={marquee.speed ?? 0.3}
              onChange={(e) => u("speed", Number(e.target.value))}
            />
          </Field>
        </div>
      </Card>

      <Card
        title={`Images (${images.length})`}
        actions={<Button onClick={() => u("images", [...images, ""])}>
          <Plus size={14} className="inline -mt-0.5 mr-1" />
          Add image
        </Button>}
      >
        {images.length === 0 ? (
          <p className="text-mist/50 text-sm">No images yet.</p>
        ) : (
          images.map((src, i) => (
            <div key={i} className="flex gap-2 items-start border-b border-mist/10 pb-3 mb-3">
              <span className="mt-4 w-8 shrink-0 text-xs text-mist/40 text-center">
                {i < (marquee.rowSplit ?? 11) ? "top" : "btm"}
              </span>
              <div className="flex-1">
                <ImageField label={`Image ${i + 1}`} value={src} onChange={(v) => setImage(i, v)} />
              </div>
              <div className="flex flex-col gap-1 mt-6 shrink-0">
                <Button variant="ghost" className="!px-2 !py-1" onClick={() => move(i, -1)} aria-label="Move up">
                  <ArrowUp size={13} />
                </Button>
                <Button variant="ghost" className="!px-2 !py-1" onClick={() => move(i, 1)} aria-label="Move down">
                  <ArrowDown size={13} />
                </Button>
                <Button
                  variant="danger"
                  className="!px-2 !py-1"
                  onClick={() => u("images", images.filter((_, j) => j !== i))}
                  aria-label="Remove image"
                >
                  <Trash2 size={13} />
                </Button>
              </div>
            </div>
          ))
        )}
      </Card>
    </>
  );
}

/* -------------------------------- about -------------------------------- */

const DECOR_SLOTS = [
  ["topLeft", "Top left"],
  ["topRight", "Top right"],
  ["bottomLeft", "Bottom left"],
  ["bottomRight", "Bottom right"],
];

export function AboutEditor({ draft, update }) {
  const about = draft.about || {};
  const decor = about.decor || [];
  const u = (key, value) => update("about", set(about, key, value));

  const setDecor = (slot, url) => {
    const existing = decor.find((d) => d.slot === slot);
    if (existing) {
      u(
        "decor",
        decor.map((d) => (d.slot === slot ? { ...d, url } : d))
      );
    } else {
      u("decor", [...decor, { slot, url, alt: "" }]);
    }
  };

  return (
    <>
      <Card title="About section">
        <Field label="Heading">
          <Input value={about.heading || ""} onChange={(e) => u("heading", e.target.value)} />
        </Field>
        <Field
          label="Body text"
          hint="Revealed one character at a time as the visitor scrolls."
        >
          <Textarea rows={6} value={about.body || ""} onChange={(e) => u("body", e.target.value)} />
        </Field>
        <Field label="Button text">
          <Input value={about.ctaLabel || ""} onChange={(e) => u("ctaLabel", e.target.value)} />
        </Field>
      </Card>

      <Card title="Corner images">
        <div className="grid sm:grid-cols-2 gap-x-5">
          {DECOR_SLOTS.map(([slot, label]) => (
            <ImageField
              key={slot}
              label={label}
              value={decor.find((d) => d.slot === slot)?.url || ""}
              onChange={(v) => setDecor(slot, v)}
            />
          ))}
        </div>
      </Card>
    </>
  );
}

/* ------------------------------- services ------------------------------- */

export function ServicesEditor({ draft, update, onAdd, onDelete }) {
  const services = draft.services || {};
  const items = services.items || [];

  const u = (key, value) => update("services", set(services, key, value));
  const setItem = (i, patch) => {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    u("items", next);
  };
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    u("items", next.map((it, idx) => ({ ...it, order: idx })));
  };

  return (
    <>
      <Card title="Services heading">
        <Field label="Heading">
          <Input value={services.heading || ""} onChange={(e) => u("heading", e.target.value)} />
        </Field>
      </Card>

      <Card
        title={`Services (${items.length})`}
        actions={
          <Button
            onClick={() =>
              onAdd("services", {
                number: String(items.length + 1).padStart(2, "0"),
                name: "New service",
                description: "",
                order: items.length,
              })
            }
          >
            <Plus size={14} className="inline -mt-0.5 mr-1" />
            Add service
          </Button>
        }
      >
        {items.length === 0 ? (
          <p className="text-mist/50 text-sm">No services yet.</p>
        ) : (
          items.map((item, i) => (
            <div key={item._id || i} className="rounded-lg border border-mist/10 p-4 mb-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-widest text-mist/40 flex items-center gap-1.5">
                  <GripVertical size={13} /> Item {i + 1}
                </span>
                <div className="flex gap-1">
                  <Button variant="ghost" className="!px-2 !py-1" onClick={() => move(i, -1)} aria-label="Move up">
                    <ArrowUp size={13} />
                  </Button>
                  <Button variant="ghost" className="!px-2 !py-1" onClick={() => move(i, 1)} aria-label="Move down">
                    <ArrowDown size={13} />
                  </Button>
                  <Button
                    variant="danger"
                    className="!px-2 !py-1"
                    onClick={() => onDelete("services", item._id, i)}
                    aria-label="Delete service"
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>

              <div className="grid sm:grid-cols-[100px_1fr] gap-x-4">
                <Field label="Number">
                  <Input value={item.number || ""} onChange={(e) => setItem(i, { number: e.target.value })} />
                </Field>
                <Field label="Name">
                  <Input value={item.name || ""} onChange={(e) => setItem(i, { name: e.target.value })} />
                </Field>
              </div>
              <Field label="Description">
                <Textarea
                  rows={3}
                  value={item.description || ""}
                  onChange={(e) => setItem(i, { description: e.target.value })}
                />
              </Field>
            </div>
          ))
        )}
      </Card>
    </>
  );
}

/* ------------------------------- projects ------------------------------- */

export function ProjectsEditor({ draft, update, onAdd, onDelete }) {
  const projects = draft.projects || {};
  const items = projects.items || [];

  const u = (key, value) => update("projects", set(projects, key, value));
  const setItem = (i, patch) => {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    u("items", next);
  };
  const setCol1 = (i, slot, value) => {
    const col1 = [...(items[i].col1 || ["", ""])];
    col1[slot] = value;
    setItem(i, { col1 });
  };
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    u("items", next.map((it, idx) => ({ ...it, order: idx })));
  };

  return (
    <>
      <Card title="Projects heading">
        <Field label="Heading">
          <Input value={projects.heading || ""} onChange={(e) => u("heading", e.target.value)} />
        </Field>
      </Card>

      <Card
        title={`Projects (${items.length})`}
        actions={
          <Button
            onClick={() =>
              onAdd("projects", {
                number: String(items.length + 1).padStart(2, "0"),
                category: "Client",
                name: "New project",
                col1: ["", ""],
                col2: "",
                order: items.length,
                published: true,
              })
            }
          >
            <Plus size={14} className="inline -mt-0.5 mr-1" />
            Add project
          </Button>
        }
      >
        {items.length === 0 ? (
          <p className="text-mist/50 text-sm">No projects yet.</p>
        ) : (
          items.map((item, i) => (
            <div key={item._id || i} className="rounded-lg border border-mist/10 p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-widest text-mist/40">
                  Project {i + 1}
                </span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-mist/70">
                    <input
                      type="checkbox"
                      checked={item.published !== false}
                      onChange={(e) => setItem(i, { published: e.target.checked })}
                    />
                    Visible on the site
                  </label>
                  <Button variant="ghost" className="!px-2 !py-1" onClick={() => move(i, -1)} aria-label="Move up">
                    <ArrowUp size={13} />
                  </Button>
                  <Button variant="ghost" className="!px-2 !py-1" onClick={() => move(i, 1)} aria-label="Move down">
                    <ArrowDown size={13} />
                  </Button>
                  <Button
                    variant="danger"
                    className="!px-2 !py-1"
                    onClick={() => onDelete("projects", item._id, i)}
                    aria-label="Delete project"
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-x-4">
                <Field label="Number">
                  <Input value={item.number || ""} onChange={(e) => setItem(i, { number: e.target.value })} />
                </Field>
                <Field label="Category">
                  <Input
                    value={item.category || ""}
                    placeholder="Client / Personal"
                    onChange={(e) => setItem(i, { category: e.target.value })}
                  />
                </Field>
                <Field label="Name">
                  <Input value={item.name || ""} onChange={(e) => setItem(i, { name: e.target.value })} />
                </Field>
              </div>

              <Field label="Live project link" hint="Leave empty to show a button that doesn't go anywhere.">
                <Input
                  value={item.liveUrl || ""}
                  placeholder="https://…"
                  onChange={(e) => setItem(i, { liveUrl: e.target.value })}
                />
              </Field>

              <div className="grid sm:grid-cols-2 gap-x-5">
                <ImageField
                  label="Left column, top"
                  value={item.col1?.[0] || ""}
                  onChange={(v) => setCol1(i, 0, v)}
                />
                <ImageField
                  label="Left column, bottom"
                  value={item.col1?.[1] || ""}
                  onChange={(v) => setCol1(i, 1, v)}
                />
              </div>
              <ImageField
                label="Right column, tall image"
                value={item.col2 || ""}
                onChange={(v) => setItem(i, { col2: v })}
              />
            </div>
          ))
        )}
      </Card>
    </>
  );
}

/* -------------------------------- account -------------------------------- */

export function AccountEditor({ user, onChangePassword }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [note, setNote] = useState("");

  const submit = async () => {
    setNote("");
    if (next !== confirm) {
      setNote("The new passwords don't match.");
      return;
    }
    try {
      await onChangePassword(current, next);
      setCurrent("");
      setNext("");
      setConfirm("");
      setNote("Password updated.");
    } catch (err) {
      setNote(err.message);
    }
  };

  return (
    <Card title="Account">
      <p className="text-sm text-mist/60 mb-4">Signed in as {user?.email}</p>
      <Field label="Current password">
        <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
      </Field>
      <Field label="New password" hint="At least 8 characters.">
        <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} />
      </Field>
      <Field label="Confirm new password">
        <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </Field>
      {note ? <p className="text-sm text-mist/80 mb-3">{note}</p> : null}
      <Button onClick={submit} disabled={!current || !next}>
        Change password
      </Button>
    </Card>
  );
}
