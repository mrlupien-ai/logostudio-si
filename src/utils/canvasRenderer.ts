import { LogoState, LogoVariant } from '../types/logo';
import { getCropZone, ATOM_FIT_FILL } from './atomSpec';
import { computeLockupLayout, LockupLayoutResult } from './lockupLayout';

export function loadSvgToImage(svgString: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
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

  // Maximum subpixel sharpness & antialiasing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Background
  const bgMode = (cfg as LogoState).bgMode || 'white';
  if (bgMode === 'dark') {
    ctx.fillStyle = '#07090E';
    ctx.fillRect(0, 0, W, H);
  } else if (bgMode === 'transparent') {
    ctx.clearRect(0, 0, W, H);
  } else if (bgMode === 'brand') {
    ctx.fillStyle = cfg.primary;
    ctx.fillRect(0, 0, W, H);
  } else {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);
  }

  const cropZone = getCropZone(W, H);

  // Raster mode branch
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

  // 1. Draw Emblem
  if (iconImg && layout.emblem.show) {
    ctx.drawImage(
      iconImg,
      layout.emblem.x,
      layout.emblem.y,
      layout.emblem.size,
      layout.emblem.size
    );
  }

  // 2. Draw Word 1
  ctx.save();
  ctx.textBaseline = 'alphabetic';
  applyCanvasLetterSpacing(ctx, layout.tracking);
  ctx.font = `${layout.w1.fontWeight} ${layout.w1.fontSize}px "${layout.fontFamily}", sans-serif`;
  ctx.fillStyle = layout.w1.color;
  ctx.fillText(layout.w1.text, layout.w1.x, layout.w1.y);
  ctx.restore();

  // 3. Draw Word 2 (if present)
  if (layout.w2) {
    ctx.save();
    ctx.textBaseline = 'alphabetic';
    applyCanvasLetterSpacing(ctx, layout.tracking);
    ctx.font = `${layout.w2.fontWeight} ${layout.w2.fontSize}px "${layout.fontFamily}", sans-serif`;
    ctx.fillStyle = layout.w2.color;
    ctx.fillText(layout.w2.text, layout.w2.x, layout.w2.y);
    ctx.restore();
  }

  // 4. Draw Dot Badge (if active)
  if (layout.dotBadge) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(layout.dotBadge.cx, layout.dotBadge.cy, layout.dotBadge.radius, 0, Math.PI * 2);
    ctx.fillStyle = layout.dotBadge.color;
    ctx.fill();
    ctx.restore();
  }

  // 5. Draw Extension Pill (if active)
  if (layout.extPill) {
    ctx.save();
    ctx.fillStyle = layout.extPill.color;
    ctx.beginPath();
    ctx.roundRect(
      layout.extPill.x,
      layout.extPill.y,
      layout.extPill.width,
      layout.extPill.height,
      layout.extPill.radius
    );
    ctx.fill();

    ctx.textBaseline = 'alphabetic';
    applyCanvasLetterSpacing(ctx, 0);
    ctx.font = `700 ${layout.extPill.fontSize}px "${layout.fontFamily}", sans-serif`;
    ctx.fillStyle = layout.extPill.textColor;
    ctx.fillText(layout.extPill.text, layout.extPill.textX, layout.extPill.textY);
    ctx.restore();
  }

  // 6. Draw Tagline (if active)
  if (layout.tagline) {
    ctx.save();
    ctx.textBaseline = 'alphabetic';
    applyCanvasLetterSpacing(ctx, layout.tagline.tracking);
    ctx.font = `600 ${layout.tagline.fontSize}px "${layout.fontFamily}", sans-serif`;
    ctx.fillStyle = layout.tagline.color;
    ctx.fillText(layout.tagline.text, layout.tagline.x, layout.tagline.y);
    ctx.restore();
  }

  // 7. Atom Safe Crop Zone (80% Default Crop Rectangle)
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
