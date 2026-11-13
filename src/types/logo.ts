import { DomainIconGroups } from '../data/domainIconGroups';

export type EmblemContainerStyle =
  | 'cutoutCorner'
  | 'monogramSeal'
  | 'isoHexCube'
  | 'bauhausGrid'
  | 'offsetNeo'
  | 'swissSeal'
  | 'slashCapsule'
  | 'shieldCrest'
  | 'vennPortal'
  | 'minimalistSpark'
  | 'squircle'
  | 'pureIcon';

export type ConstructionFamily =
  | 'cornerCut' | 'splitPanel' | 'isoSolid' | 'gridBlocks' | 'offsetShadow' | 'orbitRing'
  | 'slashBand' | 'crest' | 'overlapPair' | 'bareMark' | 'arch' | 'notchTab'
  | 'stackedBars' | 'quarterArcs' | 'diamondFacet' | 'pillSplit' | 'bracketFrame' | 'foldedCorner'
  | 'halfTone' | 'petalRing' | 'stepStair' | 'ribbonFold' | 'windowQuad' | 'tiltCard'
  | 'hexBadge' | 'octaGem' | 'teardropPin' | 'chevronWing' | 'parallelogramSlant' | 'crossPlus'
  | 'keystoneTrap' | 'starBurst' | 'capsuleWave' | 'crownPeak' | 'ticketStub' | 'prismTriangle';

export interface ConstructionSpec {
  id: string;              // stable id: `${family}-${seed.toString(36)}`
  family: ConstructionFamily;
  label: string;           // human name shown in the UI, e.g. "Notch Tab · Soft"
  params: Record<string, number | string | boolean>;
  seed: number;
}

export type TypoContrastStyle =
  | 'bold-bold'
  | 'heavy-light'
  | 'light-heavy'
  | 'upper-tracked'
  | 'dot-badge'
  | 'mono-tech'
  | 'serif-editorial';

export type MainLayoutMode = 'horizontal' | 'stacked' | 'horizontal-reverse' | 'icon-only' | 'wordmark-only';

export type CanvasBackgroundMode = 'white' | 'dark' | 'transparent' | 'brand';

export interface ColorPalette {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background?: string;
}

export interface LogoState {
  domain: string;
  brandName: string;
  word1: string;
  word2: string;
  ext: string;
  keepExt: boolean;
  extStyle: 'superscript' | 'pill' | 'inline' | 'dot';
  tagline: string;
  showTagline: boolean;
  taglineFont: string;
  taglineTracking: number;
  
  // Typography
  typoContrast: TypoContrastStyle;
  fontFamily: string;
  fontFamily2?: string;
  fontWeight1: string;
  fontWeight2: string;
  letterCase1: 'as-is' | 'uppercase' | 'lowercase' | 'capitalize';
  letterCase2: 'as-is' | 'uppercase' | 'lowercase' | 'capitalize';
  tracking: number;

  // Emblem & Vector Mark
  activeIcon: string;
  customSvgPath?: string;
  containerStyle: EmblemContainerStyle;
  construction?: ConstructionSpec;
  iconStrokeWidth: number;
  iconRotation: number;
  iconFlipH: boolean;
  iconFlipV: boolean;
  emblemPadding: number;
  emblemCornerRadius: number;

  // Colors
  primary: string;
  secondary: string;
  accent: string;
  backgroundColor: string;
  bgMode: CanvasBackgroundMode;

  // Layout & Optics
  mainLayout: MainLayoutMode;
  masterScale: number;
  iconScale: number;
  gap: number;
  baselineOffset: number;

  // Niche classification
  nicheLabel: string;
  icons10: string[];
  iconGroups?: DomainIconGroups;

  // Raster mode fallback (if user pasted raster image)
  rasterMode: boolean;
  rasterDataUrl: string | null;

  // 10 Variants
  variants10: LogoVariant[];
  activeVariantIndex: number;
}

export interface LogoVariant {
  id: number;
  domain: string;
  word1: string;
  word2: string;
  ext: string;
  keepExt: boolean;
  typoContrast: TypoContrastStyle;
  activeIcon: string;
  customSvgPath?: string;
  containerStyle: EmblemContainerStyle;
  construction?: ConstructionSpec;
  primary: string;
  secondary: string;
  accent: string;
  fontFamily: string;
  mainLayout: MainLayoutMode;
  tracking: number;
  gap: number;
  tagline?: string;
  showTagline?: boolean;
}

export interface NicheIconPack {
  label: string;
  paletteIdx: number;
  icons: string[];
}

