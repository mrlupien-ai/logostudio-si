import { ConstructionFamily, ConstructionSpec, EmblemContainerStyle } from '../types/logo';
import { hexToRgb, relativeLuminance, wcagContrastRatio } from './color';

export { hexToRgb, relativeLuminance, wcagContrastRatio };

export const ALL_CONSTRUCTION_FAMILIES: readonly ConstructionFamily[] = [
  'cornerCut',
  'splitPanel',
  'isoSolid',
  'gridBlocks',
  'offsetShadow',
  'orbitRing',
  'slashBand',
  'crest',
  'overlapPair',
  'bareMark',
  'arch',
  'notchTab',
  'stackedBars',
  'quarterArcs',
  'diamondFacet',
  'pillSplit',
  'bracketFrame',
  'foldedCorner',
  'halfTone',
  'petalRing',
  'stepStair',
  'ribbonFold',
  'windowQuad',
  'tiltCard',
  'hexBadge',
  'octaGem',
  'teardropPin',
  'chevronWing',
  'parallelogramSlant',
  'crossPlus',
  'keystoneTrap',
  'starBurst',
  'capsuleWave',
  'crownPeak',
  'ticketStub',
  'prismTriangle',
] as const;

export const FAMILY_HUMAN_NAMES: Record<ConstructionFamily, string> = {
  cornerCut: 'Corner Cutout',
  splitPanel: 'Split Monogram',
  isoSolid: 'Isometric Cube',
  gridBlocks: 'Bauhaus Cluster',
  offsetShadow: 'Offset Brutalist',
  orbitRing: 'Orbital Compass',
  slashBand: 'Diagonal Blade',
  crest: 'Heraldic Shield',
  overlapPair: 'Dual Lens Portal',
  bareMark: 'Frameless Spark',
  arch: 'Cathedral Arch',
  notchTab: 'Notch Tab Folder',
  stackedBars: 'Staggered Bars',
  quarterArcs: 'Quatrefoil Clover',
  diamondFacet: 'Rhombus Diamond',
  pillSplit: 'Stadium Capsule',
  bracketFrame: 'Open Clamp Frame',
  foldedCorner: 'Origami Sheet',
  halfTone: 'Matrix Wing',
  petalRing: 'Scalloped Rosette',
  stepStair: 'Ascending Steps',
  ribbonFold: 'Swallowtail Ribbon',
  windowQuad: 'Crosshair Quad',
  tiltCard: 'Tilted Kinetic',
  hexBadge: 'Wide Hexagon',
  octaGem: 'Emerald Octagon',
  teardropPin: 'Organic Leaf Pin',
  chevronWing: 'Delta Chevron',
  parallelogramSlant: 'Italic Monolith',
  crossPlus: 'Swiss Cross Plus',
  keystoneTrap: 'Keystone Trapezoid',
  starBurst: 'Octagram Star',
  capsuleWave: 'Twin Wave Pills',
  crownPeak: 'Alpine Crown',
  ticketStub: 'Notched Ticket',
  prismTriangle: 'Delta Prism',
};

// Silhouette buckets ensure that any 10 constructions generated for a domain
// feature diverse non-square, non-circle outer contours (polygons, wings, shields, capsules, open marks)
const SILHOUETTE_BUCKETS: readonly (readonly ConstructionFamily[])[] = [
  // 1. Polygonal & Faceted (Hexagons, Diamonds, Triangles, Keystones, Octagons, Crowns)
  ['isoSolid', 'diamondFacet', 'hexBadge', 'octaGem', 'keystoneTrap', 'prismTriangle', 'crownPeak'],
  // 2. Directional, Wings & Slanted (Chevrons, Parallelograms, Stairs, Ribbons, Blades)
  ['chevronWing', 'parallelogramSlant', 'stepStair', 'ribbonFold', 'slashBand'],
  // 3. Shields, Arches & Organic Curves (Crests, Arches, Teardrop Leaves, Quatrefoil, Rosettes, Portals)
  ['crest', 'arch', 'teardropPin', 'quarterArcs', 'petalRing', 'overlapPair'],
  // 4. Elongated Capsules, Tickets & Staggered Bars (Pills, Tickets, Wave Capsules, Stacked Bars, Folders)
  ['pillSplit', 'ticketStub', 'stackedBars', 'capsuleWave', 'notchTab'],
  // 5. Open Frameless, Crosses, Stars & Orbital Rings (Bare Marks, Brackets, Swiss Cross, Octagram, Orbit)
  ['bareMark', 'bracketFrame', 'crossPlus', 'starBurst', 'orbitRing'],
  // 6. Architectural Cards (at most 1-2 per 10-concept board)
  ['cornerCut', 'splitPanel', 'gridBlocks', 'offsetShadow', 'foldedCorner', 'halfTone', 'windowQuad', 'tiltCard'],
];

export function familyToLegacyContainerStyle(family: ConstructionFamily): EmblemContainerStyle {
  switch (family) {
    case 'cornerCut':
    case 'notchTab':
    case 'foldedCorner':
    case 'ticketStub':
      return 'cutoutCorner';
    case 'splitPanel':
    case 'pillSplit':
      return 'monogramSeal';
    case 'isoSolid':
    case 'diamondFacet':
    case 'hexBadge':
    case 'octaGem':
    case 'prismTriangle':
      return 'isoHexCube';
    case 'gridBlocks':
    case 'windowQuad':
    case 'halfTone':
    case 'crossPlus':
      return 'bauhausGrid';
    case 'offsetShadow':
    case 'tiltCard':
    case 'bracketFrame':
    case 'parallelogramSlant':
      return 'offsetNeo';
    case 'orbitRing':
    case 'petalRing':
    case 'quarterArcs':
    case 'starBurst':
      return 'swissSeal';
    case 'slashBand':
    case 'ribbonFold':
    case 'stackedBars':
    case 'stepStair':
    case 'chevronWing':
    case 'capsuleWave':
      return 'slashCapsule';
    case 'crest':
    case 'arch':
    case 'keystoneTrap':
    case 'crownPeak':
    case 'teardropPin':
      return 'shieldCrest';
    case 'overlapPair':
      return 'vennPortal';
    case 'bareMark':
    default:
      return 'minimalistSpark';
  }
}

/**
 * Deterministic 32-bit FNV-1a + avalanche hash for domain strings
 */
export function hashDomain(domain: string): number {
  const normalized = (domain || 'logo').trim().toLowerCase();
  let h = 2166136261 >>> 0;
  for (let i = 0; i < normalized.length; i++) {
    h ^= normalized.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b) >>> 0;
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35) >>> 0;
  h ^= h >>> 16;
  return (h >>> 0) || 1;
}

/**
 * Mulberry32 deterministic PRNG returning floats in [0, 1)
 */
