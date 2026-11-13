import React from 'react';
import {
  Shield,
  Type,
  Palette,
  Sliders,
  Grid,
  Bot,
  Sparkles,
  Download,
  FolderArchive,
  RefreshCw,
} from 'lucide-react';
import { LogoState, LogoVariant, TypoContrastStyle, EmblemContainerStyle, MainLayoutMode } from './types/logo';
import { parseDomainOrBrand, COLOR_PALETTES, BRAND_FONTS } from './data/domains';
import { getExtendedSemanticIconsForDomain, selectRemixIconsForDomain } from './data/domainSemanticIcons';
import { constructionsForDomain, familyToLegacyContainerStyle } from './utils/constructionEngine';
import { Header } from './components/Header';
import { DomainInspector, DomainSymbolsSelector } from './components/Inspector/DomainInspector';
import { TypographyInspector } from './components/Inspector/TypographyInspector';
import { EmblemInspector } from './components/Inspector/EmblemInspector';
import { PaletteInspector } from './components/Inspector/PaletteInspector';
import { OpticalSliders } from './components/Inspector/OpticalSliders';
import { AiAndFlowPanel } from './components/Inspector/AiAndFlowPanel';
import { SymbolVaultModal } from './components/SymbolVaultModal';
import { PortfolioModal } from './components/PortfolioModal';
import { Variants10Board } from './components/Stage/Variants10Board';
import { DualCanvasStage } from './components/Stage/DualCanvasStage';
import { LogoStudioLanding } from './components/Landing/LogoStudioLanding';
import { downloadBrandKitZip } from './utils/exporter';
import { ArrowRight } from 'lucide-react';

const AGENCY_CONSTRUCTIONS: EmblemContainerStyle[] = [
  'cutoutCorner',
  'monogramSeal',
  'isoHexCube',
  'bauhausGrid',
  'offsetNeo',
  'swissSeal',
  'slashCapsule',
  'shieldCrest',
  'vennPortal',
  'minimalistSpark',
];

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

// Deterministic per-domain ordering: every domain gets its own sequence of emblem constructions,
// type contrasts, palettes and fonts, so two domains never share the same 10 backgrounds in the same order.
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

