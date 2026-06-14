// Shared bootstrap helpers used by both the main window (index.ts) and
// child windows (child.ts).

export function resetBodyStyles(): void {
  if (typeof document === 'undefined') return;
  const ds = document.documentElement.style;
  ds.margin = '0';
  ds.padding = '0';
  ds.width = '100%';
  ds.height = '100%';
  ds.background = 'transparent';
  ds.overflow = 'hidden';
  const bs = document.body.style;
  bs.margin = '0';
  bs.padding = '0';
  bs.width = '100%';
  bs.height = '100%';
  bs.background = 'transparent';
  bs.overflow = 'hidden';
}

export function showErrorOnPage(msg: string): void {
  if (typeof document === 'undefined') return;
  const pre = document.createElement('pre');
  pre.style.position = 'fixed';
  pre.style.left = '8px';
  pre.style.top = '8px';
  pre.style.right = '8px';
  pre.style.color = '#ff8080';
  pre.style.background = 'rgba(0,0,0,0.85)';
  pre.style.padding = '8px';
  pre.style.font = '12px/1.4 monospace';
  pre.style.whiteSpace = 'pre-wrap';
  pre.style.wordBreak = 'break-word';
  pre.style.zIndex = '999999';
  pre.textContent = msg;
  document.body.appendChild(pre);
}

export async function waitForFonts(): Promise<void> {
  if (typeof document === 'undefined') return;
  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
  if (!fonts) return;
  try { await fonts.ready; } catch { /* fall back to default fonts */ }
}
