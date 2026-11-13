import JSZip from 'jszip';
import { LogoState } from '../types/logo';
import { generateFullLogoSvg, buildEmblemSvgMarkup } from './svgBuilder';
import { drawLogoOnCanvas, loadSvgToImage } from './canvasRenderer';
import { ATOM_MAIN, ATOM_SQUARE, EXPORT_PIXEL_RATIO } from './atomSpec';
import { ensureFontsLoaded } from './fontLoader';

export async function downloadSvg(
  state: LogoState,
  filename: string,
  options: {
    width?: number;
    height?: number;
    background?: 'transparent' | 'white' | 'dark' | 'brand';
  } = {}
) {
  await ensureFontsLoaded(state.fontFamily);

  const width = options.width || 750;
  const height = options.height || 450;
  const background = options.background || (state.bgMode as 'transparent' | 'white' | 'dark' | 'brand') || 'white';

  const svgContent = generateFullLogoSvg(state, {
    width,
    height,
    background,
  });

  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.svg') ? filename : `${filename}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function copySvgCode(
  state: LogoState,
  options: {
    width?: number;
    height?: number;
    background?: 'transparent' | 'white' | 'dark' | 'brand';
  } = {}
): Promise<boolean> {
  await ensureFontsLoaded(state.fontFamily);

  const width = options.width || 750;
  const height = options.height || 450;
  const background = options.background || 'transparent';

  const svgContent = generateFullLogoSvg(state, {
    width,
    height,
    background,
  });

  try {
    await navigator.clipboard.writeText(svgContent);
    return true;
  } catch (err) {
    console.error('Failed to copy SVG to clipboard:', err);
    return false;
  }
}

