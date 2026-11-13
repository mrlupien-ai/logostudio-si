import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  buildLogoMessage,
  getExtensionId,
  isValidExtensionId,
  pingExitFlip,
  saveExtensionId,
  EXTENSION_ID_KEY,
} from './exitflipBridge';
import { LogoState } from '../types/logo';

const EXT = 'abcdefghijklmnopabcdefghijklmnop';
const PNG = 'data:image/png;base64,iVBORw0KGgo=';

function fakeWindow(sendMessage?: (...a: unknown[]) => void, lastError?: { message?: string }) {
  const store = new Map<string, string>();
  const w = {
    localStorage: {
      getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    },
    chrome: sendMessage ? { runtime: { sendMessage, lastError } } : undefined,
  };
  (globalThis as unknown as { window: unknown }).window = w;
  return w;
}

const state = {
  domain: ' AllFancyFont.com ',
  primary: '#0B132B',
  secondary: '#00A878',
  accent: '#F59E0B',
  fontFamily: 'Outfit',
  activeIcon: 'ChartSpline',
  activeVariantIndex: 0,
  variants10: [{ id: 1 }],
} as unknown as LogoState;

describe('exitflipBridge', () => {
  beforeEach(() => fakeWindow());
  afterEach(() => {
    vi.useRealTimers();
    delete (globalThis as unknown as { window?: unknown }).window;
  });

  it('accepts only 32-character a–p extension ids', () => {
    expect(isValidExtensionId(EXT)).toBe(true);
    expect(isValidExtensionId('abc')).toBe(false);
    expect(isValidExtensionId('ABCDEFGHIJKLMNOPABCDEFGHIJKLMNOP')).toBe(false);
    expect(isValidExtensionId('qbcdefghijklmnopabcdefghijklmnop')).toBe(false);
    expect(saveExtensionId('nope')).toBe(false);
    expect(getExtensionId()).toBe(null);
    expect(saveExtensionId(EXT)).toBe(true);
    expect(getExtensionId()).toBe(EXT);
  });

  it('ignores a tampered stored id', () => {
    const w = fakeWindow();
    w.localStorage.setItem(EXTENSION_ID_KEY, 'javascript:alert(1)');
    expect(getExtensionId()).toBe(null);
  });

  it('builds the protocol v1 logo message', () => {
    const m = buildLogoMessage(state, PNG, PNG);
    expect(m.type).toBe('exitflip.logo');
    expect(m.version).toBe(1);
    expect(m.domain).toBe('allfancyfont.com');
    expect(m.main.startsWith('data:image/png;base64,')).toBe(true);
    expect(m.square.startsWith('data:image/png;base64,')).toBe(true);
    expect(m.concept.colors).toEqual(['#0B132B', '#00A878', '#F59E0B']);
    expect(m.concept.palette).toBe('Institutional Emerald');
    expect(m.concept.label).toBe('#1 · ChartSpline');
    expect(m.concept.font).toBe('Outfit');
  });

  it('returns the "did not answer" error when the extension never calls back', async () => {
    vi.useFakeTimers();
    fakeWindow(() => {});
    saveExtensionId(EXT);
    const p = pingExitFlip(2500);
    vi.advanceTimersByTime(2600);
    const r = await p;
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/did not answer/);
  });

  it('returns the "did not answer" error when Chrome reports lastError', async () => {
    fakeWindow((_id: unknown, _msg: unknown, cb: unknown) => (cb as (r: unknown) => void)(undefined), { message: 'Could not establish connection.' });
    saveExtensionId(EXT);
    const r = await pingExitFlip();
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/did not answer/);
  });

  it('passes the extension reply through', async () => {
    const seen: unknown[] = [];
    fakeWindow((id: unknown, msg: unknown, cb: unknown) => {
      seen.push(id, msg);
      (cb as (r: unknown) => void)({ ok: true, app: 'ExitFlip', version: '1.11.0' });
    });
    saveExtensionId(EXT);
    const r = await pingExitFlip();
    expect(r).toEqual({ ok: true, app: 'ExitFlip', version: '1.11.0' });
    expect(seen).toEqual([EXT, { type: 'exitflip.ping' }]);
  });
});