export function createPrng(seed: number): () => number {
  let a = (seed >>> 0) || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function randFloat(rng: () => number, min: number, max: number, decimals = 2): number {
  const val = min + rng() * (max - min);
  const f = Math.pow(10, decimals);
  return Math.round(val * f) / f;
}

function pickOne<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

/**
 * WCAG 2.1 relative luminance and contrast ratio calculation imported from ./color
 */

export function ensureIconContrast(preferredIconHex: string, bgHex: string, c1: string): string {
  if (wcagContrastRatio(preferredIconHex, bgHex) >= 3.0) {
    return preferredIconHex;
  }
  const candidates = ['#FFFFFF', c1, '#0B132B'];
  let best = '#FFFFFF';
  let bestRatio = 0;
  for (const cand of candidates) {
    const ratio = wcagContrastRatio(cand, bgHex);
    if (ratio > bestRatio) {
      bestRatio = ratio;
      best = cand;
    }
  }
  return best;
}

export interface Box2D {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ComputedConstructionLayout {
  mainBox: Box2D;
  iconBox: { x: number; y: number; size: number };
  accentBox: Box2D;
  bgBehindIcon: 'c1' | 'c2' | 'white';
  preferredIconTone: 'white' | 'c1';
}

export function boxesOverlap(a: Box2D, b: Box2D, margin = 0): boolean {
  return !(
    a.x + a.w + margin <= b.x ||
    b.x + b.w + margin <= a.x ||
    a.y + a.h + margin <= b.y ||
    b.y + b.h + margin <= a.y
  );
}

const ACCENT_SHAPES = ['dot', 'ring', 'pill', 'diamond', 'bar'] as const;
const FILL_MODES = ['solid', 'duotone', 'outline', 'ghost'] as const;
const ICON_ANCHORS = ['center', 'offsetTL', 'offsetBR', 'lower', 'upper'] as const;
const CARDINAL_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315] as const;

function buildStyleAdjective(params: Record<string, number | string | boolean>): string {
  const r = Number(params.radius || 32);
  const fillMode = String(params.fillMode || 'solid');
  const corner = Number(params.corner || 0);
  const cornerNames = ['NW', 'NE', 'SE', 'SW'];

  if (fillMode === 'outline') return `Line · ${cornerNames[corner % 4]}`;
  if (fillMode === 'duotone') return `Duotone · R${r}`;
  if (r >= 42) return `Soft · R${r}`;
  if (r <= 24) return `Sharp · R${r}`;
  return `Facet · ${cornerNames[corner % 4]}`;
}

export function instantiateFamily(
  family: ConstructionFamily,
  seed: number,
  attempt = 0
): ConstructionSpec {
  const effectiveSeed = (seed + Math.imul(attempt + 1, 0x9e3779b1)) >>> 0 || 1;
  const rng = createPrng(effectiveSeed);

  const radius = randInt(rng, 18, 50);
  const corner = randInt(rng, 0, 3);
  const angle =
    family === 'orbitRing' || family === 'petalRing' || family === 'quarterArcs' || family === 'starBurst'
      ? pickOne(rng, CARDINAL_ANGLES)
      : family === 'tiltCard'
      ? randInt(rng, -8, 8) || 5
      : randInt(rng, -22, 22);
  const split = randFloat(rng, 0.34, 0.66, 2);
  const weight = randInt(rng, 5, 15);
  const accentShape = pickOne(rng, ACCENT_SHAPES);
  const accentPos = randInt(rng, 0, 7);
  const fillMode = pickOne(rng, FILL_MODES);
  const iconScale = randFloat(rng, 0.82, 1.06, 2);
  const iconAnchor = pickOne(rng, ICON_ANCHORS);

  const params: Record<string, number | string | boolean> = {
    radius,
    corner,
    angle,
    split,
    weight,
    accentShape,
    accentPos,
    fillMode,
    iconScale,
    iconAnchor,
  };

  const adj = buildStyleAdjective(params);
  const id = `${family}-${effectiveSeed.toString(36)}`;
  const label = `${FAMILY_HUMAN_NAMES[family]} · ${adj}`;

  return {
    id,
    family,
    label,
    params,
    seed: effectiveSeed,
  };
}

/**
 * Computes deterministic, validated geometry for a construction spec so that:
 * 1. Everything stays inside [0, 200] x [0, 200]
 * 2. Icon size is in [84, 124] (42% to 62% of 200x200)
 * 3. Icon box lies fully inside mainBox with >= 10% padding from mainBox edges
 * 4. Accent box never overlaps the icon box
 */
export function computeConstructionGeometry(spec: ConstructionSpec): ComputedConstructionLayout {
  const p = spec.params;
  const iconScale = Math.max(0.78, Math.min(1.08, Number(p.iconScale ?? 0.92)));
  const anchor = String(p.iconAnchor ?? 'center');
  const corner = Math.abs(Number(p.corner ?? 0)) % 4;
  const accentPos = Math.abs(Number(p.accentPos ?? 0)) % 8;
  const fillMode = String(p.fillMode ?? 'solid');

  // Distinct main bounding boxes tailored to each silhouette family (wide, tall, hexagonal, etc.)
  let mainBox: Box2D = { x: 18, y: 18, w: 164, h: 164 };

  switch (spec.family) {
    case 'pillSplit':
    case 'ticketStub':
    case 'ribbonFold':
    case 'stackedBars':
      // Distinctly wide horizontal stadium / ticket / ribbon proportions
      mainBox = { x: 12, y: 34, w: 176, h: 132 };
      break;
    case 'arch':
    case 'crest':
    case 'teardropPin':
      // Distinctly tall vertical shield / cathedral arch proportions
      mainBox = { x: 26, y: 14, w: 148, h: 172 };
      break;
    case 'hexBadge':
    case 'octaGem':
    case 'keystoneTrap':
    case 'crownPeak':
    case 'parallelogramSlant':
      // Wide geometric polygon proportions
      mainBox = { x: 14, y: 24, w: 172, h: 152 };
      break;
    case 'diamondFacet':
    case 'isoSolid':
    case 'starBurst':
    case 'crossPlus':
    case 'petalRing':
    case 'quarterArcs':
    case 'chevronWing':
    case 'prismTriangle':
      mainBox = { x: 14, y: 14, w: 172, h: 172 };
      break;
    case 'bareMark':
    case 'bracketFrame':
      mainBox = { x: 14, y: 14, w: 172, h: 172 };
      break;
    case 'offsetShadow':
    case 'tiltCard':
      mainBox = { x: 20, y: 20, w: 152, h: 152 };
      break;
    default:
      mainBox = { x: 18, y: 18, w: 164, h: 164 };
      break;
  }

  // Target icon size in [84, 124], constrained by 76% of min(mainBox.w, mainBox.h) so >= 10% padding on each side is guaranteed
  const maxAllowedByMain = Math.floor(Math.min(mainBox.w, mainBox.h) * 0.76);
  const rawSize = Math.round(96 * iconScale);
  const baseSize =
    spec.family === 'bareMark' || spec.family === 'bracketFrame'
      ? Math.round(112 * iconScale)
      : rawSize;
  const iconSize = Math.max(84, Math.min(124, Math.min(maxAllowedByMain, baseSize)));

  // Safe inner bounds for iconBox (at least 10.5% padding inside mainBox)
  const padX = Math.ceil(mainBox.w * 0.105);
  const padY = Math.ceil(mainBox.h * 0.105);
  const minX = mainBox.x + padX;
  const maxX = mainBox.x + mainBox.w - padX - iconSize;
  const minY = mainBox.y + padY;
  const maxY = mainBox.y + mainBox.h - padY - iconSize;

  let ix = Math.round(mainBox.x + (mainBox.w - iconSize) / 2);
  let iy = Math.round(mainBox.y + (mainBox.h - iconSize) / 2);

  // Keep centered for radially symmetric / polygonal marks so the icon sits right in the optical heart
  const symmetricFamilies = new Set<ConstructionFamily>([
    'diamondFacet',
    'isoSolid',
    'hexBadge',
    'octaGem',
    'starBurst',
    'crossPlus',
    'petalRing',
    'quarterArcs',
    'orbitRing',
    'chevronWing',
    'prismTriangle',
    'keystoneTrap',
    'crownPeak',
    'teardropPin',
  ]);

  if (!symmetricFamilies.has(spec.family)) {
    if (anchor === 'offsetTL') {
      ix = minX + Math.round((maxX - minX) * 0.25);
      iy = minY + Math.round((maxY - minY) * 0.25);
    } else if (anchor === 'offsetBR') {
      ix = minX + Math.round((maxX - minX) * 0.75);
      iy = minY + Math.round((maxY - minY) * 0.75);
    } else if (anchor === 'lower') {
      iy = minY + Math.round((maxY - minY) * 0.78);
    } else if (anchor === 'upper') {
      iy = minY + Math.round((maxY - minY) * 0.22);
    }
  }

  if (spec.family === 'cornerCut') {
    const pushLeft = corner === 1 || corner === 2;
    const pushUp = corner === 2 || corner === 3;
    ix = pushLeft ? minX + 2 : Math.max(minX, maxX - 2);
    iy = pushUp ? minY + 2 : Math.max(minY, maxY - 2);
  } else if (spec.family === 'splitPanel' || spec.family === 'pillSplit') {
    ix = Math.max(minX, maxX - 4);
  } else if (spec.family === 'prismTriangle' || spec.family === 'crownPeak') {
    iy = Math.min(maxY, iy + 6);
  }

  ix = Math.max(minX, Math.min(maxX, ix));
  iy = Math.max(minY, Math.min(maxY, iy));

  const iconRect: Box2D = { x: ix, y: iy, w: iconSize, h: iconSize };

  // Place accent in one of 8 slots cleanly inset inside mainBox or in outer corner clearance
  // so it NEVER straddles the container border stroke or overlaps iconRect
  const accentSize = 14;
  const inLeft = mainBox.x + 10;
  const inRight = mainBox.x + mainBox.w - 10 - accentSize;
  const inTop = mainBox.y + 10;
  const inBottom = mainBox.y + mainBox.h - 10 - accentSize;
  const candidateAccentBoxes: Box2D[] = [
    { x: inRight, y: inTop, w: accentSize, h: accentSize },    // 0: Inset NE
    { x: inLeft, y: inTop, w: accentSize, h: accentSize },     // 1: Inset NW
    { x: inRight, y: inBottom, w: accentSize, h: accentSize }, // 2: Inset SE
    { x: inLeft, y: inBottom, w: accentSize, h: accentSize },  // 3: Inset SW
    { x: 180, y: 6, w: accentSize, h: accentSize },            // 4: Outer NE clearance
    { x: 6, y: 6, w: accentSize, h: accentSize },              // 5: Outer NW clearance
    { x: 180, y: 180, w: accentSize, h: accentSize },          // 6: Outer SE clearance
    { x: 6, y: 180, w: accentSize, h: accentSize },            // 7: Outer SW clearance
  ];

  let chosenAccent = candidateAccentBoxes[accentPos % candidateAccentBoxes.length];
  if (boxesOverlap(chosenAccent, iconRect, 3)) {
    for (let i = 0; i < candidateAccentBoxes.length; i++) {
      const cand = candidateAccentBoxes[(accentPos + i) % candidateAccentBoxes.length];
      if (!boxesOverlap(cand, iconRect, 3)) {
        chosenAccent = cand;
        break;
      }
    }
  }
  if (boxesOverlap(chosenAccent, iconRect, 1)) {
    chosenAccent = { x: 6, y: 6, w: 12, h: 12 };
  }

  const isLightPlate =
    spec.family === 'bareMark' ||
    spec.family === 'bracketFrame' ||
    fillMode === 'outline' ||
    fillMode === 'ghost';

  return {
    mainBox,
    iconBox: { x: ix, y: iy, size: iconSize },
    accentBox: chosenAccent,
    bgBehindIcon: isLightPlate ? 'white' : 'c1',
    preferredIconTone: isLightPlate ? 'c1' : 'white',
  };
}

export interface GeometryCheckResult {
  valid: boolean;
  reasons: string[];
  iconSize: number;
  contrastRatio: number;
}

export function validateConstructionSpec(
  spec: ConstructionSpec,
  palette = { c1: '#0B132B', c2: '#00A878', c3: '#F59E0B' }
): GeometryCheckResult {
  const geom = computeConstructionGeometry(spec);
  const reasons: string[] = [];

  // Check 1: Icon box lies fully inside mainBox with at least 10% padding
  const padX = geom.mainBox.w * 0.1;
  const padY = geom.mainBox.h * 0.1;
  if (
    geom.iconBox.x < geom.mainBox.x + padX - 0.5 ||
    geom.iconBox.y < geom.mainBox.y + padY - 0.5 ||
    geom.iconBox.x + geom.iconBox.size > geom.mainBox.x + geom.mainBox.w - padX + 0.5 ||
    geom.iconBox.y + geom.iconBox.size > geom.mainBox.y + geom.mainBox.h - padY + 0.5
  ) {
    reasons.push('Icon box violates 10% inner padding of main shape');
  }

  // Check 2: Icon covers 42% to 62% of the 200x200 box (84 to 124 px)
  if (geom.iconBox.size < 84 || geom.iconBox.size > 124) {
    reasons.push(`Icon size ${geom.iconBox.size}px outside [84, 124]px range`);
  }

  // Check 3: Contrast between icon colour and shape directly behind it >= 3:1
  const bgHex =
    geom.bgBehindIcon === 'white'
      ? '#FFFFFF'
      : geom.bgBehindIcon === 'c2'
      ? palette.c2
      : palette.c1;
  const preferredHex = geom.preferredIconTone === 'c1' ? palette.c1 : '#FFFFFF';
  const actualIconHex = ensureIconContrast(preferredHex, bgHex, palette.c1);
  const contrastRatio = wcagContrastRatio(actualIconHex, bgHex);
  if (contrastRatio < 3.0) {
    reasons.push(`WCAG contrast ${contrastRatio.toFixed(2)} is below 3.0`);
  }

  // Check 4: Accent never overlaps icon box
  const iconRect: Box2D = {
    x: geom.iconBox.x,
    y: geom.iconBox.y,
    w: geom.iconBox.size,
    h: geom.iconBox.size,
  };
  if (boxesOverlap(geom.accentBox, iconRect)) {
    reasons.push('Accent overlaps icon box');
  }

  // Check 5: Everything stays inside the 200 x 200 box
  const allBoxes = [geom.mainBox, iconRect, geom.accentBox];
  for (const b of allBoxes) {
    if (b.x < 0 || b.y < 0 || b.x + b.w > 200 || b.y + b.h > 200) {
      reasons.push(`Box (${b.x},${b.y},${b.w},${b.h}) exceeds 200x200 emblem bounds`);
    }
  }

  return {
    valid: reasons.length === 0,
    reasons,
    iconSize: geom.iconBox.size,
    contrastRatio,
  };
}

function renderAccentMark(
  accentBox: Box2D,
  shape: string,
  c3: string,
  c2: string
): string {
  const cx = accentBox.x + accentBox.w / 2;
  const cy = accentBox.y + accentBox.h / 2;
  const r = Math.min(accentBox.w, accentBox.h) / 2;

  switch (shape) {
    case 'ring':
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#FFFFFF"/><circle cx="${cx}" cy="${cy}" r="${Math.max(3, r - 3)}" fill="none" stroke="${c3}" stroke-width="3.5"/>`;
    case 'pill':
      return `<rect x="${accentBox.x}" y="${cy - 5}" width="${accentBox.w}" height="10" rx="5" fill="${c3}"/>`;
    case 'diamond':
      return `<polygon points="${cx},${accentBox.y} ${accentBox.x + accentBox.w},${cy} ${cx},${accentBox.y + accentBox.h} ${accentBox.x},${cy}" fill="${c3}"/>`;
    case 'bar':
      return `<rect x="${accentBox.x + 2}" y="${cy - 4}" width="${accentBox.w - 4}" height="8" rx="4" fill="${c3}" stroke="${c2}" stroke-width="1.5"/>`;
    case 'dot':
    default:
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c3}"/>`;
  }
}

