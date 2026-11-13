import React from 'react';
import {
  Grid,
  Sparkles,
  Download,
  Code,
  Check,
  Search,
  Maximize2,
  Crosshair,
  Sliders,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { LogoState, LogoVariant, TypoContrastStyle, MainLayoutMode } from './types/logo';
import { parseDomainOrBrand, COLOR_PALETTES, BRAND_FONTS } from './data/domains';
import { getExtendedSemanticIconsForDomain, selectRemixIconsForDomain } from './data/domainSemanticIcons';
import { constructionsForDomain, familyToLegacyContainerStyle } from './utils/constructionEngine';
import { resolveLucideIcon } from './utils/svgBuilder';
import { Header } from './components/Header';
import { DomainSymbolsSelector } from './components/Inspector/DomainInspector';
import { TypographyInspector } from './components/Inspector/TypographyInspector';
import { EmblemInspector } from './components/Inspector/EmblemInspector';
import { OpticalSliders } from './components/Inspector/OpticalSliders';
import { AiAndFlowPanel } from './components/Inspector/AiAndFlowPanel';
import { SymbolVaultModal } from './components/SymbolVaultModal';
import { PortfolioModal } from './components/PortfolioModal';
import { Variants10Board } from './components/Stage/Variants10Board';
import { DualCanvasStage } from './components/Stage/DualCanvasStage';
import { LogoStudioLanding } from './components/Landing/LogoStudioLanding';
import { downloadBrandKitZip, downloadSvg, copySvgCode } from './utils/exporter';

const TYPO_CONTRAST_STYLES: TypoContrastStyle[] = [
  'bold-bold',
  'heavy-light',
  'light-heavy',
  'bold-bold',
  'heavy-light',
  'dot-badge',
  'bold-bold',
  'heavy-light',
  'upper-tracked',
  'bold-bold',
];

function hashDomainSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const out = [...items];
  let s = (seed >>> 0) || 1;
  for (let i = out.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = (s >>> 8) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function syncMasterWithLeadVariant(s: LogoState): LogoState {
  const lead = s.variants10[0];
  if (!lead) return s;
  return {
    ...s,
    containerStyle: lead.containerStyle,
    construction: lead.construction,
    typoContrast: lead.typoContrast,
    fontFamily: lead.fontFamily,
  };
}

export default function App() {
  const [variantSeedOffset, setVariantSeedOffset] = React.useState(0);
  const [remixMode, setRemixMode] = React.useState<'core-focus' | 'deep-semantic'>('core-focus');
  const [paletteIndex, setPaletteIndex] = React.useState(0);
  const [leftDockTab, setLeftDockTab] = React.useState<'concepts' | 'vault' | 'ai'>('concepts');
  const [vaultSearchQuery, setVaultSearchQuery] = React.useState('');
  const [showSafeGrid, setShowSafeGrid] = React.useState(false);
  const [showVectorGuides, setShowVectorGuides] = React.useState(true);
  const [copiedFooterSvg, setCopiedFooterSvg] = React.useState(false);
  const [isPortfolioOpen, setIsPortfolioOpen] = React.useState(false);
  const [isVaultOpen, setIsVaultOpen] = React.useState(false);
  const [appMode, setAppMode] = React.useState<'studio' | 'landing'>('studio');

  // Initialize initial state for "adstock.org"
  const [state, setState] = React.useState<LogoState>(() => {
    const init = parseDomainOrBrand('adstock.org');
    return {
      domain: init.domain,
      brandName: `${init.word1}${init.word2 ? ' ' + init.word2 : ''}`,
      word1: init.word1,
      word2: init.word2,
      ext: init.ext,
      keepExt: init.keepExt,
      extStyle: 'pill',
      tagline: 'MARKET ASSET EXCHANGE',
      showTagline: false,
      taglineFont: 'Plus Jakarta Sans',
      taglineTracking: 3.5,

      typoContrast: 'bold-bold',
      fontFamily: 'Outfit',
      fontWeight1: '800',
      fontWeight2: '700',
      letterCase1: 'as-is',
      letterCase2: 'as-is',
      tracking: -1.5,

      activeIcon: init.iconGroups?.core[0] || init.icons10[0] || 'ChartSpline',
      containerStyle: 'cutoutCorner',
      iconStrokeWidth: 2.2,
      iconRotation: 0,
      iconFlipH: false,
      iconFlipV: false,
      emblemPadding: 24,
      emblemCornerRadius: 38,

      primary: init.palette.primary,
      secondary: init.palette.secondary,
      accent: init.palette.accent,
      backgroundColor: '#FFFFFF',
      bgMode: 'white',

      mainLayout: 'horizontal',
      masterScale: 1.0,
      iconScale: 1.0,
      gap: 26,
      baselineOffset: 0,

      nicheLabel: init.nicheLabel,
      icons10: init.icons10,
      iconGroups: init.iconGroups,

      rasterMode: false,
      rasterDataUrl: null,

      variants10: [],
      activeVariantIndex: 0,
    };
  });

  // Helper to generate 10 bespoke concepts with domain-accurate semantic icon rotation
  const generate10Variants = React.useCallback(
    (
      currentState: LogoState,
      seed = 0,
      mode: 'core-focus' | 'deep-semantic' = 'core-focus'
    ): LogoVariant[] => {
      const pool = getExtendedSemanticIconsForDomain(
        currentState.domain,
        currentState.word1,
        currentState.word2,
        currentState.nicheLabel,
        currentState.icons10,
        currentState.iconGroups
      );
      const icons = selectRemixIconsForDomain(pool, seed, mode);
      const variants: LogoVariant[] = [];

      const domainSeed = hashDomainSeed((currentState.domain || '').toLowerCase());
      const domainConstructions = constructionsForDomain(currentState.domain, seed, 10);
      const typoStyles = seededShuffle(TYPO_CONTRAST_STYLES, (domainSeed ^ 0x9e3779b9) + seed * 104729);
      const palettes = seededShuffle(COLOR_PALETTES, (domainSeed ^ 0x85ebca6b) + seed * 1299709);
      const fonts = seededShuffle(BRAND_FONTS, (domainSeed ^ 0xc2b2ae35) + seed * 15485863);

      for (let i = 0; i < 10; i++) {
        const iconForThisVariant = icons[i % icons.length];
        const spec = domainConstructions[i % domainConstructions.length];
        const legacyStyle = familyToLegacyContainerStyle(spec.family);
        const typoContrast = typoStyles[i % typoStyles.length];
        const pal =
          i === 0 && seed === 0
            ? { primary: currentState.primary, secondary: currentState.secondary, accent: currentState.accent }
            : palettes[i % palettes.length];
        const font = fonts[i % fonts.length];
        const layout: MainLayoutMode = i === 9 ? 'stacked' : 'horizontal';

        variants.push({
          id: i + 1,
          domain: currentState.domain,
          word1: currentState.word1,
          word2: currentState.word2,
          ext: currentState.ext,
          keepExt: currentState.keepExt,
          typoContrast,
          activeIcon: iconForThisVariant,
          customSvgPath: currentState.customSvgPath,
          containerStyle: legacyStyle,
          construction: spec,
          primary: pal.primary,
          secondary: pal.secondary,
          accent: pal.accent,
          fontFamily: font,
          mainLayout: layout,
          tracking: currentState.tracking,
          gap: currentState.gap,
          tagline: currentState.tagline,
          showTagline: currentState.showTagline,
        });
      }

      return variants;
    },
    []
  );

  // Initialize 10 variants on first mount
  React.useEffect(() => {
    setState((prev) =>
      syncMasterWithLeadVariant({
        ...prev,
        variants10: generate10Variants(prev, 0),
      })
    );
  }, [generate10Variants]);

  // Handle Domain Smart Generation
  const handleDomainGenerate = (domainToUse?: string) => {
    const raw = domainToUse || state.domain || 'adstock.org';
    const parsed = parseDomainOrBrand(raw);

    setState((prev) => {
      const next: LogoState = {
        ...prev,
        domain: parsed.domain,
        brandName: `${parsed.word1}${parsed.word2 ? ' ' + parsed.word2 : ''}`,
        word1: parsed.word1,
        word2: parsed.word2,
        ext: parsed.ext,
        keepExt: parsed.keepExt,
        nicheLabel: parsed.nicheLabel,
        icons10: parsed.icons10,
        iconGroups: parsed.iconGroups,
        activeIcon: parsed.iconGroups?.core[0] || parsed.icons10[0] || 'Sparkles',
        primary: parsed.palette.primary,
        secondary: parsed.palette.secondary,
        accent: parsed.palette.accent,
        containerStyle: 'cutoutCorner',
        typoContrast: 'bold-bold',
        rasterMode: false,
        rasterDataUrl: null,
        activeVariantIndex: 0,
        variants10: [],
      };
      next.variants10 = generate10Variants(next, 0);
      return syncMasterWithLeadVariant(next);
    });
    setVariantSeedOffset(0);
  };

  // Toggle 1-Word vs 2-Word mode
  const handleToggleWordMode = () => {
    setState((prev) => {
      if (prev.word2 && prev.word2.trim() !== '') {
        const merged = prev.word1 + prev.word2.toLowerCase();
        const next: LogoState = {
          ...prev,
          word1: merged,
          word2: '',
        };
        next.variants10 = generate10Variants(next, variantSeedOffset);
        return next;
      } else {
        const full = prev.word1;
        const mid = Math.ceil(full.length / 2);
        const w1 = full.slice(0, mid);
        const w2 = full.slice(mid);
        const next: LogoState = {
          ...prev,
          word1: w1.charAt(0).toUpperCase() + w1.slice(1),
          word2: w2.charAt(0).toUpperCase() + w2.slice(1),
        };
        next.variants10 = generate10Variants(next, variantSeedOffset);
        return next;
      }
    });
  };

  // Select variant card to apply to master
  const handleSelectVariant = (index: number) => {
    const v = state.variants10[index];
    if (!v) return;

    setState((prev) => ({
      ...prev,
      activeVariantIndex: index,
      activeIcon: v.activeIcon,
      containerStyle: v.containerStyle,
      construction: v.construction,
      typoContrast: v.typoContrast,
      primary: v.primary,
      secondary: v.secondary,
      accent: v.accent,
      fontFamily: v.fontFamily,
      mainLayout: v.mainLayout,
      customSvgPath: v.customSvgPath !== undefined ? v.customSvgPath : prev.customSvgPath,
    }));
  };

  // Remix 10 variants
  const handleRemixVariants = () => {
    const nextOffset = variantSeedOffset + 1;
    setVariantSeedOffset(nextOffset);
    setState((prev) => {
      const nextVariants = generate10Variants(prev, nextOffset, remixMode);
      const activeVar = nextVariants[prev.activeVariantIndex] || nextVariants[0];
      return {
        ...prev,
        variants10: nextVariants,
        activeIcon: activeVar ? activeVar.activeIcon : prev.activeIcon,
        containerStyle: activeVar ? activeVar.containerStyle : prev.containerStyle,
        construction: activeVar ? activeVar.construction : prev.construction,
        typoContrast: activeVar ? activeVar.typoContrast : prev.typoContrast,
        fontFamily: activeVar ? activeVar.fontFamily : prev.fontFamily,
      };
    });
  };

  // Switch between Core 10 rotation and Deep Semantic pool rotation
  const handleChangeRemixMode = (nextMode: 'core-focus' | 'deep-semantic') => {
    setRemixMode(nextMode);
    const effectiveSeed = nextMode === 'deep-semantic' && variantSeedOffset === 0 ? 1 : variantSeedOffset;
    if (effectiveSeed !== variantSeedOffset) {
      setVariantSeedOffset(effectiveSeed);
    }
    setState((prev) => {
      const nextVariants = generate10Variants(prev, effectiveSeed, nextMode);
      const activeVar = nextVariants[prev.activeVariantIndex] || nextVariants[0];
      return {
        ...prev,
        variants10: nextVariants,
        activeIcon: activeVar ? activeVar.activeIcon : prev.activeIcon,
        containerStyle: activeVar ? activeVar.containerStyle : prev.containerStyle,
        construction: activeVar ? activeVar.construction : prev.construction,
      };
    });
  };

  // Cycle palette
  const handleCyclePalette = () => {
    const nextIdx = (paletteIndex + 1) % COLOR_PALETTES.length;
    setPaletteIndex(nextIdx);
    const p = COLOR_PALETTES[nextIdx];
    setState((prev) => ({
      ...prev,
      primary: p.primary,
      secondary: p.secondary,
      accent: p.accent,
    }));
  };

  // Reset optical sliders
  const handleResetSliders = () => {
    setState((prev) => ({
      ...prev,
      masterScale: 1.0,
      iconScale: 1.0,
      gap: 26,
      tracking: -1.5,
    }));
  };

  // Update patch helper
  const handleUpdatePatch = (patch: Partial<LogoState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  };

  const handleCopyFooterSvg = async () => {
    const ok = await copySvgCode(state);
    if (ok) {
      setCopiedFooterSvg(true);
      setTimeout(() => setCopiedFooterSvg(false), 2000);
    }
  };

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

  const filteredDrawerIcons = React.useMemo(() => {
    const q = vaultSearchQuery.trim().toLowerCase();
    const list = semanticPool.allSemantic;
    if (!q) return list;
    return list.filter((ico) => ico.toLowerCase().includes(q));
  }, [semanticPool.allSemantic, vaultSearchQuery]);

  if (appMode === 'landing') {
    return (
      <div className="relative">
        <div className="fixed top-3 right-4 z-50 flex items-center gap-2 bg-[#0b0f1a]/95 backdrop-blur-md border border-[#1b2333] px-3.5 py-1.5 rounded-xl shadow-2xl">
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">Active View:</span>
          <span className="text-xs font-bold text-blue-400 font-mono">LogoStudio.si SaaS</span>
          <span className="text-slate-600">·</span>
          <button
            type="button"
            onClick={() => setAppMode('studio')}
            className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-lg shadow-blue-600/30 transition cursor-pointer flex items-center gap-1.5"
          >
            <span>Open Vector Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <LogoStudioLanding
          onLaunchStudio={(dom) => {
            if (dom) handleDomainGenerate(dom);
            setAppMode('studio');
          }}
        />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#06080D] text-slate-100 select-none overflow-hidden">
      {/* 1. TOP STUDIO COMMAND BAR (54px) */}
      <Header
        state={state}
        onDomainChange={(domain) => setState((prev) => ({ ...prev, domain }))}
        onSelectPortfolioDomain={(dom) => handleDomainGenerate(dom)}
        onGenerate={() => handleDomainGenerate()}
        onRemix={handleRemixVariants}
        onToggleWordMode={handleToggleWordMode}
        onOpenPortfolio={() => setIsPortfolioOpen(true)}
        onOpenVault={() => setIsVaultOpen(true)}
        onOpenAiPanel={() => setLeftDockTab('ai')}
        onOpenLandingMockup={() => setAppMode('landing')}
      />

      {/* 2. MAIN WORKSPACE: 4-ZONE STUDIO ARCHITECTURE */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ZONE 2: LEFT DOCK — ICON RAIL (56px) + NAVIGATOR DRAWER (268px) */}
        <aside className="flex h-full shrink-0 z-20">
          {/* 56px Vertical Icon Tool Rail */}
          <div className="w-14 bg-[#0B0E17] border-r border-white/[0.07] flex flex-col items-center py-3 justify-between shrink-0">
            <div className="flex flex-col items-center gap-2 w-full px-1.5">
              {/* Tab 1: 10 Bespoke Agency Concepts */}
              <button
                type="button"
                onClick={() => setLeftDockTab('concepts')}
                title="10 Bespoke Agency Concepts (#1 - #10)"
                className={`w-full py-2 rounded-xl flex flex-col items-center gap-1 transition cursor-pointer ${
                  leftDockTab === 'concepts'
                    ? 'bg-indigo-600/20 border border-indigo-500/50 text-indigo-300 shadow-inner'
                    : 'hover:bg-white/[0.04] border border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span className="text-[9px] font-bold tracking-tight">Concepts</span>
              </button>

              {/* Tab 2: 1,600+ Symbol Vault */}
              <button
                type="button"
                onClick={() => setLeftDockTab('vault')}
                title="1,600+ Vector Symbol Vault & Semantic Filter"
                className={`w-full py-2 rounded-xl flex flex-col items-center gap-1 transition cursor-pointer ${
                  leftDockTab === 'vault'
                    ? 'bg-indigo-600/20 border border-indigo-500/50 text-indigo-300 shadow-inner'
                    : 'hover:bg-white/[0.04] border border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Grid className="w-4 h-4" />
                <span className="text-[9px] font-semibold tracking-tight">1,600+</span>
              </button>

              {/* Tab 3: AI & Flow Crop */}
              <button
                type="button"
                onClick={() => setLeftDockTab('ai')}
                title="AI & Flow Crop Settings"
                className={`w-full py-2 rounded-xl flex flex-col items-center gap-1 transition cursor-pointer ${
                  leftDockTab === 'ai'
                    ? 'bg-indigo-600/20 border border-indigo-500/50 text-indigo-300 shadow-inner'
                    : 'hover:bg-white/[0.04] border border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-[9px] font-semibold tracking-tight">AI Crop</span>
              </button>
            </div>

            {/* Bottom Rail Utilities: Vector Guides & Atom 80% Safe Zone */}
            <div className="flex flex-col items-center gap-2 w-full px-1.5">
              <button
                type="button"
                onClick={() => setShowVectorGuides((p) => !p)}
                title="Toggle Vector Bezier Anchor Nodes"
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition cursor-pointer ${
                  showVectorGuides
                    ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
                    : 'bg-[#101522] border-white/[0.07] text-slate-400 hover:text-white'
                }`}
              >
                <Crosshair className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowSafeGrid((p) => !p)}
                title="Toggle Atom 80% Safe Crop Overlay"
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition cursor-pointer ${
                  showSafeGrid
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-[#101522] border-white/[0.07] text-slate-400 hover:text-amber-300'
                }`}
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 276px Navigator Drawer (2-Column Grid for 10 Concepts) */}
          <div className="w-[276px] bg-[#0B0E17]/90 border-r border-white/[0.07] flex flex-col h-full overflow-hidden">
            {/* DRAWER VIEW 1: 10 BESPOKE AGENCY CONCEPTS */}
            {leftDockTab === 'concepts' && (
              <Variants10Board
                state={state}
                onSelectVariant={handleSelectVariant}
                remixMode={remixMode}
                onChangeRemixMode={handleChangeRemixMode}
                onRemixVariants={handleRemixVariants}
                onOpenVault={() => setIsVaultOpen(true)}
              />
            )}

            {/* DRAWER VIEW 2: 1,600+ SYMBOL VAULT & SEMANTIC MORPHEMES */}
            {leftDockTab === 'vault' && (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="p-3 border-b border-white/[0.07] shrink-0 space-y-2.5 bg-[#090C13]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-300">
                      1,600+ Symbol Vault
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsVaultOpen(true)}
                      className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                    >
                      Full Modal ↗
                    </button>
                  </div>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
                    <input
                      type="text"
                      value={vaultSearchQuery}
                      onChange={(e) => setVaultSearchQuery(e.target.value)}
                      placeholder="Filter symbols (e.g. chart, shield)..."
                      className="w-full bg-[#06080D] border border-white/[0.07] focus:border-indigo-500 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-4">
                  {/* 10 Curated Semantic Morpheme Symbols (Concept 4 + Word1 3 + Word2 3) */}
                  <DomainSymbolsSelector
                    currentDomain={state.domain}
                    icons10={state.icons10}
                    iconGroups={state.iconGroups}
                    activeIcon={state.activeIcon}
                    onSelectIcon={(ico) =>
                      setState((prev) => ({ ...prev, activeIcon: ico, customSvgPath: undefined }))
                    }
                  />

                  {/* Extended Semantic Pool Grid */}
                  <div className="pt-2 border-t border-white/[0.07] space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-bold text-slate-300">
                        Semantic Pool ({filteredDrawerIcons.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsVaultOpen(true)}
                        className="text-indigo-400 hover:underline cursor-pointer"
                      >
                        Browse All 1,638
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {filteredDrawerIcons.map((ico) => {
                        const IconComp = resolveLucideIcon(ico);
                        const isSelected = ico.toLowerCase() === state.activeIcon.toLowerCase();
                        return (
                          <button
                            key={ico}
                            type="button"
                            onClick={() =>
                              setState((prev) => ({
                                ...prev,
                                activeIcon: ico,
                                customSvgPath: undefined,
                              }))
                            }
                            title={ico}
                            className={`p-1.5 rounded-lg text-[10px] font-mono flex flex-col items-center justify-center gap-1 border transition cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                                : 'bg-[#06080D] hover:bg-[#101522] text-slate-300 border-white/[0.07]'
                            }`}
                          >
                            <IconComp size={15} strokeWidth={2.1} />
                            <span className="text-[8px] truncate w-full text-center">
                              {ico.length > 7 ? ico.slice(0, 6) + '…' : ico}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DRAWER VIEW 3: AI & FLOW CROP */}
            {leftDockTab === 'ai' && (
              <div className="flex flex-col h-full overflow-y-auto p-3 space-y-3">
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/25 space-y-1.5">
                  <div className="text-xs font-bold text-indigo-300">AI &amp; Flow Smart Crop</div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Automatically enforces Atom Marketplace 80% safe zone padding and optical weight balancing across 1500×900 and 1200×1200 exports.
                  </p>
                </div>

                <div className="space-y-2 p-2.5 rounded-xl bg-[#06080D] border border-white/[0.07]">
                  <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                    <span>Atom Crop Zone (80%)</span>
                    <input
                      type="checkbox"
                      checked={showSafeGrid}
                      onChange={(e) => setShowSafeGrid(e.target.checked)}
                      className="rounded border-slate-600 bg-[#06080D] text-indigo-500 cursor-pointer"
                    />
                  </label>
                  <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                    <span>Bezier Vector Anchor Handles</span>
                    <input
                      type="checkbox"
                      checked={showVectorGuides}
                      onChange={(e) => setShowVectorGuides(e.target.checked)}
                      className="rounded border-slate-600 bg-[#06080D] text-indigo-500 cursor-pointer"
                    />
                  </label>
                </div>

                <AiAndFlowPanel
                  state={state}
                  onUpdateRaster={(dataUrl) =>
                    setState((prev) => ({
                      ...prev,
                      rasterMode: true,
                      rasterDataUrl: dataUrl,
                    }))
                  }
                  onClearRaster={() =>
                    setState((prev) => ({
                      ...prev,
                      rasterMode: false,
                      rasterDataUrl: null,
                    }))
                  }
                />
              </div>
            )}
          </div>
        </aside>

        {/* ZONE 3: CENTER INFINITE VECTOR VIEWPORT */}
        <DualCanvasStage
          state={state}
          onUpdateState={handleUpdatePatch}
          showSafeGrid={showSafeGrid}
          onToggleSafeGrid={() => setShowSafeGrid((p) => !p)}
          showVectorGuides={showVectorGuides}
          onToggleVectorGuides={() => setShowVectorGuides((p) => !p)}
          onCyclePalette={handleCyclePalette}
        />

        {/* ZONE 4: RIGHT PRECISION INSPECTOR (320px, Zero Clipping + Sticky Footer) */}
        <aside className="w-[320px] bg-[#0B0E17] border-l border-white/[0.07] flex flex-col h-full shrink-0 z-20">
          {/* Inspector Header */}
          <div className="px-3.5 py-2.5 border-b border-white/[0.07] flex items-center justify-between shrink-0 bg-[#090C13]">
            <div className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-extrabold tracking-tight text-white">
                Vector &amp; Type Inspector
              </span>
            </div>
            <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-500/25 px-1.5 py-0.5 rounded truncate max-w-[125px]">
              #{state.activeVariantIndex + 1} · {state.activeIcon}
            </span>
          </div>

          {/* Inspector Scrollable Body */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.07]">
            {/* Sections 1 & 2: Wordmark & Hierarchy + Typography & Case Matrix */}
            <TypographyInspector state={state} onChange={handleUpdatePatch} />

            {/* Section 3: Vector Emblem Architecture */}
            <EmblemInspector
              state={state}
              onChange={handleUpdatePatch}
              onOpenVault={() => setIsVaultOpen(true)}
            />

            {/* Domain Curated 10 Symbols (Concept 4 + Word 1 3 + Word 2 3) */}
            <div className="p-3.5">
              <DomainSymbolsSelector
                currentDomain={state.domain}
                icons10={state.icons10}
                iconGroups={state.iconGroups}
                activeIcon={state.activeIcon}
                onSelectIcon={(ico) =>
                  setState((prev) => ({ ...prev, activeIcon: ico, customSvgPath: undefined }))
                }
              />
            </div>

            {/* Precision Optical Proportions */}
            <div className="p-3.5">
              <OpticalSliders
                state={state}
                onChange={handleUpdatePatch}
                onReset={handleResetSliders}
              />
            </div>
          </div>

          {/* Sticky Bottom Action Footer */}
          <div className="p-3 border-t border-white/[0.07] bg-[#06080D]/95 shrink-0 space-y-2">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={handleCopyFooterSvg}
                className="py-1.5 px-2.5 rounded-lg bg-[#101522] hover:bg-white/[0.06] border border-white/[0.07] text-[11px] font-bold text-slate-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                {copiedFooterSvg ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied!</span>
                  </>
                ) : (
                  <>
                    <Code className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Copy SVG Code</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => downloadSvg(state, `${state.domain || 'logo'}-vector.svg`)}
                className="py-1.5 px-2.5 rounded-lg bg-[#101522] hover:bg-white/[0.06] border border-white/[0.07] text-[11px] font-bold text-slate-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>Export Vector SVG</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => downloadBrandKitZip(state)}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs tracking-tight flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Download Complete Brand Kit (.ZIP)</span>
            </button>
          </div>
        </aside>
      </div>

      {/* 3. Portfolio Modal (223 Domains) */}
      <PortfolioModal
        isOpen={isPortfolioOpen}
        currentDomain={state.domain}
        onSelectDomain={(dom) => handleDomainGenerate(dom)}
        onClose={() => setIsPortfolioOpen(false)}
      />

      {/* 4. Symbol Vault Modal (1,638 Canonical Symbols + Domain Semantic Filter) */}
      <SymbolVaultModal
        isOpen={isVaultOpen}
        activeIcon={state.activeIcon}
        domain={state.domain}
        word1={state.word1}
        word2={state.word2}
        nicheLabel={state.nicheLabel}
        icons10={state.icons10}
        iconGroups={state.iconGroups}
        onSelectIcon={(ico) =>
          setState((prev) => ({ ...prev, activeIcon: ico, customSvgPath: undefined }))
        }
        onClose={() => setIsVaultOpen(false)}
      />
    </div>
  );
}
