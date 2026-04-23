// Authoring app — browser form + live preview for building new compliance guides.
//
// State model: a single `content` object that mirrors the CG_CONTENT schema.
// Every edit patches that object and (a) updates the live preview by posting
// it to the iframe, (b) persists to localStorage, (c) bumps a timestamp used
// by the "saved / saving" indicator.
//
// The preview iframe loads `preview-shell.html`, which itself waits for the
// parent to post a content object before rendering. This way the preview can
// re-render on every keystroke without reloading.

const { useState, useEffect, useRef, useCallback, useMemo } = React;

// ---------- Starter content ----------
// A lightweight starter draft so new authors have something to see right away.
// Intentionally skeletal — demonstrates every section type with 1-2 items
// each, so you can delete what you don't need.
const STARTER_CONTENT = {
  title: "New Compliance Guide",
  subtitle: "Compliance Guide",
  effectiveDate: "",
  publishedDate: "",
  code: "",
  summary: "",
  background: [""],
  legislation: [
    { juris: "FEDERAL", title: "", effective: "", status: "active", statusLabel: "Active", note: "" },
  ],
  tiles: [
    { icon: "shield-check", label: "", sub: "" },
  ],
  keyRequirements: [
    { title: "", body: "" },
  ],
  howToImplement: {
    intro: "",
    items: [
      { head: "", body: "" },
    ],
  },
  otherFactors: { title: "", body: "" },
  citations: [""],
};

// ---------- localStorage helpers ----------
const LS_KEY = "cg:authoring:draft";
const LS_META = "cg:authoring:meta";

function loadDraft() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) { return null; }
}
function saveDraft(content) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(content));
    localStorage.setItem(LS_META, JSON.stringify({ savedAt: Date.now() }));
  } catch (e) {}
}
function clearDraft() {
  localStorage.removeItem(LS_KEY);
  localStorage.removeItem(LS_META);
}

// ---------- Content sanitation for rendering ----------
// The renderer skips sections that are empty/zero-length. We want the AUTHORING
// experience to let the user edit every section, even ones with no content
// yet, but the PREVIEW should hide sections that are still empty so the user
// sees the real document taking shape.
function sanitizeForPreview(c) {
  const out = { ...c };
  // Skip empty strings
  if (!out.summary?.trim()) delete out.summary;
  if (out.background) {
    const bg = out.background.filter(p => p.trim());
    if (bg.length) out.background = bg; else delete out.background;
  }
  if (out.legislation) {
    const ll = out.legislation.filter(l => l.title?.trim());
    if (ll.length) out.legislation = ll; else delete out.legislation;
  }
  if (out.tiles) {
    const tt = out.tiles.filter(t => t.label?.trim());
    if (tt.length) out.tiles = tt; else delete out.tiles;
  }
  if (out.keyRequirements) {
    const rr = out.keyRequirements.filter(r => r.title?.trim() || r.body?.trim());
    if (rr.length) out.keyRequirements = rr; else delete out.keyRequirements;
  }
  if (out.howToImplement?.items) {
    const items = out.howToImplement.items.filter(i => i.head?.trim() || i.body?.trim());
    if (items.length) {
      out.howToImplement = { ...out.howToImplement, items };
    } else {
      delete out.howToImplement;
    }
  }
  if (out.otherFactors && !out.otherFactors.title?.trim() && !out.otherFactors.body?.trim()) {
    delete out.otherFactors;
  }
  if (out.citations) {
    const cc = out.citations.filter(s => s.trim());
    if (cc.length) out.citations = cc; else delete out.citations;
  }
  return out;
}

