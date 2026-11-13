import { LogoState, LogoVariant, TypoContrastStyle } from '../types/logo';
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
}

export interface ExtensionPillLayout {
  show: boolean;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  fontSize: number;
  color: string;
  textColor: string;
  textX: number;
  textY: number;
}

export interface DotBadgeLayout {
  show: boolean;
  cx: number;
  cy: number;
  radius: number;
  color: string;
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
  isSquare: boolean;
  useHorizontal: boolean;
  emblem: EmblemLayout;
  w1: WordLayout;
  w2: WordLayout | null;
  dotBadge: DotBadgeLayout | null;
  extPill: ExtensionPillLayout | null;
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

/**
 * Computes the unified layout and bounding box for both Canvas and SVG rendering.
 * Guarantees that the bounding box fits completely inside Atom.com's crop zone (central 80%).
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

  const mScale = (cfg as LogoState).masterScale ?? 1.0;
  const iScale = (cfg as LogoState).iconScale ?? 1.0;

  const cropZone = getCropZone(W, H);

  // Target safe fill inside crop zone
  const requestedFill = ATOM_FIT_FILL * mScale;
  const safeFill = Math.min(1.0, requestedFill);
  let isClamped = requestedFill > 1.0;

  const maxTargetW = cropZone.w * safeFill;
  const maxTargetH = cropZone.h * safeFill;

  const useHorizontal = !isSquare && cfg.mainLayout !== 'stacked';

  // Target dimensions
  const targetW = maxTargetW;
  const targetH = useHorizontal ? Math.min(maxTargetH, H * 0.60) : maxTargetH;

  // Sizing reference
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

  // Helper to measure lockup geometry at a specific scale
  const measureAtScale = (fontSize: number, iconSize: number, gapSize: number) => {
    let w1Width = 0;
    let w1Ascent = fontSize * 0.72;
    let w1Descent = fontSize * 0.18;

    let w2Width = 0;
    let w2Ascent = fontSize * 0.72;
    let w2Descent = fontSize * 0.18;

    if (ctx) {
      ctx.save();
      applyCanvasLetterSpacing(ctx, tracking);

      ctx.font = `${weights.w1} ${fontSize}px "${fontFam}", sans-serif`;
      const m1 = ctx.measureText(w1Text);
      w1Width = m1.width;
      w1Ascent = m1.actualBoundingBoxAscent || fontSize * 0.72;
      w1Descent = m1.actualBoundingBoxDescent || fontSize * 0.18;

      if (!isSingle) {
        ctx.font = `${weights.w2} ${fontSize}px "${fontFam}", sans-serif`;
        const m2 = ctx.measureText(w2Text);
        w2Width = m2.width;
        w2Ascent = m2.actualBoundingBoxAscent || fontSize * 0.72;
        w2Descent = m2.actualBoundingBoxDescent || fontSize * 0.18;
      }
      ctx.restore();
    } else {
      // Fallback if no canvas context
      const ratio = weights.isUpper ? 0.68 : 0.54;
      w1Width = w1Text.length * fontSize * ratio;
      w2Width = isSingle ? 0 : w2Text.length * fontSize * ratio;
    }

    // Dot badge
    let dotBadgeW = 0;
    const hasDotBadge = cfg.typoContrast === 'dot-badge' && !cfg.keepExt && isSingle;
    if (hasDotBadge) {
      dotBadgeW = fontSize * 0.22;
    }

    // Extension pill
    let pillW = 0;
    let pillH = 0;
    let pillOffset = 0;
    let extFontSize = 0;
    const hasExt = Boolean(cfg.keepExt && cfg.ext);
    if (hasExt) {
      extFontSize = Math.round(fontSize * 0.52);
      let extTextW = cfg.ext!.length * extFontSize * 0.65;
      if (ctx) {
        ctx.save();
        applyCanvasLetterSpacing(ctx, 0);
        ctx.font = `700 ${extFontSize}px "${fontFam}", sans-serif`;
        extTextW = ctx.measureText(cfg.ext!).width;
        ctx.restore();
      }
      const padX = fontSize * 0.12;
      pillW = extTextW + padX * 2;
      pillH = extFontSize * 1.35;
      pillOffset = fontSize * 0.08;
    }

    // Words + badges width
    const wordsTotalW = w1Width + w2Width + dotBadgeW + (hasExt ? pillOffset + pillW : 0);

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
        tagW = tm.width;
        tagAscent = tm.actualBoundingBoxAscent || tagFontSize * 0.72;
        tagDescent = tm.actualBoundingBoxDescent || tagFontSize * 0.18;
        ctx.restore();
      } else {
        tagW = tagText.length * tagFontSize * 0.65;
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
      w1Width,
      w1Ascent,
      w1Descent,
      w2Width,
      w2Ascent,
      w2Descent,
      ascent,
      descent,
      hasDotBadge,
      dotBadgeW,
      hasExt,
      pillW,
      pillH,
      pillOffset,
      extFontSize,
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

    // Center lockup horizontally and vertically
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
    // Stacked mode
    const textBlockW = Math.max(m.wordsTotalW, m.tagW);
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

  // Exact Bounding Box centered on canvas
  const bboxW = maxInkX - minInkX;
  const bboxH = maxInkY - minInkY;

  // Perfect optical re-centering
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
  };

  // Word 2 layout
  let curX = wordmarkStartX + m.w1Width;
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
    };
    curX += m.w2Width;
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

  // Extension Pill layout
  let extPill: ExtensionPillLayout | null = null;
  if (m.hasExt && cfg.ext) {
    const pillX = curX + m.pillOffset;
    const pillY = baselineY - m.extFontSize * 1.05;
    const padX = baseFontSize * 0.12;
    extPill = {
      show: true,
      text: cfg.ext,
      x: pillX,
      y: pillY,
      width: m.pillW,
      height: m.pillH,
      radius: m.pillH / 2,
      fontSize: m.extFontSize,
      color: cfg.secondary,
      textColor: '#FFFFFF',
      textX: pillX + padX,
      textY: baselineY - m.extFontSize * 0.12,
    };
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

  // Check against Atom's default crop zone
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
    tagline,
    boundingBox,
    cropZone,
    isClamped,
    isCutByDefaultCrop,
    cutDetails,
  };
}
