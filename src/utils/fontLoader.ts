const LOADED_FONTS = new Set<string>();
const EMBEDDED_FONT_CSS_CACHE = new Map<string, string>();

export const GOOGLE_FONT_URLS: Record<string, string> = {
  'Plus Jakarta Sans': 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap',
  'Outfit': 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap',
  'Space Grotesk': 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap',
  'Sora': 'https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap',
  'DM Sans': 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap',
  'Montserrat': 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap',
  'Syne': 'https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap',
  'Inter': 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
  'Oswald': 'https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&display=swap',
  'Playfair Display': 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,600&display=swap',
  'JetBrains Mono': 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&display=swap',
};

export async function ensureFontLoaded(fontFamily: string): Promise<void> {
  if (typeof document === 'undefined') return;

  if (!LOADED_FONTS.has(fontFamily)) {
    const url = GOOGLE_FONT_URLS[fontFamily];
    if (url && !document.querySelector(`link[href="${url}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      document.head.appendChild(link);
    }
    LOADED_FONTS.add(fontFamily);
  }

  try {
    await Promise.all([
      document.fonts.load(`400 48px "${fontFamily}"`),
      document.fonts.load(`700 48px "${fontFamily}"`),
      document.fonts.load(`800 48px "${fontFamily}"`),
    ]);
  } catch {
    // Ignore fallback errors
  }
}

export const ensureFontsLoaded = ensureFontLoaded;

export async function preloadAllBrandFonts(): Promise<void> {
  await Promise.all(Object.keys(GOOGLE_FONT_URLS).map(ensureFontLoaded));
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return typeof btoa === 'function' ? btoa(binary) : '';
}

/**
 * Fetches a subsetted Google Font stylesheet for the given characters, downloads each referenced
 * woff2 binary, and inline-encodes it as a base64 `data:font/woff2;base64,...` `@font-face` rule
 * so exported SVGs render with the exact brand font even on machines without the font installed
 * or inside sandboxed `<img src="data:image/svg+xml...">` tags.
 * Falls back to `@import url(...)` if network fetch fails.
 */
export async function fetchEmbeddedFontCss(
  fontFamily: string,
  weights: string[],
  textSample: string
): Promise<string> {
  const fallbackImportUrl =
    GOOGLE_FONT_URLS[fontFamily] || GOOGLE_FONT_URLS['Plus Jakarta Sans'];
  const fallbackCss = `@import url('${fallbackImportUrl}');`;

  if (typeof fetch === 'undefined') {
    return fallbackCss;
  }

  const uniqueChars = Array.from(new Set((textSample || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.').split('')))
    .filter((c) => c.trim().length > 0)
    .sort()
    .join('');

  const cleanWeights = Array.from(new Set(weights.map((w) => String(w).replace(/[^0-9]/g, '') || '700'))).sort();
  const cacheKey = `${fontFamily}|${cleanWeights.join(',')}|${uniqueChars}`;

  const cached = EMBEDDED_FONT_CSS_CACHE.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const familyParam = encodeURIComponent(fontFamily).replace(/%20/g, '+');
    const weightParam = cleanWeights.join(';');
    const cssUrl = `https://fonts.googleapis.com/css2?family=${familyParam}:wght@${weightParam}&text=${encodeURIComponent(
      uniqueChars
    )}&display=swap`;

    const cssRes = await fetch(cssUrl);
    if (!cssRes.ok) {
      return fallbackCss;
    }

    let cssText = await cssRes.text();
    const urlMatches = Array.from(cssText.matchAll(/url\((['"]?)(https:\/\/fonts\.gstatic\.com\/[^)'"]+)\1\)/g));

    if (urlMatches.length === 0) {
      return fallbackCss;
    }

    for (const match of urlMatches) {
      const fullMatch = match[0];
      const fontFileUrl = match[2];
      const fontRes = await fetch(fontFileUrl);
      if (fontRes.ok) {
        const buf = await fontRes.arrayBuffer();
        const b64 = arrayBufferToBase64(buf);
        if (b64) {
          cssText = cssText.replace(fullMatch, `url('data:font/woff2;base64,${b64}')`);
        }
      }
    }

    EMBEDDED_FONT_CSS_CACHE.set(cacheKey, cssText);
    return cssText;
  } catch {
    return fallbackCss;
  }
}
