import React from 'react';
import { Download, Code, Check, Smartphone, Layout, ShoppingBag, Grid, ShieldCheck, AlertTriangle, Sparkles, RefreshCw, Archive } from 'lucide-react';
import { LogoState } from '../../types/logo';
import { drawLogoOnCanvas, loadSvgToImage } from '../../utils/canvasRenderer';
import { buildEmblemSvgMarkup } from '../../utils/svgBuilder';
import { downloadSvg, copySvgCode, downloadOffscreenPng, downloadAll10VariantsZip } from '../../utils/exporter';
import { ensureFontsLoaded } from '../../utils/fontLoader';
import { LockupLayoutResult } from '../../utils/lockupLayout';
import { ATOM_MAIN, ATOM_SQUARE, getCropZone } from '../../utils/atomSpec';
import { getExtendedSemanticIconsForDomain } from '../../data/domainSemanticIcons';

interface DualCanvasStageProps {
  state: LogoState;
  onUpdateState: (patch: Partial<LogoState>) => void;
  remixMode?: 'core-focus' | 'deep-semantic';
  onChangeRemixMode?: (mode: 'core-focus' | 'deep-semantic') => void;
  onRemixVariants?: () => void;
}

export const DualCanvasStage: React.FC<DualCanvasStageProps> = ({
  state,
  remixMode = 'core-focus',
  onChangeRemixMode,
  onRemixVariants,
}) => {
  const [activeTab, setActiveTab] = React.useState<'studio' | 'mockup-web' | 'mockup-app' | 'mockup-atom'>('studio');
  const [showSafeGrid, setShowSafeGrid] = React.useState(false);
  const [copiedSvg, setCopiedSvg] = React.useState(false);
  const [atomSimMode, setAtomSimMode] = React.useState<'main' | 'square'>('main');
  const [isExportingZip, setIsExportingZip] = React.useState(false);
  const [exportStatus, setExportStatus] = React.useState('');

  const semanticPool = React.useMemo(() => {
    return getExtendedSemanticIconsForDomain(
      state.domain,
      state.word1,
      state.word2,
      state.nicheLabel,
      state.icons10,
      state.iconGroups
    );
  }, [state.domain, state.word1, state.word2, state.nicheLabel, state.icons10, state.iconGroups]);

  const handleExportZip = async () => {
    try {
      setIsExportingZip(true);
      await downloadAll10VariantsZip(state, (msg) => setExportStatus(msg));
    } catch (err) {
      console.error(err);
    } finally {
      setIsExportingZip(false);
      setExportStatus('');
    }
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

      // A) Uploaded Canvas (Full 750x450 or 600x600 image before crop)
      if (atomUploadCanvasRef.current) {
        drawLogoOnCanvas(atomUploadCanvasRef.current, img, state, simW, simH, isSimSquare, false, 1);
      }

      // B) Cropped Result Canvas (Cropper.js getCroppedCanvas: takes central 80% and scales to output)
      if (atomCroppedCanvasRef.current) {
        const crop = getCropZone(simW, simH);
        const tempCanvas = document.createElement('canvas');
        // Render 2x source for pristine crop scaling
        drawLogoOnCanvas(tempCanvas, img, state, simW, simH, isSimSquare, false, 2);

        const cropCtx = atomCroppedCanvasRef.current.getContext('2d');
        if (cropCtx) {
          atomCroppedCanvasRef.current.width = simW;
          atomCroppedCanvasRef.current.height = simH;
          cropCtx.imageSmoothingEnabled = true;
          cropCtx.imageSmoothingQuality = 'high';

          // Crop from 2x canvas source
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
  }, [state, showSafeGrid, atomSimMode]);

  const handleCopySvg = async () => {
    const success = await copySvgCode(state, { background: 'transparent' });
    if (success) {
      setCopiedSvg(true);
      setTimeout(() => setCopiedSvg(false), 2000);
    }
  };

  const currentSimLayout = atomSimMode === 'square' ? squareLayout : mainLayout;
  const currentSimW = atomSimMode === 'square' ? ATOM_SQUARE.w : ATOM_MAIN.w;
  const currentSimH = atomSimMode === 'square' ? ATOM_SQUARE.h : ATOM_MAIN.h;
  const currentCrop = getCropZone(currentSimW, currentSimH);

  return (
    <div className="flex flex-col gap-4">
      {/* Stage Toolbar & View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0b0f1a] border border-[#1b2333] rounded-2xl px-4 py-2.5 shadow-xl">
        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 bg-[#06080f] p-1 rounded-xl border border-[#1b2333]">
          <button
            type="button"
            onClick={() => setActiveTab('studio')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
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
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
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
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
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
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'mockup-atom'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Marketplace Card</span>
          </button>
        </div>

        {/* View Controls: Safe Grid, Quick SVG Actions & 10 Concepts Remix/Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          <label className="flex items-center gap-1.5 text-xs text-orange-400 font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={showSafeGrid}
              onChange={(e) => setShowSafeGrid(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-orange-500 cursor-pointer"
            />
            <span>Atom crop zone (80%)</span>
          </label>

          <div className="h-4 w-[1px] bg-slate-800" />

          {/* Quick SVG Actions */}
          <button
            type="button"
            onClick={handleCopySvg}
            className="px-2.5 py-1 text-xs font-semibold bg-[#111726] hover:bg-[#182137] text-slate-200 rounded-lg border border-[#232d44] flex items-center gap-1 transition cursor-pointer"
            title="Copy vector SVG markup"
          >
            {copiedSvg ? <Check className="w-3 h-3 text-emerald-400" /> : <Code className="w-3 h-3 text-cyan-400" />}
            <span>{copiedSvg ? 'Copied!' : 'Copy SVG'}</span>
          </button>

          <button
            type="button"
            onClick={() => downloadSvg(state, `${state.domain || 'logo'}-vector.svg`)}
            className="px-2.5 py-1 text-xs font-semibold bg-[#111726] hover:bg-[#182137] text-slate-200 rounded-lg border border-[#232d44] flex items-center gap-1 transition cursor-pointer"
            title="Download vector SVG file"
          >
            <Download className="w-3 h-3 text-emerald-400" />
            <span>Export SVG</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-800" />

          {/* Core 10 vs Deep Semantic Switcher */}
          {onChangeRemixMode && (
            <div className="flex items-center bg-[#06080f] p-0.5 rounded-lg border border-[#232d44] text-[10px] font-semibold">
              <button
                type="button"
                onClick={() => onChangeRemixMode('core-focus')}
                className={`px-2 py-1 rounded-md transition cursor-pointer ${
                  remixMode === 'core-focus'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Rotate the 10 primary domain symbols across new container architectures"
              >
                Core 10 ({semanticPool.tier1.length})
              </button>
              <button
                type="button"
                onClick={() => onChangeRemixMode('deep-semantic')}
                className={`px-2 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                  remixMode === 'deep-semantic'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Anchor the 4 Core symbols and rotate extended domain-morpheme symbols"
              >
                <Sparkles className="w-2.5 h-2.5" />
                <span>Deep Semantic ({semanticPool.allSemantic.length})</span>
              </button>
            </div>
          )}

          {/* Remix Architectures */}
          {onRemixVariants && (
            <button
              type="button"
              onClick={onRemixVariants}
              className="px-2.5 py-1 text-xs font-semibold bg-[#111726] hover:bg-[#182137] text-amber-300 rounded-lg border border-[#232d44] transition flex items-center gap-1.5 cursor-pointer"
              title="Remix icon-to-architecture pairings, typography contrast, and palettes"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Remix Architectures ↻</span>
            </button>
          )}

          {/* Export 10 (.ZIP) */}
          <button
            type="button"
            onClick={handleExportZip}
            disabled={isExportingZip || state.variants10.length === 0}
            className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 rounded-lg border border-emerald-500/30 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Export all 10 concepts as SVGs and PNGs in a .ZIP file"
          >
            <Archive className="w-3 h-3" />
            <span>{isExportingZip ? (exportStatus || 'Exporting...') : 'Export 10 (.ZIP)'}</span>
          </button>
        </div>
      </div>

      {/* VIEW TAB 1: MASTER CANVASES (750x450 & 600x600) */}
      {activeTab === 'studio' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
          {/* IMAGE 1: 750 × 450 (MAIN LOGO) */}
          <div className="xl:col-span-7 bg-[#0b0f1a] border border-[#1b2333] rounded-2xl p-4 shadow-xl flex flex-col">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[11px] font-extrabold rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  IMAGE 1 — MAIN LOGO
                </span>
                <span className="text-xs font-mono text-slate-400">
                  upload 1500 × 900 → Atom 750 × 450
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => downloadSvg(state, 'main-logo-750x450.svg', { width: 750, height: 450 })}
                  className="px-2.5 py-1 text-xs font-semibold bg-[#111726] hover:bg-[#182137] text-slate-200 rounded-lg border border-[#232d44] transition cursor-pointer"
                  title="Download as Vector SVG"
                >
                  SVG
                </button>
                <button
                  type="button"
                  onClick={() => downloadOffscreenPng(state, false)}
                  className="px-2.5 py-1 text-xs font-bold bg-[#111726] hover:bg-[#182137] text-slate-200 rounded-lg border border-[#232d44] transition cursor-pointer"
                  title="Export high-resolution 1500x900 PNG for Atom upload"
                >
                  Export PNG ↓
                </button>
              </div>
            </div>

            <div
              className={`rounded-xl p-4 flex items-center justify-center border border-slate-800/80 overflow-auto ${
                state.bgMode === 'transparent'
                  ? 'canvas-checkerboard'
                  : state.bgMode === 'dark'
                  ? 'bg-[#06080f]'
                  : 'bg-slate-100 canvas-grid-dot'
              }`}
            >
              <canvas
                ref={mainCanvasRef}
                width={750}
                height={450}
                className="max-w-full h-auto shadow-2xl rounded-lg bg-transparent"
              />
            </div>
          </div>

          {/* IMAGE 2: 600 × 600 (SQUARE LOGO) */}
          <div className="xl:col-span-5 bg-[#0b0f1a] border border-[#1b2333] rounded-2xl p-4 shadow-xl flex flex-col">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[11px] font-extrabold rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  IMAGE 2 — SQUARE LOGO
                </span>
                <span className="text-xs font-mono text-slate-400">
                  upload 1200 × 1200 → Atom 600 × 600
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => downloadSvg(state, 'square-logo-600x600.svg', { width: 600, height: 600 })}
                  className="px-2.5 py-1 text-xs font-semibold bg-[#111726] hover:bg-[#182137] text-slate-200 rounded-lg border border-[#232d44] transition cursor-pointer"
                  title="Download as Vector SVG"
                >
                  SVG
                </button>
                <button
                  type="button"
                  onClick={() => downloadOffscreenPng(state, true)}
                  className="px-2.5 py-1 text-xs font-bold bg-[#111726] hover:bg-[#182137] text-slate-200 rounded-lg border border-[#232d44] transition cursor-pointer"
                  title="Export high-resolution 1200x1200 PNG for Atom upload"
                >
                  Export PNG ↓
                </button>
              </div>
            </div>

            <div
              className={`rounded-xl p-4 flex items-center justify-center border border-slate-800/80 overflow-auto ${
                state.bgMode === 'transparent'
                  ? 'canvas-checkerboard'
                  : state.bgMode === 'dark'
                  ? 'bg-[#06080f]'
                  : 'bg-slate-100 canvas-grid-dot'
              }`}
            >
              <canvas
                ref={squareCanvasRef}
                width={600}
                height={600}
                className="max-w-full h-auto max-h-[380px] shadow-2xl rounded-lg bg-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* VIEW TAB 2: WEBSITE HEADER NAVBAR MOCKUP */}
      {activeTab === 'mockup-web' && (
        <div className="bg-[#0b0f1a] border border-[#1b2333] rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm">Real-World SaaS Navigation Bar Mockup</h3>
              <p className="text-xs text-slate-400">
                Preview your logo rendered in a sleek 2026 SaaS desktop web application header.
              </p>
            </div>
            <span className="text-[11px] font-mono text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
              Desktop 1440px Baseline
            </span>
          </div>

          {/* Browser Window Mockup */}
          <div className="rounded-2xl border border-slate-700/60 overflow-hidden shadow-2xl bg-[#030712]">
            {/* Window Top Controls */}
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

            {/* Live Web Header */}
            <header className="px-8 py-4 border-b border-slate-800 bg-[#080d1a]/95 backdrop-blur flex items-center justify-between gap-8">
              {/* Brand Logo in Header */}
              <div className="flex items-center gap-3">
                <canvas
                  ref={(c) => {
                    if (c && mainCanvasRef.current) {
                      const ctx = c.getContext('2d');
                      ctx?.drawImage(mainCanvasRef.current, 0, 0, 180, 108);
                    }
                  }}
                  width={180}
                  height={108}
                  className="w-36 h-auto"
                />
              </div>

              {/* Nav links */}
              <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-300">
                <span className="hover:text-white cursor-pointer transition">Platform</span>
                <span className="hover:text-white cursor-pointer transition">Solutions</span>
                <span className="hover:text-white cursor-pointer transition">Resources</span>
                <span className="hover:text-white cursor-pointer transition">Pricing</span>
              </nav>

              {/* Primary action */}
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

            {/* Hero Body Content preview */}
            <div className="p-12 text-center max-w-2xl mx-auto space-y-4">
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
        <div className="bg-[#0b0f1a] border border-[#1b2333] rounded-2xl p-6 shadow-xl space-y-6">
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

          {/* Smartphone Screen Mockup */}
          <div className="max-w-sm mx-auto bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[44px] p-6 border-4 border-slate-700 shadow-2xl space-y-8">
            <div className="flex justify-between items-center text-xs text-slate-400 font-mono px-3 pt-1">
              <span>9:41</span>
              <div className="w-16 h-3 bg-slate-800 rounded-full" />
              <span>5G 100%</span>
            </div>

            {/* App Grid */}
            <div className="grid grid-cols-4 gap-4 pt-4">
              {/* Our App Tile */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-16 h-16 rounded-[18px] bg-white p-1 shadow-2xl border border-white/20 flex items-center justify-center overflow-hidden">
                  <canvas
                    ref={(c) => {
                      if (c && squareCanvasRef.current) {
                        const ctx = c.getContext('2d');
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

              {/* Sample apps */}
              {['Safari', 'Maps', 'Mail', 'Photos', 'Notes', 'Stocks', 'Music'].map((app) => (
                <div key={app} className="flex flex-col items-center gap-1.5 opacity-60">
                  <div className="w-16 h-16 rounded-[18px] bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-[10px] text-slate-400">
                    {app[0]}
                  </div>
                  <span className="text-[10px] text-slate-400 truncate max-w-[64px]">{app}</span>
                </div>
              ))}
            </div>

            <div className="pt-8 text-center text-[11px] text-slate-400">
              Native Continuous Squircle (Apple iOS &amp; Material 3 Spec)
            </div>
          </div>
        </div>
      )}

      {/* VIEW TAB 4: LIVE ATOM MARKETPLACE & CROP SIMULATOR */}
      {activeTab === 'mockup-atom' && (
        <div className="bg-[#0b0f1a] border border-[#1b2333] rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Atom.com Cropper.js Simulator</h3>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  autoCropArea: 0.8
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Atom.com's Cropper.js default crop covers the central 80% (autoCropArea: 0.8). Outer 10% is discarded.
              </p>
            </div>

            {/* Selector: Main (750x450) vs Square (600x600) */}
            <div className="flex items-center gap-2">
              <div className="bg-[#06080f] p-1 rounded-xl border border-[#1b2333] flex items-center">
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
          </div>

          {/* Automatic Cut Verification Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#101626] border border-[#1e2740] rounded-xl">
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
                    Cut by Atom's default crop: {currentSimLayout?.cutDetails?.side},{' '}
                    {currentSimLayout?.cutDetails?.px}px
                  </span>
                </div>
              )}

              {currentSimLayout?.isClamped && (
                <span className="text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                  ⚠️ Limited to the Atom crop zone
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Atom.com Live Crop Tool Simulator */}
            <div className="lg:col-span-7 bg-[#1c212d] border border-slate-700/80 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
              <div className="border-b border-slate-700/60 pb-3 mb-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white">
                    Crop {atomSimMode === 'main' ? 'Main' : 'Square'} Logo (Atom.com Upload Dialog)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    The orange frame shows the default 80% crop window. Outer 10% is discarded.
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  Cropper.js viewMode: 1
                </span>
              </div>

              {/* Atom Crop Canvas Area */}
              <div className="relative bg-[#2e3136] rounded-xl p-4 flex items-center justify-center overflow-hidden border border-slate-600">
                {/* Full Upload Image Container */}
                <div
                  className="relative shadow-2xl bg-white overflow-hidden flex items-center justify-center"
                  style={{
                    width: '100%',
                    maxWidth: atomSimMode === 'square' ? '400px' : '500px',
                    aspectRatio: atomSimMode === 'square' ? '1/1' : '5/3',
                  }}
                >
                  {/* Upload Canvas Background */}
                  <canvas
                    ref={atomUploadCanvasRef}
                    width={currentSimW}
                    height={currentSimH}
                    className="w-full h-full object-contain"
                  />

                  {/* Dimmed 10% Margins Outer Overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Top 10% */}
                    <div className="absolute top-0 left-0 right-0 h-[10%] bg-black/55 backdrop-blur-[0.5px]" />
                    {/* Bottom 10% */}
                    <div className="absolute bottom-0 left-0 right-0 h-[10%] bg-black/55 backdrop-blur-[0.5px]" />
                    {/* Left 10% (between top and bottom) */}
                    <div className="absolute top-[10%] bottom-[10%] left-0 w-[10%] bg-black/55 backdrop-blur-[0.5px]" />
                    {/* Right 10% (between top and bottom) */}
                    <div className="absolute top-[10%] bottom-[10%] right-0 w-[10%] bg-black/55 backdrop-blur-[0.5px]" />
                  </div>

                  {/* Active Orange Crop Box (central 80%) */}
                  <div
                    className="absolute pointer-events-none border-2 border-[#ff5a36]"
                    style={{
                      top: '10%',
                      bottom: '10%',
                      left: '10%',
                      right: '10%',
                    }}
                  >
                    {/* Rule of Thirds Grid Inside Orange Box */}
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-40">
                      <div className="border-r border-b border-dashed border-[#ff5a36]" />
                      <div className="border-r border-b border-dashed border-[#ff5a36]" />
                      <div className="border-b border-dashed border-[#ff5a36]" />
                      <div className="border-r border-b border-dashed border-[#ff5a36]" />
                      <div className="border-r border-b border-dashed border-[#ff5a36]" />
                      <div className="border-b border-dashed border-[#ff5a36]" />
                      <div className="border-r border-dashed border-[#ff5a36]" />
                      <div className="border-r border-dashed border-[#ff5a36]" />
                      <div />
                    </div>

                    {/* Corner & Edge Handles */}
                    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#ff5a36] shadow" />
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-[#ff5a36] shadow" />
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#ff5a36] shadow" />
                    <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-white border-2 border-[#ff5a36] shadow" />
                    <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white border-2 border-[#ff5a36] shadow" />
                    <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#ff5a36] shadow" />
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-[#ff5a36] shadow" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#ff5a36] shadow" />
                  </div>
                </div>
              </div>

              {/* Action Buttons Mockup */}
              <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-700/60">
                <span className="text-[11px] text-slate-400">
                  Atom upload file: <strong>{atomSimMode === 'main' ? '1500 × 900 px' : '1200 × 1200 px'}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => downloadOffscreenPng(state, atomSimMode === 'square')}
                  className="px-4 py-2 bg-[#1877f2] hover:bg-[#166fe5] text-white text-xs font-bold rounded-lg shadow transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>
                    Download {atomSimMode === 'main' ? '1500 × 900' : '1200 × 1200'} Upload File
                  </span>
                </button>
              </div>
            </div>

            {/* Right: Result after Crop & Apply Preview + Atom Card */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              {/* Result after Crop & Apply */}
              <div className="bg-[#111726] border border-[#1e2740] rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">
                    Result after Crop &amp; Apply ({currentSimW} × {currentSimH} px)
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Scaled Output
                  </span>
                </div>

                <div className="bg-white rounded-xl overflow-hidden border border-slate-300 flex items-center justify-center p-3 shadow-inner">
                  <canvas
                    ref={atomCroppedCanvasRef}
                    width={currentSimW}
                    height={currentSimH}
                    className="w-full h-auto object-contain rounded"
                  />
                </div>

                {/* Simulated Marketplace Listing Card */}
                <div className="bg-[#0a0e1a] rounded-xl p-3 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300">Marketplace Card Result</span>
                    <span className="text-[10px] text-slate-500 font-mono">280px Grid Width</span>
                  </div>

                  <div className="bg-white rounded-lg p-2.5 border border-slate-200 shadow space-y-2">
                    <div className="aspect-[5/3] bg-white rounded overflow-hidden flex items-center justify-center">
                      <canvas
                        ref={(c) => {
                          if (c && atomCroppedCanvasRef.current) {
                            const ctx = c.getContext('2d');
                            ctx?.drawImage(atomCroppedCanvasRef.current, 0, 0, 240, 144);
                          }
                        }}
                        width={240}
                        height={144}
                        className="w-full h-auto object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <div className="text-xs font-extrabold text-slate-900 truncate max-w-[140px]">
                          {state.domain}
                        </div>
                        <div className="text-[10px] text-emerald-600 font-semibold">● Verified Logo</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-black text-slate-900">$2,499</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#080c16] rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <div className="font-bold text-indigo-300 flex items-center gap-1">
                    <span>Atom.com Upload &amp; Crop Guarantee:</span>
                  </div>
                  <p className="text-slate-400 leading-normal">
                    The logo bounding box is automatically fitted inside the central 80% crop zone. Clicking "Crop &amp; Apply" on Atom.com keeps 100% of the logo intact without clipping or manual zooming.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
