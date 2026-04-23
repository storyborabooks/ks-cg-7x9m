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

// ---------- Default content ----------
// Pre-populated with the COPPA 2026 Rule Changes guide so first-time visitors
// see a fully worked example. "New draft" resets to BLANK_CONTENT.
const BLANK_CONTENT = {
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
  iconGrid: { heading: "", items: [] },
  comparison: { heading: "", left: { label: "", icon: "check-circle", items: [] }, right: { label: "", icon: "x-circle", items: [] } },
  processFlow: { heading: "", items: [] },
  calloutCard: { icon: "alert-triangle", heading: "", body: "", variant: "info" },
  citations: [""],
  sectionOrder: ["summary", "background", "legislation", "tiles",
    "keyRequirements", "howToImplement", "otherFactors",
    "iconGrid", "comparison", "processFlow", "calloutCard",
    "citations"],
};

const STARTER_CONTENT = {
  title: "COPPA 2026 Rule Changes",
  subtitle: "Compliance Guide",
  effectiveDate: "April 22, 2026",
  publishedDate: "January 2026",
  code: "COPPA-2026",
  summary: "The FTC\u2019s amended Children\u2019s Online Privacy Protection Rule takes effect April 22, 2026. Operators of child-directed services, and services with actual knowledge they collect personal information from children under 13, face expanded consent, data-minimization, and retention obligations. This guide summarizes what changes, what\u2019s new, and what to do.",
  background: [
    "In January 2025, the FTC finalized amendments to the COPPA Rule \u2014 the first substantive update since 2013. The amendments close loopholes around targeted advertising, tighten the definition of personal information, add new consent requirements for third-party data sharing, and codify data-retention and security obligations.",
    "The compliance deadline is April 22, 2026. Existing operators must update privacy policies, consent flows, data-sharing agreements, and internal retention schedules before that date. New entrants must build to the amended rule from day one."
  ],
  legislation: [
    { juris: "FEDERAL", title: "Amended COPPA Rule (16 C.F.R. \u00a7 312)", effective: "Apr 22, 2026", status: "active", statusLabel: "Active", note: "FTC enforcement. Civil penalties up to $53,088 per violation." },
    { juris: "CALIFORNIA", title: "Age-Appropriate Design Code (AB 2273)", effective: "In litigation", status: "blocked", statusLabel: "Blocked", note: "Preliminarily enjoined by 9th Cir. Tracks COPPA-style duties for minors under 18." },
    { juris: "MARYLAND", title: "Age-Appropriate Design Code (HB 603)", effective: "Oct 1, 2025", status: "active", statusLabel: "Active", note: "Design-duty + DPIA requirements for services likely accessed by minors." },
    { juris: "FEDERAL", title: "KOSA (S.1409)", effective: "Pending", status: "watch", statusLabel: "Watch", note: "Passed Senate 2024; House action uncertain. Would add duty of care + design mandates." }
  ],
  keyRequirements: [
    { title: "Expanded definition of personal information", body: "The amended rule expands \u2018personal information\u2019 to include biometric identifiers (fingerprints, voiceprints, retinal scans, gait data) and government-issued identifiers. If your product collects, infers, or stores any of these from a child under 13, verifiable parental consent (VPC) is required." },
    { title: "Separate consent for third-party data sharing", body: "Operators must now obtain a separate, opt-in parental consent before disclosing a child\u2019s personal information to third parties for purposes other than supporting the internal operations of the service. A general consent for service use no longer covers third-party disclosure." },
    { title: "Data retention + written retention policy", body: "Operators must retain a child\u2019s personal information only for as long as reasonably necessary to fulfill the purpose for which it was collected. A written data-retention policy must be posted publicly and must specify a deletion schedule. Indefinite retention is no longer permitted." },
    { title: "Written information-security program", body: "Operators must establish, implement, and maintain a written information-security program containing administrative, technical, and physical safeguards appropriate to the sensitivity of the personal information and the size and complexity of the operator." }
  ],
  tiles: [
    { icon: "shield-check", label: "Separate VPC", sub: "for 3rd-party sharing" },
    { icon: "scan-face", label: "Biometrics = PI", sub: "new category" },
    { icon: "clock", label: "Retention policy", sub: "written + public" },
    { icon: "lock", label: "Security program", sub: "written safeguards" }
  ],
  howToImplement: {
    intro: "Use this checklist to prepare for the April 22, 2026 compliance deadline. Most items require coordination between product, legal, and security teams.",
    items: [
      { head: "Audit your data inventory", body: "Map every field of personal information you collect from users under 13, including biometric and government-ID fields added by the 2026 amendments. Flag anything new." },
      { head: "Split consent flows", body: "Redesign your parental-consent flow to obtain separate, opt-in consent for third-party data sharing. General service-use consent must not imply consent to sharing." },
      { head: "Publish a retention schedule", body: "Write and publicly post a data-retention policy that specifies, for each category of child personal information, how long you retain it and when it is deleted." },
      { head: "Update privacy policy", body: "Revise your privacy policy to reflect the expanded definition of personal information, separate-consent requirement, retention schedule, and the named third parties you disclose to." },
      { head: "Stand up a security program", body: "Document your administrative, technical, and physical safeguards in a written information-security program. Assign an accountable owner. Review at least annually." },
      { head: "Vendor + processor diligence", body: "Update contracts with processors and advertising partners to reflect the new disclosure restrictions. Obtain written assurances of equivalent data-handling practices." },
      { head: "Train your team", body: "Brief product, engineering, and support teams on the amended rule. Document training completion." }
    ]
  },
  otherFactors: {
    title: "Interaction with state laws",
    body: "COPPA sets a federal floor, not a ceiling. State laws \u2014 California AADC (when it clears litigation), Maryland AADC, Connecticut SB 3, and others \u2014 impose additional duties, especially for the 13\u201317 age group that COPPA does not cover. Build to the stricter standard in any state where you operate."
  },
  citations: [
    "16 C.F.R. Part 312 (amended Jan. 2025; eff. Apr. 22, 2026)",
    "FTC press release, \"FTC Finalizes Changes to Children\u2019s Privacy Rule\" (Jan. 16, 2025)",
    "Maryland HB 603 \u2014 Age-Appropriate Design Code Act (2024)"
  ],
  sectionOrder: ["summary", "background", "legislation", "tiles",
    "keyRequirements", "howToImplement", "otherFactors",
    "iconGrid", "comparison", "processFlow", "calloutCard",
    "citations"],
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

  const reorderSections = useCallback((newOrder) => {
    setContent(prev => ({ ...prev, sectionOrder: newOrder }));
  }, []);

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
        setContent({ ...BLANK_CONTENT, ...data });
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

  const doExportPdf = async () => {
    showToast("Generating PDF…");
    // Build standalone HTML and render in a hidden iframe for PDF capture.
    const sanitized = sanitizeForPreview(content);
    const html = buildStandaloneHtml(sanitized, variant);
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;left:-9999px;top:0;width:816px;height:1056px;border:0;";
    document.body.appendChild(iframe);
    iframe.contentDocument.open();
    iframe.contentDocument.write(html);
    iframe.contentDocument.close();
    // Wait for fonts + scripts + Babel to compile + render.
    await new Promise(ok => {
      let checks = 0;
      const poll = setInterval(() => {
        checks++;
        const root = iframe.contentDocument.getElementById("root");
        const hasContent = root && root.children.length > 0 && root.querySelector(".cg-sheet:not(.cg-measure-sheet)");
        if (hasContent || checks > 60) { clearInterval(poll); setTimeout(ok, 600); }
      }, 300);
    });
    const target = iframe.contentDocument.querySelector(".cg-viewer") || iframe.contentDocument.getElementById("root");
    const sheets = iframe.contentDocument.querySelectorAll(".cg-sheet:not(.cg-measure-sheet)");
    if (!sheets.length) {
      showToast("PDF failed: no pages rendered");
      document.body.removeChild(iframe);
      return;
    }
    // Use html2pdf.js
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: "px", format: [816, 1056], hotfixes: ["px_scaling"] });
    for (let i = 0; i < sheets.length; i++) {
      if (i > 0) pdf.addPage([816, 1056]);
      const canvas = await html2canvas(sheets[i], {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: 816,
        height: 1056,
        windowWidth: 816,
        windowHeight: 1056,
      });
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, 816, 1056);
    }
    pdf.save(`${(content.code || "guide").toLowerCase().replace(/[^a-z0-9-]+/g, "-")}.pdf`);
    document.body.removeChild(iframe);
    showToast("Downloaded PDF");
  };

  const doReset = () => {
    if (!confirm("Clear this draft and start over? This can't be undone.")) return;
    clearDraft();
    setContent(BLANK_CONTENT);
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
          <button className="btn btn-primary" onClick={doExportPdf}>Export PDF</button>
          <button className="btn" onClick={doExportHtml}>Export HTML</button>
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
            onReorderSections={reorderSections}
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
        in the final guide. Drag sections by their grip handle to reorder them, and rearrange
        items within a section using the ↑ / ↓ controls.
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

  <script>
    window.CG_CONTENT = ${JSON.stringify(content, null, 2)};
    window.CG_LOGO_URL = "${new URL("../assets/logo_kidsafe.png", window.location.href).href}";
  </script>
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
