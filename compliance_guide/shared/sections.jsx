// Shared section components for all three Compliance Guide variations.
// Visual differences between Conservative / Balanced / Bolder live entirely in each
// variation's style.css — the JSX + class names stay identical. This means a single
// content object renders unchanged across all three templates.
//
// Usage:
//   <CGGuide c={CG_CONTENT} />
//
// Paginates automatically: sheets split when their body is full.

const { useRef, useEffect, useLayoutEffect, useState } = React;

// ---------- primitives ----------

function CGSheet({ pageNum, totalPages, children }) {
  // Role tag used by decorative styles to vary composition per page.
  // first + last so a single-page doc gets both; middle pages get "middle".
  const role =
    totalPages === 1 ? 'only' :
    pageNum === 1 ? 'first' :
    pageNum === totalPages ? 'last' : 'middle';
  return (
    <div
      className="cg-sheet"
      data-page={pageNum}
      data-page-role={role}
      data-page-parity={pageNum % 2 === 0 ? 'even' : 'odd'}
      data-screen-label={`${String(pageNum).padStart(2,'0')} page ${pageNum}`}
    >
      <div className="cg-sheet-bg" aria-hidden="true" />
      {children}
      <footer className="cg-page-foot">
        <span className="cg-foot-brand">kidSAFE Compliance Guide</span>
        <span className="cg-foot-page">{pageNum} of {totalPages}</span>
      </footer>
    </div>
  );
}

function CGHeader({ c }) {
  return (
    <header className="cg-sheet-head">
      <div className="cg-head-text">
        <div className="cg-head-topic">{c.subtitle || "Compliance Guide"}</div>
        <h1 className="cg-head-title">{c.title}</h1>
        {c.effectiveDate && (
          <div className="cg-head-meta">
            <span>Effective {c.effectiveDate}</span>
            {c.publishedDate && <span className="cg-head-sep">·</span>}
            {c.publishedDate && <span>Published {c.publishedDate}</span>}
          </div>
        )}
      </div>
      <img className="cg-head-logo" src="../../assets/logo_kidsafe.png" alt="kidSAFE Seal Program" />
    </header>
  );
}

function CGRunningHead({ c, pageNum }) {
  // Compact top strip used on continuation pages.
  return (
    <header className="cg-sheet-running">
      <div className="cg-running-text">
        <span className="cg-running-title">{c.title}</span>
        <span className="cg-running-sep">·</span>
        <span className="cg-running-sub">{c.subtitle || "Compliance Guide"}</span>
      </div>
      <img className="cg-running-logo" src="../../assets/logo_kidsafe.png" alt="kidSAFE" />
    </header>
  );
}

function CGSummary({ text }) {
  return <p className="cg-summary">{text}</p>;
}

// ---------- Sections ----------

function SecBackground({ items }) {
  return (
    <section className="cg-sec cg-sec-background">
      <div className="cg-eyebrow">Background</div>
      <div className="cg-sec-body">
        {items.map((para, i) => <p key={i}>{para}</p>)}
      </div>
    </section>
  );
}

