import React from 'react';
import {
  Download,
  Smartphone,
  Layout,
  ShoppingBag,
  Grid,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Palette,
  Share2,
  ChevronDown,
  Sun,
  Moon,
  ArrowRight,
  CheckCircle2,
  Code,
  FolderArchive,
  Star,
} from 'lucide-react';
import { LogoState } from '../../types/logo';
import { drawLogoOnCanvas, loadSvgToImage } from '../../utils/canvasRenderer';
import {
  buildEmblemSvgMarkup,
  buildEmblemInnerMarkup,
  formatWordText,
  getTypographicWeights,
  generateFullLogoSvg,
} from '../../utils/svgBuilder';
import {
  downloadSvg,
  downloadOffscreenPng,
  buildAppIconVariantSvg,
  downloadSvgString,
  downloadSvgStringAsPng,
  downloadAppIconsZip,
} from '../../utils/exporter';
import { ensureFontsLoaded } from '../../utils/fontLoader';
import { LockupLayoutResult } from '../../utils/lockupLayout';
import { ATOM_MAIN, ATOM_SQUARE, getCropZone } from '../../utils/atomSpec';
import { COLOR_PALETTES } from '../../data/domains';
import { SocialMediaKitStage } from './SocialMediaKitStage';

interface DualCanvasStageProps {
  state: LogoState;
  onUpdateState: (patch: Partial<LogoState>) => void;
  showSafeGrid?: boolean;
  onToggleSafeGrid?: () => void;
  showVectorGuides?: boolean;
  onToggleVectorGuides?: () => void;
  onCyclePalette?: () => void;
}