export function renderConstruction(
  spec: ConstructionSpec,
  ctx: {
    c1: string;
    c2: string;
    c3: string;
    initChar: string;
    fontFamily: string;
    renderIcon: (x: number, y: number, size: number, color: string) => string;
  }
): string {
  const { c1, c2, c3, initChar, fontFamily, renderIcon } = ctx;
  const p = spec.params;
  const geom = computeConstructionGeometry(spec);
  const { mainBox, iconBox, accentBox } = geom;

  const r = Math.min(52, Math.max(16, Number(p.radius ?? 34)));
  const corner = Math.abs(Number(p.corner ?? 0)) % 4;
  const angle = Number(p.angle ?? 15);
  const split = Math.max(0.32, Math.min(0.68, Number(p.split ?? 0.5)));
  const weight = Math.max(4, Math.min(16, Number(p.weight ?? 8)));
  const accentShape = String(p.accentShape ?? 'dot');
  const fillMode = String(p.fillMode ?? 'solid');

  const bgHex =
    geom.bgBehindIcon === 'white' ? '#FFFFFF' : geom.bgBehindIcon === 'c2' ? c2 : c1;
  const preferredIconHex = geom.preferredIconTone === 'c1' ? c1 : '#FFFFFF';
  const iconColor = ensureIconContrast(preferredIconHex, bgHex, c1);

  const isOutlineOrGhost = fillMode === 'outline' || fillMode === 'ghost';
  const primaryFill = isOutlineOrGhost ? '#FFFFFF' : c1;
  const primaryStroke = isOutlineOrGhost ? `stroke="${c1}" stroke-width="${Math.max(4, Math.min(9, weight))}"` : '';

  const basePlateMarkup = isOutlineOrGhost
    ? `<rect x="${mainBox.x}" y="${mainBox.y}" width="${mainBox.w}" height="${mainBox.h}" rx="${r}" fill="#FFFFFF"/><rect x="${mainBox.x}" y="${mainBox.y}" width="${mainBox.w}" height="${mainBox.h}" rx="${r}" fill="${c2}" fill-opacity="${fillMode === 'ghost' ? '0.12' : '0.06'}" stroke="${c1}" stroke-width="${Math.max(4, Math.min(10, weight))}"/>`
    : `<rect x="${mainBox.x}" y="${mainBox.y}" width="${mainBox.w}" height="${mainBox.h}" rx="${r}" fill="${c1}"/>`;

  const accentSvg = renderAccentMark(accentBox, accentShape, c3, c2);
  const iconSvg = renderIcon(iconBox.x, iconBox.y, iconBox.size, iconColor);

  let familyBackdrop = '';

  switch (spec.family) {
    // =========================================================================
    // 1. POLYGONAL & FACETED SILHOUETTES (NOT SQUARES OR CIRCLES)
    // =========================================================================
    case 'diamondFacet': {
      // True 45-degree Rhombus / Diamond outer silhouette (no square rect!)
      const top = mainBox.y;
      const bot = mainBox.y + mainBox.h;
      const left = mainBox.x;
      const right = mainBox.x + mainBox.w;
      familyBackdrop = `
        <polygon points="100,${top} ${right},100 100,${bot} ${left},100" fill="${primaryFill}" ${primaryStroke} stroke-linejoin="round"/>
        <polygon points="100,${top} ${right},100 100,100" fill="${c2}" opacity="${isOutlineOrGhost ? '0.2' : '0.45'}"/>
        <polygon points="100,100 ${left},100 100,${bot}" fill="${c2}" opacity="${isOutlineOrGhost ? '0.12' : '0.22'}"/>
        <polygon points="100,${top + 22} ${right - 22},100 100,${bot - 22} ${left + 22},100" fill="${primaryFill}" stroke="${c2}" stroke-width="3"/>
      `;
      break;
    }

    case 'hexBadge': {
      // Wide Flat-Top Hexagon silhouette (172 x 152)
      const x0 = mainBox.x;
      const x1 = mainBox.x + 38;
      const x2 = mainBox.x + mainBox.w - 38;
      const x3 = mainBox.x + mainBox.w;
      const y0 = mainBox.y;
      const yMid = Math.round(mainBox.y + mainBox.h / 2);
      const y1 = mainBox.y + mainBox.h;
      familyBackdrop = `
        <polygon points="${x1},${y0} ${x2},${y0} ${x3},${yMid} ${x2},${y1} ${x1},${y1} ${x0},${yMid}" fill="${primaryFill}" ${primaryStroke} stroke-linejoin="round"/>
        <polygon points="${x1},${y0} ${x2},${y0} ${x3},${yMid} 100,${yMid} ${x0},${yMid}" fill="${c2}" opacity="${isOutlineOrGhost ? '0.16' : '0.32'}"/>
        <polygon points="${x1 + 10},${y0 + 12} ${x2 - 10},${y0 + 12} ${x3 - 14},${yMid} ${x2 - 10},${y1 - 12} ${x1 + 10},${y1 - 12} ${x0 + 14},${yMid}" fill="none" stroke="${c2}" stroke-width="2.5" opacity="0.55"/>
      `;
      break;
    }

    case 'octaGem': {
      // Architectural Chamfered Octagon / Emerald Cut silhouette
      const cut = 38;
      const x0 = mainBox.x;
      const x1 = mainBox.x + mainBox.w;
      const y0 = mainBox.y;
      const y1 = mainBox.y + mainBox.h;
      familyBackdrop = `
        <polygon points="${x0 + cut},${y0} ${x1 - cut},${y0} ${x1},${y0 + cut} ${x1},${y1 - cut} ${x1 - cut},${y1} ${x0 + cut},${y1} ${x0},${y1 - cut} ${x0},${y0 + cut}" fill="${primaryFill}" ${primaryStroke} stroke-linejoin="round"/>
        <polygon points="${x0 + cut},${y0} ${x1 - cut},${y0} ${x1},${y0 + cut} ${x0},${y1 - cut} ${x0},${y0 + cut}" fill="${c2}" opacity="${isOutlineOrGhost ? '0.15' : '0.28'}"/>
        <polygon points="${x0 + cut + 8},${y0 + 10} ${x1 - cut - 8},${y0 + 10} ${x1 - 10},${y0 + cut + 8} ${x1 - 10},${y1 - cut - 8} ${x1 - cut - 8},${y1 - 10} ${x0 + cut + 8},${y1 - 10} ${x0 + 10},${y1 - cut - 8} ${x0 + 10},${y0 + cut + 8}" fill="none" stroke="${c2}" stroke-width="2.5" opacity="0.6"/>
      `;
      break;
    }

    case 'isoSolid': {
      // 3D Isometric Hexagon Cube silhouette
      const cx = 100;
      const topY = mainBox.y;
      const botY = mainBox.y + mainBox.h;
      const leftX = mainBox.x + 6;
      const rightX = mainBox.x + mainBox.w - 6;
      const midY1 = Math.round(topY + mainBox.h * 0.26);
      const midY2 = Math.round(topY + mainBox.h * 0.74);
      familyBackdrop = `
        <polygon points="${cx},${topY} ${rightX},${midY1} ${rightX},${midY2} ${cx},${botY} ${leftX},${midY2} ${leftX},${midY1}" fill="${primaryFill}" ${primaryStroke} stroke-linejoin="round"/>
        <polygon points="${cx},${topY} ${rightX},${midY1} ${cx},100 ${leftX},${midY1}" fill="${c2}" opacity="${isOutlineOrGhost ? '0.22' : '0.82'}"/>
        <polygon points="${cx},100 ${rightX},${midY1} ${rightX},${midY2} ${cx},${botY}" fill="${c2}" opacity="${isOutlineOrGhost ? '0.12' : '0.35'}"/>
        <polygon points="${cx},40 ${rightX - 24},68 ${rightX - 24},132 ${cx},160 ${leftX + 24},132 ${leftX + 24},68" fill="${primaryFill}" stroke="${c2}" stroke-width="3.5"/>
      `;
      break;
    }

    case 'keystoneTrap': {
      // Tapered Architectural Keystone Trapezoid silhouette (wide top or wide base)
      const inv = corner % 2 === 1;
      const topInset = inv ? 26 : 4;
      const botInset = inv ? 4 : 26;
      const x0 = mainBox.x;
      const x1 = mainBox.x + mainBox.w;
      const y0 = mainBox.y;
      const y1 = mainBox.y + mainBox.h;
      familyBackdrop = `
        <polygon points="${x0 + topInset},${y0} ${x1 - topInset},${y0} ${x1 - botInset},${y1} ${x0 + botInset},${y1}" fill="${primaryFill}" ${primaryStroke} stroke-linejoin="round"/>
        <polygon points="${x0 + topInset},${y0} 100,${y0} 100,${y1} ${x0 + botInset},${y1}" fill="${c2}" opacity="${isOutlineOrGhost ? '0.15' : '0.28'}"/>
      `;
      break;
    }

    case 'prismTriangle': {
      // Rounded Delta / Prism Shield-Triangle silhouette
      const x0 = mainBox.x;
      const x1 = mainBox.x + mainBox.w;
      const y0 = mainBox.y;
      const y1 = mainBox.y + mainBox.h;
      familyBackdrop = `
        <path d="M 100 ${y0} L ${x1} ${y1 - 24} Q ${x1} ${y1} ${x1 - 24} ${y1} H ${x0 + 24} Q ${x0} ${y1} ${x0} ${y1 - 24} L 72 ${y0 + 36} Q 100 ${y0} 100 ${y0} Z" fill="${primaryFill}" ${primaryStroke} stroke-linejoin="round"/>
        <polygon points="100,${y0 + 8} ${x1 - 12},${y1 - 12} 100,${y1 - 12}" fill="${c2}" opacity="${isOutlineOrGhost ? '0.16' : '0.3'}"/>
      `;
      break;
    }

    case 'crownPeak': {
      // 3-Peak Alpine Crown / Ridge polygon silhouette
      const x0 = mainBox.x;
      const x1 = mainBox.x + mainBox.w;
      const y0 = mainBox.y;
      const y1 = mainBox.y + mainBox.h;
      familyBackdrop = `
        <polygon points="${x0},${y0 + 22} ${x0 + 44},${y0 + 48} 100,${y0} ${x1 - 44},${y0 + 48} ${x1},${y0 + 22} ${x1 - 14},${y1} ${x0 + 14},${y1}" fill="${primaryFill}" ${primaryStroke} stroke-linejoin="round"/>
        <polygon points="100,${y0} ${x1 - 44},${y0 + 48} ${x1},${y0 + 22} ${x1 - 14},${y1} 100,${y1}" fill="${c2}" opacity="${isOutlineOrGhost ? '0.15' : '0.28'}"/>
      `;
      break;
    }

    // =========================================================================
    // 2. DIRECTIONAL, WINGS & SLANTED SILHOUETTES (NO SQUARE BOX)
    // =========================================================================
    case 'chevronWing': {
      // Bold Twin Upward/Forward Chevron Wings silhouette
      const x0 = mainBox.x + 8;
      const x1 = mainBox.x + mainBox.w - 8;
      const y0 = mainBox.y + 6;
      const y1 = mainBox.y + mainBox.h - 6;
      familyBackdrop = `
        <polygon points="100,${y0} ${x1},${y0 + 42} ${x1},${y1} 100,${y1 - 28} ${x0},${y1} ${x0},${y0 + 42}" fill="${primaryFill}" ${primaryStroke} stroke-linejoin="round"/>
        <polygon points="100,${y0} ${x1},${y0 + 42} ${x1},${y0 + 74} 100,${y0 + 32} ${x0},${y0 + 74} ${x0},${y0 + 42}" fill="${c2}" opacity="${isOutlineOrGhost ? '0.24' : '0.78'}"/>
      `;
      break;
    }

    case 'parallelogramSlant': {
      // Dynamic Speed-Slanted Parallelogram Monolith (no upright square!)
      const slant = corner % 2 === 0 ? 24 : -24;
      const x0 = mainBox.x + 12;
      const x1 = mainBox.x + mainBox.w - 12;
      const y0 = mainBox.y;
      const y1 = mainBox.y + mainBox.h;
      const tlX = slant > 0 ? x0 + slant : x0;
      const trX = slant > 0 ? x1 : x1 + slant;
      const brX = slant > 0 ? x1 - slant : x1;
      const blX = slant > 0 ? x0 : x0 - slant;
      familyBackdrop = `
        <polygon points="${tlX + 6},${y0 + 8} ${trX + 6},${y0 + 8} ${brX + 6},${y1 + 4} ${blX + 6},${y1 + 4}" fill="${c2}" opacity="0.75"/>
        <polygon points="${tlX},${y0} ${trX},${y0} ${brX},${y1} ${blX},${y1}" fill="${primaryFill}" ${primaryStroke} stroke-linejoin="round"/>
      `;
      break;
    }

    case 'stepStair': {
      // 3 Ascending Stepped Tiers forming an architectural stair silhouette (no bounding rect!)
      const x0 = mainBox.x;
      const w = mainBox.w;
      const y0 = mainBox.y;
      const h = mainBox.h;
      familyBackdrop = `
        <rect x="${x0 + 28}" y="${y0}" width="${w - 28}" height="52" rx="16" fill="${c2}" opacity="0.85"/>
        <rect x="${x0 + 14}" y="${y0 + 40}" width="${w - 14}" height="84" rx="20" fill="${primaryFill}" ${primaryStroke}/>
        <rect x="${x0}" y="${y0 + h - 52}" width="${w - 24}" height="52" rx="16" fill="${primaryFill}"/>
        <rect x="${x0 + 18}" y="${y0 + 36}" width="${w - 36}" height="100" rx="22" fill="${primaryFill}"/>
      `;
      break;
    }

    case 'ribbonFold': {
      // Swallowtail Z-Ribbon Banner silhouette (not a square!)
      const x0 = mainBox.x;
      const x1 = mainBox.x + mainBox.w;
      const y0 = mainBox.y;
      const y1 = mainBox.y + mainBox.h;
      const midY = Math.round((y0 + y1) / 2);
      familyBackdrop = `
        <polygon points="${x0},${y0} ${x1 - 14},${y0} ${x1},${midY} ${x1 - 14},${y1} ${x0},${y1} ${x0 + 18},${midY}" fill="${primaryFill}" ${primaryStroke} stroke-linejoin="round"/>
        <polygon points="${x0},${y0} ${x1 - 14},${y0} ${x1},${midY} ${x0 + 18},${midY}" fill="${c2}" opacity="${isOutlineOrGhost ? '0.18' : '0.35'}"/>
      `;
      break;
    }

    case 'slashBand': {
      // Chamfered Diagonal Blade Container (opposite corners bevelled at 45°, not a 4-corner square)
      const x0 = mainBox.x;
      const x1 = mainBox.x + mainBox.w;
      const y0 = mainBox.y;
      const y1 = mainBox.y + mainBox.h;
      const bev = 44;
      familyBackdrop = `
        <polygon points="${x0 + bev},${y0} ${x1},${y0} ${x1},${y1 - bev} ${x1 - bev},${y1} ${x0},${y1} ${x0},${y0 + bev}" fill="${primaryFill}" ${primaryStroke} stroke-linejoin="round"/>
        <polygon points="${x0 + bev},${y0} ${x1},${y0} ${x1},${y0 + 64} ${x0},${y1 - 40} ${x0},${y0 + bev}" fill="${c2}" opacity="${isOutlineOrGhost ? '0.18' : '0.42'}"/>
      `;
      break;
    }

    // =========================================================================
    // 3. SHIELDS, ARCHES & ORGANIC CURVES
    // =========================================================================
    case 'crest': {
      const topY = mainBox.y;
      const botY = mainBox.y + mainBox.h;
      const leftX = mainBox.x + 2;
      const rightX = mainBox.x + mainBox.w - 2;
      const shoulderY = topY + 28;
      const waistY = topY + Math.round(mainBox.h * 0.56);
      familyBackdrop = `
        <path d="M 100 ${topY} L ${rightX} ${shoulderY} V ${waistY} C ${rightX} ${botY - 24} 136 ${botY - 8} 100 ${botY} C 64 ${botY - 8} ${leftX} ${botY - 24} ${leftX} ${waistY} V ${shoulderY} Z" fill="${primaryFill}" ${primaryStroke}/>
        <path d="M 100 ${topY + 10} L ${rightX - 10} ${shoulderY + 6} V ${waistY - 4} C ${rightX - 10} ${botY - 32} 130 ${botY - 18} 100 ${botY - 12} Z" fill="${c2}" opacity="${isOutlineOrGhost ? '0.18' : '0.45'}"/>
      `;
      break;
    }

    case 'arch': {
      // Tall Architectural Cathedral Arch (dome top, stepped plinth base)
      const archR = Math.round(mainBox.w / 2);
      const archTop = mainBox.y + archR;
      const botY = mainBox.y + mainBox.h;
      familyBackdrop = `
        <path d="M ${mainBox.x} ${archTop} A ${archR} ${archR} 0 0 1 ${mainBox.x + mainBox.w} ${archTop} V ${botY - 12} H ${mainBox.x} Z" fill="${primaryFill}" ${primaryStroke}/>
        <rect x="${mainBox.x - 8}" y="${botY - 16}" width="${mainBox.w + 16}" height="16" rx="8" fill="${c2}"/>
      `;
      break;
    }

    case 'teardropPin': {
      // Organic Asymmetric Leaf / Droplet Pin (3 rounded corners + 1 sharp pointed apex)
      const x0 = mainBox.x;
      const y0 = mainBox.y;
      const w = mainBox.w;
      const h = mainBox.h;
      const rad = 68;
      familyBackdrop = `
        <path d="M ${x0 + rad} ${y0} H ${x0 + w - 12} Q ${x0 + w} ${y0} ${x0 + w} ${y0 + 12} V ${y0 + h - rad} A ${rad} ${rad} 0 0 1 ${x0 + w - rad} ${y0 + h} H ${x0 + rad} A ${rad} ${rad} 0 0 1 ${x0} ${y0 + h - rad} V ${y0 + rad} A ${rad} ${rad} 0 0 1 ${x0 + rad} ${y0} Z" fill="${primaryFill}" ${primaryStroke}/>
        <circle cx="${x0 + w - 26}" cy="${y0 + 26}" r="18" fill="${c2}" opacity="0.45"/>
      `;
      break;
    }

    case 'quarterArcs': {
      // 4-Lobe Quatrefoil Clover silhouette (4 overlapping circles, no square box!)
      const lobeR = 46;
      const off = 32;
      familyBackdrop = `
        <circle cx="${100 - off}" cy="${100 - off}" r="${lobeR}" fill="${c2}" opacity="0.88"/>
        <circle cx="${100 + off}" cy="${100 + off}" r="${lobeR}" fill="${c2}" opacity="0.88"/>
        <circle cx="${100 + off}" cy="${100 - off}" r="${lobeR}" fill="${primaryFill}"/>
        <circle cx="${100 - off}" cy="${100 + off}" r="${lobeR}" fill="${primaryFill}"/>
        <circle cx="100" cy="100" r="56" fill="${primaryFill}" stroke="${c2}" stroke-width="3"/>
      `;
      break;
    }

    case 'petalRing': {
      // 8-Pointed Scalloped Rosette / Gear Star silhouette
      const petals: string[] = [];
      const numPetals = 8;
      for (let i = 0; i < numPetals; i++) {
        const theta = (i * 2 * Math.PI) / numPetals;
        const px = Math.round(100 + 58 * Math.cos(theta));
        const py = Math.round(100 + 58 * Math.sin(theta));
        petals.push(
          `<circle cx="${px}" cy="${py}" r="24" fill="${i % 2 === 0 ? primaryFill : c2}"/>`
        );
      }
      familyBackdrop = `
        ${petals.join('')}
        <circle cx="100" cy="100" r="62" fill="${primaryFill}" stroke="#FFFFFF" stroke-width="3"/>
      `;
      break;
    }

    case 'overlapPair': {
      // Two intersecting asymmetric stadium/circle lenses (no single square or circle)
      const off = corner % 2 === 0 ? -18 : 18;
      familyBackdrop = `
        <rect x="${22}" y="${36}" width="116" height="128" rx="58" fill="${c2}" opacity="0.88"/>
        <circle cx="${106 - off * 0.3}" cy="100" r="64" fill="${primaryFill}" ${primaryStroke}/>
      `;
      break;
    }

    // =========================================================================
    // 4. ELONGATED CAPSULES, TICKETS & STAGGERED BARS
    // =========================================================================
    case 'pillSplit': {
      // True Horizontal Stadium Pill Capsule (176 x 132, rx=66) — distinctly oval/stadium, not square!
      const pillRx = Math.floor(mainBox.h / 2);
      const capW = Math.round(mainBox.w * 0.36);
      familyBackdrop = `
        <rect x="${mainBox.x}" y="${mainBox.y}" width="${mainBox.w}" height="${mainBox.h}" rx="${pillRx}" fill="${primaryFill}" ${primaryStroke}/>
        <rect x="${mainBox.x}" y="${mainBox.y}" width="${capW}" height="${mainBox.h}" rx="${ Math.floor(capW / 2) }" fill="${c2}" opacity="0.85"/>
        <rect x="${mainBox.x + 36}" y="${mainBox.y}" width="${mainBox.w - 36}" height="${mainBox.h}" rx="${pillRx}" fill="${primaryFill}"/>
      `;
      break;
    }

    case 'ticketStub': {
      // Horizontal Cinema / Event Ticket Stub with semicircular side notches
      const x0 = mainBox.x;
      const x1 = mainBox.x + mainBox.w;
      const y0 = mainBox.y;
      const y1 = mainBox.y + mainBox.h;
      const midY = Math.round((y0 + y1) / 2);
      familyBackdrop = `
        <rect x="${x0}" y="${y0}" width="${mainBox.w}" height="${mainBox.h}" rx="22" fill="${primaryFill}" ${primaryStroke}/>
        <line x1="${x0 + 36}" y1="${y0 + 10}" x2="${x0 + 36}" y2="${y1 - 10}" stroke="${c2}" stroke-width="3" stroke-dasharray="6 6"/>
        <circle cx="${x0}" cy="${midY}" r="18" fill="#FFFFFF"/>
        <circle cx="${x1}" cy="${midY}" r="18" fill="#FFFFFF"/>
      `;
      break;
    }

    case 'stackedBars': {
      // 3 Staggered Horizontal Stadium Bars of different widths (no bounding square!)
      const y0 = mainBox.y;
      familyBackdrop = `
        <rect x="14" y="${y0}" width="144" height="38" rx="19" fill="${c2}"/>
        <rect x="42" y="${y0 + 46}" width="144" height="40" rx="20" fill="${primaryFill}"/>
        <rect x="20" y="${y0 + 94}" width="152" height="38" rx="19" fill="${c2}" opacity="0.85"/>
        <polygon points="100,${y0 + 4} 162,100 100,${y0 + mainBox.h - 4} 38,100" fill="${primaryFill}" stroke="#FFFFFF" stroke-width="4" stroke-linejoin="round"/>
      `;
      break;
    }

    case 'capsuleWave': {
      // Twin Offset Diagonal Capsules forming an S-Wave silhouette
      familyBackdrop = `
        <g transform="rotate(-14 100 100)">
          <rect x="18" y="34" width="142" height="58" rx="29" fill="${c2}"/>
          <rect x="40" y="108" width="142" height="58" rx="29" fill="${c2}"/>
          <rect x="28" y="42" width="144" height="116" rx="52" fill="${primaryFill}" ${primaryStroke}/>
        </g>
      `;
      break;
    }

    case 'notchTab': {
      // Asymmetric Folder / Briefcase silhouette with raised top tab
      const tabW = Math.round(mainBox.w * 0.46);
      const tabX = corner % 2 === 0 ? mainBox.x : mainBox.x + mainBox.w - tabW;
      familyBackdrop = `
        <rect x="${tabX}" y="${mainBox.y}" width="${tabW}" height="44" rx="14" fill="${c2}"/>
        <rect x="${mainBox.x}" y="${mainBox.y + 22}" width="${mainBox.w}" height="${mainBox.h - 22}" rx="28" fill="${primaryFill}" ${primaryStroke}/>
      `;
      break;
    }

    // =========================================================================
    // 5. OPEN FRAMELESS, CROSSES, STARS & ORBITAL RINGS
    // =========================================================================
    case 'bareMark': {
      // Open frameless oversized mark with subtle geometric crosshairs
      familyBackdrop = `
        <polygon points="100,18 182,100 100,182 18,100" fill="#FFFFFF"/>
        <polygon points="100,22 178,100 100,178 22,100" fill="${c2}" opacity="0.1" stroke="${c2}" stroke-width="2" stroke-dasharray="10 6"/>
      `;
      break;
    }

    case 'bracketFrame': {
      // Open Architectural L-Brackets framing open space (no filled background box!)
      const bw = Math.max(10, weight);
      const arm = 54;
      const x0 = mainBox.x + 6;
      const y0 = mainBox.y + 6;
      const x1 = mainBox.x + mainBox.w - 6;
      const y1 = mainBox.y + mainBox.h - 6;
      familyBackdrop = `
        <polygon points="100,28 172,100 100,172 28,100" fill="#FFFFFF"/>
        <path d="M ${x0} ${y0 + arm} V ${y0} H ${x0 + arm}" fill="none" stroke="${c1}" stroke-width="${bw}" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M ${x1} ${y1 - arm} V ${y1} H ${x1 - arm}" fill="none" stroke="${c2}" stroke-width="${bw}" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M ${x1 - arm * 0.6} ${y0} H ${x1} V ${y0 + arm * 0.6}" fill="none" stroke="${c2}" stroke-width="${Math.round(bw * 0.65)}" stroke-linecap="round" stroke-linejoin="round" opacity="0.65"/>
      `;
      break;
    }

    case 'crossPlus': {
      // True Swiss Cross / Plus silhouette (two intersecting perpendicular arms, no outer square!)
      const armW = 104;
      const armStart = Math.round((200 - armW) / 2);
      const spanStart = mainBox.x;
      const spanLen = mainBox.w;
      familyBackdrop = `
        <rect x="${armStart}" y="${spanStart}" width="${armW}" height="${spanLen}" rx="26" fill="${c2}"/>
        <rect x="${spanStart}" y="${armStart}" width="${spanLen}" height="${armW}" rx="26" fill="${primaryFill}" ${primaryStroke}/>
        <rect x="${armStart + 4}" y="${armStart + 4}" width="${armW - 8}" height="${armW - 8}" rx="20" fill="${primaryFill}"/>
      `;
      break;
    }

    case 'starBurst': {
      // 8-Pointed Geometric Octagram Star silhouette (two rotated squares at 0° and 45°)
      const s = 126;
      const xy = Math.round((200 - s) / 2);
      familyBackdrop = `
        <g transform="rotate(45 100 100)">
          <rect x="${xy}" y="${xy}" width="${s}" height="${s}" rx="20" fill="${c2}"/>
        </g>
        <rect x="${xy}" y="${xy}" width="${s}" height="${s}" rx="20" fill="${primaryFill}" ${primaryStroke}/>
      `;
      break;
    }

    case 'orbitRing': {
      const outerR = Math.round(mainBox.w / 2);
      const innerR = outerR - 18;
      const rad = ((angle || 45) * Math.PI) / 180;
      const ax1 = Math.round(100 + outerR * Math.cos(rad));
      const ay1 = Math.round(100 + outerR * Math.sin(rad));
      const ax2 = Math.round(100 + outerR * Math.cos(rad + Math.PI * 0.65));
      const ay2 = Math.round(100 + outerR * Math.sin(rad + Math.PI * 0.65));
      familyBackdrop = `
        <circle cx="100" cy="100" r="${outerR}" fill="none" stroke="${c1}" stroke-width="${Math.max(4, Math.round(weight * 0.6))}" stroke-dasharray="18 10"/>
        <path d="M ${ax1} ${ay1} A ${outerR} ${outerR} 0 0 1 ${ax2} ${ay2}" fill="none" stroke="${c2}" stroke-width="${Math.max(8, weight)}" stroke-linecap="round"/>
        <polygon points="100,${100 - innerR} ${100 + innerR},100 100,${100 + innerR} ${100 - innerR},100" fill="${primaryFill}" stroke="${c2}" stroke-width="3" stroke-linejoin="round"/>
        <circle cx="100" cy="100" r="${innerR - 8}" fill="${primaryFill}"/>
      `;
      break;
    }

    // =========================================================================
    // 6. ARCHITECTURAL CARDS & MODULAR PLATES
    // =========================================================================
    case 'cornerCut': {
      const cutCx = corner === 0 || corner === 3 ? mainBox.x + 22 : mainBox.x + mainBox.w - 22;
      const cutCy = corner === 0 || corner === 1 ? mainBox.y + 22 : mainBox.y + mainBox.h - 22;
      const bandY = corner < 2 ? mainBox.y : mainBox.y + Math.round(mainBox.h * 0.55);
      familyBackdrop = `
        ${basePlateMarkup}
        <rect x="${mainBox.x}" y="${bandY}" width="${mainBox.w}" height="${Math.round(mainBox.h * 0.45)}" rx="${Math.round(r * 0.75)}" fill="${c2}" opacity="0.24"/>
        <circle cx="${cutCx}" cy="${cutCy}" r="28" fill="#FFFFFF"/>
        <circle cx="${cutCx}" cy="${cutCy}" r="18" fill="${c2}"/>
        <circle cx="${cutCx}" cy="${cutCy}" r="6" fill="#FFFFFF"/>
      `;
      break;
    }

    case 'splitPanel': {
      const splitX = mainBox.x + Math.round(mainBox.w * Math.min(0.42, split * 0.65));
      const panelW = splitX - mainBox.x;
      familyBackdrop = `
        ${basePlateMarkup}
        <rect x="${mainBox.x}" y="${mainBox.y}" width="${panelW}" height="${mainBox.h}" rx="${Math.min(r, Math.floor(panelW / 2))}" fill="${c2}" opacity="${isOutlineOrGhost ? '0.22' : '0.88'}"/>
        <text x="${mainBox.x + Math.round(panelW / 2)}" y="${mainBox.y + Math.round(mainBox.h * 0.62)}" font-family="'${fontFamily}', sans-serif" font-weight="800" font-size="44" fill="${isOutlineOrGhost ? c1 : '#FFFFFF'}" text-anchor="middle">${initChar}</text>
      `;
      break;
    }

    case 'gridBlocks': {
      const topH = Math.round(mainBox.h * 0.28);
      const halfW = Math.round((mainBox.w - 10) / 2);
      familyBackdrop = `
        <rect x="${mainBox.x}" y="${mainBox.y}" width="${halfW}" height="${topH}" rx="14" fill="${c2}"/>
        <rect x="${mainBox.x + halfW + 10}" y="${mainBox.y}" width="${halfW}" height="${topH}" rx="14" fill="${c3}"/>
        <rect x="${mainBox.x}" y="${mainBox.y + topH + 8}" width="${mainBox.w}" height="${mainBox.h - topH - 8}" rx="24" fill="${primaryFill}" ${primaryStroke}/>
        <rect x="${mainBox.x + 12}" y="${mainBox.y + 18}" width="${mainBox.w - 24}" height="${mainBox.h - 26}" rx="24" fill="${primaryFill}"/>
      `;
      break;
    }

    case 'offsetShadow': {
      const dx = corner === 0 || corner === 3 ? -12 : 12;
      const dy = corner === 0 || corner === 1 ? -12 : 12;
      familyBackdrop = `
        <rect x="${mainBox.x + dx}" y="${mainBox.y + dy}" width="${mainBox.w}" height="${mainBox.h}" rx="${r}" fill="${c2}"/>
        ${basePlateMarkup}
        <rect x="${mainBox.x + 6}" y="${mainBox.y + 6}" width="${mainBox.w - 12}" height="${mainBox.h - 12}" rx="${Math.max(10, r - 6)}" fill="none" stroke="#FFFFFF" stroke-width="2.5" opacity="0.35"/>
      `;
      break;
    }

    case 'foldedCorner': {
      const fold = 46;
      const rxEdge = mainBox.x + mainBox.w;
      const tyEdge = mainBox.y;
      familyBackdrop = `
        ${basePlateMarkup}
        <polygon points="${rxEdge - fold},${tyEdge} ${rxEdge},${tyEdge} ${rxEdge},${tyEdge + fold}" fill="#FFFFFF"/>
        <polygon points="${rxEdge - fold},${tyEdge} ${rxEdge - fold},${tyEdge + fold} ${rxEdge},${tyEdge + fold}" fill="${c2}"/>
      `;
      break;
    }

    case 'halfTone': {
      const dots: string[] = [];
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 2; col++) {
          const dx = mainBox.x + 12 + col * 14;
          const dy = mainBox.y + 24 + row * 18;
          dots.push(`<circle cx="${dx}" cy="${dy}" r="4.5" fill="${c2}"/>`);
        }
      }
      familyBackdrop = `
        ${ dots.join('') }
        <path d="M ${mainBox.x + 34} ${mainBox.y} H ${mainBox.x + mainBox.w - 24} Q ${mainBox.x + mainBox.w} ${mainBox.y} ${mainBox.x + mainBox.w} ${mainBox.y + 24} V ${mainBox.y + mainBox.h - 24} Q ${mainBox.x + mainBox.w} ${mainBox.y + mainBox.h} ${mainBox.x + mainBox.w - 24} ${mainBox.y + mainBox.h} H ${mainBox.x + 24} Q ${mainBox.x} ${mainBox.y + mainBox.h} ${mainBox.x} ${mainBox.y + mainBox.h - 24} V ${mainBox.y + 96} H ${mainBox.x + 34} Z" fill="${primaryFill}" ${primaryStroke}/>
        <rect x="${mainBox.x + 16}" y="${mainBox.y + 16}" width="${mainBox.w - 24}" height="${mainBox.h - 24}" rx="28" fill="${primaryFill}"/>
      `;
      break;
    }

    case 'windowQuad': {
      const midX = mainBox.x + Math.round(mainBox.w / 2);
      const midY = mainBox.y + Math.round(mainBox.h / 2);
      familyBackdrop = `
        ${basePlateMarkup}
        <line x1="${midX}" y1="${mainBox.y + 8}" x2="${midX}" y2="${mainBox.y + mainBox.h - 8}" stroke="${c2}" stroke-width="3" opacity="0.35"/>
        <line x1="${mainBox.x + 8}" y1="${midY}" x2="${mainBox.x + mainBox.w - 8}" y2="${midY}" stroke="${c2}" stroke-width="3" opacity="0.35"/>
        <rect x="${corner % 2 === 0 ? mainBox.x + 10 : midX + 6}" y="${corner < 2 ? mainBox.y + 10 : midY + 6}" width="28" height="28" rx="8" fill="${c2}" opacity="0.45"/>
      `;
      break;
    }

    case 'tiltCard':
    default: {
      const tilt = Math.max(-8, Math.min(8, angle || 7));
      familyBackdrop = `
        <g transform="rotate(${-tilt} 100 100)">
          <rect x="${mainBox.x}" y="${mainBox.y}" width="${mainBox.w}" height="${mainBox.h}" rx="${r}" fill="${c2}" opacity="0.82"/>
        </g>
        <g transform="rotate(${tilt} 100 100)">
          ${basePlateMarkup}
        </g>
      `;
      break;
    }
  }

  return `${familyBackdrop}${accentSvg}${iconSvg}`;
}