function SecLegislation({ cards }) {
  return (
    <section className="cg-sec cg-sec-legislation">
      <div className="cg-eyebrow">Legislation Overview</div>
      <div className="cg-leg-grid">
        {cards.map((l, i) => (
          <article key={i} className="cg-leg-card">
            <header className="cg-leg-head">
              <span className="cg-leg-juris">{l.juris}</span>
              <span className="cg-leg-eff">Eff. {l.effective}</span>
            </header>
            <h3 className="cg-leg-title">{l.title}</h3>
            <div className="cg-leg-status">
              <span className={`cg-status s-${l.status}`}>
                <span className="dot" />
                <span>{l.statusLabel || l.status}</span>
              </span>
            </div>
            {l.note && <p className="cg-leg-note">{l.note}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}

function SecKeyRequirements({ items }) {
  return (
    <section className="cg-sec cg-sec-requirements">
      <div className="cg-eyebrow">Key Requirements</div>
      <div className="cg-req-list">
        {items.map((r, i) => (
          <article key={i} className="cg-req">
            <div className="cg-req-num">{String(i+1).padStart(2,'0')}</div>
            <div className="cg-req-body">
              <h3 className="cg-req-title">{r.title}</h3>
              <p className="cg-req-copy">{r.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SecTiles({ items }) {
  return (
    <section className="cg-sec cg-sec-tiles">
      <div className="cg-eyebrow">At a glance</div>
      <div className={`cg-tile-row n-${items.length}`}>
        {items.map((t, i) => (
          <div key={i} className="cg-tile">
            <div className="cg-tile-icon">
              <CGIcon name={t.icon} size={22} />
            </div>
            <div className="cg-tile-label">{t.label}</div>
            {t.sub && <div className="cg-tile-sub">{t.sub}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}

function SecHowToImplement({ intro, items }) {
  return (
    <section className="cg-sec cg-sec-implement">
      <div className="cg-eyebrow">How to Implement</div>
      {intro && <p className="cg-sec-intro">{intro}</p>}
      <ol className="cg-check-list">
        {items.map((it, i) => {
          const num = String(i+1).padStart(2,'0');
          return (
            <li key={i} className="cg-check-item" data-num={num}>
              <div className="cg-check-marker" aria-hidden="true">
                <div className="cg-check-box"><CGIcon name="check" size={12} stroke={3} /></div>
                <span className="cg-check-num">{num}</span>
              </div>
              <div className="cg-check-body">
                <span className="cg-check-head">{it.head}.</span>{" "}
                <span>{it.body}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function SecOtherFactors({ title, body }) {
  return (
    <section className="cg-sec cg-sec-other">
      <div className="cg-callout">
        <div className="cg-callout-eyebrow">Other Factors</div>
        <h3 className="cg-callout-title">{title}</h3>
        <p className="cg-callout-body">{body}</p>
      </div>
    </section>
  );
}

function SecCitations({ items }) {
  return (
    <section className="cg-sec cg-sec-citations">
      <div className="cg-eyebrow">Citations</div>
      <ol className="cg-citations">
        {items.map((s, i) => <li key={i}>{s}</li>)}
      </ol>
    </section>
  );
}

// ---------- Content-aware pagination ----------
//
// We render ALL sections into a hidden measurement sheet, then greedily pack them
// into real sheets (a first "cover" sheet with full header, plus continuation
// sheets with a compact running head). If a single section overflows a fresh
// page, we still place it and let it span — a conservative approach that works
// for the typical 1–3 page guides.

function CGGuide({ c, fullHeaderEveryPage = false }) {
  // Build the ordered list of sections to render, skipping empty ones.
  const sections = [];
  if (c.summary)        sections.push(<CGSummary key="summary" text={c.summary} />);
  if (c.background?.length)      sections.push(<SecBackground    key="bg" items={c.background} />);
  if (c.legislation?.length)     sections.push(<SecLegislation   key="leg" cards={c.legislation} />);
  if (c.tiles?.length)           sections.push(<SecTiles         key="tiles" items={c.tiles} />);
  if (c.keyRequirements?.length) sections.push(<SecKeyRequirements key="req" items={c.keyRequirements} />);
  if (c.howToImplement?.items?.length)
    sections.push(<SecHowToImplement key="how" intro={c.howToImplement.intro} items={c.howToImplement.items} />);
  if (c.otherFactors)            sections.push(<SecOtherFactors  key="other" title={c.otherFactors.title} body={c.otherFactors.body} />);
  if (c.citations?.length)       sections.push(<SecCitations     key="cite" items={c.citations} />);

  const [pages, setPages] = useState([sections]); // start with one page, refine after measure
  const measureRef = useRef(null);

  // Fingerprint of content — changes whenever sections change, which re-runs
  // the measurement pass. Authoring mode mutates `c` on every keystroke; we
  // need pagination to keep up.
  const contentKey = JSON.stringify(c);

  useLayoutEffect(() => {
    const root = measureRef.current;
    if (!root) return;

    // Work on clones of the measurement nodes
    const sheetEl = root.querySelector('.cg-measure-sheet');
    if (!sheetEl) return;

    // Usable content height on a page. The measurement sheet may itself overflow
    // (min-height is 11in), so we compute budget from the *fixed* page height,
    // not the measurement sheet's current render.
    const pxPerIn = 96; // matches CSS --page-w / --page-h at 96dpi
    const sheetH = 11 * pxPerIn;
    const head   = sheetEl.querySelector('.cg-sheet-head')?.getBoundingClientRect().height || 0;
    const foot   = sheetEl.querySelector('.cg-page-foot')?.getBoundingClientRect().height || 0;
    // Measurement page has the full header; continuation has a running head
    // (or the full header again, when fullHeaderEveryPage is on).
    const runningH = 36; // compact running-head estimate
    const fullHeadH = head; // reuse the measured full-header height
    const gapY = 12; // rough gap between sections in column layout

    // Pull every section's natural height from the measurement sheet.
    const contentItems = Array.from(sheetEl.querySelectorAll('[data-cg-measure]'));
    // Sheet padding can live on the sheet itself OR on .cg-sheet-body (some
    // variations inset the body instead of the sheet). Sum both so budget is
    // correct regardless of which layer owns the padding.
    const sumPad = (el) => {
      if (!el) return 0;
      const s = getComputedStyle(el);
      return (parseFloat(s.paddingTop) || 0) + (parseFloat(s.paddingBottom) || 0);
    };
    const bodyEl = sheetEl.querySelector('.cg-sheet-body');
    const padSheet = sumPad(sheetEl);
    const padBody  = sumPad(bodyEl);
    const totalPad = padSheet + padBody;
    const firstPageBudget = sheetH - totalPad - head - foot - gapY;
    const laterPageBudget = sheetH - totalPad - (fullHeaderEveryPage ? fullHeadH : runningH) - foot - gapY;

    const allPages = [];
    let current = [];
    let used = 0;
    let budget = firstPageBudget;

    contentItems.forEach((el, i) => {
      const h = el.getBoundingClientRect().height + gapY;
      if (used + h > budget && current.length > 0) {
        allPages.push(current);
        current = [];
        used = 0;
        budget = laterPageBudget;
      }
      current.push(i);
      used += h;
    });
    if (current.length) allPages.push(current);

    // Map indices back to section nodes (in the original order).
    const paged = allPages.map(idxs => idxs.map(i => sections[i]));
    setPages(paged);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentKey, fullHeaderEveryPage]);

  const total = pages.length;

  return (
    <>
      {/* Hidden measurement sheet: renders all sections once, off-screen. */}
      <div
        ref={measureRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '-99999px',
          top: 0,
          visibility: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <div className="cg-sheet cg-measure-sheet">
          <div className="cg-sheet-bg" aria-hidden="true" />
          <CGHeader c={c} />
          <div className="cg-sheet-body">
            {sections.map((s, i) => (
              <div key={i} data-cg-measure>{s}</div>
            ))}
          </div>
          <footer className="cg-page-foot">
            <span>kidSAFE Compliance Guide</span>
            <span>1 of 1</span>
          </footer>
        </div>
      </div>

      {/* Real rendered sheets */}
      {pages.map((pageSections, pi) => (
        <CGSheet key={pi} pageNum={pi+1} totalPages={total}>
          {pi === 0 || fullHeaderEveryPage ? <CGHeader c={c} /> : <CGRunningHead c={c} pageNum={pi+1} />}
          <div className="cg-sheet-body">
            {pageSections.map((s, i) => (
              <div key={i} className="cg-sec-wrap">{s}</div>
            ))}
          </div>
        </CGSheet>
      ))}
    </>
  );
}

Object.assign(window, {
  CGGuide, CGSheet, CGHeader, CGRunningHead, CGSummary,
  SecBackground, SecLegislation, SecKeyRequirements, SecTiles, SecHowToImplement, SecOtherFactors, SecCitations,
});