// Keeps the master canvas identical to concept #1 after the concepts are (re)built for a domain.
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
  const [activeInspectorTab, setActiveInspectorTab] = React.useState<'identity' | 'vault' | 'ai'>('identity');
  const [isPortfolioOpen, setIsPortfolioOpen] = React.useState(false);
  const [isVaultOpen, setIsVaultOpen] = React.useState(false);
  const [appMode, setAppMode] = React.useState<'studio' | 'landing'>('landing');

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
      fontFamily: 'Plus Jakarta Sans',
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
    setState((prev) => syncMasterWithLeadVariant({
      ...prev,
      variants10: generate10Variants(prev, 0),
    }));
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
        // Merge into single word
        const merged = prev.word1 + prev.word2.toLowerCase();
        const next: LogoState = {
          ...prev,
          word1: merged,
          word2: '',
        };
        next.variants10 = generate10Variants(next, variantSeedOffset);
        return next;
      } else {
        // Split in half
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

  // Remix 10 variants (rotates both domain-accurate semantic icons AND container architectures)
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

  if (appMode === 'landing') {
    return (
      <div className="relative">
        {/* Floating Top Mode Switcher Bar */}
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
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* 1. Header with Top Bar Contract */}
      <Header
        state={state}
        onDomainChange={(domain) => setState((prev) => ({ ...prev, domain }))}
        onGenerate={() => handleDomainGenerate()}
        onToggleWordMode={handleToggleWordMode}
        onOpenPortfolio={() => setIsPortfolioOpen(true)}
        onOpenVault={() => setIsVaultOpen(true)}
        onOpenAiPanel={() => setActiveInspectorTab('ai')}
        onOpenLandingMockup={() => setAppMode('landing')}
      />

      {/* 2. Main Studio Workspace */}
      <main className="flex-1 max-w-[1840px] w-full mx-auto p-3 lg:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: INSPECTOR & TOOLS (4 COLS) */}
        <aside className="lg:col-span-4 flex flex-col gap-4">
          {/* Domain & Industry Niche Header */}
          <DomainInspector
            currentDomain={state.domain}
            nicheLabel={state.nicheLabel}
            onSelectDomain={(dom) => handleDomainGenerate(dom)}
            onOpenVault={() => setIsVaultOpen(true)}
          />

          {/* Inspector Tabs Container */}
          <div className="bg-[#0b0f1a] border border-[#1b2333] rounded-2xl overflow-hidden shadow-xl flex-1 flex flex-col">
            {/* Tab navigation */}
            <div className="grid grid-cols-3 border-b border-[#1b2333] bg-[#080b13] text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setActiveInspectorTab('identity')}
                className={`py-3 px-2 text-center border-b-2 transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeInspectorTab === 'identity'
                    ? 'border-indigo-500 text-indigo-400 bg-[#0b0f1a]'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Identity Craft</span>
              </button>

              <button
                type="button"
                onClick={() => setIsVaultOpen(true)}
                className="py-3 px-2 text-center border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>1,600+ Symbols</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveInspectorTab('ai')}
                className={`py-3 px-2 text-center border-b-2 transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeInspectorTab === 'ai'
                    ? 'border-indigo-500 text-indigo-400 bg-[#0b0f1a]'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>AI &amp; Flow Crop</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-4 space-y-5 flex-1 overflow-y-auto max-h-[70vh]">
              {activeInspectorTab === 'identity' && (
                <>
                  {/* Curated Color Palette */}
                  <PaletteInspector
                    state={state}
                    onChange={handleUpdatePatch}
                    onCyclePalette={handleCyclePalette}
                  />

                  {/* Typography & Hierarchy */}
                  <div className="pt-3 border-t border-[#1a2233]">
                    <TypographyInspector state={state} onChange={handleUpdatePatch} />
                  </div>

                  {/* Emblem Vector Construction */}
                  <div className="pt-3 border-t border-[#1a2233]">
                    <EmblemInspector
                      state={state}
                      onChange={handleUpdatePatch}
                      onOpenVault={() => setIsVaultOpen(true)}
                    />
                  </div>

                  {/* 10 Symbols for Domain (Concept 4 + Word1 3 + Word2 3) */}
                  <div className="pt-3 border-t border-[#1a2233]">
                    <DomainSymbolsSelector
                      currentDomain={state.domain}
                      icons10={state.icons10}
                      iconGroups={state.iconGroups}
                      activeIcon={state.activeIcon}
                      onSelectIcon={(ico) => setState((prev) => ({ ...prev, activeIcon: ico, customSvgPath: undefined }))}
                    />
                  </div>

                  {/* Precision Optical Proportions */}
                  <OpticalSliders
                    state={state}
                    onChange={handleUpdatePatch}
                    onReset={handleResetSliders}
                  />
                </>
              )}

              {activeInspectorTab === 'ai' && (
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
              )}
            </div>

            {/* Bottom Quick Action */}
            <div className="p-4 border-t border-[#1b2333] bg-[#080b13]">
              <button
                type="button"
                onClick={() => downloadBrandKitZip(state)}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 hover:opacity-95 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Complete Brand Kit (.ZIP)</span>
              </button>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: DUAL MASTER CANVASES & 10 CONCEPTS (8 COLS) */}
        <section className="lg:col-span-8 flex flex-col gap-5">
          {/* Dual Master Canvases & Mockup Previews */}
          <DualCanvasStage
            state={state}
            onUpdateState={handleUpdatePatch}
            remixMode={remixMode}
            onChangeRemixMode={handleChangeRemixMode}
            onRemixVariants={handleRemixVariants}
          />

          {/* 10 Bespoke Agency Concepts Board */}
          <Variants10Board
            state={state}
            onSelectVariant={handleSelectVariant}
          />
        </section>
      </main>

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
        onSelectIcon={(ico) => setState((prev) => ({ ...prev, activeIcon: ico, customSvgPath: undefined }))}
        onClose={() => setIsVaultOpen(false)}
      />
    </div>
  );
}
