// Inline SVG icons used across Compliance Guide variations.
// Stand-in for kidSAFE's custom thin-line pictograms (to be replaced).
// Style via CSS (width, stroke, color).

window.CGIcon = function CGIcon({ name, size = 20, stroke = 1.6 }) {
  const paths = ICONS[name];
  if (!paths) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths}
    </svg>
  );
};

const p = (d, extra) => <path d={d} {...(extra || {})} />;
const c = (cx, cy, r, extra) => <circle cx={cx} cy={cy} r={r} {...(extra || {})} />;
const r = (x, y, w, h, rx, extra) => <rect x={x} y={y} width={w} height={h} rx={rx} {...(extra || {})} />;

const ICONS = {
  "shield-check":  <>{p("M12 3l8 3v6c0 5-3.5 9.3-8 11-4.5-1.7-8-6-8-11V6l8-3z")}{p("M9 12l2 2 4-4")}</>,
  "shield":        <>{p("M12 3l8 3v6c0 5-3.5 9.3-8 11-4.5-1.7-8-6-8-11V6l8-3z")}</>,
  "scan-face":     <>{p("M4 7V5a1 1 0 011-1h2")}{p("M20 7V5a1 1 0 00-1-1h-2")}{p("M4 17v2a1 1 0 001 1h2")}{p("M20 17v2a1 1 0 01-1 1h-2")}{c(9, 10, 0.8, {fill:"currentColor", stroke:"none"})}{c(15, 10, 0.8, {fill:"currentColor", stroke:"none"})}{p("M9 15c1 1.2 2 2 3 2s2-.8 3-2")}</>,
  "lock":          <>{r(4, 11, 16, 10, 2)}{p("M8 11V7a4 4 0 018 0v4")}</>,
  "clock":         <>{c(12, 12, 9)}{p("M12 7v5l3 2")}</>,
  "file-text":     <>{p("M6 3h9l3 3v15H6z")}{p("M9 10h6")}{p("M9 14h6")}{p("M9 18h4")}</>,
  "book":          <>{p("M4 5a2 2 0 012-2h11v17H6a2 2 0 00-2 2")}{p("M17 3v17")}</>,
  "users":         <>{c(9, 9, 3)}{p("M3 20a6 6 0 0112 0")}{p("M17 7a3 3 0 110 6")}{p("M15 20a6 6 0 016-6")}</>,
  "mail":          <>{r(3, 6, 18, 13, 2)}{p("M3 7l9 6 9-6")}</>,
  "alert-triangle":<>{p("M12 3l10 17H2L12 3z")}{p("M12 10v4")}{c(12, 17, 0.8, {fill:"currentColor", stroke:"none"})}</>,
  "check":         <>{p("M5 12l5 5L20 7")}</>,
  "arrow-right":   <>{p("M5 12h14")}{p("M13 5l7 7-7 7")}</>,
  "database":      <>{p("M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z")}{p("M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6")}{p("M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3")}</>,
  "settings":      <>{c(12, 12, 3)}{p("M19 15l2 1-1 2-2-1-1 2-2-1v2h-2v-2l-2 1-1-2-2 1-1-2 2-1-2-1 1-2 2 1 1-2h2v2l2-1 1 2 2-1 1 2-2 1z")}</>,
  "badge-check":   <>{p("M12 3l2 2 3-1 1 3 3 2-2 3 1 3-3 1-1 3-3-1-2 2-2-2-3 1-1-3-3-1 2-3-1-3 3-1 1-3 3 1z")}{p("M9 12l2 2 4-4")}</>,
  "bell":          <>{p("M6 10a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6z")}{p("M10 20a2 2 0 004 0")}</>,
  "flag":          <>{p("M5 3v18")}{p("M5 4h12l-3 4 3 4H5")}</>,
  "search":        <>{c(11, 11, 7)}{p("M21 21l-5-5")}</>,
  "git-branch":    <>{c(6, 6, 2)}{c(6, 18, 2)}{c(18, 8, 2)}{p("M6 8v8")}{p("M18 10c0 4-4 4-6 4h-4")}</>,
};
