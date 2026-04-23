// AuthoringForm — renders the collapsible section cards for each piece of
// content. Each section has a header (section name, a "filled" badge, a
// chevron), and when expanded, a set of fields.
//
// Editing is entirely uncontrolled-on-parent: every field calls the App-level
// `update(path, value)` prop which is the single source of truth. The form
// never holds its own state.

function AuthoringForm({
  content,
  openSections,
  toggleSection,
  update,
  pushItem,
  removeItem,
  moveItem,
}) {
  return (
    <>
      <SectionCard
        id="header"
        num="01"
        title="Header"
        desc="Title, dates, and the short eyebrow above the title"
        open={openSections.header}
        onToggle={() => toggleSection("header")}
        filled={!!(content.title && content.title !== "New Compliance Guide")}
      >
        <TextField
          label="Title"
          hint="Short and specific — e.g. 'COPPA 2026 Rule Changes'"
          value={content.title || ""}
          onChange={v => update("title", v)}
        />
        <TextField
          label="Subtitle / eyebrow"
          hint="Appears above the title. Default: 'Compliance Guide'"
          value={content.subtitle || ""}
          onChange={v => update("subtitle", v)}
        />
        <div className="field-row">
          <TextField
            label="Effective date"
            hint="e.g. 'April 22, 2026' or 'In litigation'"
            value={content.effectiveDate || ""}
            onChange={v => update("effectiveDate", v)}
          />
          <TextField
            label="Published date"
            hint="Date this guide was published"
            value={content.publishedDate || ""}
            onChange={v => update("publishedDate", v)}
          />
        </div>
        <TextField
          label="Code"
          hint="Internal identifier, e.g. 'COPPA-2026'. Used in filename when you export."
          value={content.code || ""}
          onChange={v => update("code", v)}
        />
      </SectionCard>

      <SectionCard
        id="summary"
        num="02"
        title="Summary"
        desc="One paragraph introducing the guide. Shown in a pull-quote style."
        open={openSections.summary}
        onToggle={() => toggleSection("summary")}
        filled={!!(content.summary && content.summary.trim())}
      >
        <TextAreaField
          label="Summary paragraph"
          hint="2–4 sentences. Appears below the header."
          value={content.summary || ""}
          rows={4}
          onChange={v => update("summary", v)}
        />
      </SectionCard>

      <SectionCard
        id="background"
        num="03"
        title="Background"
        desc="Context paragraphs explaining how we got here"
        open={openSections.background}
        onToggle={() => toggleSection("background")}
        filled={!!(content.background && content.background.some(p => p.trim()))}
      >
        {(content.background || []).map((para, i) => (
          <ItemRow
            key={i}
            num={`Paragraph ${i+1}`}
            onUp={i > 0 ? () => moveItem("background", i, -1) : null}
            onDown={i < (content.background.length - 1) ? () => moveItem("background", i, 1) : null}
            onDelete={() => removeItem("background", i)}
          >
            <TextAreaField
              hideLabel
              value={para}
              rows={3}
              onChange={v => update(["background", i], v)}
            />
          </ItemRow>
        ))}
        <button className="add-item" onClick={() => pushItem("background", "")}>
          + Add paragraph
        </button>
      </SectionCard>

      <SectionCard
        id="legislation"
        num="04"
        title="Legislation Overview"
        desc="Cards summarizing the laws / rules covered"
        open={openSections.legislation}
        onToggle={() => toggleSection("legislation")}
        filled={!!(content.legislation && content.legislation.some(l => l.title?.trim()))}
      >
        {(content.legislation || []).map((l, i) => (
          <ItemRow
            key={i}
            num={`Card ${i+1}`}
            onUp={i > 0 ? () => moveItem("legislation", i, -1) : null}
            onDown={i < (content.legislation.length - 1) ? () => moveItem("legislation", i, 1) : null}
            onDelete={() => removeItem("legislation", i)}
          >
            <div className="field-row">
              <TextField
                label="Jurisdiction"
                hint="e.g. FEDERAL, CALIFORNIA"
                value={l.juris || ""}
                onChange={v => update(["legislation", i, "juris"], v)}
              />
              <TextField
                label="Effective date"
                value={l.effective || ""}
                onChange={v => update(["legislation", i, "effective"], v)}
              />
            </div>
            <TextField
              label="Title"
              hint="Full bill/law name, e.g. 'Amended COPPA Rule (16 C.F.R. § 312)'"
              value={l.title || ""}
              onChange={v => update(["legislation", i, "title"], v)}
            />
            <div className="field-row">
              <StatusField
                label="Status"
                value={l.status || "active"}
                onChange={(status, statusLabel) => {
                  update(["legislation", i, "status"], status);
                  update(["legislation", i, "statusLabel"], statusLabel);
                }}
              />
              <TextField
                label="Status label"
                hint="Displayed text (Active, Blocked, Watch, etc.)"
                value={l.statusLabel || ""}
                onChange={v => update(["legislation", i, "statusLabel"], v)}
              />
            </div>
            <TextAreaField
              label="Note"
              hint="1–2 sentence summary below the card title"
              value={l.note || ""}
              rows={2}
              onChange={v => update(["legislation", i, "note"], v)}
            />
          </ItemRow>
        ))}
        <button
          className="add-item"
          onClick={() => pushItem("legislation", {
            juris: "FEDERAL", title: "", effective: "", status: "active", statusLabel: "Active", note: "",
          })}
        >
          + Add legislation card
        </button>
      </SectionCard>

      <SectionCard
        id="tiles"
        num="05"
        title="At a Glance"
        desc="3–5 small tiles with an icon + short label"
        open={openSections.tiles}
        onToggle={() => toggleSection("tiles")}
        filled={!!(content.tiles && content.tiles.some(t => t.label?.trim()))}
      >
        {(content.tiles || []).map((t, i) => (
          <ItemRow
            key={i}
            num={`Tile ${i+1}`}
            onUp={i > 0 ? () => moveItem("tiles", i, -1) : null}
            onDown={i < (content.tiles.length - 1) ? () => moveItem("tiles", i, 1) : null}
            onDelete={() => removeItem("tiles", i)}
          >
            <div className="field-row">
              <IconField
                label="Icon"
                value={t.icon || "shield-check"}
                onChange={v => update(["tiles", i, "icon"], v)}
              />
              <TextField
                label="Label"
                hint="Short — 2–4 words"
                value={t.label || ""}
                onChange={v => update(["tiles", i, "label"], v)}
              />
            </div>
            <TextField
              label="Subtext"
              hint="Small supporting line under the label"
              value={t.sub || ""}
              onChange={v => update(["tiles", i, "sub"], v)}
            />
          </ItemRow>
        ))}
        <button
          className="add-item"
          onClick={() => pushItem("tiles", { icon: "shield-check", label: "", sub: "" })}
        >
          + Add tile
        </button>
      </SectionCard>

      <SectionCard
        id="keyRequirements"
        num="06"
        title="Key Requirements"
        desc="Numbered list of the substantive rules to comply with"
        open={openSections.keyRequirements}
        onToggle={() => toggleSection("keyRequirements")}
        filled={!!(content.keyRequirements && content.keyRequirements.some(r => r.title?.trim()))}
      >
        {(content.keyRequirements || []).map((r, i) => (
          <ItemRow
            key={i}
            num={`Requirement ${i+1}`}
            onUp={i > 0 ? () => moveItem("keyRequirements", i, -1) : null}
            onDown={i < (content.keyRequirements.length - 1) ? () => moveItem("keyRequirements", i, 1) : null}
            onDelete={() => removeItem("keyRequirements", i)}
          >
            <TextField
              label="Title"
              value={r.title || ""}
              onChange={v => update(["keyRequirements", i, "title"], v)}
            />
            <TextAreaField
              label="Body"
              hint="1–3 sentence explanation"
              value={r.body || ""}
              rows={3}
              onChange={v => update(["keyRequirements", i, "body"], v)}
            />
          </ItemRow>
        ))}
        <button
          className="add-item"
          onClick={() => pushItem("keyRequirements", { title: "", body: "" })}
        >
          + Add requirement
        </button>
      </SectionCard>

      <SectionCard
        id="howToImplement"
        num="07"
        title="How to Implement"
        desc="Action checklist — what to actually do about it"
        open={openSections.howToImplement}
        onToggle={() => toggleSection("howToImplement")}
        filled={!!(content.howToImplement?.items?.some(it => it.head?.trim()))}
      >
        <TextAreaField
          label="Intro"
          hint="1 sentence framing the checklist. Shown above the items."
          value={content.howToImplement?.intro || ""}
          rows={2}
          onChange={v => update(["howToImplement", "intro"], v)}
        />
        {(content.howToImplement?.items || []).map((it, i) => (
          <ItemRow
            key={i}
            num={`Step ${i+1}`}
            onUp={i > 0 ? () => moveItem(["howToImplement", "items"], i, -1) : null}
            onDown={i < (content.howToImplement.items.length - 1) ? () => moveItem(["howToImplement", "items"], i, 1) : null}
            onDelete={() => removeItem(["howToImplement", "items"], i)}
          >
            <TextField
              label="Heading"
              hint="Imperative — 'Audit your data inventory'"
              value={it.head || ""}
              onChange={v => update(["howToImplement", "items", i, "head"], v)}
            />
            <TextAreaField
              label="Body"
              hint="What to do, briefly"
              value={it.body || ""}
              rows={3}
              onChange={v => update(["howToImplement", "items", i, "body"], v)}
            />
          </ItemRow>
        ))}
        <button
          className="add-item"
          onClick={() => pushItem(["howToImplement", "items"], { head: "", body: "" })}
        >
          + Add step
        </button>
      </SectionCard>

      <SectionCard
        id="otherFactors"
        num="08"
        title="Other Factors"
        desc="Callout: relationship to other laws, caveats, edge cases"
        open={openSections.otherFactors}
        onToggle={() => toggleSection("otherFactors")}
        filled={!!(content.otherFactors?.title?.trim() || content.otherFactors?.body?.trim())}
      >
        <TextField
          label="Callout title"
          value={content.otherFactors?.title || ""}
          onChange={v => update(["otherFactors", "title"], v)}
        />
        <TextAreaField
          label="Callout body"
          value={content.otherFactors?.body || ""}
          rows={4}
          onChange={v => update(["otherFactors", "body"], v)}
        />
      </SectionCard>

      <SectionCard
        id="citations"
        num="09"
        title="Citations"
        desc="Legal citations listed at the end of the guide"
        open={openSections.citations}
        onToggle={() => toggleSection("citations")}
        filled={!!(content.citations && content.citations.some(c => c.trim()))}
      >
        {(content.citations || []).map((c, i) => (
          <ItemRow
            key={i}
            num={`Citation ${i+1}`}
            onUp={i > 0 ? () => moveItem("citations", i, -1) : null}
            onDown={i < (content.citations.length - 1) ? () => moveItem("citations", i, 1) : null}
            onDelete={() => removeItem("citations", i)}
          >
            <TextField
              hideLabel
              value={c}
              onChange={v => update(["citations", i], v)}
            />
          </ItemRow>
        ))}
        <button className="add-item" onClick={() => pushItem("citations", "")}>
          + Add citation
        </button>
      </SectionCard>
    </>
  );
}

