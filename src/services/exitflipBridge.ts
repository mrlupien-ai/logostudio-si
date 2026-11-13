import { LogoState } from '../types/logo';
import { COLOR_PALETTES } from '../data/domains';
import { renderUploadPngs } from '../utils/uploadPngs';

/**
 * Bridge to the ExitFlip Chrome extension (private seller tool).
 * The extension declares `externally_connectable` for this site's origins, so the page can hand it the
 * current logo directly through Chrome. Nothing is sent to a server. Protocol v1:
 *   { type: 'exitflip.ping' }                       → { ok, app, version }
 *   { type: 'exitflip.logo', version: 1, domain,    → { ok, domain, inPortfolio, mainSize, squareSize } | { ok: false, error }
 *     main: 1500×900 PNG data URL, square: 1200×1200 PNG data URL, concept? }
 */

export const EXTENSION_ID_KEY = 'exitflip.extensionId';
const EXTENSION_ID_RE = /^[a-p]{32}$/;
const NO_ANSWER =
  'ExitFlip did not answer — check that the extension is installed and enabled, then reload this page.';

type SendMessage = (extensionId: string, message: unknown, callback: (response: unknown) => void) => void;

declare global {
  interface Window {
    chrome?: {
      runtime?: {
        sendMessage?: SendMessage;
        lastError?: { message?: string };
      };
    };
  }
}

export type ExitFlipStatus = 'unavailable' | 'no-extension' | 'ready';

export interface ExitFlipReply {
  ok: boolean;
  error?: string;
  version?: string;
  domain?: string;
  inPortfolio?: boolean;
}

export interface ExitFlipLogoMessage {
  type: 'exitflip.logo';
  version: 1;
  domain: string;
  main: string;
  square: string;
  concept: { label: string; font: string; palette: string; colors: string[] };
}

export function isValidExtensionId(id: unknown): id is string {
  return typeof id === 'string' && EXTENSION_ID_RE.test(id);
}

export function getExtensionId(): string | null {
  try {
    const id = window.localStorage.getItem(EXTENSION_ID_KEY);
    return isValidExtensionId(id) ? id : null;
  } catch {
    return null;
  }
}

export function saveExtensionId(id: string): boolean {
  if (!isValidExtensionId(id)) return false;
  try {
    window.localStorage.setItem(EXTENSION_ID_KEY, id);
    return true;
  } catch {
    return false;
  }
}

export function bridgeSupported(): boolean {
  return typeof window !== 'undefined' && typeof window.chrome?.runtime?.sendMessage === 'function';
}

function callExtension(message: unknown, timeoutMs: number): Promise<ExitFlipReply> {
  const id = getExtensionId();
  const send = window.chrome?.runtime?.sendMessage;
  if (!id || typeof send !== 'function') return Promise.resolve({ ok: false, error: NO_ANSWER });
  return new Promise((resolve) => {
    let settled = false;
    const finish = (r: ExitFlipReply) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(r);
    };
    const timer = setTimeout(() => finish({ ok: false, error: NO_ANSWER }), timeoutMs);
    try {
      send.call(window.chrome!.runtime, id, message, (response: unknown) => {
        const lastError = window.chrome?.runtime?.lastError;
        if (lastError) return finish({ ok: false, error: NO_ANSWER });
        if (!response || typeof response !== 'object') return finish({ ok: false, error: NO_ANSWER });
        finish(response as ExitFlipReply);
      });
    } catch {
      finish({ ok: false, error: NO_ANSWER });
    }
  });
}

export function pingExitFlip(timeoutMs = 2500): Promise<ExitFlipReply> {
  return callExtension({ type: 'exitflip.ping' }, timeoutMs);
}

export function buildLogoMessage(state: LogoState, main: string, square: string): ExitFlipLogoMessage {
  const palette = COLOR_PALETTES.find(
    (p) => p.primary.toLowerCase() === state.primary.toLowerCase() && p.secondary.toLowerCase() === state.secondary.toLowerCase()
  );
  const lead = state.variants10[state.activeVariantIndex];
  return {
    type: 'exitflip.logo',
    version: 1,
    domain: state.domain.trim().toLowerCase(),
    main,
    square,
    concept: {
      label: `#${lead ? lead.id : state.activeVariantIndex + 1} · ${state.activeIcon}`,
      font: state.fontFamily,
      palette: palette ? palette.name : 'Custom',
      colors: [state.primary, state.secondary, state.accent],
    },
  };
}

export async function sendLogoToExitFlip(state: LogoState, timeoutMs = 8000): Promise<ExitFlipReply> {
  let pngs: { main: string; square: string };
  try {
    pngs = await renderUploadPngs(state);
  } catch (e) {
    return { ok: false, error: `Could not render the logo PNGs: ${e instanceof Error ? e.message : String(e)}` };
  }
  return callExtension(buildLogoMessage(state, pngs.main, pngs.square), timeoutMs);
}