// ---------- Root ----------
function App() {
  const [content, setContent] = useState(() => loadDraft() || STARTER_CONTENT);
  const [savedAt, setSavedAt] = useState(null);
  const [openSections, setOpenSections] = useState({ header: true });
  const [variant, setVariant] = useState(() =>
    localStorage.getItem("cg:authoring:variant") || "a"
  );
  const [toast, setToast] = useState(null);
  const iframeRef = useRef(null);

  // Autosave on every change (debounced).
  useEffect(() => {
    const t = setTimeout(() => {
      saveDraft(content);
      setSavedAt(Date.now());
    }, 350);
    return () => clearTimeout(t);
  }, [content]);

  // Post content to preview iframe whenever it changes.
  const postToPreview = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;
    iframe.contentWindow.postMessage(
      { type: "cg:content", content: sanitizeForPreview(content) },
      "*"
    );
  }, [content]);

  // Debounced post on every keystroke.
  useEffect(() => {
    const t = setTimeout(postToPreview, 120);
    return () => clearTimeout(t);
  }, [postToPreview]);

  // Variant change → reload iframe with new variant, then re-post content.
  useEffect(() => {
    localStorage.setItem("cg:authoring:variant", variant);
  }, [variant]);

  const onIframeLoad = () => postToPreview();

  // The preview iframe tells us when it's ready (Babel-compiled scripts have
  // registered their message listener). At that point we re-post content so
  // we don't lose the first render. Because postToPreview is useCallback'd
  // over `content`, we stash the latest in a ref to avoid stale closures.
  const contentRef = useRef(content);
  useEffect(() => { contentRef.current = content; }, [content]);
  useEffect(() => {
    function onMsg(ev) {
      if (ev.data?.type === "cg:preview:ready") {
        const iframe = iframeRef.current;
        if (!iframe?.contentWindow) return;
        iframe.contentWindow.postMessage(
          { type: "cg:content", content: sanitizeForPreview(contentRef.current) },
          "*"
        );
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  // ---------- Patch helpers ----------
  // All edits go through `update(path, value)` — path is a dotted string or
  // array of keys/indexes, value is the new leaf. This keeps React state
  // immutable and lets the form components stay dumb.
  const update = useCallback((path, value) => {
    const keys = Array.isArray(path) ? path : path.split(".");
    setContent(prev => {
      const next = structuredClone(prev);
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (obj[k] == null) obj[k] = (typeof keys[i+1] === "number") ? [] : {};
        obj = obj[k];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  }, []);

  const pushItem = useCallback((arrayPath, item) => {
    const keys = Array.isArray(arrayPath) ? arrayPath : arrayPath.split(".");
    setContent(prev => {
      const next = structuredClone(prev);
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      const lastKey = keys[keys.length - 1];
      if (!Array.isArray(obj[lastKey])) obj[lastKey] = [];
      obj[lastKey].push(structuredClone(item));
      return next;
    });
  }, []);

  const removeItem = useCallback((arrayPath, idx) => {
    const keys = Array.isArray(arrayPath) ? arrayPath : arrayPath.split(".");
    setContent(prev => {
      const next = structuredClone(prev);
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      const lastKey = keys[keys.length - 1];
      obj[lastKey] = obj[lastKey].filter((_, i) => i !== idx);
      return next;
    });
  }, []);

  const moveItem = useCallback((arrayPath, idx, delta) => {
    const keys = Array.isArray(arrayPath) ? arrayPath : arrayPath.split(".");
    setContent(prev => {
      const next = structuredClone(prev);
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      const lastKey = keys[keys.length - 1];
      const arr = obj[lastKey];
      const newIdx = idx + delta;
      if (newIdx < 0 || newIdx >= arr.length) return prev;
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return next;
    });
  }, []);

  const toggleSection = id => {
    setOpenSections(s => ({ ...s, [id]: !s[id] }));
  };

  // ---------- Actions: import JSON, export JSON, export HTML, reset ----------
  const doExportJson = () => {
    const data = JSON.stringify(sanitizeForPreview(content), null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(content.code || "guide").toLowerCase().replace(/[^a-z0-9-]+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Downloaded JSON");
  };

  const doImportJson = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const data = JSON.parse(text);
        // Merge onto STARTER so any missing sections default safely.
        setContent({ ...STARTER_CONTENT, ...data });
        showToast("Imported");
      } catch (e) {
        showToast("Import failed: not valid JSON");
      }
    };
    input.click();
  };

  const doExportHtml = () => {
    const sanitized = sanitizeForPreview(content);
    const html = buildStandaloneHtml(sanitized, variant);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(content.code || "guide").toLowerCase().replace(/[^a-z0-9-]+/g, "-")}.html`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Downloaded HTML");
  };

  const doReset = () => {
    if (!confirm("Clear this draft and start over? This can't be undone.")) return;
    clearDraft();
    setContent(STARTER_CONTENT);
    showToast("Started a new draft");
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  };

  const savedLabel = savedAt
    ? (Date.now() - savedAt < 3000 ? "Saved" : "Saved a moment ago")
    : "Draft loaded";

  // ---------- Render ----------
  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-brand">
          <img src="../assets/logo_kidsafe.png" alt="kidSAFE" />
          <span className="divider"></span>
          <div>
            <div className="topbar-title">Compliance Guide Authoring</div>
            <div className="topbar-sub">Fill the form · live preview on the right · autosaves</div>
          </div>
        </div>
        <div className="topbar-sep"></div>
        <div className="topbar-status"><span className="dot"></span> {savedLabel}</div>
        <div className="topbar-actions">
          <button className="btn btn-ghost" onClick={doReset}>New draft</button>
          <button className="btn" onClick={doImportJson}>Import JSON</button>
          <button className="btn" onClick={doExportJson}>Export JSON</button>
          <button className="btn btn-primary" onClick={doExportHtml}>Export HTML</button>
        </div>
      </header>

      <div className="form-col">
        <div className="form-inner">
          <IntroCard />
          <AuthoringForm
            content={content}
            openSections={openSections}
            toggleSection={toggleSection}
            update={update}
            pushItem={pushItem}
            removeItem={removeItem}
            moveItem={moveItem}
          />
        </div>
      </div>

      <div className="preview-col">
        <div className="preview-toolbar" role="tablist" aria-label="Preview variation">
          {[
            ["a", "A · Conservative"],
            ["b", "B · Balanced"],
            ["c", "C · Seal"],
            ["d", "D · Field Guide"],
          ].map(([id, label]) => (
            <button
              key={id}
              className={variant === id ? "active" : ""}
              onClick={() => setVariant(id)}
            >{label}</button>
          ))}
        </div>
        <iframe
          ref={iframeRef}
          className="preview-iframe"
          src={`./authoring/preview-shell.html?v=${variant}`}
          onLoad={onIframeLoad}
          title="Live preview"
        />
      </div>

      {toast && <div className="toast show">{toast}</div>}
    </div>
  );
}

function IntroCard() {
  return (
    <div className="intro-card">
      <h2>Create a new compliance guide</h2>
      <p>
        Fill out each section on the left. The preview on the right updates as you type, and
        your draft autosaves to this browser. When you're ready, export as JSON (to hand off
        to a developer) or HTML (to send directly to stakeholders).
      </p>
      <p style={{marginTop: 8}}>
        <strong>Every section is optional.</strong> Skip any you don't need — they won't appear
        in the final guide. You can rearrange items within a section using the ↑ / ↓ controls.
      </p>
    </div>
  );
}

// ---------- Build a standalone HTML export ----------
// The exported file is self-contained-ish: it loads React + Babel + kidSAFE
// shared stylesheets from the same relative paths as the template project.
// For a truly offline bundle, we'd inline everything — that's a future step.
function buildStandaloneHtml(content, variant) {
  const variantFolder = {
    a: "variation-a-conservative",
    b: "variation-b-balanced",
    c: "variation-c-bolder",
    d: "variation-d-workbook",
  }[variant] || "variation-a-conservative";

  return `<!DOCTYPE html>
<html lang="en" data-cg-variant="Variation ${variant.toUpperCase()}">
<head>
  <meta charset="utf-8">
  <title>kidSAFE Compliance Guide — ${content.title || "Untitled"}</title>
  <link rel="stylesheet" href="../colors_and_type.css">
  <link rel="stylesheet" href="./shared/tokens.css">
  <link rel="stylesheet" href="./shared/bubbles.css">
  <link rel="stylesheet" href="./${variantFolder}/style.css">
</head>
<body>
  <div class="cg-viewer"><div id="root"></div></div>

  <script src="https://unpkg.com/react@18.3.1/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js"></script>

  <script>window.CG_CONTENT = ${JSON.stringify(content, null, 2)};</script>
  <script type="text/babel" src="./shared/CGIcon.jsx"></script>
  <script type="text/babel" src="./shared/sections.jsx"></script>
  <script type="text/babel">
    ReactDOM.createRoot(document.getElementById("root")).render(
      <CGGuide c={window.CG_CONTENT} fullHeaderEveryPage={true} />
    );
  </script>
  <script src="./shared/viewer.js" defer></script>
</body>
</html>`;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
