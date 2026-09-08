import { useEffect, useState } from "react";
import { X, Upload, Trash2, Image as ImageIcon } from "lucide-react";
import { api } from "../api.js";

export function Field({ label, hint, children }) {
  return (
    <label className="block mb-4">
      <span className="block text-sm font-medium text-mist mb-1.5">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-mist/50 mt-1">{hint}</span> : null}
    </label>
  );
}

const inputBase =
  "w-full rounded-lg bg-black/40 border border-mist/20 px-3 py-2 text-mist " +
  "placeholder:text-mist/30 focus:outline-none focus:border-mist/60 transition";

export function Input(props) {
  return <input {...props} className={`${inputBase} ${props.className || ""}`} />;
}

export function Textarea(props) {
  return (
    <textarea
      rows={4}
      {...props}
      className={`${inputBase} resize-y ${props.className || ""}`}
    />
  );
}

export function Button({ variant = "primary", className = "", ...props }) {
  const styles = {
    primary: "bg-mist text-ink hover:bg-white",
    ghost: "border border-mist/30 text-mist hover:bg-mist/10",
    danger: "border border-red-500/40 text-red-300 hover:bg-red-500/10",
  };
  return (
    <button
      type="button"
      {...props}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
    />
  );
}

export function Card({ title, actions, children }) {
  return (
    <section className="rounded-xl border border-mist/15 bg-white/[0.02] p-5 mb-5">
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 mb-4">
          <h3 className="text-mist font-semibold">{title}</h3>
          <div className="flex gap-2">{actions}</div>
        </header>
      )}
      {children}
    </section>
  );
}

export function Banner({ kind = "info", children, onDismiss }) {
  if (!children) return null;
  const styles = {
    info: "border-mist/25 text-mist",
    error: "border-red-500/40 text-red-300 bg-red-500/5",
    success: "border-emerald-500/40 text-emerald-300 bg-emerald-500/5",
  };
  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm mb-4 ${styles[kind]}`}
    >
      <span>{children}</span>
      {onDismiss ? (
        <button type="button" onClick={onDismiss} aria-label="Dismiss">
          <X size={16} />
        </button>
      ) : null}
    </div>
  );
}

/**
 * A URL text field with a thumbnail, an upload button, and a picker that
 * lists everything already in the media library.
 */
export function ImageField({ label, value, onChange, hint }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const media = await api.uploadMedia(file);
      onChange(media.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  return (
    <div className="mb-4">
      <span className="block text-sm font-medium text-mist mb-1.5">{label}</span>
      <div className="flex gap-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-mist/20 bg-black/40 grid place-items-center">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon size={18} className="text-mist/30" />
          )}
        </div>
        <div className="flex-1">
          <Input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://… or upload a file"
          />
          <div className="flex gap-2 mt-2">
            <label className="cursor-pointer rounded-lg border border-mist/30 px-3 py-1.5 text-xs text-mist hover:bg-mist/10 transition inline-flex items-center gap-1.5">
              <Upload size={13} />
              {busy ? "Uploading…" : "Upload"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
                disabled={busy}
              />
            </label>
            <Button variant="ghost" className="!px-3 !py-1.5 !text-xs" onClick={() => setOpen(true)}>
              Choose from library
            </Button>
            {value ? (
              <Button
                variant="ghost"
                className="!px-3 !py-1.5 !text-xs"
                onClick={() => onChange("")}
              >
                Clear
              </Button>
            ) : null}
          </div>
          {hint ? <p className="text-xs text-mist/50 mt-1">{hint}</p> : null}
          {error ? <p className="text-xs text-red-300 mt-1">{error}</p> : null}
        </div>
      </div>

      {open ? (
        <MediaPicker
          onClose={() => setOpen(false)}
          onPick={(url) => {
            onChange(url);
            setOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}

export function MediaPicker({ onClose, onPick }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.listMedia().then(setItems).catch((err) => setError(err.message));
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 p-4 overflow-auto" onClick={onClose}>
      <div
        className="mx-auto max-w-4xl rounded-xl border border-mist/20 bg-ink p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between mb-4">
          <h3 className="text-mist font-semibold">Media library</h3>
          <button type="button" onClick={onClose} className="text-mist/60 hover:text-mist">
            <X size={18} />
          </button>
        </header>

        <Banner kind="error">{error}</Banner>

        {!items ? (
          <p className="text-mist/50 text-sm">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-mist/50 text-sm">
            Nothing uploaded yet. Use the Upload button on any image field to add files.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {items.map((m) => (
              <button
                key={m._id}
                type="button"
                onClick={() => onPick(m.url)}
                className="group rounded-lg border border-mist/15 overflow-hidden text-left hover:border-mist/60 transition"
              >
                <img src={m.url} alt="" className="h-28 w-full object-cover bg-black/40" />
                <span className="block truncate px-2 py-1.5 text-[11px] text-mist/60">
                  {m.originalName || m.filename}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Full media manager, used by the Media tab. */
export function MediaManager() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => api.listMedia().then(setItems).catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setBusy(true);
    setError("");
    try {
      for (const file of files) await api.uploadMedia(file);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this file? Any section still pointing at it will show a placeholder.")) return;
    try {
      await api.deleteMedia(id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Card
      title="Media library"
      actions={
        <label className="cursor-pointer rounded-lg bg-mist px-4 py-2 text-sm font-medium text-ink hover:bg-white transition inline-flex items-center gap-2">
          <Upload size={14} />
          {busy ? "Uploading…" : "Upload images"}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUpload}
            disabled={busy}
          />
        </label>
      }
    >
      <Banner kind="error" onDismiss={() => setError("")}>
        {error}
      </Banner>

      {items.length === 0 ? (
        <p className="text-mist/50 text-sm">
          No files yet. Uploads are stored on the server and can be reused in any section.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {items.map((m) => (
            <figure key={m._id} className="rounded-lg border border-mist/15 overflow-hidden">
              <img src={m.url} alt="" className="h-28 w-full object-cover bg-black/40" />
              <figcaption className="p-2">
                <span className="block truncate text-[11px] text-mist/60">
                  {m.originalName || m.filename}
                </span>
                <div className="flex items-center justify-between mt-1.5">
                  <button
                    type="button"
                    className="text-[11px] text-mist/70 hover:text-mist"
                    onClick={() => navigator.clipboard?.writeText(m.url)}
                  >
                    Copy URL
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(m._id)}
                    className="text-red-400/70 hover:text-red-300"
                    aria-label="Delete file"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </Card>
  );
}
