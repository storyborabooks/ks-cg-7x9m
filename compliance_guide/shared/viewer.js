// Shared viewer runtime: wraps one or more .cg-sheet elements with a top bar,
// keyboard shortcuts, and a "Print / Save PDF" button. Works without any
// framework — just include this script after your sheets.

(function () {
  // Embedded detection is now done synchronously in <head> via the
  // data-cg-embedded attribute. Skip all viewer chrome in that case.
  if (document.documentElement.hasAttribute('data-cg-embedded')) return;

  const root = document.getElementById('cg-viewer-root') || document.body;

  // Count sheets for display
  const sheets = () => Array.from(document.querySelectorAll('.cg-sheet'));

  // Build the floating bar
  const bar = document.createElement('div');
  bar.className = 'cg-viewer-bar';
  bar.innerHTML = `
    <span class="label" data-role="variant"></span>
    <span class="sep"></span>
    <span class="label"><span data-role="count">0</span> page<span data-role="plural">s</span></span>
    <span class="sep"></span>
    <button data-role="print">Print / Save PDF</button>
  `;
  document.body.appendChild(bar);

  const variant = document.documentElement.getAttribute('data-cg-variant') || 'Compliance Guide';
  bar.querySelector('[data-role="variant"]').textContent = variant;

  const update = () => {
    const n = sheets().length;
    bar.querySelector('[data-role="count"]').textContent = n;
    bar.querySelector('[data-role="plural"]').textContent = n === 1 ? '' : 's';
  };
  update();

  // React via Babel renders asynchronously, so sheets() returns 0 on first
  // call. Watch #root (or body) for mutations and recount after sheets land.
  const target = document.getElementById('root') || document.body;
  const mo = new MutationObserver(() => update());
  mo.observe(target, { childList: true, subtree: true });
  // Stop observing once things settle.
  setTimeout(() => mo.disconnect(), 3000);

  bar.querySelector('[data-role="print"]').addEventListener('click', () => {
    window.print();
  });

  // Cmd/Ctrl+P triggers native print anyway — nothing to do.

  // Expose for embedding
  window.CGViewer = { update };
})();
