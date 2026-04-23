// AuthoringForm — renders the collapsible section cards for each piece of
// content. Sections are rendered in the order specified by content.sectionOrder,
// and can be reordered via drag-and-drop.
//
// The Header section is always first and is not draggable. The remaining
// sections (summary, background, legislation, tiles, keyRequirements,
// howToImplement, otherFactors, citations) can be dragged by a grip handle.

// Default section order used when content.sectionOrder is missing.
const DEFAULT_SECTION_ORDER = [
  "summary", "background", "legislation", "tiles",
  "keyRequirements", "howToImplement", "otherFactors",
  "iconGrid", "comparison", "processFlow", "calloutCard",
  "citations",
];

// ---------- Section registry ----------
// Each entry defines how a section card renders. This replaces the old
// hardcoded <SectionCard> blocks.
const SECTION_DEFS = {
  summary: {
    title: "Summary",
    desc: "One paragraph introducing the guide. Shown in a pull-quote style.",
    filled: c => !!(c.summary && c.summary.trim()),
    render: (c, { update }) => (
      <TextAreaField
        label="Summary paragraph"
        hint="2–4 sentences. Appears below the header."
        value={c.summary || ""}
        rows={4}
        onChange={v => update("summary", v)}
      />
    ),
  },
  background: {
    title: "Background",
    desc: "Context paragraphs explaining how we got here",
    filled: c => !!(c.background && c.background.some(p => p.trim())),
    render: (c, { update, pushItem, removeItem, moveItem }) => (
      <>
        {(c.background || []).map((para, i) => (
          <ItemRow
            key={i}
            num={`Paragraph ${i+1}`}
            onUp={i > 0 ? () => moveItem("background", i, -1) : null}
            onDown={i < (c.background.length - 1) ? () => moveItem("background", i, 1) : null}
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
      </>
    ),
  },
  legislation: {
    title: "Legislation Overview",
    desc: "Cards summarizing the laws / rules covered",
    filled: c => !!(c.legislation && c.legislation.some(l => l.title?.trim())),
    render: (c, { update, pushItem, removeItem, moveItem }) => (
      <>
        {(c.legislation || []).map((l, i) => (
          <ItemRow
            key={i}
            num={`Card ${i+1}`}
            onUp={i > 0 ? () => moveItem("legislation", i, -1) : null}
            onDown={i < (c.legislation.length - 1) ? () => moveItem("legislation", i, 1) : null}
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
      </>
    ),
  },
  tiles: {
    title: "At a Glance",
    desc: "3–5 small tiles with an icon + short label",
    filled: c => !!(c.tiles && c.tiles.some(t => t.label?.trim())),
    render: (c, { update, pushItem, removeItem, moveItem }) => (
      <>
        {(c.tiles || []).map((t, i) => (
          <ItemRow
            key={i}
            num={`Tile ${i+1}`}
            onUp={i > 0 ? () => moveItem("tiles", i, -1) : null}
            onDown={i < (c.tiles.length - 1) ? () => moveItem("tiles", i, 1) : null}
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
      </>
    ),
  },
  keyRequirements: {
    title: "Key Requirements",
    desc: "Numbered list of the substantive rules to comply with",
    filled: c => !!(c.keyRequirements && c.keyRequirements.some(r => r.title?.trim())),
    render: (c, { update, pushItem, removeItem, moveItem }) => (
      <>
        {(c.keyRequirements || []).map((r, i) => (
          <ItemRow
            key={i}
            num={`Requirement ${i+1}`}
            onUp={i > 0 ? () => moveItem("keyRequirements", i, -1) : null}
            onDown={i < (c.keyRequirements.length - 1) ? () => moveItem("keyRequirements", i, 1) : null}
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
      </>
    ),
  },
  howToImplement: {
    title: "How to Implement",
    desc: "Action checklist — what to actually do about it",
    filled: c => !!(c.howToImplement?.items?.some(it => it.head?.trim())),
    render: (c, { update, pushItem, removeItem, moveItem }) => (
      <>
        <TextAreaField
          label="Intro"
          hint="1 sentence framing the checklist. Shown above the items."
          value={c.howToImplement?.intro || ""}
          rows={2}
          onChange={v => update(["howToImplement", "intro"], v)}
        />
        {(c.howToImplement?.items || []).map((it, i) => (
          <ItemRow
            key={i}
            num={`Step ${i+1}`}
            onUp={i > 0 ? () => moveItem(["howToImplement", "items"], i, -1) : null}
            onDown={i < (c.howToImplement.items.length - 1) ? () => moveItem(["howToImplement", "items"], i, 1) : null}
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
      </>
    ),
  },
  otherFactors: {
    title: "Other Factors",
    desc: "Callout: relationship to other laws, caveats, edge cases",
    filled: c => !!(c.otherFactors?.title?.trim() || c.otherFactors?.body?.trim()),
    render: (c, { update }) => (
      <>
        <TextField
          label="Callout title"
          value={c.otherFactors?.title || ""}
          onChange={v => update(["otherFactors", "title"], v)}
        />
        <TextAreaField
          label="Callout body"
          value={c.otherFactors?.body || ""}
          rows={4}
          onChange={v => update(["otherFactors", "body"], v)}
        />
      </>
    ),
  },
  iconGrid: {
    title: "Icon Grid",
    desc: "2-column grid of icon cards with title + description",
    filled: c => !!(c.iconGrid?.items?.some(it => it.title?.trim())),
    render: (c, { update, pushItem, removeItem, moveItem }) => (
      <>
        <TextField
          label="Section heading"
          hint="Eyebrow text above the grid. Default: 'Overview'"
          value={c.iconGrid?.heading || ""}
          onChange={v => update(["iconGrid", "heading"], v)}
        />
        {(c.iconGrid?.items || []).map((item, i) => (
          <ItemRow
            key={i}
            num={`Card ${i+1}`}
            onUp={i > 0 ? () => moveItem(["iconGrid", "items"], i, -1) : null}
            onDown={i < (c.iconGrid.items.length - 1) ? () => moveItem(["iconGrid", "items"], i, 1) : null}
            onDelete={() => removeItem(["iconGrid", "items"], i)}
          >
            <div className="field-row">
              <IconField
                label="Icon"
                value={item.icon || "shield-check"}
                onChange={v => update(["iconGrid", "items", i, "icon"], v)}
              />
              <TextField
                label="Title"
                value={item.title || ""}
                onChange={v => update(["iconGrid", "items", i, "title"], v)}
              />
            </div>
            <TextAreaField
              label="Description"
              hint="1–2 sentences explaining this point"
              value={item.body || ""}
              rows={2}
              onChange={v => update(["iconGrid", "items", i, "body"], v)}
            />
          </ItemRow>
        ))}
        <button
          className="add-item"
          onClick={() => pushItem(["iconGrid", "items"], { icon: "shield-check", title: "", body: "" })}
        >
          + Add card
        </button>
      </>
    ),
  },
  comparison: {
    title: "Comparison",
    desc: "Side-by-side columns (before/after, do/don't, old/new)",
    filled: c => !!(c.comparison?.left?.items?.some(s => s.trim()) || c.comparison?.right?.items?.some(s => s.trim())),
    render: (c, { update, pushItem, removeItem }) => {
      const cmp = c.comparison || { heading: "", left: { label: "", icon: "", items: [] }, right: { label: "", icon: "", items: [] }};
      return (
        <>
          <TextField
            label="Section heading"
            hint="Eyebrow text. Default: 'Comparison'"
            value={cmp.heading || ""}
            onChange={v => update(["comparison", "heading"], v)}
          />
          <div className="field-row">
            <div style={{flex: 1}}>
              <h4 className="sub-heading">Left column</h4>
              <div className="field-row">
                <IconField
                  label="Icon"
                  value={cmp.left?.icon || "check-circle"}
                  onChange={v => update(["comparison", "left", "icon"], v)}
                />
                <TextField
                  label="Label"
                  hint="e.g. 'Before', 'Do', 'Required'"
                  value={cmp.left?.label || ""}
                  onChange={v => update(["comparison", "left", "label"], v)}
                />
              </div>
              {(cmp.left?.items || []).map((item, i) => (
                <div key={i} className="inline-item">
                  <TextField
                    hideLabel
                    value={item}
                    onChange={v => update(["comparison", "left", "items", i], v)}
                  />
                  <button className="remove-btn" onClick={() => removeItem(["comparison", "left", "items"], i)}>×</button>
                </div>
              ))}
              <button className="add-item" onClick={() => pushItem(["comparison", "left", "items"], "")}>+ Add item</button>
            </div>
            <div style={{flex: 1}}>
              <h4 className="sub-heading">Right column</h4>
              <div className="field-row">
                <IconField
                  label="Icon"
                  value={cmp.right?.icon || "x-circle"}
                  onChange={v => update(["comparison", "right", "icon"], v)}
                />
                <TextField
                  label="Label"
                  hint="e.g. 'After', 'Don't', 'Prohibited'"
                  value={cmp.right?.label || ""}
                  onChange={v => update(["comparison", "right", "label"], v)}
                />
              </div>
              {(cmp.right?.items || []).map((item, i) => (
                <div key={i} className="inline-item">
                  <TextField
                    hideLabel
                    value={item}
                    onChange={v => update(["comparison", "right", "items", i], v)}
                  />
                  <button className="remove-btn" onClick={() => removeItem(["comparison", "right", "items"], i)}>×</button>
                </div>
              ))}
              <button className="add-item" onClick={() => pushItem(["comparison", "right", "items"], "")}>+ Add item</button>
            </div>
          </div>
        </>
      );
    },
  },
  processFlow: {
    title: "Process Flow",
    desc: "Horizontal step-by-step flow with icons and arrows",
    filled: c => !!(c.processFlow?.items?.some(s => s.label?.trim())),
    render: (c, { update, pushItem, removeItem, moveItem }) => (
      <>
        <TextField
          label="Section heading"
          hint="Eyebrow text. Default: 'Process'"
          value={c.processFlow?.heading || ""}
          onChange={v => update(["processFlow", "heading"], v)}
        />
        {(c.processFlow?.items || []).map((step, i) => (
          <ItemRow
            key={i}
            num={`Step ${i+1}`}
            onUp={i > 0 ? () => moveItem(["processFlow", "items"], i, -1) : null}
            onDown={i < (c.processFlow.items.length - 1) ? () => moveItem(["processFlow", "items"], i, 1) : null}
            onDelete={() => removeItem(["processFlow", "items"], i)}
          >
            <div className="field-row">
              <IconField
                label="Icon"
                value={step.icon || "circle"}
                onChange={v => update(["processFlow", "items", i, "icon"], v)}
              />
              <TextField
                label="Label"
                hint="Short — 2–4 words"
                value={step.label || ""}
                onChange={v => update(["processFlow", "items", i, "label"], v)}
              />
            </div>
            <TextField
              label="Subtext"
              hint="Optional detail line"
              value={step.sub || ""}
              onChange={v => update(["processFlow", "items", i, "sub"], v)}
            />
          </ItemRow>
        ))}
        <button
          className="add-item"
          onClick={() => pushItem(["processFlow", "items"], { icon: "circle", label: "", sub: "" })}
        >
          + Add step
        </button>
      </>
    ),
  },
  calloutCard: {
    title: "Callout Card",
    desc: "Emphasized box with icon, heading, and body text",
    filled: c => !!(c.calloutCard?.heading?.trim()),
    render: (c, { update }) => (
      <>
        <div className="field-row">
          <IconField
            label="Icon"
            value={c.calloutCard?.icon || "alert-triangle"}
            onChange={v => update(["calloutCard", "icon"], v)}
          />
          <SelectField
            label="Variant"
            value={c.calloutCard?.variant || "info"}
            options={[
              { value: "info", label: "Info (blue)" },
              { value: "warning", label: "Warning (amber)" },
              { value: "success", label: "Success (green)" },
              { value: "danger", label: "Danger (red)" },
            ]}
            onChange={v => update(["calloutCard", "variant"], v)}
          />
        </div>
        <TextField
          label="Heading"
          value={c.calloutCard?.heading || ""}
          onChange={v => update(["calloutCard", "heading"], v)}
        />
        <TextAreaField
          label="Body"
          hint="1–3 sentences"
          value={c.calloutCard?.body || ""}
          rows={3}
          onChange={v => update(["calloutCard", "body"], v)}
        />
      </>
    ),
  },
  citations: {
    title: "Citations",
    desc: "Legal citations listed at the end of the guide",
    filled: c => !!(c.citations && c.citations.some(s => s.trim())),
    render: (c, { update, pushItem, removeItem, moveItem }) => (
      <>
        {(c.citations || []).map((ci, i) => (
          <ItemRow
            key={i}
            num={`Citation ${i+1}`}
            onUp={i > 0 ? () => moveItem("citations", i, -1) : null}
            onDown={i < (c.citations.length - 1) ? () => moveItem("citations", i, 1) : null}
            onDelete={() => removeItem("citations", i)}
          >
            <TextField
              hideLabel
              value={ci}
              onChange={v => update(["citations", i], v)}
            />
          </ItemRow>
        ))}
        <button className="add-item" onClick={() => pushItem("citations", "")}>
          + Add citation
        </button>
      </>
    ),
  },
};

// ---------- Main form component ----------

function AuthoringForm({
  content,
  openSections,
  toggleSection,
  update,
  pushItem,
  removeItem,
  moveItem,
  onReorderSections,
}) {
  // Merge: if a saved draft's sectionOrder is missing newly-added section IDs,
  // append them before citations so returning users see the new modules.
  const rawOrder = content.sectionOrder || DEFAULT_SECTION_ORDER;
  const allIds = Object.keys(SECTION_DEFS);
  const missing = allIds.filter(id => !rawOrder.includes(id));
  let order = rawOrder;
  if (missing.length > 0) {
    const citIdx = rawOrder.indexOf("citations");
    order = [...rawOrder];
    if (citIdx !== -1) {
      order.splice(citIdx, 0, ...missing);
    } else {
      order.push(...missing);
    }
  }
  const helpers = { update, pushItem, removeItem, moveItem };

  // --- Drag-and-drop state ---
  const [dragId, setDragId] = React.useState(null);      // section being dragged
  const [dropTarget, setDropTarget] = React.useState(null); // section being hovered over
  const [dropSide, setDropSide] = React.useState(null);  // "above" or "below"

  const handleDragStart = (e, sectionId) => {
    setDragId(sectionId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", sectionId);
  };

  const cleanupDrag = () => {
    document.querySelectorAll(".section.drop-above, .section.drop-below").forEach(el => {
      el.classList.remove("drop-above", "drop-below");
    });
    setDragId(null);
    setDropTarget(null);
    setDropSide(null);
  };

  const handleDragEnd = () => cleanupDrag();

  const handleDragOver = (e, sectionId) => {
    if (!dragId || dragId === sectionId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    // Determine whether we're in the top or bottom half of the target
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const side = e.clientY < midY ? "above" : "below";
    if (dropTarget !== sectionId || dropSide !== side) {
      // Clean previous indicators
      document.querySelectorAll(".section.drop-above, .section.drop-below").forEach(el => {
        el.classList.remove("drop-above", "drop-below");
      });
      e.currentTarget.classList.add(side === "above" ? "drop-above" : "drop-below");
      setDropTarget(sectionId);
      setDropSide(side);
    }
  };

  const handleDragLeave = (e) => {
    // Only clear if we're leaving the section entirely (not entering a child)
    if (!e.currentTarget.contains(e.relatedTarget)) {
      e.currentTarget.classList.remove("drop-above", "drop-below");
      setDropTarget(null);
      setDropSide(null);
    }
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (!dragId || dragId === targetId) return;
    const fromIdx = order.indexOf(dragId);
    const toIdx = order.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) return;

    const newOrder = order.filter(id => id !== dragId);
    let insertIdx = newOrder.indexOf(targetId);
    if (dropSide === "below") insertIdx += 1;
    newOrder.splice(insertIdx, 0, dragId);
    onReorderSections(newOrder);
    cleanupDrag();
  };

  return (
    <>
      {/* Header is always first and not draggable */}
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

      {/* Reorderable sections rendered from sectionOrder */}
      {order.map((sectionId, idx) => {
        const def = SECTION_DEFS[sectionId];
        if (!def) return null;
        const num = String(idx + 2).padStart(2, "0"); // header is 01
        return (
          <SectionCard
            key={sectionId}
            id={sectionId}
            num={num}
            title={def.title}
            desc={def.desc}
            open={openSections[sectionId]}
            onToggle={() => toggleSection(sectionId)}
            filled={def.filled(content)}
            draggable
            onDragStart={e => handleDragStart(e, sectionId)}
            onDragEnd={handleDragEnd}
            onDragOver={e => handleDragOver(e, sectionId)}
            onDragLeave={handleDragLeave}
            onDrop={e => handleDrop(e, sectionId)}
            isDragging={dragId === sectionId}
          >
            {def.render(content, helpers)}
          </SectionCard>
        );
      })}
    </>
  );
}

// ---------- Primitives ----------

function SectionCard({
  id, num, title, desc, open, onToggle, filled, children,
  draggable, onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop, isDragging,
}) {
  return (
    <div
      className={`section${isDragging ? " dragging" : ""}`}
      data-open={open ? "true" : "false"}
      draggable={draggable ? "true" : undefined}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="section-head" onClick={onToggle}>
        <div className="section-head-left">
          {draggable && (
            <span
              className="section-grip"
              title="Drag to reorder"
              onClick={e => e.stopPropagation()}
              onMouseDown={e => e.stopPropagation()}
            >⠿</span>
          )}
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

function SelectField({ label, value, options, onChange }) {
  return (
    <label className="field">
      <div className="field-label"><span>{label}</span></div>
      <select value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => (
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
  "check-circle", "x-circle", "circle", "arrow-right",
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
Object.assign(window, { AuthoringForm, DEFAULT_SECTION_ORDER });