// ---------- Primitives ----------

function SectionCard({ id, num, title, desc, open, onToggle, filled, children }) {
  return (
    <div className="section" data-open={open ? "true" : "false"}>
      <div className="section-head" onClick={onToggle}>
        <div className="section-head-left">
          <span className="section-num">{num}</span>
          <div>
            <div className="section-title">{title}</div>
            {desc && <div className="section-desc">{desc}</div>}
          </div>
        </div>
        <div className="section-head-right">
          <span className={`section-badge ${filled ? "filled" : ""}`}>
            {filled ? "Filled" : "Empty"}
          </span>
          <span className="section-caret">▸</span>
        </div>
      </div>
      <div className="section-body">{children}</div>
    </div>
  );
}

function ItemRow({ num, onUp, onDown, onDelete, children }) {
  return (
    <div className="item">
      <div className="item-head">
        <span className="item-num">{num}</span>
        <div className="item-actions">
          <button className="icon-btn" onClick={onUp} disabled={!onUp} title="Move up">↑</button>
          <button className="icon-btn" onClick={onDown} disabled={!onDown} title="Move down">↓</button>
          <button className="icon-btn danger" onClick={onDelete} title="Delete">✕</button>
        </div>
      </div>
      {children}
    </div>
  );
}

function TextField({ label, hint, hideLabel, value, onChange }) {
  return (
    <label className="field">
      {!hideLabel && label && (
        <div className="field-label">
          <span>{label}</span>
          {hint && <span className="field-hint">{hint}</span>}
        </div>
      )}
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </label>
  );
}

