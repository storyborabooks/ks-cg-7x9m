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
  "key":           <>{p("M21 2l-2 2m-7.6 7.6a5.5 5.5 0 11-7.8 7.8 5.5 5.5 0 017.8-7.8zm0 0L15 7l3 3m2-2l2-2")}</>,
  "clipboard-check":<>{r(8, 2, 8, 4, 1)}{p("M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2")}{p("M9 14l2 2 4-4")}</>,
  "clipboard-list":<>{r(8, 2, 8, 4, 1)}{p("M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2")}{p("M12 11h4")}{p("M12 16h4")}{c(8, 11.5, 0.5, {fill:"currentColor", stroke:"none"})}{c(8, 16.5, 0.5, {fill:"currentColor", stroke:"none"})}</>,
  "file-shield":   <>{p("M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z")}{p("M14 2v6h6")}{p("M12 13l3 1.5v3c0 1.5-1.2 3-3 3.5-1.8-.5-3-2-3-3.5v-3l3-1.5z")}</>,
  "calendar":      <>{r(3, 4, 18, 18, 2)}{p("M16 2v4")}{p("M8 2v4")}{p("M3 10h18")}</>,
  "timer":         <>{c(12, 14, 8)}{p("M12 10v4")}{p("M10 2h4")}</>,
  "user-check":    <>{p("M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2")}{c(9, 7, 4)}{p("M16 11l2 2 4-4")}</>,
  "user-x":        <>{p("M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2")}{c(9, 7, 4)}{p("M17 8l5 5")}{p("M22 8l-5 5")}</>,
  "id-card":       <>{r(2, 5, 20, 14, 2)}{c(8, 12, 2)}{p("M14 10h4")}{p("M14 14h2")}{p("M5 16c0-1.7 1.3-3 3-3s3 1.3 3 3")}</>,
  "eye":           <>{p("M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z")}{c(12, 12, 3)}</>,
  "eye-off":       <>{p("M17.9 17.9C16.2 19.2 14.2 20 12 20c-7 0-11-8-11-8a18.5 18.5 0 015.1-5.9")}{p("M9.9 4.2A9.1 9.1 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.2 3.1")}{p("M1 1l22 22")}</>,
  "alert-circle":  <>{c(12, 12, 10)}{p("M12 8v4")}{c(12, 16, 0.8, {fill:"currentColor", stroke:"none"})}</>,
  "x":             <>{p("M18 6L6 18")}{p("M6 6l12 12")}</>,
  "info":          <>{c(12, 12, 10)}{p("M12 16v-4")}{c(12, 8, 0.8, {fill:"currentColor", stroke:"none"})}</>,
  "sliders":       <>{p("M4 21v-7")}{p("M4 10V3")}{p("M12 21v-9")}{p("M12 8V3")}{p("M20 21v-5")}{p("M20 12V3")}{p("M1 14h6")}{p("M9 8h6")}{p("M17 16h6")}</>,
  "toggle-right":  <>{r(1, 5, 22, 14, 7)}{c(16, 12, 3)}</>,
  "trash":         <>{p("M3 6h18")}{p("M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6")}{p("M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2")}</>,
  "archive":       <>{p("M21 8v13H3V8")}{p("M1 3h22v5H1z")}{p("M10 12h4")}</>,
  "globe":         <>{c(12, 12, 10)}{p("M2 12h20")}{p("M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z")}</>,
  "map-pin":       <>{p("M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z")}{c(12, 10, 3)}</>,
  "book-open":     <>{p("M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z")}{p("M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z")}</>,
  "filter":        <>{p("M22 3H2l8 9.5V20l4 2v-9.5L22 3z")}</>,
  "check-circle":  <>{c(12, 12, 10)}{p("M9 12l2 2 4-4")}</>,
  "x-circle":      <>{c(12, 12, 10)}{p("M15 9l-6 6")}{p("M9 9l6 6")}</>,
  "circle":        <>{c(12, 12, 10)}</>,
};