export const DualCanvasStage: React.FC<DualCanvasStageProps> = ({
  state,
  onUpdateState,
  showSafeGrid: externalSafeGrid,
  onToggleSafeGrid,
  showVectorGuides: externalVectorGuides,
  onToggleVectorGuides,
  onCyclePalette,
}) => {
  const [activeTab, setActiveTab] = React.useState<
    'studio' | 'mockup-web' | 'mockup-app' | 'mockup-atom' | 'social-kit'
  >('studio');
  const [webLayoutMode, setWebLayoutMode] = React.useState<'saas-sticky' | 'glass-pill' | 'fintech-split'>('saas-sticky');
  const [webTheme, setWebTheme] = React.useState<'dark' | 'light'>('dark');
  const [marketplaceView, setMarketplaceView] = React.useState<'live-cards' | 'crop-sim'>('live-cards');
  const [isExportingAppZip, setIsExportingAppZip] = React.useState(false);

  const [internalSafeGrid, setInternalSafeGrid] = React.useState(false);
  const [internalVectorGuides, setInternalVectorGuides] = React.useState(true);
  const [atomSimMode, setAtomSimMode] = React.useState<'main' | 'square'>('main');
  const [zoomScale, setZoomScale] = React.useState<number>(1);

  const showSafeGrid = externalSafeGrid !== undefined ? externalSafeGrid : internalSafeGrid;
  const showVectorGuides = externalVectorGuides !== undefined ? externalVectorGuides : internalVectorGuides;

  const handleToggleSafeGrid = () => {
    if (onToggleSafeGrid) {
      onToggleSafeGrid();
    } else {
      setInternalSafeGrid((p) => !p);
    }
  };

  const handleToggleVectorGuides = () => {
    if (onToggleVectorGuides) {
      onToggleVectorGuides();
    } else {
      setInternalVectorGuides((p) => !p);
    }
  };

  const handleCycleZoom = () => {
    setZoomScale((prev) => (prev === 1 ? 1.08 : prev === 1.08 ? 0.92 : 1));
  };

  const [mainLayout, setMainLayout] = React.useState<LockupLayoutResult | null>(null);
  const [squareLayout, setSquareLayout] = React.useState<LockupLayoutResult | null>(null);

  const mainCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const squareCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const atomUploadCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const atomCroppedCanvasRef = React.useRef<HTMLCanvasElement>(null);

  // Live 60fps SVG markups for Web Header, App Icons, and Marketplace Cards
  const liveEmblemInner = React.useMemo(
    () =>
      buildEmblemInnerMarkup({
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
      }),
    [
      state.containerStyle,
      state.construction,
      state.activeIcon,
      state.customSvgPath,
      state.primary,
      state.secondary,
      state.accent,
      state.fontFamily,
      state.word1,
      state.iconStrokeWidth,
      state.iconRotation,
      state.iconFlipH,
      state.iconFlipV,
    ]
  );

  const liveMainCardSvg = React.useMemo(
    () => generateFullLogoSvg(state, { width: 750, height: 450, background: 'white' }),
    [state]
  );

  const weights = getTypographicWeights(state.typoContrast);
  const w1Formatted = formatWordText(state.word1, state.letterCase1, weights.isUpper);
  const w2Formatted = formatWordText(state.word2, state.letterCase2, weights.isUpper);
  const fullBrandDisplay = `${w1Formatted}${w2Formatted}`;

  // Render canvases whenever state or fonts update
  React.useEffect(() => {
    let isCancelled = false;

    async function renderAll() {
      await ensureFontsLoaded(state.fontFamily);
      if (isCancelled) return;

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

      const img = await loadSvgToImage(emblemSvg);
      if (isCancelled) return;

      // 1. Main Canvas 750x450
      if (mainCanvasRef.current) {
        const res = drawLogoOnCanvas(mainCanvasRef.current, img, state, ATOM_MAIN.w, ATOM_MAIN.h, false, showSafeGrid, 1);
        setMainLayout(res);
      }

      // 2. Square Canvas 600x600
      if (squareCanvasRef.current) {
        const res = drawLogoOnCanvas(squareCanvasRef.current, img, state, ATOM_SQUARE.w, ATOM_SQUARE.h, true, showSafeGrid, 1);
        setSquareLayout(res);
      }

      // 3. Atom Simulator Canvases
      const isSimSquare = atomSimMode === 'square';
      const simW = isSimSquare ? ATOM_SQUARE.w : ATOM_MAIN.w;
      const simH = isSimSquare ? ATOM_SQUARE.h : ATOM_MAIN.h;

      if (atomUploadCanvasRef.current) {
        drawLogoOnCanvas(atomUploadCanvasRef.current, img, state, simW, simH, isSimSquare, false, 1);
      }

      if (atomCroppedCanvasRef.current) {
        const crop = getCropZone(simW, simH);
        const tempCanvas = document.createElement('canvas');
        drawLogoOnCanvas(tempCanvas, img, state, simW, simH, isSimSquare, false, 2);

        const cropCtx = atomCroppedCanvasRef.current.getContext('2d');
        if (cropCtx) {
          atomCroppedCanvasRef.current.width = simW;
          atomCroppedCanvasRef.current.height = simH;
          cropCtx.imageSmoothingEnabled = true;
          cropCtx.imageSmoothingQuality = 'high';

          cropCtx.drawImage(
            tempCanvas,
            crop.x * 2,
            crop.y * 2,
            crop.w * 2,
            crop.h * 2,
            0,
            0,
            simW,
            simH
          );
        }
      }
    }

    renderAll().catch((err) => {
      console.error('Failed to render main canvases:', err);
    });

    return () => {
      isCancelled = true;
    };
  }, [state, showSafeGrid, atomSimMode, activeTab, marketplaceView]);

  const currentSimLayout = atomSimMode === 'square' ? squareLayout : mainLayout;
  const currentSimW = atomSimMode === 'square' ? ATOM_SQUARE.w : ATOM_MAIN.w;
  const currentSimH = atomSimMode === 'square' ? ATOM_SQUARE.h : ATOM_MAIN.h;
  const currentCrop = getCropZone(currentSimW, currentSimH);

  const getArtboardSurfaceClass = () => {
    if (state.bgMode === 'transparent') return 'checkerboard-surface';
    if (state.bgMode === 'dark') return 'bg-[#070B14]';
    if (state.bgMode === 'brand') return 'bg-[#EEF2FF]';
    return 'bg-white';
  };

  // Helper component for Live Horizontal Logo in Navbar & Widgets (60fps SVG + Wordmark)
  const renderLiveHorizontalBrandLogo = (heightPx = 38, onDark = true) => {
    const word1Color = onDark ? '#FFFFFF' : state.primary;
    const word2Color = state.secondary;
    return (
      <div className="inline-flex items-center gap-2.5 select-none shrink-0" style={{ height: `${heightPx}px` }}>
        <svg
          viewBox="0 0 200 200"
          style={{ width: `${heightPx}px`, height: `${heightPx}px` }}
          className="shrink-0 overflow-visible"
          dangerouslySetInnerHTML={{ __html: liveEmblemInner }}
        />
        <div className="flex flex-col justify-center leading-none">
          <div
            className="flex items-baseline tracking-tight whitespace-nowrap"
            style={{
              fontFamily: `'${state.fontFamily}', sans-serif`,
              fontSize: `${Math.round(heightPx * 0.56)}px`,
              letterSpacing: `${state.tracking * 0.4}px`,
            }}
          >
            <span style={{ fontWeight: weights.w1 as unknown as number, color: word1Color }}>
              {w1Formatted}
            </span>
            {w2Formatted && (
              <span style={{ fontWeight: weights.w2 as unknown as number, color: word2Color }}>
                {w2Formatted}
              </span>
            )}
            {state.keepExt && state.ext && (
              <span
                className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold"
                style={{
                  backgroundColor: state.accent,
                  color: '#0F172A',
                }}
              >
                {state.ext}
              </span>
            )}
          </div>
          {state.showTagline && state.tagline && heightPx >= 34 && (
            <span
              className="text-[8px] font-mono uppercase tracking-widest mt-0.5 truncate max-w-[180px]"
              style={{ color: onDark ? '#94A3B8' : '#64748B' }}
            >
              {state.tagline}
            </span>
          )}
        </div>
      </div>
    );
  };

  const handleDownloadAllAppIcons = async () => {
    setIsExportingAppZip(true);
    try {
      await downloadAppIconsZip(state);
    } finally {
      setIsExportingAppZip(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col relative infinite-canvas-bg overflow-hidden min-w-0">
      {/* Top Horizontal Pixel Ruler */}
      <div className="h-5 bg-[#090C13]/90 border-b border-white/[0.07] flex items-center pl-5 text-[9px] font-mono text-slate-600 ruler-x select-none shrink-0">
        <span className="w-24">0px</span>
        <span className="w-24">150px</span>
        <span className="w-24">300px</span>
        <span className="w-24">450px</span>
        <span className="w-24">600px</span>
        <span className="w-24">750px</span>
        <span className="w-24">900px</span>
        <span className="w-24">1200px</span>
        <span className="w-24">1500px</span>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Vertical Pixel Ruler */}
        <div className="w-5 bg-[#090C13]/90 border-r border-white/[0.07] flex flex-col items-center pt-4 text-[8px] font-mono text-slate-600 ruler-y select-none shrink-0 gap-16">
          <span className="-rotate-90">0</span>
          <span className="-rotate-90">150</span>
          <span className="-rotate-90">300</span>
          <span className="-rotate-90">450</span>
          <span className="-rotate-90">600</span>
          <span className="-rotate-90">900</span>
        </div>

        {/* Center Interactive Artboards Area */}
        <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto relative">
          {/* TOP FLOATING HUD: 5 View Mode Tabs + Surface Context + Crop Zone + Bezier Guides */}
          <div className="flex items-center justify-between gap-2 z-20 flex-wrap">
            {/* 5 View Mode Tabs */}
            <div className="flex items-center gap-1 bg-[#0B0E17]/95 backdrop-blur-md border border-white/[0.08] p-1 rounded-xl shadow-2xl flex-wrap">
              <button
                type="button"
                onClick={() => setActiveTab('studio')}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'studio'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Master Canvases</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('mockup-web')}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'mockup-web'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                <span>Website Header Mockup</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('mockup-app')}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'mockup-app'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile App Icon</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('mockup-atom')}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'mockup-atom'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Marketplace Card</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('social-kit')}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'social-kit'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-emerald-300 hover:text-white bg-emerald-500/10 border border-emerald-500/20'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Social Media Kit</span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-black/30 text-emerald-200">
                  12
                </span>
              </button>
            </div>

            {/* Canvas Surface Context Switcher */}
            <div className="flex items-center gap-1 bg-[#0B0E17]/95 backdrop-blur-md border border-white/[0.08] p-1 rounded-xl shadow-2xl">
              <span className="text-[10px] font-mono text-slate-400 px-2 hidden sm:inline">Surface:</span>
              <button
                type="button"
                onClick={() => onUpdateState({ bgMode: 'white', backgroundColor: '#FFFFFF' })}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  state.bgMode === 'white'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                White
              </button>
              <button
                type="button"
                onClick={() => onUpdateState({ bgMode: 'dark', backgroundColor: '#070B14' })}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                  state.bgMode === 'dark'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Dark
              </button>
              <button
                type="button"
                onClick={() => onUpdateState({ bgMode: 'transparent' })}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                  state.bgMode === 'transparent'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Transparent
              </button>
              <button
                type="button"
                onClick={() => onUpdateState({ bgMode: 'brand', backgroundColor: '#EEF2FF' })}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                  state.bgMode === 'brand'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Brand Tint
              </button>
            </div>

            {/* Right HUD: Safe Crop Overlay + Vector Guides + Zoom */}
            <div className="flex items-center gap-2 bg-[#0B0E17]/95 backdrop-blur-md border border-white/[0.08] px-3 py-1.5 rounded-xl shadow-2xl">
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-amber-300">
                <input
                  type="checkbox"
                  checked={showSafeGrid}
                  onChange={handleToggleSafeGrid}
                  className="rounded border-amber-500/50 bg-[#06080D] text-amber-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                />
                <span>80% Atom Safe Crop</span>
              </label>
              <div className="h-3.5 w-px bg-white/10" />
              <button
                type="button"
                onClick={handleToggleVectorGuides}
                className={`text-[11px] font-mono transition cursor-pointer ${
                  showVectorGuides ? 'text-indigo-300 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Bezier Guides
              </button>
              <div className="h-3.5 w-px bg-white/10" />
              <button
                type="button"
                onClick={handleCycleZoom}
                className="text-[11px] font-mono text-slate-300 hover:text-white transition cursor-pointer"
                title="Cycle Artboard Zoom"
              >
                {Math.round(zoomScale * 100)}%
              </button>
            </div>
          </div>

          {/* CENTER STAGE CONTENT */}
          <div
            className="my-auto py-3 transition-transform duration-200"
            style={{ transform: `scale(${zoomScale})`, transformOrigin: 'center center' }}
          >
            {/* VIEW TAB 1: MASTER CANVASES (750x450 & 600x600) */}
            {activeTab === 'studio' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center max-w-[1320px] mx-auto w-full">
                {/* ARTBOARD 1: MAIN HORIZONTAL LOCKUP (750 x 450) */}
                <div className="lg:col-span-7 flex flex-col">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        IMAGE 1 — MAIN LOGO
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        upload 1500 × 900 → Atom 750 × 450
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => downloadSvg(state, 'main-logo-750x450.svg', { width: 750, height: 450 })}
                        className="px-2 py-1 rounded-md bg-[#0B0E17] hover:bg-[#101522] border border-white/[0.07] text-[10px] font-mono font-semibold text-slate-300 hover:text-white transition cursor-pointer"
                      >
                        SVG
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadOffscreenPng(state, false)}
                        className="px-2.5 py-1 rounded-md bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-[10px] font-mono font-bold text-indigo-200 transition cursor-pointer"
                      >
                        Export PNG ↓
                      </button>
                    </div>
                  </div>

                  <div
                    className={`relative rounded-2xl border border-white/15 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.85)] overflow-hidden transition-colors duration-200 flex items-center justify-center p-3 ${getArtboardSurfaceClass()}`}
                  >
                    {showSafeGrid && (
                      <div className="absolute inset-[10%] border-2 border-dashed border-amber-500/80 rounded-lg pointer-events-none z-20 flex items-start justify-between p-1.5 bg-amber-500/[0.03]">
                        <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 shadow">
                          Atom 80% Safe Zone (750×450)
                        </span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900/80 text-amber-300">
                          10% Margin Bleed
                        </span>
                      </div>
                    )}

                    <div
                      className={`relative inline-flex items-center justify-center ${
                        showVectorGuides ? 'border border-indigo-500/45 rounded-lg p-0.5' : ''
                      }`}
                    >
                      {showVectorGuides && (
                        <>
                          <div className="vector-node -top-1 -left-1" />
                          <div className="vector-node -top-1 -right-1" />
                          <div className="vector-node -bottom-1 -left-1" />
                          <div className="vector-node -bottom-1 -right-1" />
                        </>
                      )}
                      <canvas
                        ref={mainCanvasRef}
                        width={750}
                        height={450}
                        className="max-w-full h-auto rounded-lg bg-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* ARTBOARD 2: SQUARE BRAND MARK (600 x 600) */}
                <div className="lg:col-span-5 flex flex-col">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        IMAGE 2 — SQUARE LOGO
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        1200 × 1200 → Atom 600 × 600
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => downloadSvg(state, 'square-logo-600x600.svg', { width: 600, height: 600 })}
                        className="px-2 py-1 rounded-md bg-[#0B0E17] hover:bg-[#101522] border border-white/[0.07] text-[10px] font-mono font-semibold text-slate-300 hover:text-white transition cursor-pointer"
                      >
                        SVG
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadOffscreenPng(state, true)}
                        className="px-2.5 py-1 rounded-md bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-200 transition cursor-pointer"
                      >
                        Export PNG ↓
                      </button>
                    </div>
                  </div>

                  <div
                    className={`relative rounded-2xl border border-white/15 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.85)] overflow-hidden transition-colors duration-200 flex items-center justify-center p-3 ${getArtboardSurfaceClass()}`}
                  >
                    {showSafeGrid && (
                      <div className="absolute inset-[10%] border-2 border-dashed border-amber-500/80 rounded-lg pointer-events-none z-20 flex items-start justify-between p-1.5 bg-amber-500/[0.03]">
                        <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 shadow">
                          Atom 600×600 Safe
                        </span>
                      </div>
                    )}

                    <div
                      className={`relative inline-flex items-center justify-center ${
                        showVectorGuides ? 'border border-cyan-500/45 rounded-lg p-0.5' : ''
                      }`}
                    >
                      {showVectorGuides && (
                        <>
                          <div className="vector-node -top-1 -left-1" />
                          <div className="vector-node -top-1 -right-1" />
                          <div className="vector-node -bottom-1 -left-1" />
                          <div className="vector-node -bottom-1 -right-1" />
                        </>
                      )}
                      <canvas
                        ref={squareCanvasRef}
                        width={600}
                        height={600}
                        className="max-w-full h-auto max-h-[340px] rounded-lg bg-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW TAB 2: WEBSITE HEADER MOCKUP (Multi-Context Web & SaaS Suite) */}
            {activeTab === 'mockup-web' && (
              <div className="bg-[#0B0E17] border border-white/[0.08] rounded-2xl p-5 shadow-2xl space-y-5 max-w-[1260px] mx-auto">
                {/* Top Sub-Switcher: 3 Layout Modes + Light/Dark Switch */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white text-sm">Multi-Context Web &amp; SaaS Header Suite</h3>
                    <p className="text-xs text-slate-400">
                      Live 60fps vector lockup, typography, and brand color tokens tested across 3 production web layouts.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 bg-[#06080D] p-1 rounded-xl border border-white/[0.07]">
                      {(
                        [
                          { id: 'saas-sticky', label: '1. SaaS Hero & Sticky Navbar' },
                          { id: 'glass-pill', label: '2. Floating Glass Pill Header' },
                          { id: 'fintech-split', label: '3. E-Commerce / FinTech Split Hero' },
                        ] as const
                      ).map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setWebLayoutMode(m.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                            webLayoutMode === m.id
                              ? 'bg-indigo-600 text-white shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setWebTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
                      className="px-2.5 py-1.5 rounded-xl bg-[#06080D] hover:bg-white/[0.06] border border-white/[0.07] text-xs font-semibold text-slate-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      {webTheme === 'dark' ? (
                        <>
                          <Sun className="w-3.5 h-3.5 text-amber-400" />
                          <span>Light Theme</span>
                        </>
                      ) : (
                        <>
                          <Moon className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Dark Theme</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Browser Window Frame */}
                <div
                  className={`rounded-2xl border overflow-hidden shadow-2xl transition-colors ${
                    webTheme === 'dark'
                      ? 'bg-[#050811] border-slate-700/70 text-white'
                      : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  {/* Browser Chrome Bar */}
                  <div
                    className={`px-4 py-2.5 border-b flex items-center justify-between gap-3 ${
                      webTheme === 'dark' ? 'bg-[#0B0F1C] border-slate-800' : 'bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                      <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                      <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                    </div>
                    <div
                      className={`flex-1 max-w-md mx-auto rounded-lg px-3 py-1 text-[11px] font-mono text-center truncate border ${
                        webTheme === 'dark'
                          ? 'bg-[#06080F] border-slate-800 text-slate-300'
                          : 'bg-white border-slate-300 text-slate-700'
                      }`}
                    >
                      https://{state.domain}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">1440px Desktop</span>
                  </div>

                  {/* Live Website Navbar (Always renders complete horizontal SVG + Wordmark at height: 38px) */}
                  <div className={webLayoutMode === 'glass-pill' ? 'px-6 pt-4' : ''}>
                    <header
                      className={`px-7 py-3.5 flex items-center justify-between gap-6 transition-all ${
                        webLayoutMode === 'glass-pill'
                          ? webTheme === 'dark'
                            ? 'rounded-2xl bg-[#0D1324]/90 backdrop-blur-md border border-white/10 shadow-xl'
                            : 'rounded-2xl bg-slate-900/5 backdrop-blur-md border border-slate-200 shadow-lg'
                          : webTheme === 'dark'
                          ? 'border-b border-slate-800/80 bg-[#080D1A]/95'
                          : 'border-b border-slate-200 bg-white/95'
                      }`}
                    >
                      {/* Left: Complete Horizontal Vector Logo (height: 38px) */}
                      {renderLiveHorizontalBrandLogo(38, webTheme === 'dark')}

                      {/* Center: Navigation Links with Dropdown Indicators */}
                      <nav
                        className={`hidden md:flex items-center gap-6 text-xs font-semibold ${
                          webTheme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                        }`}
                      >
                        {['Platform', 'Solutions', 'Resources', 'Pricing'].map((item, i) => (
                          <span
                            key={item}
                            className="inline-flex items-center gap-1 hover:opacity-100 opacity-85 cursor-pointer transition"
                          >
                            <span>{item}</span>
                            {i < 3 && <ChevronDown className="w-3 h-3 opacity-60" />}
                          </span>
                        ))}
                      </nav>

                      {/* Right: Theme Switch, Sign In & Brand Accent CTA */}
                      <div className="flex items-center gap-2.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setWebTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
                          className={`p-2 rounded-lg border text-xs cursor-pointer ${
                            webTheme === 'dark'
                              ? 'border-slate-800 bg-slate-900 text-slate-300'
                              : 'border-slate-200 bg-slate-100 text-slate-700'
                          }`}
                          title="Toggle Website Theme"
                        >
                          {webTheme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          className={`px-3 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                            webTheme === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-950'
                          }`}
                        >
                          Sign In
                        </button>
                        <button
                          type="button"
                          style={{ backgroundColor: state.secondary }}
                          className="px-4 py-2 text-xs font-bold text-white rounded-xl shadow-lg flex items-center gap-1.5 transition hover:opacity-95 cursor-pointer"
                        >
                          <span>Get Started</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </header>
                  </div>

                  {/* Hero Section & 3 B2B Dashboard UI Cards */}
                  <div className="p-8 md:p-10 space-y-8">
                    <div
                      className={
                        webLayoutMode === 'fintech-split'
                          ? 'grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left'
                          : 'text-center max-w-3xl mx-auto space-y-4'
                      }
                    >
                      <div className={webLayoutMode === 'fintech-split' ? 'lg:col-span-7 space-y-4' : 'space-y-4'}>
                        {/* Interactive Niche Badge with Spark Point */}
                        <div
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold border"
                          style={{
                            borderColor: `${state.secondary}40`,
                            backgroundColor: `${state.secondary}15`,
                            color: webTheme === 'dark' ? '#E2E8F0' : state.primary,
                          }}
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: state.accent }}
                          />
                          <span>{state.nicheLabel}</span>
                        </div>

                        <h2
                          className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight"
                          style={{ fontFamily: `'${state.fontFamily}', sans-serif` }}
                        >
                          Next-Generation Intelligence for{' '}
                          <span style={{ color: state.secondary }}>{fullBrandDisplay}</span>
                        </h2>

                        <p
                          className={`text-sm leading-relaxed max-w-2xl ${
                            webLayoutMode === 'fintech-split' ? '' : 'mx-auto'
                          } ${webTheme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}
                        >
                          {state.showTagline && state.tagline
                            ? state.tagline
                            : `Enterprise-grade ${state.nicheLabel.toLowerCase()} engineered for high-velocity teams on ${state.domain}.`}
                        </p>

                        {/* 2 CTA Buttons */}
                        <div
                          className={`flex flex-wrap items-center gap-3 pt-2 ${
                            webLayoutMode === 'fintech-split' ? 'justify-start' : 'justify-center'
                          }`}
                        >
                          <button
                            type="button"
                            style={{ backgroundColor: state.primary }}
                            className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-lg flex items-center gap-2 cursor-pointer"
                          >
                            <span>Start Free Trial</span>
                            <ArrowRight className="w-3.5 h-3.5" style={{ color: state.accent }} />
                          </button>
                          <button
                            type="button"
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold border cursor-pointer ${
                              webTheme === 'dark'
                                ? 'border-slate-700 bg-slate-900/80 text-slate-200'
                                : 'border-slate-300 bg-slate-50 text-slate-800'
                            }`}
                          >
                            Book Demo
                          </button>
                        </div>
                      </div>

                      {webLayoutMode === 'fintech-split' && (
                        <div
                          className={`lg:col-span-5 rounded-2xl p-5 border shadow-xl space-y-3 ${
                            webTheme === 'dark'
                              ? 'bg-[#0B1020] border-slate-800'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            {renderLiveHorizontalBrandLogo(30, webTheme === 'dark')}
                            <span
                              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded"
                              style={{ backgroundColor: `${state.accent}25`, color: state.accent }}
                            >
                              LIVE TELEMETRY
                            </span>
                          </div>
                          <div className="h-24 rounded-xl bg-gradient-to-r from-indigo-500/10 to-emerald-500/10 border border-white/5 flex items-center justify-center p-3">
                            <svg viewBox="0 0 240 60" className="w-full h-full">
                              <path
                                d="M 5 48 Q 45 18, 85 34 T 165 16 T 235 8"
                                fill="none"
                                stroke={state.secondary}
                                strokeWidth="3.5"
                                strokeLinecap="round"
                              />
                              <circle cx="165" cy="16" r="4.5" fill={state.accent} />
                              <circle cx="235" cy="8" r="5" fill={state.primary} />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 3 B2B / Dashboard UI Cards at the bottom */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      {/* Card 1: Real-Time Velocity Spline */}
                      <div
                        className={`rounded-xl p-4 border text-left space-y-2.5 ${
                          webTheme === 'dark'
                            ? 'bg-[#0A0F1D] border-slate-800/90'
                            : 'bg-slate-50/90 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold opacity-75">Carryover Index</span>
                          <span
                            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded"
                            style={{ backgroundColor: `${state.secondary}20`, color: state.secondary }}
                          >
                            +42.8% YoY
                          </span>
                        </div>
                        <div className="text-xl font-black" style={{ fontFamily: `'${state.fontFamily}', sans-serif` }}>
                          $1.84M <span className="text-xs font-normal opacity-60">ARR</span>
                        </div>
                        <svg viewBox="0 0 200 42" className="w-full h-9">
                          <path
                            d="M 4 34 C 40 32, 65 12, 105 20 C 140 26, 165 6, 196 8"
                            fill="none"
                            stroke={state.secondary}
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                          <circle cx="196" cy="8" r="4" fill={state.accent} />
                        </svg>
                      </div>

                      {/* Card 2: Brand Primary Architecture KPI */}
                      <div
                        className={`rounded-xl p-4 border text-left space-y-2.5 ${
                          webTheme === 'dark'
                            ? 'bg-[#0A0F1D] border-slate-800/90'
                            : 'bg-slate-50/90 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold opacity-75">Attribution Precision</span>
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: state.accent }}
                          />
                        </div>
                        <div className="text-xl font-black" style={{ fontFamily: `'${state.fontFamily}', sans-serif` }}>
                          99.94% <span className="text-xs font-normal opacity-60">SLA</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-slate-800/30 overflow-hidden flex">
                          <div style={{ width: '68%', backgroundColor: state.primary }} />
                          <div style={{ width: '24%', backgroundColor: state.secondary }} />
                          <div style={{ width: '8%', backgroundColor: state.accent }} />
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono opacity-70">
                          <span>Primary {state.primary}</span>
                          <span>Accent {state.secondary}</span>
                        </div>
                      </div>

                      {/* Card 3: Active Domain Identity Node */}
                      <div
                        className={`rounded-xl p-4 border text-left space-y-2.5 ${
                          webTheme === 'dark'
                            ? 'bg-[#0A0F1D] border-slate-800/90'
                            : 'bg-slate-50/90 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold opacity-75">Verified Brand Node</span>
                          <span
                            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded"
                            style={{ backgroundColor: `${state.primary}30`, color: state.accent }}
                          >
                            {state.domain}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 pt-1">
                          <svg
                            viewBox="0 0 200 200"
                            className="w-10 h-10 shrink-0"
                            dangerouslySetInnerHTML={{ __html: liveEmblemInner }}
                          />
                          <div>
                            <div className="text-xs font-bold">{fullBrandDisplay} Cloud</div>
                            <div className="text-[10px] opacity-65">
                              {state.construction?.label || state.containerStyle} · {state.fontFamily}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW TAB 3: MOBILE APP ICON (3-Panel iOS 18, Android Material 3 & App Store Suite) */}
            {activeTab === 'mockup-app' && (
              <div className="bg-[#0B0E17] border border-white/[0.08] rounded-2xl p-5 shadow-2xl space-y-5 max-w-[1320px] mx-auto">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      Multi-Device iOS 18, Android Material 3 &amp; App Store Suite
                    </h3>
                    <p className="text-xs text-slate-400">
                      Live vector emblem squircle icons, homescreen widget, 4 surface matrices, and multi-size technical specs.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadAllAppIcons}
                    disabled={isExportingAppZip}
                    className="px-4 py-2 text-xs font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-lg flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                  >
                    <FolderArchive className="w-3.5 h-3.5" />
                    <span>{isExportingAppZip ? 'Packing Icons...' : 'Export All App Icons (.ZIP)'}</span>
                  </button>
                </div>

                {/* 3 Side-by-Side Visual Panels */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                  {/* PANEL 1 (4 cols): iPhone Pro Homescreen & Widget Mockup */}
                  <div className="lg:col-span-4 bg-gradient-to-br from-slate-900 via-[#0E1528] to-slate-950 rounded-[40px] p-5 border-4 border-slate-700/90 shadow-2xl flex flex-col justify-between space-y-5">
                    {/* Status Bar & Dynamic Island */}
                    <div className="flex justify-between items-center text-[11px] text-slate-300 font-mono px-2">
                      <span>9:41</span>
                      <div className="w-20 h-4 bg-black rounded-full border border-white/10" />
                      <span>5G 100%</span>
                    </div>

                    {/* 8 Homescreen App Tiles (Brand App in Hero Position with Complete Vector Emblem & Full Brand Name) */}
                    <div className="grid grid-cols-4 gap-3 pt-1">
                      {/* Primary Brand App Icon */}
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="relative w-14 h-14 rounded-[16px] bg-white p-1.5 shadow-2xl border border-white/30 flex items-center justify-center">
                          <span
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-extrabold flex items-center justify-center text-slate-950 shadow"
                            style={{ backgroundColor: state.accent }}
                          >
                            1
                          </span>
                          <svg
                            viewBox="0 0 200 200"
                            className="w-full h-full overflow-visible"
                            dangerouslySetInnerHTML={{ __html: liveEmblemInner }}
                          />
                        </div>
                        <span className="text-[10px] font-extrabold text-white truncate max-w-[66px]">
                          {fullBrandDisplay}
                        </span>
                      </div>

                      {/* 7 Companion iOS Apps */}
                      {[
                        { name: 'Analytics', bg: 'bg-indigo-950/90', dot: state.secondary },
                        { name: 'Wallet', bg: 'bg-slate-800/90', dot: state.accent },
                        { name: 'Markets', bg: 'bg-emerald-950/90', dot: '#10B981' },
                        { name: 'Mail', bg: 'bg-slate-800/80', dot: '#38BDF8' },
                        { name: 'Files', bg: 'bg-slate-800/80', dot: '#818CF8' },
                        { name: 'Calendar', bg: 'bg-slate-800/80', dot: '#F43F5E' },
                        { name: 'Settings', bg: 'bg-slate-800/80', dot: '#94A3B8' },
                      ].map((app) => (
                        <div key={app.name} className="flex flex-col items-center gap-1.5 opacity-75">
                          <div
                            className={`w-14 h-14 rounded-[16px] ${app.bg} border border-white/10 flex items-center justify-center shadow-md`}
                          >
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: app.dot }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-300 truncate max-w-[64px]">{app.name}</span>
                        </div>
                      ))}
                    </div>

                    {/* iOS Medium Widget with Horizontal Logo, Activity Spline & Metrics */}
                    <div className="rounded-3xl bg-[#090D18]/90 backdrop-blur-md border border-white/15 p-3.5 shadow-xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        {renderLiveHorizontalBrandLogo(26, true)}
                        <span
                          className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${state.secondary}25`, color: state.secondary }}
                        >
                          LIVE +18.4%
                        </span>
                      </div>
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <div className="text-[10px] text-slate-400">Active Index</div>
                          <div className="text-lg font-black text-white font-mono">$48,920</div>
                        </div>
                        <svg viewBox="0 0 120 34" className="w-28 h-8">
                          <path
                            d="M 3 28 Q 28 10, 54 20 T 116 6"
                            fill="none"
                            stroke={state.secondary}
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                          <circle cx="116" cy="6" r="3.5" fill={state.accent} />
                        </svg>
                      </div>
                    </div>

                    <div className="text-center text-[10px] text-slate-400 font-mono">
                      iOS 18 Continuous Squircle &amp; Medium Smart Widget
                    </div>
                  </div>

                  {/* PANEL 2 (4 cols): 4 Surface Variants Matrix (512x512 Squircle Preview) */}
                  <div className="lg:col-span-4 bg-[#06080D] border border-white/[0.07] rounded-2xl p-4 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                        4 Surface Variants Matrix (512×512)
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Download individual SVG or 512×512 PNG for any surface background.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 flex-1 items-center">
                      {(
                        [
                          { id: 'primary', label: 'Primary Ink Surface' },
                          { id: 'white', label: 'Pure White Surface' },
                          { id: 'accent', label: 'Brand Accent Gradient' },
                          { id: 'dark', label: 'Dark Glass Tinted' },
                        ] as const
                      ).map((surf) => {
                        const svgStr = buildAppIconVariantSvg(state, surf.id, 512);
                        const cleanDom = (state.domain || 'app').toLowerCase().replace(/[^a-z0-9]/g, '-');
                        return (
                          <div
                            key={surf.id}
                            className="bg-[#0B0E17] border border-white/[0.07] rounded-xl p-2.5 flex flex-col items-center gap-2"
                          >
                            <div
                              className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg [&>svg]:w-full [&>svg]:h-full"
                              dangerouslySetInnerHTML={{ __html: svgStr }}
                            />
                            <span className="text-[10px] font-bold text-slate-300 text-center leading-tight">
                              {surf.label}
                            </span>
                            <div className="flex items-center gap-1.5 w-full">
                              <button
                                type="button"
                                onClick={() =>
                                  downloadSvgStringAsPng(svgStr, 512, 512, `${cleanDom}-icon-${surf.id}-512.png`)
                                }
                                className="flex-1 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-[10px] font-mono font-bold text-indigo-300 cursor-pointer"
                              >
                                PNG
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  downloadSvgString(svgStr, `${cleanDom}-icon-${surf.id}.svg`)
                                }
                                className="flex-1 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono font-bold text-slate-300 cursor-pointer"
                              >
                                SVG
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* PANEL 3 (4 cols): Multi-Size Technical Spec & App Store Search Card */}
                  <div className="lg:col-span-4 bg-[#06080D] border border-white/[0.07] rounded-2xl p-4 flex flex-col justify-between space-y-4">
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                        Multi-Size Technical Spec &amp; App Store Card
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Optical legibility verified from 1024px down to 16px favicon.
                      </p>
                    </div>

                    {/* Multi-Size Scale Row */}
                    <div className="bg-[#0B0E17] border border-white/[0.07] rounded-xl p-3 flex items-end justify-between gap-2">
                      {[
                        { label: 'App Store', sub: '1024px', box: 'w-14 h-14 rounded-2xl' },
                        { label: 'Home', sub: '180px', box: 'w-11 h-11 rounded-xl' },
                        { label: 'Spotlight', sub: '120px', box: 'w-9 h-9 rounded-lg' },
                        { label: 'Notif', sub: '60px', box: 'w-7 h-7 rounded-md' },
                        { label: 'Favicon', sub: '32/16px', box: 'w-5 h-5 rounded' },
                      ].map((sz) => (
                        <div key={sz.label} className="flex flex-col items-center gap-1">
                          <div className={`${sz.box} bg-white p-1 shadow border border-white/20 flex items-center justify-center`}>
                            <svg
                              viewBox="0 0 200 200"
                              className="w-full h-full"
                              dangerouslySetInnerHTML={{ __html: liveEmblemInner }}
                            />
                          </div>
                          <span className="text-[9px] font-bold text-slate-300">{sz.label}</span>
                          <span className="text-[8px] font-mono text-slate-500">{sz.sub}</span>
                        </div>
                      ))}
                    </div>

                    {/* App Store Search Result Card */}
                    <div className="bg-[#0B0E17] border border-white/[0.07] rounded-xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-14 h-14 rounded-2xl bg-white p-1.5 shadow-md shrink-0">
                            <svg
                              viewBox="0 0 200 200"
                              className="w-full h-full"
                              dangerouslySetInnerHTML={{ __html: liveEmblemInner }}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-extrabold text-white truncate">
                              {fullBrandDisplay} — {state.nicheLabel.split('&')[0]}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">{state.domain} Official App</div>
                            <div className="flex items-center gap-1 mt-1 text-amber-400 text-[10px] font-bold">
                              <Star className="w-3 h-3 fill-amber-400" />
                              <span>4.9 · #1 in Business</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => downloadOffscreenPng(state, true, 'app-icon-512x512.png')}
                          className="px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold cursor-pointer shrink-0"
                        >
                          GET
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleDownloadAllAppIcons}
                      disabled={isExportingAppZip}
                      className="w-full py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-xs font-extrabold text-emerald-300 flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export All App Icons (.ZIP)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW TAB 4: MARKETPLACE CARD (Dual-View: Live Marketplace Cards + 80% Cropper.js Simulator) */}
            {activeTab === 'mockup-atom' && (
              <div className="bg-[#0B0E17] border border-white/[0.08] rounded-2xl p-5 shadow-2xl space-y-5 max-w-[1280px] mx-auto">
                {/* Top Sub-Tab Switcher */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] pb-3.5">
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      Domain Marketplace Suite &amp; Atom.com 80% Auto-Crop Simulator
                    </h3>
                    <p className="text-xs text-slate-400">
                      Preview live domain sales cards (Atom, Executive Lander, Sedo/Afternic) or inspect the Cropper.js 80% safe zone.
                    </p>
                  </div>

                  <div className="flex items-center gap-1 bg-[#06080D] p-1 rounded-xl border border-white/[0.08]">
                    <button
                      type="button"
                      onClick={() => setMarketplaceView('live-cards')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        marketplaceView === 'live-cards'
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Live Marketplace Cards (Atom / Sedo / Lander)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMarketplaceView('crop-sim')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        marketplaceView === 'crop-sim'
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      80% Auto-Crop Simulator (Cropper.js)
                    </button>
                  </div>
                </div>

                {/* SUB-VIEW 1: LIVE MARKETPLACE CARDS (Atom Grid Card + Executive Lander + Sedo/Afternic Row) */}
                {marketplaceView === 'live-cards' && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                      {/* 1. Atom / Squadhelp Premium Grid Card (5 cols) */}
                      <div className="lg:col-span-5 bg-[#06080D] border border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                            1. Atom / Squadhelp Premium Grid Card
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            PREMIUM DOMAIN
                          </span>
                        </div>

                        <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-lg p-3 space-y-3 text-slate-900">
                          <div
                            className="aspect-[5/3] bg-white rounded-lg overflow-hidden border border-slate-100 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                            dangerouslySetInnerHTML={{ __html: liveMainCardSvg }}
                          />

                          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                            <div>
                              <div className="text-sm font-black text-slate-900">{state.domain}</div>
                              <div className="text-[11px] text-slate-500">
                                $2,495 · or $208/mo for 12 mos
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: state.primary }} />
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: state.secondary }} />
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: state.accent }} />
                              </div>
                              <button
                                type="button"
                                onClick={() => downloadOffscreenPng(state, false)}
                                style={{ backgroundColor: state.primary }}
                                className="px-3 py-1.5 rounded-lg text-white text-xs font-extrabold cursor-pointer"
                              >
                                Buy Now
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 2. Executive Domain Lander Hero Card (7 cols) */}
                      <div className="lg:col-span-7 bg-[#06080D] border border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                            2. Executive Domain For-Sale Lander
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            Escrow.com / Atom Pay Protected
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-[#0B0F1C] border border-white/[0.07] rounded-xl p-4">
                          <div className="md:col-span-7 space-y-3">
                            <div className="bg-white rounded-xl p-3 shadow-md">
                              <div
                                className="w-full [&>svg]:w-full [&>svg]:h-auto"
                                dangerouslySetInnerHTML={{ __html: liveMainCardSvg }}
                              />
                            </div>
                            <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-emerald-300">
                              <span className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                                <CheckCircle2 className="w-3 h-3" /> Full Vector SVG
                              </span>
                              <span className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                                <CheckCircle2 className="w-3 h-3" /> Custom Color Palette
                              </span>
                              <span className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                                <CheckCircle2 className="w-3 h-3" /> Social Media Kit
                              </span>
                            </div>
                          </div>

                          <div className="md:col-span-5 bg-[#06080D] border border-white/[0.08] rounded-xl p-3.5 space-y-2.5">
                            <div className="text-[10px] font-mono uppercase text-slate-400">Acquire Domain</div>
                            <div className="text-lg font-black text-white">{state.domain}</div>
                            <div className="space-y-1.5 pt-1">
                              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-300">
                                <span>Buy Now</span>
                                <span>$2,495</span>
                              </div>
                              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.04] border border-white/[0.07] text-xs font-semibold text-slate-300">
                                <span>Lease to Own</span>
                                <span>$208 / mo</span>
                              </div>
                              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.04] border border-white/[0.07] text-xs font-semibold text-slate-300">
                                <span>Make Offer</span>
                                <span>Min $1,250</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3. Sedo / Afternic Compact Row Listing */}
                    <div className="bg-[#06080D] border border-white/[0.08] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-white p-1.5 shadow flex items-center justify-center shrink-0">
                          <svg
                            viewBox="0 0 200 200"
                            className="w-full h-full"
                            dangerouslySetInnerHTML={{ __html: liveEmblemInner }}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white">{state.domain}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                              {state.nicheLabel}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            SedoMLS / Afternic Fast-Transfer · Instant Vector Brand Kit Included
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-[10px] font-mono text-slate-400">Semantic Brand Score</div>
                          <div className="text-sm font-extrabold text-emerald-400">9.6 / 10 (Tier-1)</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setMarketplaceView('crop-sim')}
                          className="px-3.5 py-2 rounded-xl bg-[#101522] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-bold text-slate-200 cursor-pointer"
                        >
                          Verify 80% Atom Crop →
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB-VIEW 2: 80% AUTO-CROP SIMULATOR (Cropper.js) */}
                {marketplaceView === 'crop-sim' && (
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">Atom.com Cropper.js Simulator</span>
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                          autoCropArea: 0.8
                        </span>
                      </div>

                      <div className="bg-[#06080D] p-1 rounded-xl border border-white/[0.07] flex items-center">
                        <button
                          type="button"
                          onClick={() => setAtomSimMode('main')}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            atomSimMode === 'main'
                              ? 'bg-indigo-600 text-white shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Main 750×450 (5:3)
                        </button>
                        <button
                          type="button"
                          onClick={() => setAtomSimMode('square')}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            atomSimMode === 'square'
                              ? 'bg-indigo-600 text-white shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Square 600×600 (1:1)
                        </button>
                      </div>
                    </div>

                    {/* Automatic Cut Verification Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#101522] border border-white/[0.07] rounded-xl">
                      <div className="flex items-center gap-2">
                        {currentSimLayout && !currentSimLayout.isCutByDefaultCrop ? (
                          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span>Nothing is cut</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-lg">
                            <AlertTriangle className="w-4 h-4 text-rose-400" />
                            <span>
                              Cut by Atom&apos;s default crop: {currentSimLayout?.cutDetails?.side},{' '}
                              {currentSimLayout?.cutDetails?.px}px
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="text-[11px] font-mono text-slate-400 flex items-center gap-4">
                        <span>
                          Bounding Box:{' '}
                          <strong className="text-white">
                            {currentSimLayout?.boundingBox.width} × {currentSimLayout?.boundingBox.height} px
                          </strong>
                        </span>
                        <span>
                          Default Crop Zone:{' '}
                          <strong className="text-orange-400">
                            {currentCrop.w} × {currentCrop.h} px
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      <div className="lg:col-span-7 bg-[#1c212d] border border-slate-700/80 rounded-2xl p-4 shadow-2xl flex flex-col justify-between">
                        <div className="border-b border-slate-700/60 pb-2.5 mb-3 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-white">
                              Crop {atomSimMode === 'main' ? 'Main' : 'Square'} Logo (Atom.com Upload Dialog)
                            </div>
                            <div className="text-[10px] text-slate-400">
                              The orange frame shows the default 80% crop window.
                            </div>
                          </div>
                          <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                            Cropper.js viewMode: 1
                          </span>
                        </div>

                        <div className="relative bg-[#2e3136] rounded-xl p-3 flex items-center justify-center overflow-hidden border border-slate-600">
                          <div
                            className="relative shadow-2xl bg-white overflow-hidden flex items-center justify-center"
                            style={{
                              width: '100%',
                              maxWidth: atomSimMode === 'square' ? '340px' : '440px',
                              aspectRatio: atomSimMode === 'square' ? '1/1' : '5/3',
                            }}
                          >
                            <canvas
                              ref={atomUploadCanvasRef}
                              width={currentSimW}
                              height={currentSimH}
                              className="w-full h-full object-contain"
                            />

                            <div className="absolute inset-0 pointer-events-none">
                              <div className="absolute top-0 left-0 right-0 h-[10%] bg-black/55" />
                              <div className="absolute bottom-0 left-0 right-0 h-[10%] bg-black/55" />
                              <div className="absolute top-[10%] bottom-[10%] left-0 w-[10%] bg-black/55" />
                              <div className="absolute top-[10%] bottom-[10%] right-0 w-[10%] bg-black/55" />
                            </div>

                            <div
                              className="absolute pointer-events-none border-2 border-[#ff5a36]"
                              style={{ top: '10%', bottom: '10%', left: '10%', right: '10%' }}
                            >
                              <div className="absolute -top-1.5 -left-1.5 w-2.5 h-2.5 bg-white border-2 border-[#ff5a36]" />
                              <div className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-white border-2 border-[#ff5a36]" />
                              <div className="absolute -bottom-1.5 -left-1.5 w-2.5 h-2.5 bg-white border-2 border-[#ff5a36]" />
                              <div className="absolute -bottom-1.5 -right-1.5 w-2.5 h-2.5 bg-white border-2 border-[#ff5a36]" />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 mt-3 pt-2.5 border-t border-slate-700/60">
                          <span className="text-[11px] text-slate-400">
                            Atom upload file: <strong>{atomSimMode === 'main' ? '1500 × 900 px' : '1200 × 1200 px'}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => downloadOffscreenPng(state, atomSimMode === 'square')}
                            className="px-3.5 py-1.5 bg-[#1877f2] hover:bg-[#166fe5] text-white text-xs font-bold rounded-lg shadow transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download {atomSimMode === 'main' ? '1500 × 900' : '1200 × 1200'} File</span>
                          </button>
                        </div>
                      </div>

                      <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
                        <div className="bg-[#101522] border border-white/[0.07] rounded-2xl p-4 shadow-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-200">
                              Result after Crop &amp; Apply ({currentSimW} × {currentSimH} px)
                            </span>
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              Scaled Output
                            </span>
                          </div>

                          <div className="bg-white rounded-xl overflow-hidden border border-slate-300 flex items-center justify-center p-2.5 shadow-inner">
                            <canvas
                              ref={atomCroppedCanvasRef}
                              width={currentSimW}
                              height={currentSimH}
                              className="w-full h-auto max-h-[210px] object-contain rounded"
                            />
                          </div>

                          <div className="p-2.5 bg-[#06080D] rounded-xl border border-white/[0.06] text-[11px] text-slate-300">
                            <span className="font-bold text-indigo-300">Atom.com Upload &amp; Crop Guarantee: </span>
                            <span className="text-slate-400">
                              Fitted inside the central 80% crop zone so 100% of the logo remains intact.
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VIEW TAB 5: SOCIAL MEDIA KIT (12 FORMATS · 8 PLATFORMS) */}
            {activeTab === 'social-kit' && <SocialMediaKitStage state={state} />}
          </div>

          {/* BOTTOM FLOATING COLOR HARMONY DOCK */}
          <div className="flex items-center justify-between gap-3 bg-[#0B0E17]/95 backdrop-blur-md border border-white/[0.09] px-3.5 py-2 rounded-2xl shadow-2xl max-w-[1040px] mx-auto w-full z-20 flex-wrap mt-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-400" />
                <span>Curated Color Palette</span>
              </span>
              <select
                value={
                  COLOR_PALETTES.findIndex(
                    (p) =>
                      p.primary.toLowerCase() === state.primary.toLowerCase() &&
                      p.secondary.toLowerCase() === state.secondary.toLowerCase()
                  )
                }
                onChange={(e) => {
                  const idx = parseInt(e.target.value, 10);
                  const p = COLOR_PALETTES[idx];
                  if (p) {
                    onUpdateState({
                      primary: p.primary,
                      secondary: p.secondary,
                      accent: p.accent,
                    });
                  }
                }}
                aria-label="Select Curated Color Palette"
                className="bg-[#06080D] border border-white/[0.07] rounded-lg px-2.5 py-1 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value={-1} disabled>
                  Select Curated Palette ({COLOR_PALETTES.length} presets)...
                </option>
                {COLOR_PALETTES.map((pal, idx) => (
                  <option key={pal.name} value={idx} className="bg-[#0B0E17] text-white">
                    {idx + 1}. {pal.name}
                  </option>
                ))}
              </select>

              {onCyclePalette && (
                <button
                  type="button"
                  onClick={onCyclePalette}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-[11px] font-bold text-indigo-300 transition flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Next Palette ↻</span>
                </button>
              )}
            </div>

            {/* 3 Live Color Swatch Pickers */}
            <div className="flex items-center gap-2">
              {/* Primary Ink */}
              <label className="flex items-center gap-2 bg-[#06080D] border border-white/[0.07] hover:border-white/20 rounded-xl px-2.5 py-1 cursor-pointer transition">
                <input
                  type="color"
                  value={state.primary}
                  onChange={(e) => onUpdateState({ primary: e.target.value })}
                  className="w-5 h-5 rounded cursor-pointer bg-transparent border-0 p-0"
                />
                <div className="leading-tight">
                  <div className="text-[9px] text-slate-400 font-semibold">Primary Ink</div>
                  <div className="text-[10px] font-mono font-bold text-white">
                    {state.primary.toUpperCase()}
                  </div>
                </div>
              </label>

              {/* Brand Accent */}
              <label className="flex items-center gap-2 bg-[#06080D] border border-white/[0.07] hover:border-white/20 rounded-xl px-2.5 py-1 cursor-pointer transition">
                <input
                  type="color"
                  value={state.secondary}
                  onChange={(e) => onUpdateState({ secondary: e.target.value })}
                  className="w-5 h-5 rounded cursor-pointer bg-transparent border-0 p-0"
                />
                <div className="leading-tight">
                  <div className="text-[9px] text-slate-400 font-semibold">Brand Accent</div>
                  <div className="text-[10px] font-mono font-bold text-white">
                    {state.secondary.toUpperCase()}
                  </div>
                </div>
              </label>

              {/* Spark Point */}
              <label className="flex items-center gap-2 bg-[#06080D] border border-white/[0.07] hover:border-white/20 rounded-xl px-2.5 py-1 cursor-pointer transition">
                <input
                  type="color"
                  value={state.accent}
                  onChange={(e) => onUpdateState({ accent: e.target.value })}
                  className="w-5 h-5 rounded cursor-pointer bg-transparent border-0 p-0"
                />
                <div className="leading-tight">
                  <div className="text-[9px] text-slate-400 font-semibold">Spark Point</div>
                  <div className="text-[10px] font-mono font-bold text-white">
                    {state.accent.toUpperCase()}
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