export function describeConstruction(spec: ConstructionSpec): string {
  const p = spec.params;
  const cornerNames = ['top-left', 'top-right', 'bottom-right', 'bottom-left'];
  const cornerLabel = cornerNames[Math.abs(Number(p.corner ?? 0)) % 4];
  const fillMode = String(p.fillMode ?? 'solid');
  const radius = Number(p.radius ?? 32);
  const accentShape = String(p.accentShape ?? 'dot');
  return `${spec.label} (${spec.family} construction, ${fillMode} fill, ${radius}px corner radius, ${cornerLabel} orientation, ${accentShape} spark accent)`;
}

export function constructionsForDomain(
  domain: string,
  remixSeed: number,
  count = 10
): ConstructionSpec[] {
  const normalized = (domain || 'logo').trim().toLowerCase();
  const domainHash = hashDomain(normalized);
  const baseSeed = (domainHash ^ Math.imul((remixSeed || 0) + 1, 0x9e3779b1)) >>> 0 || 1;
  const rng = createPrng(baseSeed);

  // Shuffle each silhouette bucket independently so every domain gets a unique mix
  // of polygons, directional wings, shields/arches, capsules/tickets, open marks, and at most 1-2 cards
  const shuffledBuckets = SILHOUETTE_BUCKETS.map((bucket) => {
    const arr = [...bucket];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  });

  // Order the first 5 non-card buckets deterministically per domain
  const nonCardIndices = [0, 1, 2, 3, 4];
  for (let i = nonCardIndices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [nonCardIndices[i], nonCardIndices[j]] = [nonCardIndices[j], nonCardIndices[i]];
  }

  // Build a balanced 10+ family sequence where 9 out of 10 slots come from non-square/non-circle silhouette buckets
  const orderedFamilies: ConstructionFamily[] = [];
  const used = new Set<ConstructionFamily>();

  // Round 1: 1 from each of the 5 non-card buckets (5 distinct silhouettes)
  for (const bIdx of nonCardIndices) {
    const fam = shuffledBuckets[bIdx][0];
    if (fam && !used.has(fam)) {
      orderedFamilies.push(fam);
      used.add(fam);
    }
  }

  // Round 2: 1 architectural card (slot 6)
  const cardFam = shuffledBuckets[5][0];
  if (cardFam && !used.has(cardFam)) {
    orderedFamilies.push(cardFam);
    used.add(cardFam);
  }

  // Round 3: second pick from each of the 5 non-card buckets
  for (const bIdx of nonCardIndices) {
    const fam = shuffledBuckets[bIdx][1];
    if (fam && !used.has(fam)) {
      orderedFamilies.push(fam);
      used.add(fam);
    }
  }

  // Append remaining families from all buckets if count > orderedFamilies.length
  for (const bucket of shuffledBuckets) {
    for (const fam of bucket) {
      if (!used.has(fam)) {
        orderedFamilies.push(fam);
        used.add(fam);
      }
    }
  }

  const results: ConstructionSpec[] = [];

  for (let slot = 0; slot < count; slot++) {
    const fam = orderedFamilies[slot % orderedFamilies.length];
    const slotSeed =
      (baseSeed ^
        Math.imul(slot + 1, 0x85ebca6b) ^
        Math.imul(remixSeed + 1, 0xc2b2ae35)) >>>
        0 || 1;

    let chosenSpec = instantiateFamily(fam, slotSeed, 0);
    for (let attempt = 0; attempt < 6; attempt++) {
      const candidate = instantiateFamily(fam, slotSeed, attempt);
      const check = validateConstructionSpec(candidate);
      if (check.valid) {
        chosenSpec = candidate;
        break;
      }
    }
    results.push(chosenSpec);
  }

  return results;
}
