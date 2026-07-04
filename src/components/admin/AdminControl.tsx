"use client";

import { useEffect, useMemo, useState } from "react";

type SessionPayload = {
  configured: boolean;
  authenticated: boolean;
  usesDevelopmentFallback: boolean;
  role: string | null;
  storage?: { mode?: string; persistent?: boolean };
};

type ApiResponse<T> = T & { ok?: boolean; message?: string };

const DRAFT_KEY = "ksp-admin-draft";

function setDeepValue(target: Record<string, unknown>, path: string, value: unknown) {
  const keys = path.split(".").filter(Boolean);
  const last = keys.pop();

  if (!last) {
    return;
  }

  let cursor: Record<string, unknown> = target;

  keys.forEach((key) => {
    if (!cursor[key] || typeof cursor[key] !== "object") {
      cursor[key] = /^\d+$/.test(key) ? [] : {};
    }
    cursor = cursor[key] as Record<string, unknown>;
  });

  cursor[last] = value;
}

export function AdminControl() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [password, setPassword] = useState("");
  const [breakGlassToken, setBreakGlassToken] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [design, setDesign] = useState<Record<string, unknown> | null>(null);
  const [raw, setRaw] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }
    return window.localStorage.getItem(DRAFT_KEY) || "";
  });
  const [dirty, setDirty] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return Boolean(window.localStorage.getItem(DRAFT_KEY));
  });
  const [targetPath, setTargetPath] = useState("hero.image");

  const storageMode = useMemo(() => session?.storage?.mode || "unknown", [session?.storage?.mode]);

  async function api<T>(path: string, options: RequestInit = {}) {
    const response = await fetch(path, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const payload = (await response.json().catch(() => ({}))) as ApiResponse<T>;

    if (!response.ok || payload.ok === false) {
      throw new Error(payload.message || `Request failed (${response.status})`);
    }

    return payload;
  }

  async function loadSession() {
    const payload = await api<SessionPayload>("/api/session", { method: "GET" });
    setSession(payload);
    return payload;
  }

  async function loadDesign() {
    const payload = await api<{ design: Record<string, unknown> }>("/api/design", { method: "GET" });
    setDesign(payload.design);
    setRaw(JSON.stringify(payload.design, null, 2));
    setDirty(false);
    window.localStorage.removeItem(DRAFT_KEY);
  }

  useEffect(() => {
    async function init() {
      try {
        const current = await loadSession();
        if (current.authenticated) {
          await loadDesign();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to initialize admin.");
      } finally {
        setLoading(false);
      }
    }

    void init();
  }, []);

  useEffect(() => {
    if (dirty) {
      window.localStorage.setItem(DRAFT_KEY, raw);
    }
  }, [dirty, raw]);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("Authenticating...");

    try {
      await api("/api/admin-login", {
        method: "POST",
        body: JSON.stringify({ password: password || undefined, breakGlassToken: breakGlassToken || undefined }),
      });
      setPassword("");
      setBreakGlassToken("");
      const current = await loadSession();
      if (current.authenticated) {
        await loadDesign();
      }
      setStatus("Authenticated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
      setStatus("");
    }
  }

  function onRawChange(nextValue: string) {
    setRaw(nextValue);
    setDirty(true);
    setStatus("Draft updated.");
  }

  function applyRawJson() {
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      setDesign(parsed);
      setDirty(true);
      setError("");
      setStatus("JSON applied locally. Save to publish.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "JSON parse failed.");
    }
  }

  async function saveDesign() {
    if (!design) {
      return;
    }

    setStatus("Saving...");
    setError("");

    try {
      const payload = await api<{ design: Record<string, unknown> }>("/api/design", {
        method: "POST",
        body: JSON.stringify({ design }),
      });

      setDesign(payload.design);
      setRaw(JSON.stringify(payload.design, null, 2));
      setDirty(false);
      window.localStorage.removeItem(DRAFT_KEY);
      await loadSession();
      setStatus("Published.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
      setStatus("");
    }
  }

  async function uploadMedia(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fileInput = event.currentTarget.elements.namedItem("file") as HTMLInputElement | null;
    const file = fileInput?.files?.[0];

    if (!file || !design) {
      setError("Select a file first.");
      return;
    }

    setStatus("Uploading...");
    setError("");

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(reader.error || new Error("Unable to read file."));
        reader.readAsDataURL(file);
      });

      const payload = await api<{ media: { url: string; label: string; kind: string } }>("/api/upload", {
        method: "POST",
        body: JSON.stringify({ fileName: file.name, dataUrl }),
      });

      const next = structuredClone(design);
      setDeepValue(next, targetPath, payload.media.url);

      const mediaLibrary = Array.isArray(next.mediaLibrary) ? next.mediaLibrary : [];
      next.mediaLibrary = [payload.media, ...mediaLibrary];

      setDesign(next);
      setRaw(JSON.stringify(next, null, 2));
      setDirty(true);
      setStatus(`Uploaded ${payload.media.label}. Assigned to ${targetPath}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
      setStatus("");
    }
  }

  async function logout() {
    await api("/api/session", { method: "DELETE" });
    setSession((value) => (value ? { ...value, authenticated: false, role: null } : value));
    setDesign(null);
    setRaw("");
    setDirty(false);
    setStatus("Logged out.");
  }

  if (loading) {
    return <div className="admin-shell">Loading control room...</div>;
  }

  if (!session?.configured) {
    return (
      <div className="admin-shell">
        <h1>Admin is locked.</h1>
        <p>Set KSP_ADMIN_PASSWORD and KSP_ADMIN_SECRET to unlock editing.</p>
      </div>
    );
  }

  if (!session.authenticated) {
    return (
      <div className="admin-shell">
        <h1>KingShadP Control Room</h1>
        <p>Sign in with admin password or audited break-glass token.</p>
        <form onSubmit={login} className="admin-form">
          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <label>
            Break-glass token
            <input
              type="password"
              value={breakGlassToken}
              onChange={(event) => setBreakGlassToken(event.target.value)}
            />
          </label>
          <button type="submit">Authenticate</button>
        </form>
        {session.usesDevelopmentFallback ? (
          <p>Development fallback active: password is &quot;admin&quot;.</p>
        ) : null}
        {status ? <p>{status}</p> : null}
        {error ? <p className="danger">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <h1>Control Room</h1>
          <p>
            Role: {session.role} • Storage: {storageMode}
          </p>
        </div>
        <div>
          <button type="button" onClick={saveDesign} disabled={!dirty}>
            Save & Publish
          </button>
          <button type="button" onClick={() => void loadDesign()}>
            Reload
          </button>
          <button type="button" onClick={() => void logout()}>
            Log out
          </button>
        </div>
      </header>

      <section className="admin-grid">
        <article>
          <h2>Media Upload + Auto Assign</h2>
          <form onSubmit={uploadMedia} className="admin-form">
            <label>
              Assign to JSON path
              <input value={targetPath} onChange={(event) => setTargetPath(event.target.value)} />
            </label>
            <label>
              Select file
              <input type="file" name="file" accept="image/*,video/*" />
            </label>
            <button type="submit">Upload and assign</button>
          </form>
        </article>

        <article>
          <h2>Raw JSON (Full Control)</h2>
          <textarea value={raw} onChange={(event) => onRawChange(event.target.value)} rows={26} spellCheck={false} />
          <div className="admin-actions">
            <button type="button" onClick={applyRawJson}>
              Apply JSON
            </button>
            <a href="/" target="_blank" rel="noreferrer">
              Open preview
            </a>
          </div>
        </article>
      </section>

      {status ? <p>{status}</p> : null}
      {error ? <p className="danger">{error}</p> : null}
      {dirty ? <p className="warning">Unsaved draft is active and backed up locally.</p> : <p>Saved.</p>}
    </div>
  );
}