export function downloadCanvasAsPng(
  canvas: HTMLCanvasElement,
  filename: string
) {
  const cleanFilename = filename.endsWith('.png') ? filename : `${filename}.png`;
  const link = document.createElement('a');
  link.download = cleanFilename;
  link.href = canvas.toDataURL('image/png', 1.0);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Downloads a high-resolution export rendered at EXPORT_PIXEL_RATIO (1500x900 or 1200x1200).
 * Prepares the upload file so Atom's 80% crop scales down to 750x450 / 600x600 without upscaling.
 */
export async function downloadOffscreenPng(
  state: LogoState,
  isSquare: boolean,
  customFilename?: string
): Promise<void> {
  await ensureFontsLoaded(state.fontFamily);

  const W = isSquare ? ATOM_SQUARE.w : ATOM_MAIN.w;
  const H = isSquare ? ATOM_SQUARE.h : ATOM_MAIN.h;
  const ratio = EXPORT_PIXEL_RATIO;

  const emblemSvg = buildEmblemSvgMarkup(
    {
      containerStyle: state.containerStyle,
      construction: state.construction,
      activeIcon: state.activeIcon,
      customSvgPath: state.customSvgPath,
      primary: state.primary,
      secondary: state.secondary,
      accent: state.accent,
      fontFamily: state.fontFamily,
      word1: state.word1,
      iconStrokeWidth: state.iconStrokeWidth,
      iconRotation: state.iconRotation,
      iconFlipH: state.iconFlipH,
      iconFlipV: state.iconFlipV,
    },
    600
  );

  const emblemImg = await loadSvgToImage(emblemSvg);
  const canvas = document.createElement('canvas');
  drawLogoOnCanvas(canvas, emblemImg, state, W, H, isSquare, false, ratio);

  const cleanDom = (state.domain || 'logo').toLowerCase().replace(/[^a-z0-9]/g, '-');
  const filename =
    customFilename ||
    (isSquare
      ? `${cleanDom}-upload-square-1200x1200.png`
      : `${cleanDom}-upload-main-1500x900.png`);

  downloadCanvasAsPng(canvas, filename);
}

export async function downloadBrandKitZip(
  state: LogoState,
  onProgress?: (msg: string) => void
): Promise<void> {
  await ensureFontsLoaded(state.fontFamily);

  onProgress?.('Generating vector SVGs and assets...');
  const zip = new JSZip();
  const cleanDom = (state.domain || 'brand-logo').toLowerCase().replace(/[^a-z0-9]/g, '-');
  const folder = zip.folder(`${cleanDom}-brand-kit`) || zip;

  // 1. Vector SVGs
  const svgMainWhite = generateFullLogoSvg(state, { width: 750, height: 450, background: 'white' });
  folder.file('vector-logo-750x450-white.svg', svgMainWhite);

  const svgMainTrans = generateFullLogoSvg(state, { width: 750, height: 450, background: 'transparent' });
  folder.file('vector-logo-transparent.svg', svgMainTrans);

  const svgSquare = generateFullLogoSvg(state, { width: 600, height: 600, background: 'transparent' });
  folder.file('vector-logo-square.svg', svgSquare);

  const svgEmblemOnly = buildEmblemSvgMarkup(
    {
      containerStyle: state.containerStyle,
      construction: state.construction,
      activeIcon: state.activeIcon,
      customSvgPath: state.customSvgPath,
      primary: state.primary,
      secondary: state.secondary,
      accent: state.accent,
      fontFamily: state.fontFamily,
      word1: state.word1,
      iconStrokeWidth: state.iconStrokeWidth,
      iconRotation: state.iconRotation,
      iconFlipH: state.iconFlipH,
      iconFlipV: state.iconFlipV,
    },
    512
  );
  folder.file('vector-emblem-512x512.svg', svgEmblemOnly);

  // 2. High-resolution PNGs rendered on offscreen canvas
  onProgress?.('Rendering ultra high-resolution PNGs...');
  const emblemImg = await loadSvgToImage(
    buildEmblemSvgMarkup(
      {
        containerStyle: state.containerStyle,
        construction: state.construction,
        activeIcon: state.activeIcon,
        customSvgPath: state.customSvgPath,
        primary: state.primary,
        secondary: state.secondary,
        accent: state.accent,
        fontFamily: state.fontFamily,
        word1: state.word1,
        iconStrokeWidth: state.iconStrokeWidth,
      },
      600
    )
  );

  // Main 750x450
  const cMain = document.createElement('canvas');
  drawLogoOnCanvas(cMain, emblemImg, state, 750, 450, false, false, 1);
  folder.file('main-logo-750x450.png', cMain.toDataURL('image/png').split(',')[1], { base64: true });

  // Main 2x Retina 1500x900
  const cMain2x = document.createElement('canvas');
  drawLogoOnCanvas(cMain2x, emblemImg, state, 750, 450, false, false, 2);
  folder.file('main-logo-retina-1500x900.png', cMain2x.toDataURL('image/png').split(',')[1], { base64: true });

  // Atom Upload Main 1500x900 (single source of truth for Atom.com uploads)
  folder.file('atom-upload-main-1500x900.png', cMain2x.toDataURL('image/png').split(',')[1], { base64: true });

  // Square 600x600
  const cSq = document.createElement('canvas');
  drawLogoOnCanvas(cSq, emblemImg, state, 600, 600, true, false, 1);
  folder.file('square-logo-600x600.png', cSq.toDataURL('image/png').split(',')[1], { base64: true });

  // Atom Upload Square 1200x1200
  const cSq2x = document.createElement('canvas');
  drawLogoOnCanvas(cSq2x, emblemImg, state, 600, 600, true, false, 2);
  folder.file('atom-upload-square-1200x1200.png', cSq2x.toDataURL('image/png').split(',')[1], { base64: true });

  // App Icon 512x512
  const cApp = document.createElement('canvas');
  drawLogoOnCanvas(cApp, emblemImg, state, 512, 512, true, false, 1);
  folder.file('app-icon-512x512.png', cApp.toDataURL('image/png').split(',')[1], { base64: true });

  // Favicon 32x32
  const cFav = document.createElement('canvas');
  drawLogoOnCanvas(cFav, emblemImg, state, 32, 32, true, false, 1);
  folder.file('favicon-32x32.png', cFav.toDataURL('image/png').split(',')[1], { base64: true });

  // 3. Brand Identity Spec JSON
  const brandGuide = {
    brandName: `${state.word1}${state.word2 ? ' ' + state.word2 : ''}`,
    domain: state.domain,
    tagline: state.tagline || '',
    typography: {
      primaryFont: state.fontFamily,
      contrastStyle: state.typoContrast,
      weights: {
        word1: state.word1,
        word2: state.word2,
      },
    },
    palette: {
      primaryInk: state.primary,
      brandAccent: state.secondary,
      sparkPoint: state.accent,
      background: state.backgroundColor || '#FFFFFF',
    },
    emblem: {
      symbol: state.activeIcon,
      architecture: state.construction ? state.construction.label : state.containerStyle,
      constructionSpec: state.construction || null,
      strokeWidth: state.iconStrokeWidth,
    },
    specifications: {
      mainDimensions: '750 x 450 px (5:3)',
      squareDimensions: '600 x 600 px (1:1)',
      recommendedSafeMargin: "Atom's default crop keeps the central 80% (600x360 within 750x450; 480x480 within 600x600)",
      vectorFormat: 'SVG 1.1 Scalable Vector Graphics',
    },
    generatedAt: new Date().toISOString(),
  };

  folder.file('brand-guidelines.json', JSON.stringify(brandGuide, null, 2));

  onProgress?.('Compressing Brand Kit ZIP archive...');
  const content = await zip.generateAsync({ type: 'blob' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(content);
  link.download = `${cleanDom}-brand-kit.zip`;
  link.click();
}

export async function downloadAll10VariantsZip(
  state: LogoState,
  onProgress?: (msg: string) => void
): Promise<void> {
  if (state.variants10.length === 0) return;
  await ensureFontsLoaded(state.fontFamily);

  onProgress?.('Rendering 10 agency concepts...');
  const zip = new JSZip();
  const cleanDom = (state.domain || 'domain').toLowerCase().replace(/[^a-z0-9]/g, '-');
  const folder = zip.folder(`${cleanDom}-10-agency-concepts`) || zip;

  for (let i = 0; i < state.variants10.length; i++) {
    const v = state.variants10[i];
    onProgress?.(`Processing variant ${i + 1} of 10 (${v.activeIcon})...`);

    // SVG
    const svgStr = generateFullLogoSvg(v, { width: 750, height: 450, background: 'white' });
    folder.file(`variant-${v.id}-${v.activeIcon}-vector.svg`, svgStr);

    // PNG Main
    const emblemSvg = buildEmblemSvgMarkup(
      {
        containerStyle: v.containerStyle,
        construction: v.construction,
        activeIcon: v.activeIcon,
        customSvgPath: v.customSvgPath || state.customSvgPath,
        primary: v.primary,
        secondary: v.secondary,
        accent: v.accent,
        fontFamily: v.fontFamily,
        word1: v.word1,
      },
      600
    );
    const img = await loadSvgToImage(emblemSvg);

    const cMain = document.createElement('canvas');
    drawLogoOnCanvas(cMain, img, v, 750, 450, false, false, 1);
    folder.file(`variant-${v.id}-${v.activeIcon}-750x450.png`, cMain.toDataURL('image/png').split(',')[1], { base64: true });

    // PNG Square
    const cSq = document.createElement('canvas');
    drawLogoOnCanvas(cSq, img, v, 600, 600, true, false, 1);
    folder.file(`variant-${v.id}-${v.activeIcon}-600x600.png`, cSq.toDataURL('image/png').split(',')[1], { base64: true });
  }

  onProgress?.('Generating ZIP file...');
  const content = await zip.generateAsync({ type: 'blob' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(content);
  link.download = `${cleanDom}-10-agency-concepts.zip`;
  link.click();
}
