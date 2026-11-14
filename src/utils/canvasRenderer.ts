import { LogoState, LogoVariant } from '../types/logo';
import { getCropZone, ATOM_FIT_FILL } from './atomSpec';
import { computeLockupLayout, LockupLayoutResult } from './lockupLayout';

export function loadSvgToImage(svgString: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image() as HTMLImageElement & { __emblemBleedRatio?: number };
    const vbMatch = svgString.match(/viewBox=["']([^"']+)["']/i);
    if (vbMatch) {
      const parts = vbMatch[1].trim().split(/[\s,]+/).map(Number);
      if (parts.length === 4 && Number.isFinite(parts[0]) && parts[0] < 0) {
        img.__emblemBleedRatio = Math.abs(parts[0]) / 200;
      }
    }
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

function applyCanvasLetterSpacing(ctx: CanvasRenderingContext2D, trackingPx: number) {
  if ('letterSpacing' in ctx) {
    (ctx as unknown as { letterSpacing: string }).letterSpacing = `${trackingPx}px`;
  }
}

/**
 * Draws the logo on canvas using the unified lockup layout engine.
 * Supports pixelRatio for crisp high-DPI raster exports without distortion.
 */
export function drawLogoOnCanvas(
  canvas: HTMLCanvasElement,
  iconImg: HTMLImageElement | null,
  cfg: LogoState | LogoVariant,
  W: number,
  H: number,
  isSquare: boolean,
  showSafeGrid = false,
  pixelRatio = 1
): LockupLayoutResult | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const ratio = pixelRatio || 1;
  canvas.width = Math.round(W * ratio);
  canvas.height = Math.round(H * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const bgMode = (cfg as LogoState).bgMode || 'white';
  let w1Color = cfg.primary;
  let w2Color = cfg.secondary;

  if (bgMode === 'dark') {
    ctx.fillStyle = '#07090E';
    ctx.fillRect(0, 0, W, H);
    w1Color = '#F8FAFC';
    w2Color = cfg.accent || '#38BDF8';
  } else if (bgMode === 'transparent') {
    ctx.clearRect(0, 0, W, H);
  } else if (bgMode === 'brand') {
    ctx.fillStyle = cfg.primary;
    ctx.fillRect(0, 0, W, H);
    w1Color = '#FFFFFF';
    w2Color = cfg.accent || '#FACC15';
  } else {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);
  }

  const cropZone = getCropZone(W, H);

  if ((cfg as LogoState).rasterMode && (cfg as LogoState).rasterDataUrl) {
    const rImg = new Image();
    rImg.onload = () => {
      const mScale = (cfg as LogoState).masterScale ?? 1.0;
      const fillRatio = Math.min(1.0, ATOM_FIT_FILL * mScale);
      const targetW = cropZone.w * fillRatio;
      const targetH = cropZone.h * fillRatio;
      const sM = Math.min(targetW / rImg.width, targetH / rImg.height);
      const drawW = rImg.width * sM;
      const drawH = rImg.height * sM;
      const drawX = (W - drawW) / 2;
      const drawY = (H - drawH) / 2;
      ctx.drawImage(rImg, drawX, drawY, drawW, drawH);

      if (showSafeGrid) {
        ctx.save();
        ctx.strokeStyle = '#ff5a36';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(cropZone.x, cropZone.y, cropZone.w, cropZone.h);
        ctx.restore();
      }
    };
    rImg.src = (cfg as LogoState).rasterDataUrl!;
    return null;
  }

  // Unified lockup layout
  const layout = computeLockupLayout(ctx, cfg, W, H, isSquare);

  // 1. Draw Emblem (aligned with any SVG viewBox bleed margin so scaled/offset layers never clip)
  if (iconImg && layout.emblem.show) {
    const bleed = (iconImg as HTMLImageElement & { __emblemBleedRatio?: number }).__emblemBleedRatio || 0;
    const drawX = layout.emblem.x - layout.emblem.size * bleed;
    const drawY = layout.emblem.y - layout.emblem.size * bleed;
    const drawSize = layout.emblem.size * (1 + bleed * 2);
    ctx.drawImage(iconImg, drawX, drawY, drawSize, drawSize);
  }

  // 2. Draw Word 1 (with optional 45° stencil cut via offscreen destination-out layer)
  if (
    layout.wordmarkAccent?.mode === 'stencil-slice-45' &&
    layout.wordmarkAccent.slicePolygon &&
    typeof document !== 'undefined'
  ) {
    const off = document.createElement('canvas');
    off.width = Math.round(W * ratio);
    off.height = Math.round(H * ratio);
    const octx = off.getContext('2d');
    if (octx) {
      octx.setTransform(ratio, 0, 0, ratio, 0, 0);
      octx.textBaseline = 'alphabetic';
      applyCanvasLetterSpacing(octx, layout.w1.trackingPx);
      octx.font = `${layout.w1.fontWeight} ${layout.w1.fontSize}px "${layout.fontFamily}", sans-serif`;
      octx.fillStyle = w1Color;
      octx.fillText(layout.w1.text, layout.w1.x, layout.w1.y);

      // Punch out the 45° diagonal cut polygon
      octx.globalCompositeOperation = 'destination-out';
      const poly = layout.wordmarkAccent.slicePolygon;
      octx.beginPath();
      octx.moveTo(poly[0].x, poly[0].y);
      for (let i = 1; i < poly.length; i++) {
        octx.lineTo(poly[i].x, poly[i].y);
      }
      octx.closePath();
      octx.fill();

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(off, 0, 0);
      ctx.restore();
    }
  } else {
    ctx.save();
    ctx.textBaseline = 'alphabetic';
    applyCanvasLetterSpacing(ctx, layout.w1.trackingPx);
    ctx.font = `${layout.w1.fontWeight} ${layout.w1.fontSize}px "${layout.fontFamily}", sans-serif`;
    ctx.fillStyle = w1Color;
    ctx.fillText(layout.w1.text, layout.w1.x, layout.w1.y);
    ctx.restore();
  }

  // 3. Draw Word 2 (if present)
  if (layout.w2) {
    ctx.save();
    ctx.textBaseline = 'alphabetic';
    applyCanvasLetterSpacing(ctx, layout.w2.trackingPx);
    ctx.font = `${layout.w2.fontWeight} ${layout.w2.fontSize}px "${layout.fontFamily}", sans-serif`;
    ctx.fillStyle = w2Color;
    ctx.fillText(layout.w2.text, layout.w2.x, layout.w2.y);
    ctx.restore();
  }

  // 3b. Draw Word 3 (if present — alternates back to w1Color & w1 weight for 3-word hierarchy)
  if (layout.w3) {
    ctx.save();
    ctx.textBaseline = 'alphabetic';
    applyCanvasLetterSpacing(ctx, layout.w3.trackingPx);
    ctx.font = `${layout.w3.fontWeight} ${layout.w3.fontSize}px "${layout.fontFamily}", sans-serif`;
    ctx.fillStyle = w1Color;
    ctx.fillText(layout.w3.text, layout.w3.x, layout.w3.y);
    ctx.restore();
  }

  // 4. Draw Wordmark Accent (spark-dot or stencil wedge)
  if (layout.wordmarkAccent) {
    const wa = layout.wordmarkAccent;
    if (
      wa.mode === 'spark-dot' &&
      wa.sparkCx !== undefined &&
      wa.sparkCy !== undefined &&
      wa.sparkRadius !== undefined
    ) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(wa.sparkCx, wa.sparkCy, wa.sparkRadius, 0, Math.PI * 2);
      ctx.fillStyle = wa.color;
      ctx.fill();
      ctx.restore();
    } else if (wa.mode === 'stencil-slice-45' && wa.wedgePolygon && wa.wedgePolygon.length >= 3) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(wa.wedgePolygon[0].x, wa.wedgePolygon[0].y);
      for (let i = 1; i < wa.wedgePolygon.length; i++) {
        ctx.lineTo(wa.wedgePolygon[i].x, wa.wedgePolygon[i].y);
      }
      ctx.closePath();
      ctx.fillStyle = wa.color;
      ctx.fill();
      ctx.restore();
    }
  }

  // 5. Draw Dot Badge (if active)
  if (layout.dotBadge) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(layout.dotBadge.cx, layout.dotBadge.cy, layout.dotBadge.radius, 0, Math.PI * 2);
    ctx.fillStyle = layout.dotBadge.color;
    ctx.fill();
    ctx.restore();
  }

  // 6. Draw Extension Block across all 5 extStyle modes
  if (layout.extPill) {
    const ep = layout.extPill;
    ctx.save();
    if (ep.style === 'inline' || ep.style === 'superscript') {
      ctx.textBaseline = 'alphabetic';
      applyCanvasLetterSpacing(ctx, ep.style === 'superscript' ? 0.5 : 0);
      ctx.font = `${ep.fontWeight} ${ep.fontSize}px "${ep.fontFamily}", sans-serif`;
      ctx.fillStyle = ep.textColor;
      ctx.fillText(ep.text, ep.textX, ep.textY);
    } else if (ep.style === 'dot') {
      if (ep.dotCx !== undefined && ep.dotCy !== undefined && ep.dotRadius !== undefined) {
        ctx.beginPath();
        ctx.arc(ep.dotCx, ep.dotCy, ep.dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = ep.dotColor || cfg.accent;
        ctx.fill();
      }
      ctx.textBaseline = 'alphabetic';
      applyCanvasLetterSpacing(ctx, 0);
      ctx.font = `${ep.fontWeight} ${ep.fontSize}px "${ep.fontFamily}", sans-serif`;
      ctx.fillStyle = ep.textColor;
      ctx.fillText(ep.text, ep.textX, ep.textY);
    } else if (ep.style === 'tech-tag') {
      ctx.save();
      ctx.globalAlpha = ep.fillOpacity ?? 0.12;
      ctx.fillStyle = ep.color;
      ctx.beginPath();
      ctx.roundRect(ep.x, ep.y, ep.width, ep.height, ep.radius);
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = ep.strokeColor || ep.color;
      ctx.lineWidth = ep.strokeWidth ?? 1.5;
      ctx.beginPath();
      ctx.roundRect(ep.x, ep.y, ep.width, ep.height, ep.radius);
      ctx.stroke();

      ctx.textBaseline = 'alphabetic';
      applyCanvasLetterSpacing(ctx, 0.5);
      ctx.font = `${ep.fontWeight} ${ep.fontSize}px "${ep.fontFamily}", monospace`;
      ctx.fillStyle = ep.textColor;
      ctx.fillText(ep.text, ep.textX, ep.textY);
    } else {
      // 'pill'
      ctx.fillStyle = ep.color;
      ctx.beginPath();
      ctx.roundRect(ep.x, ep.y, ep.width, ep.height, ep.radius);
      ctx.fill();

      ctx.textBaseline = 'alphabetic';
      applyCanvasLetterSpacing(ctx, 0);
      ctx.font = `${ep.fontWeight} ${ep.fontSize}px "${ep.fontFamily}", sans-serif`;
      ctx.fillStyle = ep.textColor;
      ctx.fillText(ep.text, ep.textX, ep.textY);
    }
    ctx.restore();
  }

  // 7. Draw Tagline (if active)
  if (layout.tagline) {
    ctx.save();
    ctx.textBaseline = 'alphabetic';
    applyCanvasLetterSpacing(ctx, layout.tagline.tracking);
    ctx.font = `600 ${layout.tagline.fontSize}px "${layout.fontFamily}", sans-serif`;
    ctx.fillStyle = layout.tagline.color;
    ctx.fillText(layout.tagline.text, layout.tagline.x, layout.tagline.y);
    ctx.restore();
  }

  // 8. Safe Crop Zone (80% Default Crop Rectangle)
  if (showSafeGrid) {
    ctx.save();
    ctx.strokeStyle = '#ff5a36';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(layout.cropZone.x, layout.cropZone.y, layout.cropZone.w, layout.cropZone.h);
    ctx.restore();
  }

  return layout;
}
