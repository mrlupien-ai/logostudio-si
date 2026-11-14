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

export type ExtStyle = 'inline' | 'superscript' | 'pill' | 'dot' | 'tech-tag';
export type WordmarkAccentMode = 'none' | 'spark-dot' | 'stencil-slice-45';
export type EmblemFusionMode = 'single' | 'monogram-negative' | 'dual-badge';
export type MotionPreset = 'none' | 'draw-stroke' | 'kinetic-spin' | 'ambient-pulse';

export interface LogoState {
  domain: string;
  brandName: string;
  word1: string;
  word2: string;
  word3?: string;
  ext: string;
  keepExt: boolean;
  extStyle: ExtStyle;
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
  letterCase3?: 'as-is' | 'uppercase' | 'lowercase' | 'capitalize';
  tracking: number;
  tracking1Em: number;
  tracking2Em: number;
  wordmarkAccent: WordmarkAccentMode;

  // Emblem & Vector Mark
  activeIcon: string;
  secondaryIcon: string;
  emblemFusion: EmblemFusionMode;
  motionPreset: MotionPreset;
  customSvgPath?: string;
  containerStyle: EmblemContainerStyle;
  construction?: ConstructionSpec;
  iconStrokeWidth: number;
  iconRotation: number;
  iconFlipH: boolean;
  iconFlipV: boolean;
  emblemPadding: number;
  emblemCornerRadius: number;

  // Independent Fundal (Backdrop) & Icon Layer Controls
  showEmblemBg?: boolean;
  showEmblemIcon?: boolean;
  emblemBgColor?: string;
  emblemBgAccentColor?: string;
  emblemIconColor?: string;
  emblemBgScale?: number;
  emblemBgOffsetX?: number;
  emblemBgOffsetY?: number;
  emblemIconScale?: number;
  emblemIconOffsetX?: number;
  emblemIconOffsetY?: number;

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

  // Marketplace Listing Details (optional, user-editable)
  listingPrice?: string;
  leaseMonthly?: string;
  minOffer?: string;

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
  word3?: string;
  letterCase3?: 'as-is' | 'uppercase' | 'lowercase' | 'capitalize';
  ext: string;
  keepExt: boolean;
  extStyle?: ExtStyle;
  typoContrast: TypoContrastStyle;
  activeIcon: string;
  secondaryIcon?: string;
  emblemFusion?: EmblemFusionMode;
  wordmarkAccent?: WordmarkAccentMode;
  tracking1Em?: number;
  tracking2Em?: number;
  customSvgPath?: string;
  containerStyle: EmblemContainerStyle;
  construction?: ConstructionSpec;
  showEmblemBg?: boolean;
  showEmblemIcon?: boolean;
  emblemBgColor?: string;
  emblemBgAccentColor?: string;
  emblemIconColor?: string;
  emblemBgScale?: number;
  emblemBgOffsetX?: number;
  emblemBgOffsetY?: number;
  emblemIconScale?: number;
  emblemIconOffsetX?: number;
  emblemIconOffsetY?: number;
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

