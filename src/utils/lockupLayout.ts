import { ExtStyle, LogoState, LogoVariant, WordmarkAccentMode } from '../types/logo';
import { ATOM_FIT_FILL, getCropZone, CropZone } from './atomSpec';
import { getTypographicWeights, formatWordText } from './svgBuilder';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WordLayout {
  text: string;
  x: number;
  y: number; // alphabetic baseline Y
  fontSize: number;
  fontWeight: string;
  color: string;
  width: number;
  trackingPx: number;
}

export interface ExtensionPillLayout {
  show: boolean;
  style: ExtStyle;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  fontSize: number;
  fontWeight: string;
  fontFamily: string;
  color: string;
  textColor: string;
  textX: number;
  textY: number;
  dotCx?: number;
  dotCy?: number;
  dotRadius?: number;
  dotColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  fillOpacity?: number;
}

export interface DotBadgeLayout {
  show: boolean;
  cx: number;
  cy: number;
  radius: number;
  color: string;
}

export interface WordmarkAccentLayout {
  mode: WordmarkAccentMode;
  color: string;
  // For 'spark-dot'
  sparkCx?: number;
  sparkCy?: number;
  sparkRadius?: number;
  // For 'stencil-slice-45'
  sliceCenterX?: number;
  sliceCenterY?: number;
  sliceWidth?: number;
  sliceLength?: number;
  slicePolygon?: Array<{ x: number; y: number }>;
  wedgePolygon?: Array<{ x: number; y: number }>;
}

export interface TaglineLayout {
  show: boolean;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  tracking: number;
  color: string;
  width: number;
}

export interface EmblemLayout {
  show: boolean;
  x: number;
  y: number;
  size: number;
}

export interface LockupLayoutResult {
  baseFontSize: number;
  emblemSize: number;
  gap: number;
  fontFamily: string;
  tracking: number;
  tracking1Px: number;
  tracking2Px: number;
  isSquare: boolean;
  useHorizontal: boolean;
  emblem: EmblemLayout;
  w1: WordLayout;
  w2: WordLayout | null;
  dotBadge: DotBadgeLayout | null;
  extPill: ExtensionPillLayout | null;
  wordmarkAccent: WordmarkAccentLayout | null;
  tagline: TaglineLayout | null;
  boundingBox: BoundingBox;
  cropZone: CropZone;
  isClamped: boolean;
  isCutByDefaultCrop: boolean;
  cutDetails?: {
    side: 'left' | 'right' | 'top' | 'bottom';
    px: number;
  };
}

function applyCanvasLetterSpacing(ctx: CanvasRenderingContext2D, trackingPx: number) {
  if ('letterSpacing' in ctx) {
    (ctx as unknown as { letterSpacing: string }).letterSpacing = `${trackingPx}px`;
  }
}

function measureTrackedWordWidth(
  ctx: CanvasRenderingContext2D | null,
  text: string,
  weight: string,
  fontSize: number,
  fontFam: string,
  trackingPx: number,
  isUpper: boolean
): { width: number; ascent: number; descent: number } {
  if (!text) {
    return { width: 0, ascent: fontSize * 0.72, descent: fontSize * 0.18 };
  }
  if (ctx) {
    ctx.save();
    applyCanvasLetterSpacing(ctx, 0);
    ctx.font = `${weight} ${fontSize}px "${fontFam}", sans-serif`;
    const m0 = ctx.measureText(text);
    const baseW = m0.width;
    const ascent = m0.actualBoundingBoxAscent || fontSize * 0.72;
    const descent = m0.actualBoundingBoxDescent || fontSize * 0.18;

    applyCanvasLetterSpacing(ctx, trackingPx);
    const mTracked = ctx.measureText(text);
    ctx.restore();

    const manualTrackedW = baseW + Math.max(0, text.length - 1) * trackingPx;
    return {
      width: Math.max(mTracked.width, manualTrackedW),
      ascent,
      descent,
    };
  }
  const ratio = isUpper ? 0.68 : 0.56;
  return {
    width: text.length * fontSize * ratio + Math.max(0, text.length - 1) * trackingPx,
    ascent: fontSize * 0.72,
    descent: fontSize * 0.18,
  };
}