function TextAreaField({ label, hint, hideLabel, value, rows, onChange }) {
  return (
    <label className="field">
      {!hideLabel && label && (
        <div className="field-label">
          <span>{label}</span>
          {hint && <span className="field-hint">{hint}</span>}
        </div>
      )}
      <textarea
        rows={rows || 3}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </label>
  );
}

const STATUS_OPTIONS = [
  { value: "active",  label: "Active"  },
  { value: "blocked", label: "Blocked" },
  { value: "watch",   label: "Watch"   },
  { value: "monitor", label: "Monitor" },
];

function StatusField({ label, value, onChange }) {
  return (
    <label className="field">
      <div className="field-label"><span>{label}</span></div>
      <select
        value={value}
        onChange={e => {
          const opt = STATUS_OPTIONS.find(o => o.value === e.target.value);
          onChange(opt.value, opt.label);
        }}
      >
        {STATUS_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

// Curated list of Lucide icons that work well as compliance tile glyphs.
// Authors pick by name; CGIcon resolves name → SVG path.
const TILE_ICONS = [
  "shield-check", "shield", "lock", "key",
  "file-text", "clipboard-check", "clipboard-list", "file-shield",
  "clock", "calendar", "timer",
  "users", "user-check", "user-x", "scan-face", "id-card",
  "eye", "eye-off", "alert-triangle", "alert-circle",
  "check", "x", "info",
  "sliders", "settings", "toggle-right",
  "trash", "archive",
  "globe", "map-pin",
  "book", "book-open",
  "search", "filter",
];

function IconField({ label, value, onChange }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="field" ref={ref} style={{ position: "relative" }}>
      <div className="field-label"><span>{label}</span></div>
      <button
        type="button"
        className="icon-picker-trigger"
        onClick={() => setOpen(!open)}
      >
        <CGIcon name={value} size={18} stroke={1.8} />
        <span className="icon-name">{value}</span>
      </button>
      {open && (
        <div className="icon-picker-popover">
          <div className="icon-picker-grid">
            {TILE_ICONS.map(name => (
              <button
                key={name}
                type="button"
                className={`icon-picker-option ${value === name ? "selected" : ""}`}
                title={name}
                onClick={() => { onChange(name); setOpen(false); }}
              >
                <CGIcon name={name} size={20} stroke={1.6} />
                <span className="icon-label">{name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Expose for App.jsx
Object.assign(window, { AuthoringForm });
