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
} from 'lucide-react';
import { LogoState } from '../../types/logo';
import { drawLogoOnCanvas, loadSvgToImage } from '../../utils/canvasRenderer';
import { buildEmblemSvgMarkup } from '../../utils/svgBuilder';
import { downloadSvg, downloadOffscreenPng } from '../../utils/exporter';
import { ensureFontsLoaded } from '../../utils/fontLoader';
import { LockupLayoutResult } from '../../utils/lockupLayout';
import { ATOM_MAIN, ATOM_SQUARE, getCropZone } from '../../utils/atomSpec';
import { COLOR_PALETTES } from '../../data/domains';

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
  const [activeTab, setActiveTab] = React.useState<'studio' | 'mockup-web' | 'mockup-app' | 'mockup-atom'>('studio');
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
  }, [state, showSafeGrid, atomSimMode, activeTab]);

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
          {/* TOP FLOATING HUD: View Mode Switcher + Surface Context + Crop Zone + Bezier Guides */}
          <div className="flex items-center justify-between gap-2 z-20 flex-wrap">
            {/* View Mode Tabs */}
            <div className="flex items-center gap-1 bg-[#0B0E17]/95 backdrop-blur-md border border-white/[0.08] p-1 rounded-xl shadow-2xl">
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
                  {/* Artboard Header Bar */}
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

                  {/* Artboard Frame */}
                  <div
                    className={`relative rounded-2xl border border-white/15 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.85)] overflow-hidden transition-colors duration-200 flex items-center justify-center p-3 ${getArtboardSurfaceClass()}`}
                  >
                    {/* 80% Atom Safe Crop Overlay */}
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

                    {/* Vector Bezier Guides Overlay */}
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
                          <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded bg-indigo-600 text-[8px] font-mono text-white whitespace-nowrap shadow z-20">
                            Lockup · {state.fontFamily} · {state.construction?.label || state.containerStyle}
                          </div>
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
                  {/* Artboard Header Bar */}
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

                  {/* Artboard Frame */}
                  <div
                    className={`relative rounded-2xl border border-white/15 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.85)] overflow-hidden transition-colors duration-200 flex items-center justify-center p-3 ${getArtboardSurfaceClass()}`}
                  >
                    {/* 80% Atom Safe Crop Overlay */}
                    {showSafeGrid && (
                      <div className="absolute inset-[10%] border-2 border-dashed border-amber-500/80 rounded-lg pointer-events-none z-20 flex items-start justify-between p-1.5 bg-amber-500/[0.03]">
                        <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 shadow">
                          Atom 600×600 Safe
                        </span>
                      </div>
                    )}

                    {/* Vector Bezier Guides Overlay */}
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

            {/* VIEW TAB 2: WEBSITE HEADER NAVBAR MOCKUP */}
            {activeTab === 'mockup-web' && (
              <div className="bg-[#0B0E17] border border-white/[0.08] rounded-2xl p-6 shadow-2xl space-y-6 max-w-[1160px] mx-auto">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm">Real-World SaaS Navigation Bar Mockup</h3>
                    <p className="text-xs text-slate-400">
                      Preview your logo rendered in a sleek SaaS desktop web application header.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                    Desktop 1440px Baseline
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-700/60 overflow-hidden shadow-2xl bg-[#030712]">
                  <div className="bg-[#0d121f] px-4 py-2.5 border-b border-slate-800 flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                      <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                      <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                    </div>
                    <div className="flex-1 max-w-sm mx-auto bg-[#070a12] border border-slate-800 rounded-lg px-3 py-1 text-[11px] text-slate-400 font-mono text-center truncate">
                      https://{state.domain}
                    </div>
                  </div>

                  <header className="px-8 py-4 border-b border-slate-800 bg-[#080d1a]/95 backdrop-blur flex items-center justify-between gap-8">
                    <div className="flex items-center gap-3">
                      <canvas
                        ref={(c) => {
                          if (c && mainCanvasRef.current) {
                            const ctx = c.getContext('2d');
                            ctx?.clearRect(0, 0, 180, 108);
                            ctx?.drawImage(mainCanvasRef.current, 0, 0, 180, 108);
                          }
                        }}
                        width={180}
                        height={108}
                        className="w-36 h-auto"
                      />
                    </div>

                    <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-300">
                      <span className="hover:text-white cursor-pointer transition">Platform</span>
                      <span className="hover:text-white cursor-pointer transition">Solutions</span>
                      <span className="hover:text-white cursor-pointer transition">Resources</span>
                      <span className="hover:text-white cursor-pointer transition">Pricing</span>
                    </nav>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        style={{ backgroundColor: state.secondary }}
                        className="px-4 py-2 text-xs font-bold text-white rounded-xl shadow-lg transition"
                      >
                        Get Started
                      </button>
                    </div>
                  </header>

                  <div className="p-10 text-center max-w-2xl mx-auto space-y-4">
                    <div className="inline-block px-3 py-1 rounded-full text-[10px] font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20">
                      Next-Generation {state.nicheLabel}
                    </div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight" style={{ fontFamily: state.fontFamily }}>
                      Transforming the Future of {state.word1} {state.word2}
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Experience high-performance tools engineered for modern business. Scalable, secure, and intuitive from day one.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW TAB 3: MOBILE APP ICON MOCKUP */}
            {activeTab === 'mockup-app' && (
              <div className="bg-[#0B0E17] border border-white/[0.08] rounded-2xl p-6 shadow-2xl space-y-6 max-w-[920px] mx-auto">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm">Mobile Smartphone App Icon Mockup</h3>
                    <p className="text-xs text-slate-400">
                      Preview your vector mark on an iOS / Android squircle app tile.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadOffscreenPng(state, true, 'app-icon-512x512.png')}
                    className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition cursor-pointer"
                  >
                    Export 512×512 App Icon
                  </button>
                </div>

                <div className="max-w-sm mx-auto bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[44px] p-6 border-4 border-slate-700 shadow-2xl space-y-8">
                  <div className="flex justify-between items-center text-xs text-slate-400 font-mono px-3 pt-1">
                    <span>9:41</span>
                    <div className="w-16 h-3 bg-slate-800 rounded-full" />
                    <span>5G 100%</span>
                  </div>

                  <div className="grid grid-cols-4 gap-4 pt-4">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-16 h-16 rounded-[18px] bg-white p-1 shadow-2xl border border-white/20 flex items-center justify-center overflow-hidden">
                        <canvas
                          ref={(c) => {
                            if (c && squareCanvasRef.current) {
                              const ctx = c.getContext('2d');
                              ctx?.clearRect(0, 0, 120, 120);
                              ctx?.drawImage(squareCanvasRef.current, 0, 0, 120, 120);
                            }
                          }}
                          width={120}
                          height={120}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="text-[10px] font-bold text-white truncate max-w-[64px]">
                        {state.word1}
                      </span>
                    </div>

                    {['Safari', 'Maps', 'Mail', 'Photos', 'Notes', 'Stocks', 'Music'].map((app) => (
                      <div key={app} className="flex flex-col items-center gap-1.5 opacity-60">
                        <div className="w-16 h-16 rounded-[18px] bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-[10px] text-slate-400">
                          {app[0]}
                        </div>
                        <span className="text-[10px] text-slate-400 truncate max-w-[64px]">{app}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 text-center text-[11px] text-slate-400">
                    Native Continuous Squircle (Apple iOS &amp; Material 3 Spec)
                  </div>
                </div>
              </div>
            )}

            {/* VIEW TAB 4: LIVE ATOM MARKETPLACE & CROP SIMULATOR */}
            {activeTab === 'mockup-atom' && (
              <div className="bg-[#0B0E17] border border-white/[0.08] rounded-2xl p-5 shadow-2xl space-y-5 max-w-[1200px] mx-auto">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-sm">Atom.com Cropper.js Simulator</h3>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                        autoCropArea: 0.8
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Atom.com&apos;s Cropper.js default crop covers the central 80% (autoCropArea: 0.8). Outer 10% is discarded.
                    </p>
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

                    {currentSimLayout?.isClamped && (
                      <span className="text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                        Limited to the Atom crop zone
                      </span>
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

          {/* BOTTOM FLOATING COLOR HARMONY DOCK */}
          <div className="flex items-center justify-between gap-3 bg-[#0B0E17]/95 backdrop-blur-md border border-white/[0.09] px-3.5 py-2 rounded-2xl shadow-2xl max-w-[1040px] mx-auto w-full z-20 flex-wrap">
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