/**
 * Computes the unified layout and bounding box for both Canvas and SVG rendering.
 * Guarantees that the bounding box fits completely inside the central 80% safe crop zone.
 */
export function computeLockupLayout(
  providedCtx: CanvasRenderingContext2D | null,
  cfg: LogoState | LogoVariant,
  W: number,
  H: number,
  isSquare: boolean
): LockupLayoutResult {
  let ctx = providedCtx;
  if (!ctx && typeof document !== 'undefined') {
    const offscreen = document.createElement('canvas');
    offscreen.width = W;
    offscreen.height = H;
    ctx = offscreen.getContext('2d');
  }

  const weights = getTypographicWeights(cfg.typoContrast);
  const fontFam = weights.forceSerif
    ? 'Playfair Display'
    : weights.forceMono
    ? 'JetBrains Mono'
    : cfg.fontFamily || 'Plus Jakarta Sans';

  const rawTracking = (cfg as LogoState).tracking ?? -1.5;
  const tracking = weights.isUpper ? Math.max(2, rawTracking + 3) : rawTracking;

  const rawW1 = cfg.word1 || '';
  const rawW2 = cfg.word2 || '';
  const w1Text = formatWordText(rawW1, (cfg as LogoState).letterCase1 || 'as-is', weights.isUpper);
  const w2Text = formatWordText(rawW2, (cfg as LogoState).letterCase2 || 'as-is', weights.isUpper);
  const isSingle = !w2Text;

  const extStyle: ExtStyle = (cfg as LogoState).extStyle || 'pill';
  const wordmarkAccentMode: WordmarkAccentMode = (cfg as LogoState).wordmarkAccent || 'none';

  const mScale = (cfg as LogoState).masterScale ?? 1.0;
  const iScale = (cfg as LogoState).iconScale ?? 1.0;

  const cropZone = getCropZone(W, H);

  // Target safe fill inside crop zone
  const requestedFill = ATOM_FIT_FILL * mScale;
  const safeFill = Math.min(1.0, requestedFill);
  let isClamped = requestedFill > 1.0;

  const maxTargetW = cropZone.w * safeFill;
  const maxTargetH = cropZone.h * safeFill;

  let useHorizontal = !isSquare && cfg.mainLayout !== 'stacked';
  // Defect 7 fix: on compact concept thumbnails (W <= 420), if a long wordmark exceeds 13 chars in horizontal mode,
  // switch the thumbnail to stacked mode so the wordmark remains crisp and legible.
  const combinedCharCount = w1Text.length + w2Text.length + (cfg.keepExt && cfg.ext ? cfg.ext.length : 0);
  if (W <= 420 && useHorizontal && combinedCharCount >= 14) {
    useHorizontal = false;
  }

  const targetW = maxTargetW;
  const targetH = useHorizontal ? Math.min(maxTargetH, H * 0.60) : maxTargetH;

  let refFontSize: number;
  let refIconSize: number;
  let refGap: number;

  if (useHorizontal) {
    refFontSize = 100;
    refIconSize = 155 * iScale;
    refGap = (((cfg as LogoState).gap ?? 26) / 26) * 32;
  } else {
    refFontSize = isSquare ? 86 : 74;
    refIconSize = (isSquare ? 230 : 160) * iScale;
    refGap = (((cfg as LogoState).gap ?? 26) / 26) * (isSquare ? 26 : 22);
  }

  const getWordTrackPx = (fontSize: number) => {
    const t1Em = (cfg as LogoState).tracking1Em;
    const t2Em = (cfg as LogoState).tracking2Em;
    const upperBoost = weights.isUpper ? 0.04 * fontSize : 0;
    const t1Px =
      t1Em !== undefined ? t1Em * fontSize + upperBoost : (tracking / 100) * fontSize;
    const t2Px =
      t2Em !== undefined ? t2Em * fontSize + upperBoost : (tracking / 100) * fontSize;
    return { t1Px, t2Px };
  };

  // Helper to measure lockup geometry at a specific scale
  const measureAtScale = (fontSize: number, iconSize: number, gapSize: number) => {
    const { t1Px, t2Px } = getWordTrackPx(fontSize);

    const m1 = measureTrackedWordWidth(
      ctx,
      w1Text,
      weights.w1,
      fontSize,
      fontFam,
      t1Px,
      weights.isUpper
    );
    const w1Width = m1.width;
    const w1Ascent = m1.ascent;
    const w1Descent = m1.descent;

    let w2Width = 0;
    let w2Ascent = fontSize * 0.72;
    let w2Descent = fontSize * 0.18;

    if (!isSingle) {
      const m2 = measureTrackedWordWidth(
        ctx,
        w2Text,
        weights.w2,
        fontSize,
        fontFam,
        t2Px,
        weights.isUpper
      );
      w2Width = m2.width;
      w2Ascent = m2.ascent;
      w2Descent = m2.descent;
    }

    // Small junction spacing when spark-dot is active between w1 and w2
    const wordJunctionGap =
      !isSingle && wordmarkAccentMode === 'spark-dot' ? Math.round(fontSize * 0.14) : 0;

    // Dot badge
    let dotBadgeW = 0;
    const hasDotBadge = cfg.typoContrast === 'dot-badge' && !cfg.keepExt && isSingle;
    if (hasDotBadge) {
      dotBadgeW = fontSize * 0.22;
    }

    // Extension block (supports 5 modes: inline, superscript, pill, dot, tech-tag)
    let pillW = 0;
    let pillH = 0;
    let pillOffset = 0;
    let extFontSize = 0;
    let extDisplayText = '';
    let extFontWeight = '700';
    let extFontFam = fontFam;
    const hasExt = Boolean(cfg.keepExt && cfg.ext);

    if (hasExt && cfg.ext) {
      const rawExt = cfg.ext.startsWith('.') ? cfg.ext : `.${cfg.ext}`;
      const bareExt = rawExt.replace(/^\./, '');

      if (extStyle === 'inline') {
        extDisplayText = rawExt;
        extFontSize = Math.round(fontSize * 0.78);
        extFontWeight = '500';
        pillOffset = Math.max(4, Math.round(fontSize * 0.08));
        const mExt = measureTrackedWordWidth(ctx, extDisplayText, extFontWeight, extFontSize, extFontFam, 0, false);
        pillW = mExt.width;
        pillH = extFontSize;
      } else if (extStyle === 'superscript') {
        extDisplayText = bareExt.toUpperCase();
        extFontSize = Math.round(fontSize * 0.42);
        extFontWeight = '800';
        pillOffset = Math.max(6, Math.round(fontSize * 0.12));
        const mExt = measureTrackedWordWidth(ctx, extDisplayText, extFontWeight, extFontSize, extFontFam, 0.5, true);
        pillW = mExt.width;
        pillH = extFontSize * 1.1;
      } else if (extStyle === 'dot') {
        extDisplayText = bareExt;
        extFontSize = Math.round(fontSize * 0.68);
        extFontWeight = '700';
        pillOffset = Math.max(6, Math.round(fontSize * 0.12));
        const dotR = fontSize * 0.085;
        const dotGap = fontSize * 0.08;
        const mExt = measureTrackedWordWidth(ctx, extDisplayText, extFontWeight, extFontSize, extFontFam, 0, false);
        pillW = dotR * 2 + dotGap + mExt.width;
        pillH = extFontSize;
      } else if (extStyle === 'tech-tag') {
        extDisplayText = rawExt.toUpperCase();
        extFontSize = Math.round(fontSize * 0.44);
        extFontWeight = '700';
        extFontFam = 'JetBrains Mono';
        pillOffset = Math.max(10, Math.round(fontSize * 0.18));
        const mExt = measureTrackedWordWidth(ctx, extDisplayText, extFontWeight, extFontSize, extFontFam, 0.5, true);
        const padX = fontSize * 0.13;
        pillW = mExt.width + padX * 2;
        pillH = extFontSize * 1.42;
      } else {
        // Default 'pill'
        extDisplayText = rawExt;
        extFontSize = Math.round(fontSize * 0.50);
        extFontWeight = '700';
        // Defect 12 fix: enforce >= 0.18 * fontSize gap before the TLD capsule so it never touches w2/w1
        pillOffset = Math.max(10, Math.round(fontSize * 0.18));
        const mExt = measureTrackedWordWidth(ctx, extDisplayText, extFontWeight, extFontSize, extFontFam, 0, false);
        const padX = fontSize * 0.14;
        pillW = mExt.width + padX * 2;
        pillH = extFontSize * 1.38;
      }
    }

    // Words + badges width
    const wordsTotalW =
      w1Width +
      wordJunctionGap +
      w2Width +
      dotBadgeW +
      (hasExt ? pillOffset + pillW : 0);

    // Tagline
    let tagW = 0;
    let tagH = 0;
    let tagFontSize = 0;
    let tagAscent = 0;
    let tagDescent = 0;
    const showTagline = Boolean((cfg as LogoState).showTagline && (cfg as LogoState).tagline);
    const tagText = showTagline ? (cfg as LogoState).tagline!.toUpperCase() : '';
    if (showTagline) {
      tagFontSize = Math.round(fontSize * 0.24);
      tagH = tagFontSize * 1.8;
      if (ctx) {
        ctx.save();
        applyCanvasLetterSpacing(ctx, 4);
        ctx.font = `600 ${tagFontSize}px "${fontFam}", sans-serif`;
        const tm = ctx.measureText(tagText);
        tagW = Math.max(tm.width, tagText.length * tagFontSize * 0.58 + Math.max(0, tagText.length - 1) * 4);
        tagAscent = tm.actualBoundingBoxAscent || tagFontSize * 0.72;
        tagDescent = tm.actualBoundingBoxDescent || tagFontSize * 0.18;
        ctx.restore();
      } else {
        tagW = tagText.length * tagFontSize * 0.65 + Math.max(0, tagText.length - 1) * 4;
        tagAscent = tagFontSize * 0.72;
        tagDescent = tagFontSize * 0.18;
      }
    }

    const ascent = Math.max(w1Ascent, w2Ascent);
    const descent = Math.max(w1Descent, w2Descent);

    let rawBboxW = 0;
    let rawBboxH = 0;

    if (useHorizontal) {
      const textBlockW = Math.max(wordsTotalW, tagW);
      rawBboxW = iconSize + gapSize + textBlockW;
      rawBboxH = Math.max(iconSize, ascent + descent + (showTagline ? tagH : 0));
    } else {
      const textBlockW = Math.max(wordsTotalW, tagW);
      rawBboxW = Math.max(iconSize, textBlockW);
      rawBboxH = iconSize + gapSize + ascent + descent + (showTagline ? tagH : 0);
    }

    return {
      t1Px,
      t2Px,
      w1Width,
      w1Ascent,
      w1Descent,
      w2Width,
      w2Ascent,
      w2Descent,
      wordJunctionGap,
      ascent,
      descent,
      hasDotBadge,
      dotBadgeW,
      hasExt,
      pillW,
      pillH,
      pillOffset,
      extFontSize,
      extDisplayText,
      extFontWeight,
      extFontFam,
      showTagline,
      tagText,
      tagW,
      tagH,
      tagFontSize,
      tagAscent,
      tagDescent,
      wordsTotalW,
      rawBboxW,
      rawBboxH,
    };
  };

  // Step 1: Measure at reference size
  const refM = measureAtScale(refFontSize, refIconSize, refGap);
  const initialFitScale = Math.min(targetW / refM.rawBboxW, targetH / refM.rawBboxH);

  let baseFontSize = Math.round(refFontSize * initialFitScale);
  let emblemSize = Math.round(refIconSize * initialFitScale);
  let gap = Math.round(refGap * initialFitScale);

  // Step 2: Measure at computed size
  let m = measureAtScale(baseFontSize, emblemSize, gap);

  // Step 3: Verify and clamp strictly inside cropZone
  const maxAllowedW = cropZone.w;
  const maxAllowedH = useHorizontal ? Math.min(cropZone.h, H * 0.60) : cropZone.h;

  if (m.rawBboxW > maxAllowedW || m.rawBboxH > maxAllowedH) {
    const shrink = Math.min(maxAllowedW / m.rawBboxW, maxAllowedH / m.rawBboxH);
    baseFontSize = Math.max(12, Math.floor(baseFontSize * shrink));
    emblemSize = Math.max(16, Math.floor(emblemSize * shrink));
    gap = Math.max(4, Math.floor(gap * shrink));
    isClamped = true;
    m = measureAtScale(baseFontSize, emblemSize, gap);
  }

  // Secondary fine safety check
  if (m.rawBboxW > cropZone.w || m.rawBboxH > cropZone.h) {
    const finalShrink = Math.min(cropZone.w / m.rawBboxW, cropZone.h / m.rawBboxH) * 0.99;
    baseFontSize = Math.max(12, Math.floor(baseFontSize * finalShrink));
    emblemSize = Math.max(16, Math.floor(emblemSize * finalShrink));
    gap = Math.max(4, Math.floor(gap * finalShrink));
    isClamped = true;
    m = measureAtScale(baseFontSize, emblemSize, gap);
  }

  // Step 4: Positioning and Centering on canvas center (W / 2, H / 2)
  let emblemX = 0;
  let emblemY = 0;
  let wordmarkStartX = 0;
  let baselineY = 0;

  let minInkX = 0;
  let maxInkX = 0;
  let minInkY = 0;
  let maxInkY = 0;

  if (useHorizontal) {
    const textBlockW = Math.max(m.wordsTotalW, m.tagW);
    const totalW = emblemSize + gap + textBlockW;

    const startX = (W - totalW) / 2;
    const centerY = H / 2;

    emblemX = startX;
    emblemY = centerY - emblemSize / 2;

    wordmarkStartX = startX + emblemSize + gap;
    baselineY = centerY + m.ascent / 2 - m.descent * 0.12;

    minInkX = startX;
    maxInkX = startX + totalW;

    minInkY = Math.min(emblemY, baselineY - m.ascent);
    maxInkY = Math.max(
      emblemY + emblemSize,
      baselineY + m.descent + (m.showTagline ? m.tagFontSize * 1.6 + m.tagDescent : 0)
    );
  } else {
    const totalH = emblemSize + gap + m.ascent + m.descent + (m.showTagline ? m.tagH : 0);

    const startY = (H - totalH) / 2;
    emblemX = (W - emblemSize) / 2;
    emblemY = startY;

    wordmarkStartX = (W - m.wordsTotalW) / 2;
    baselineY = startY + emblemSize + gap + m.ascent;

    minInkX = Math.min(emblemX, wordmarkStartX, (W - m.tagW) / 2);
    maxInkX = Math.max(emblemX + emblemSize, wordmarkStartX + m.wordsTotalW, (W + m.tagW) / 2);

    minInkY = emblemY;
    maxInkY = baselineY + m.descent + (m.showTagline ? m.tagFontSize * 1.6 + m.tagDescent : 0);
  }

  const bboxW = maxInkX - minInkX;
  const bboxH = maxInkY - minInkY;

  const centerShiftX = W / 2 - (minInkX + bboxW / 2);
  const centerShiftY = H / 2 - (minInkY + bboxH / 2);

  emblemX += centerShiftX;
  emblemY += centerShiftY;
  wordmarkStartX += centerShiftX;
  baselineY += centerShiftY;
  minInkX += centerShiftX;
  maxInkX += centerShiftX;
  minInkY += centerShiftY;
  maxInkY += centerShiftY;

  const boundingBox: BoundingBox = {
    x: Math.round(minInkX * 10) / 10,
    y: Math.round(minInkY * 10) / 10,
    width: Math.round(bboxW * 10) / 10,
    height: Math.round(bboxH * 10) / 10,
  };

  // Word 1 layout
  const w1: WordLayout = {
    text: w1Text,
    x: wordmarkStartX,
    y: baselineY,
    fontSize: baseFontSize,
    fontWeight: weights.w1,
    color: cfg.primary,
    width: m.w1Width,
    trackingPx: m.t1Px,
  };

  // Word 2 layout
  let curX = wordmarkStartX + m.w1Width + m.wordJunctionGap;
  let w2: WordLayout | null = null;
  if (!isSingle) {
    w2 = {
      text: w2Text,
      x: curX,
      y: baselineY,
      fontSize: baseFontSize,
      fontWeight: weights.w2,
      color: cfg.secondary,
      width: m.w2Width,
      trackingPx: m.t2Px,
    };
    curX += m.w2Width;
  }

  // Wordmark Accent layout ('spark-dot' or 'stencil-slice-45')
  let wordmarkAccent: WordmarkAccentLayout | null = null;
  if (wordmarkAccentMode === 'spark-dot') {
    const sparkR = Math.max(3.5, baseFontSize * 0.082);
    const sparkCx = !isSingle
      ? wordmarkStartX + m.w1Width + m.wordJunctionGap * 0.5
      : wordmarkStartX + m.w1Width - baseFontSize * 0.14;
    const sparkCy = baselineY - m.ascent + sparkR * 0.85;
    wordmarkAccent = {
      mode: 'spark-dot',
      color: cfg.accent,
      sparkCx,
      sparkCy,
      sparkRadius: sparkR,
    };
  } else if (wordmarkAccentMode === 'stencil-slice-45') {
    // 45° diagonal cut through the first glyph of w1 + small accent wedge
    const firstGlyphW = Math.min(m.w1Width * 0.45, baseFontSize * 0.62);
    const cx = wordmarkStartX + firstGlyphW * 0.52;
    const cy = baselineY - m.ascent * 0.48;
    const sliceW = Math.max(3.5, baseFontSize * 0.055);
    const sliceLen = baseFontSize * 1.45;
    const rad = (-45 * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const nx = -sin;
    const ny = cos;
    const hw = sliceW / 2;
    const hl = sliceLen / 2;

    const slicePolygon = [
      { x: cx - cos * hl - nx * hw, y: cy - sin * hl - ny * hw },
      { x: cx + cos * hl - nx * hw, y: cy + sin * hl - ny * hw },
      { x: cx + cos * hl + nx * hw, y: cy + sin * hl + ny * hw },
      { x: cx - cos * hl + nx * hw, y: cy - sin * hl + ny * hw },
    ];

    const wedgeSize = Math.max(6, baseFontSize * 0.14);
    const wx = wordmarkStartX + firstGlyphW * 0.18;
    const wy = baselineY - m.ascent * 0.92;
    const wedgePolygon = [
      { x: wx, y: wy },
      { x: wx + wedgeSize, y: wy },
      { x: wx, y: wy + wedgeSize },
    ];

    wordmarkAccent = {
      mode: 'stencil-slice-45',
      color: cfg.accent,
      sliceCenterX: cx,
      sliceCenterY: cy,
      sliceWidth: sliceW,
      sliceLength: sliceLen,
      slicePolygon,
      wedgePolygon,
    };
  }

  // Dot Badge layout
  let dotBadge: DotBadgeLayout | null = null;
  if (m.hasDotBadge) {
    dotBadge = {
      show: true,
      cx: curX + baseFontSize * 0.12,
      cy: baselineY - baseFontSize * 0.12,
      radius: baseFontSize * 0.09,
      color: cfg.secondary,
    };
    curX += baseFontSize * 0.22;
  }

  // Extension Pill / Block layout across all 5 extStyle modes
  let extPill: ExtensionPillLayout | null = null;
  if (m.hasExt && cfg.ext) {
    const pillX = curX + m.pillOffset;

    if (extStyle === 'inline') {
      extPill = {
        show: true,
        style: 'inline',
        text: m.extDisplayText,
        x: pillX,
        y: baselineY - m.extFontSize,
        width: m.pillW,
        height: m.pillH,
        radius: 0,
        fontSize: m.extFontSize,
        fontWeight: m.extFontWeight,
        fontFamily: m.extFontFam,
        color: 'transparent',
        textColor: cfg.secondary,
        textX: pillX,
        textY: baselineY,
      };
    } else if (extStyle === 'superscript') {
      const supBaselineY = baselineY - m.ascent + m.extFontSize * 0.86;
      extPill = {
        show: true,
        style: 'superscript',
        text: m.extDisplayText,
        x: pillX,
        y: supBaselineY - m.extFontSize,
        width: m.pillW,
        height: m.pillH,
        radius: 0,
        fontSize: m.extFontSize,
        fontWeight: m.extFontWeight,
        fontFamily: m.extFontFam,
        color: 'transparent',
        textColor: cfg.accent,
        textX: pillX,
        textY: supBaselineY,
      };
    } else if (extStyle === 'dot') {
      const dotR = baseFontSize * 0.085;
      const dotCx = pillX + dotR;
      const dotCy = baselineY - baseFontSize * 0.12;
      const textX = pillX + dotR * 2 + baseFontSize * 0.08;
      extPill = {
        show: true,
        style: 'dot',
        text: m.extDisplayText,
        x: pillX,
        y: baselineY - m.extFontSize,
        width: m.pillW,
        height: m.pillH,
        radius: 0,
        fontSize: m.extFontSize,
        fontWeight: m.extFontWeight,
        fontFamily: m.extFontFam,
        color: 'transparent',
        textColor: cfg.secondary,
        textX,
        textY: baselineY,
        dotCx,
        dotCy,
        dotRadius: dotR,
        dotColor: cfg.accent,
      };
    } else if (extStyle === 'tech-tag') {
      const pillY = baselineY - m.extFontSize * 1.12;
      const padX = baseFontSize * 0.13;
      extPill = {
        show: true,
        style: 'tech-tag',
        text: m.extDisplayText,
        x: pillX,
        y: pillY,
        width: m.pillW,
        height: m.pillH,
        radius: 5,
        fontSize: m.extFontSize,
        fontWeight: m.extFontWeight,
        fontFamily: m.extFontFam,
        color: cfg.secondary,
        textColor: cfg.secondary,
        textX: pillX + padX,
        textY: pillY + m.pillH * 0.73,
        strokeColor: cfg.secondary,
        strokeWidth: 1.5,
        fillOpacity: 0.12,
      };
    } else {
      // 'pill'
      const pillY = baselineY - m.extFontSize * 1.06;
      const padX = baseFontSize * 0.14;
      extPill = {
        show: true,
        style: 'pill',
        text: m.extDisplayText,
        x: pillX,
        y: pillY,
        width: m.pillW,
        height: m.pillH,
        radius: m.pillH / 2,
        fontSize: m.extFontSize,
        fontWeight: m.extFontWeight,
        fontFamily: m.extFontFam,
        color: cfg.secondary,
        textColor: '#FFFFFF',
        textX: pillX + padX,
        textY: baselineY - m.extFontSize * 0.12,
      };
    }
    curX = pillX + m.pillW;
  }

  // Tagline layout
  let tagline: TaglineLayout | null = null;
  if (m.showTagline && m.tagText) {
    const tagX = useHorizontal ? wordmarkStartX + 2 : (W - m.tagW) / 2;
    const tagY = baselineY + m.tagFontSize * 1.6;
    tagline = {
      show: true,
      text: m.tagText,
      x: tagX,
      y: tagY,
      fontSize: m.tagFontSize,
      tracking: 4,
      color: cfg.secondary,
      width: m.tagW,
    };
  }

  // Check against central 80% safe crop zone
  let isCutByDefaultCrop = false;
  let cutDetails: { side: 'left' | 'right' | 'top' | 'bottom'; px: number } | undefined;

  const leftCut = cropZone.x - boundingBox.x;
  const rightCut = boundingBox.x + boundingBox.width - (cropZone.x + cropZone.w);
  const topCut = cropZone.y - boundingBox.y;
  const bottomCut = boundingBox.y + boundingBox.height - (cropZone.y + cropZone.h);

  if (leftCut > 0.5) {
    isCutByDefaultCrop = true;
    cutDetails = { side: 'left', px: Math.round(leftCut) };
  } else if (rightCut > 0.5) {
    isCutByDefaultCrop = true;
    cutDetails = { side: 'right', px: Math.round(rightCut) };
  } else if (topCut > 0.5) {
    isCutByDefaultCrop = true;
    cutDetails = { side: 'top', px: Math.round(topCut) };
  } else if (bottomCut > 0.5) {
    isCutByDefaultCrop = true;
    cutDetails = { side: 'bottom', px: Math.round(bottomCut) };
  }

  return {
    baseFontSize,
    emblemSize,
    gap,
    fontFamily: fontFam,
    tracking,
    tracking1Px: m.t1Px,
    tracking2Px: m.t2Px,
    isSquare,
    useHorizontal,
    emblem: {
      show: true,
      x: emblemX,
      y: emblemY,
      size: emblemSize,
    },
    w1,
    w2,
    dotBadge,
    extPill,
    wordmarkAccent,
    tagline,
    boundingBox,
    cropZone,
    isClamped,
    isCutByDefaultCrop,
    cutDetails,
  };
}
