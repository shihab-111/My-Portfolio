import { useEffect, useState, useCallback } from "react";
import {
  LayoutDashboard,
  User as UserIcon,
  Image as ImageIcon,
  Sparkles,
  Layers,
  Wrench,
  FolderOpen,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { api, auth } from "../api.js";
import { Button, Banner, Input, Field, MediaManager } from "./ui.jsx";
import {
  GeneralEditor,
  HeroEditor,
  MarqueeEditor,
  AboutEditor,
  ServicesEditor,
  ProjectsEditor,
  AccountEditor,
} from "./editors.jsx";

const TABS = [
  { id: "general", label: "General", icon: LayoutDashboard },
  { id: "hero", label: "Hero", icon: Sparkles },
  { id: "marquee", label: "Marquee", icon: Layers },
  { id: "about", label: "About", icon: UserIcon },
  { id: "services", label: "Services", icon: Wrench },
  { id: "projects", label: "Projects", icon: FolderOpen },
  { id: "media", label: "Media", icon: ImageIcon },
  { id: "account", label: "Account", icon: UserIcon },
];

/* --------------------------------- login --------------------------------- */

function Login({ onSignedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      const { token, user } = await api.login(email, password);
      auth.token = token;
      onSignedIn(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-ink px-4 font-kanit">
      <div className="w-full max-w-sm rounded-xl border border-mist/15 bg-white/[0.02] p-6">
        <h1 className="text-xl font-semibold text-mist mb-1">Site admin</h1>
        <p className="text-sm text-mist/50 mb-5">Sign in to edit the portfolio.</p>

        <Banner kind="error" onDismiss={() => setError("")}>
          {error}
        </Banner>

        <Field label="Email">
          <Input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </Field>

        <Button className="w-full mt-2" onClick={submit} disabled={busy || !email || !password}>
          {busy ? "Signing in…" : "Sign in"}
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------- dashboard -------------------------------- */

function Dashboard({ user, onSignOut }) {
  const [tab, setTab] = useState("general");
  const [draft, setDraft] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await api.getSiteAdmin();
      setDraft(data);
      setDirty(false);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Warn before losing unsaved edits.
  useEffect(() => {
    const handler = (e) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const update = (key, value) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setDirty(true);
    setSaved("");
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const next = await api.saveSite({
        meta: draft.meta,
        theme: draft.theme,
        nav: draft.nav,
        hero: draft.hero,
        marquee: draft.marquee,
        about: draft.about,
        services: draft.services,
        projects: draft.projects,
      });
      setDraft(next);
      setDirty(false);
      setSaved("Changes saved and live on the site.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Adding goes straight to the server so the new item gets a real _id.
  const onAdd = async (list, item) => {
    setError("");
    try {
      if (dirty) await save();
      await api.addItem(list, item);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const onDelete = async (list, id, index) => {
    if (!confirm("Delete this item? This can't be undone.")) return;
    setError("");
    try {
      if (id) {
        await api.deleteItem(list, id);
        await load();
      } else {
        // Never saved, so it only exists in the draft.
        const section = draft[list];
        update(list, {
          ...section,
          items: section.items.filter((_, i) => i !== index),
        });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (!draft) {
    return (
      <div className="min-h-screen grid place-items-center bg-ink text-mist/60 font-kanit">
        {error ? <Banner kind="error">{error}</Banner> : "Loading…"}
      </div>
    );
  }

  const editorProps = { draft, update, onAdd, onDelete };

  return (
    <div className="min-h-screen bg-ink font-kanit">
      <header className="sticky top-0 z-40 border-b border-mist/15 bg-ink/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <h1 className="font-semibold text-mist">Site admin</h1>
            {dirty ? (
              <span className="rounded-full bg-amber-400/15 px-2.5 py-0.5 text-[11px] text-amber-300">
                Unsaved changes
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-mist/30 px-3 py-2 text-sm text-mist hover:bg-mist/10 transition"
            >
              <ExternalLink size={14} />
              View site
            </a>
            <Button onClick={save} disabled={saving || !dirty}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
            <Button variant="ghost" onClick={onSignOut} aria-label="Sign out">
              <LogOut size={15} />
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 md:flex md:gap-6">
        <nav className="mb-5 flex gap-1 overflow-x-auto md:mb-0 md:w-48 md:shrink-0 md:flex-col">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                tab === id
                  ? "bg-mist text-ink font-medium"
                  : "text-mist/70 hover:bg-mist/10"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>

        <main className="flex-1 min-w-0">
          <Banner kind="error" onDismiss={() => setError("")}>
            {error}
          </Banner>
          <Banner kind="success" onDismiss={() => setSaved("")}>
            {saved}
          </Banner>

          {tab === "general" && <GeneralEditor {...editorProps} />}
          {tab === "hero" && <HeroEditor {...editorProps} />}
          {tab === "marquee" && <MarqueeEditor {...editorProps} />}
          {tab === "about" && <AboutEditor {...editorProps} />}
          {tab === "services" && <ServicesEditor {...editorProps} />}
          {tab === "projects" && <ProjectsEditor {...editorProps} />}
          {tab === "media" && <MediaManager />}
          {tab === "account" && (
            <AccountEditor user={user} onChangePassword={api.changePassword} />
          )}
        </main>
      </div>
    </div>
  );
}

/* ---------------------------------- shell ---------------------------------- */

export default function Admin() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!auth.token) {
      setChecking(false);
      return;
    }
    api
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => auth.clear())
      .finally(() => setChecking(false));
  }, []);

  const signOut = () => {
    auth.clear();
    setUser(null);
  };

  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center bg-ink text-mist/60 font-kanit">
        Loading…
      </div>
    );
  }

  if (!user) return <Login onSignedIn={setUser} />;
  return <Dashboard user={user} onSignOut={signOut} />;
}
