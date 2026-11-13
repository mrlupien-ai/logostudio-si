// Pure color science utilities: sRGB, WCAG 2.1 relative luminance & contrast,
// CMYK conversion, and CIEDE2000 Pantone Solid Coated approximation.

export function hexToRgb(hex: string): [number, number, number] {
  const cleaned = (hex || '#000000').replace(/[^0-9a-fA-F]/g, '');
  const full =
    cleaned.length === 3
      ? cleaned
          .split('')
          .map((c) => c + c)
          .join('')
      : cleaned.padEnd(6, '0').slice(0, 6);
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function wcagContrastRatio(hexA: string, hexB: string): number {
  const l1 = relativeLuminance(hexA);
  const l2 = relativeLuminance(hexB);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function rgbToCmyk(
  r: number,
  g: number,
  b: number
): { c: number; m: number; y: number; k: number } {
  const r1 = Math.max(0, Math.min(255, r)) / 255;
  const g1 = Math.max(0, Math.min(255, g)) / 255;
  const b1 = Math.max(0, Math.min(255, b)) / 255;
  const k = 1 - Math.max(r1, g1, b1);
  if (k >= 0.9999) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }
  const c = Math.round(((1 - r1 - k) / (1 - k)) * 100);
  const m = Math.round(((1 - g1 - k) / (1 - k)) * 100);
  const y = Math.round(((1 - b1 - k) / (1 - k)) * 100);
  return {
    c: Math.max(0, Math.min(100, c)),
    m: Math.max(0, Math.min(100, m)),
    y: Math.max(0, Math.min(100, y)),
    k: Math.round(k * 100),
  };
}

export function getWcagContrast(
  fgHex: string,
  bgHex: string
): {
  ratio: number;
  aaNormal: boolean;
  aaLarge: boolean;
  aaaNormal: boolean;
  levelLabel: 'AAA' | 'AA' | 'AA Large' | 'Fail';
} {
  const raw = wcagContrastRatio(fgHex, bgHex);
  const ratio = Math.round(raw * 100) / 100;
  const aaaNormal = raw >= 7.0;
  const aaNormal = raw >= 4.5;
  const aaLarge = raw >= 3.0;
  const levelLabel: 'AAA' | 'AA' | 'AA Large' | 'Fail' = aaaNormal
    ? 'AAA'
    : aaNormal
    ? 'AA'
    : aaLarge
    ? 'AA Large'
    : 'Fail';
  return { ratio, aaNormal, aaLarge, aaaNormal, levelLabel };
}

interface LabColor {
  L: number;
  a: number;
  b: number;
}

function rgbToLab(r: number, g: number, b: number): LabColor {
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const rl = lin(r);
  const gl = lin(g);
  const bl = lin(b);

  // sRGB D65 to XYZ
  const x = (rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375) / 0.95047;
  const y = (rl * 0.2126729 + gl * 0.7151522 + bl * 0.072175) / 1.0;
  const z = (rl * 0.0193339 + gl * 0.119192 + bl * 0.9503041) / 1.08883;

  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(x);
  const fy = f(y);
  const fz = f(z);

  return {
    L: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

function ciede2000(lab1: LabColor, lab2: LabColor): number {
  const { L: L1, a: a1, b: b1 } = lab1;
  const { L: L2, a: a2, b: b2 } = lab2;

  const avgL = (L1 + L2) / 2;
  const C1 = Math.hypot(a1, b1);
  const C2 = Math.hypot(a2, b2);
  const avgC = (C1 + C2) / 2;

  const G = 0.5 * (1 - Math.sqrt(Math.pow(avgC, 7) / (Math.pow(avgC, 7) + Math.pow(25, 7))));
  const a1p = (1 + G) * a1;
  const a2p = (1 + G) * a2;
  const C1p = Math.hypot(a1p, b1);
  const C2p = Math.hypot(a2p, b2);
  const avgCp = (C1p + C2p) / 2;

  const h1p = a1p === 0 && b1 === 0 ? 0 : ((Math.atan2(b1, a1p) * 180) / Math.PI + 360) % 360;
  const h2p = a2p === 0 && b2 === 0 ? 0 : ((Math.atan2(b2, a2p) * 180) / Math.PI + 360) % 360;

  let dhp = 0;
  if (C1p * C2p !== 0) {
    if (Math.abs(h2p - h1p) <= 180) dhp = h2p - h1p;
    else if (h2p - h1p > 180) dhp = h2p - h1p - 360;
    else dhp = h2p - h1p + 360;
  }

  const dLp = L2 - L1;
  const dCp = C2p - C1p;
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(((dhp / 2) * Math.PI) / 180);

  let avgHp = h1p + h2p;
  if (C1p * C2p !== 0) {
    if (Math.abs(h1p - h2p) <= 180) avgHp = (h1p + h2p) / 2;
    else if (h1p + h2p < 360) avgHp = (h1p + h2p + 360) / 2;
    else avgHp = (h1p + h2p - 360) / 2;
  }

  const T =
    1 -
    0.17 * Math.cos(((avgHp - 30) * Math.PI) / 180) +
    0.24 * Math.cos(((2 * avgHp) * Math.PI) / 180) +
    0.32 * Math.cos(((3 * avgHp + 6) * Math.PI) / 180) -
    0.2 * Math.cos(((4 * avgHp - 63) * Math.PI) / 180);

  const dTheta = 30 * Math.exp(-Math.pow((avgHp - 275) / 25, 2));
  const RC = 2 * Math.sqrt(Math.pow(avgCp, 7) / (Math.pow(avgCp, 7) + Math.pow(25, 7)));
  const SL = 1 + (0.015 * Math.pow(avgL - 50, 2)) / Math.sqrt(20 + Math.pow(avgL - 50, 2));
  const SC = 1 + 0.045 * avgCp;
  const SH = 1 + 0.015 * avgCp * T;
  const RT = -Math.sin(((2 * dTheta) * Math.PI) / 180) * RC;

  return Math.sqrt(
    Math.pow(dLp / SL, 2) +
      Math.pow(dCp / SC, 2) +
      Math.pow(dHp / SH, 2) +
      RT * (dCp / SC) * (dHp / SH)
  );
}

interface PantoneSwatch {
  code: string;
  name: string;
  hex: string;
}

const PANTONE_SOLID_COATED_SWATCHES: PantoneSwatch[] = [
  // Deep Navies & Obsidians
  { code: 'PMS 289 C', name: 'Midnight Navy', hex: '#0C2340' },
  { code: 'PMS 296 C', name: 'Deep Abyssal Navy', hex: '#041E42' },
  { code: 'PMS 533 C', name: 'Imperial Indigo Slate', hex: '#1B2A4A' },
  { code: 'PMS 433 C', name: 'Obsidian Slate', hex: '#1D252D' },
  { code: 'PMS Black 6 C', name: 'Carbon Night', hex: '#101820' },
  { code: 'PMS Black C', name: 'Jet Black', hex: '#2D2926' },
  { code: 'PMS 2767 C', name: 'Deep Royal Navy', hex: '#131E29' },
  { code: 'PMS 5463 C', name: 'Nordic Deep Pine', hex: '#072B31' },
  // Blues & Cobalts
  { code: 'PMS 2728 C', name: 'Cobalt Electric Blue', hex: '#0047BB' },
  { code: 'PMS 286 C', name: 'Corporate Royal Blue', hex: '#0033A0' },
  { code: 'PMS 2194 C', name: 'Azure Horizon', hex: '#0072CE' },
  { code: 'PMS 2925 C', name: 'Sky Cerulean', hex: '#009CDE' },
  { code: 'PMS 2995 C', name: 'Vivid Cyan Sky', hex: '#00A9E0' },
  { code: 'PMS 3115 C', name: 'Arctic Aqua', hex: '#00C1D5' },
  // Teals, Emeralds & Greens
  { code: 'PMS 3278 C', name: 'Institutional Emerald', hex: '#009B77' },
  { code: 'PMS 3282 C', name: 'Nordic Teal', hex: '#008578' },
  { code: 'PMS 3395 C', name: 'Vibrant Mint Emerald', hex: '#00C389' },
  { code: 'PMS 3405 C', name: 'Alpine Jade', hex: '#00AB66' },
  { code: 'PMS 348 C', name: 'Forest Green', hex: '#00843D' },
  { code: 'PMS 368 C', name: 'Electric Lime', hex: '#78BE20' },
  { code: 'PMS 3255 C', name: 'Lagoon Turquoise', hex: '#2CD5C4' },
  // Violets, Indigos & Purples
  { code: 'PMS 2685 C', name: 'Deep Royal Violet', hex: '#330072' },
  { code: 'PMS 2736 C', name: 'Electric Indigo', hex: '#4B30E3' },
  { code: 'PMS 266 C', name: 'Neural Amethyst', hex: '#753BBD' },
  { code: 'PMS 2597 C', name: 'Imperial Purple', hex: '#5C068C' },
  { code: 'PMS 2096 C', name: 'Iris Violet', hex: '#685BC7' },
  // Reds, Crimsons & Magentas
  { code: 'PMS 186 C', name: 'Editorial Crimson', hex: '#C8102E' },
  { code: 'PMS 199 C', name: 'Cardinal Red', hex: '#D50032' },
  { code: 'PMS 213 C', name: 'Electric Rose', hex: '#E31C79' },
  { code: 'PMS 219 C', name: 'Neon Magenta', hex: '#DA1884' },
  { code: 'PMS 1788 C', name: 'Coral Vermilion', hex: '#EE2737' },
  { code: 'PMS 2035 C', name: 'Ruby Carmine', hex: '#E11D48' },
  // Oranges, Coppers, Ambers & Golds
  { code: 'PMS 1655 C', name: 'Craft Terracotta', hex: '#FC4C02' },
  { code: 'PMS 158 C', name: 'Tangerine Flame', hex: '#E87722' },
  { code: 'PMS 1375 C', name: 'Warm Marigold Amber', hex: '#FF9E1B' },
  { code: 'PMS 1235 C', name: 'Golden Spark', hex: '#FFB81C' },
  { code: 'PMS 109 C', name: 'Solar Gold', hex: '#FFD100' },
  { code: 'PMS 7522 C', name: 'Brushed Copper', hex: '#B46A55' },
  { code: 'PMS 871 C', name: 'Metallic Antique Gold', hex: '#84754E' },
  { code: 'PMS 4625 C', name: 'Roasted Espresso', hex: '#4F2C1D' },
  // Neutrals, Grays & Whites
  { code: 'PMS Cool Gray 11 C', name: 'Graphite Gray', hex: '#53565A' },
  { code: 'PMS Cool Gray 9 C', name: 'Titanium Slate', hex: '#75787B' },
  { code: 'PMS Cool Gray 6 C', name: 'Silver Mist', hex: '#A7A8AA' },
  { code: 'PMS Cool Gray 2 C', name: 'Platinum Ice', hex: '#D0D0CE' },
  { code: 'PMS 11-0601 TCX', name: 'Bright White', hex: '#F8FAFC' },
];

export function getClosestPantone(hex: string): {
  code: string;
  name: string;
  hex: string;
  deltaE: number;
} {
  const [r, g, b] = hexToRgb(hex);
  const targetLab = rgbToLab(r, g, b);

  let best = PANTONE_SOLID_COATED_SWATCHES[0];
  let bestDelta = Infinity;

  for (const swatch of PANTONE_SOLID_COATED_SWATCHES) {
    const [sr, sg, sb] = hexToRgb(swatch.hex);
    const swatchLab = rgbToLab(sr, sg, sb);
    const dE = ciede2000(targetLab, swatchLab);
    if (dE < bestDelta) {
      bestDelta = dE;
      best = swatch;
    }
  }

  return {
    code: best.code,
    name: best.name,
    hex: best.hex,
    deltaE: Math.round(bestDelta * 10) / 10,
  };
}
