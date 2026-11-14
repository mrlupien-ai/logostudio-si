import { LogoState } from '../types/logo';
import { buildEmblemSvgMarkup, emblemConfigFromState } from './svgBuilder';
import { drawLogoOnCanvas, loadSvgToImage } from './canvasRenderer';
import { ensureFontLoaded } from './fontLoader';

export const UPLOAD_MAIN = { width: 1500, height: 900 } as const;
export const UPLOAD_SQUARE = { width: 1200, height: 1200 } as const;

/**
 * Renders the marketplace upload canvas (1500×900 main or 1200×1200 square) for the current state.
 * Single source for "Export PNG", the Brand Kit offscreen PNGs and "Send to ExitFlip".
 * With `opaque`, a transparent surface is rendered on white (Atom shows logos on white cards).
 */
export async function renderUploadCanvas(
  state: LogoState,
  isSquare: boolean,
  opts: { opaque?: boolean } = {}
): Promise<HTMLCanvasElement> {
  await ensureFontLoaded(state.fontFamily);
  const cfg: LogoState = opts.opaque && state.bgMode === 'transparent' ? { ...state, bgMode: 'white' } : state;
  const surfaceBgHex =
    cfg.bgMode === 'dark' ? '#07090E' : cfg.bgMode === 'brand' ? cfg.primary : '#FFFFFF';
  const emblemSvg = buildEmblemSvgMarkup(
    emblemConfigFromState(cfg, { surfaceBgHex }),
    600
  );
  const img = await loadSvgToImage(emblemSvg);
  const canvas = document.createElement('canvas');
  if (isSquare) drawLogoOnCanvas(canvas, img, cfg, 600, 600, true, false, 2);
  else drawLogoOnCanvas(canvas, img, cfg, 750, 450, false, false, 2);
  const want = isSquare ? UPLOAD_SQUARE : UPLOAD_MAIN;
  if (canvas.width !== want.width || canvas.height !== want.height) {
    throw new Error(`Upload PNG rendered at ${canvas.width}×${canvas.height}, expected ${want.width}×${want.height}`);
  }
  return canvas;
}

export async function renderUploadPng(state: LogoState, isSquare: boolean, opts: { opaque?: boolean } = {}): Promise<string> {
  const canvas = await renderUploadCanvas(state, isSquare, opts);
  return canvas.toDataURL('image/png', 1.0);
}

/** Both Atom uploads as PNG data URLs, always opaque. */
export async function renderUploadPngs(state: LogoState): Promise<{ main: string; square: string }> {
  const main = await renderUploadPng(state, false, { opaque: true });
  const square = await renderUploadPng(state, true, { opaque: true });
  return { main, square };
}
