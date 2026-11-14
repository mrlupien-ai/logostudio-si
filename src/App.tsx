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
  Layers,
  X,
  Send,
  Loader2,
} from 'lucide-react';
import { LogoState, LogoVariant, TypoContrastStyle, MainLayoutMode } from './types/logo';
import { parseDomainOrBrand, COLOR_PALETTES, BRAND_FONTS } from './data/domains';
import {
  getExtendedSemanticIconsForDomain,
  selectRemixIconsForDomain,
} from './data/domainSemanticIcons';
import {
  constructionsForDomain,
  familyToLegacyContainerStyle,
} from './utils/constructionEngine';
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
import { ToastStack, useToasts } from './components/Toast';
import {
  ExitFlipStatus,
  bridgeSupported,
  getExtensionId,
  pingExitFlip,
  saveExtensionId,
  sendLogoToExitFlip,
} from './services/exitflipBridge';
import {
  downloadBrandKitZip,
  downloadAll10VariantsZip,
  downloadEmbeddedSvgFile,
  copyEmbeddedSvgToClipboard,
} from './utils/exporter';

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
  const [isLaptopLeftDrawerOpen, setIsLaptopLeftDrawerOpen] = React.useState(false);
  const [mobileActivePane, setMobileActivePane] = React.useState<'concepts' | 'canvas' | 'inspector'>('canvas');
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
      brandName: [init.word1, init.word2, init.word3].filter(Boolean).join(' '),
      word1: init.word1,
      word2: init.word2,
      word3: init.word3 || '',
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
      letterCase3: 'as-is',
      tracking: -1.5,
      tracking1Em: -0.02,
      tracking2Em: -0.01,
      wordmarkAccent: 'none',

      activeIcon: init.iconGroups?.core[0] || init.icons10[0] || 'ChartSpline',
      secondaryIcon: init.icons10[1] || 'Sparkles',
      emblemFusion: 'single',
      containerStyle: 'cutoutCorner',
      iconStrokeWidth: 2.2,
      iconRotation: 0,
      iconFlipH: false,
      iconFlipV: false,
      showEmblemBg: true,
      showEmblemIcon: true,
      emblemBgScale: 1,
      emblemBgOffsetX: 0,
      emblemBgOffsetY: 0,
      emblemIconScale: 1,
      emblemIconOffsetX: 0,
      emblemIconOffsetY: 0,
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
      motionPreset: 'none',

      listingPrice: '',
      leaseMonthly: '',
      minOffer: '',

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
        [currentState.word2, currentState.word3].filter(Boolean).join(''),
        currentState.nicheLabel,
        currentState.icons10,
        currentState.iconGroups
      );
      const icons = selectRemixIconsForDomain(pool, seed, mode);
      const variants: LogoVariant[] = [];

      const domainSeed = hashDomainSeed((currentState.domain || '').toLowerCase());
      const domainConstructions = constructionsForDomain(currentState.domain, seed, 10);
      const typoStyles = seededShuffle(
        TYPO_CONTRAST_STYLES,
        (domainSeed ^ 0x9e3779b9) + seed * 104729
      );
      const palettes = seededShuffle(
        COLOR_PALETTES,
        (domainSeed ^ 0x85ebca6b) + seed * 1299709
      );
      const fonts = seededShuffle(BRAND_FONTS, (domainSeed ^ 0xc2b2ae35) + seed * 15485863);

      for (let i = 0; i < 10; i++) {
        const iconForThisVariant = icons[i % icons.length];
        const secondaryForThisVariant = icons[(i + 1) % icons.length] || currentState.secondaryIcon;
        const spec = domainConstructions[i % domainConstructions.length];
        const legacyStyle = familyToLegacyContainerStyle(spec.family);
        const typoContrast = typoStyles[i % typoStyles.length];
        const pal =
          i === 0 && seed === 0
            ? {
                primary: currentState.primary,
                secondary: currentState.secondary,
                accent: currentState.accent,
              }
            : palettes[i % palettes.length];
        const font = fonts[i % fonts.length];
        const layout: MainLayoutMode = i === 9 ? 'stacked' : 'horizontal';

        variants.push({
          id: i + 1,
          domain: currentState.domain,
          word1: currentState.word1,
          word2: currentState.word2,
          word3: currentState.word3,
          letterCase3: currentState.letterCase3,
          ext: currentState.ext,
          keepExt: currentState.keepExt,
          extStyle: currentState.extStyle,
          typoContrast,
          activeIcon: iconForThisVariant,
          secondaryIcon: secondaryForThisVariant,
          emblemFusion: currentState.emblemFusion,
          customSvgPath: currentState.customSvgPath,
          containerStyle: legacyStyle,
          construction: spec,
          primary: pal.primary,
          secondary: pal.secondary,
          accent: pal.accent,
          fontFamily: font,
          mainLayout: layout,
          tracking: currentState.tracking,
          tracking1Em: currentState.tracking1Em,
          tracking2Em: currentState.tracking2Em,
          wordmarkAccent: currentState.wordmarkAccent,
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
        brandName: [parsed.word1, parsed.word2, parsed.word3].filter(Boolean).join(' '),
        word1: parsed.word1,
        word2: parsed.word2,
        word3: parsed.word3 || '',
        ext: parsed.ext,
        keepExt: parsed.keepExt,
        nicheLabel: parsed.nicheLabel,
        icons10: parsed.icons10,
        iconGroups: parsed.iconGroups,
        activeIcon: parsed.iconGroups?.core[0] || parsed.icons10[0] || 'Sparkles',
        secondaryIcon: parsed.icons10[1] || 'Sparkles',
        primary: parsed.palette.primary,
        secondary: parsed.palette.secondary,
        accent: parsed.palette.accent,
        emblemBgColor: undefined,
        emblemBgAccentColor: undefined,
        emblemIconColor: undefined,
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

  // Toggle 1-Word vs Multi-Word mode
  const handleToggleWordMode = () => {
    setState((prev) => {
      if ((prev.word2 && prev.word2.trim() !== '') || (prev.word3 && prev.word3.trim() !== '')) {
        const merged =
          prev.word1 +
          (prev.word2 ? prev.word2.toLowerCase() : '') +
          (prev.word3 ? prev.word3.toLowerCase() : '');
        const next: LogoState = {
          ...prev,
          word1: merged,
          word2: '',
          word3: '',
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
          word3: '',
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
    const effectiveSeed =
      nextMode === 'deep-semantic' && variantSeedOffset === 0 ? 1 : variantSeedOffset;
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
      tracking1Em: -0.02,
      tracking2Em: -0.01,
    }));
  };

  // Update patch helper
  const handleUpdatePatch = (patch: Partial<LogoState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  };

  const handleCopyFooterSvg = async () => {
    const ok = await copyEmbeddedSvgToClipboard(state, {
      width: 750,
      height: 450,
      background: state.bgMode,
      animated: state.motionPreset !== 'none',
    });
    if (ok) {
      setCopiedFooterSvg(true);
      setTimeout(() => setCopiedFooterSvg(false), 2000);
    }
  };

  // ExitFlip bridge: opened from the extension (?domain=&from=exitflip&ext=) and "Send to ExitFlip".
  const { toasts, push: pushToast, dismiss: dismissToast } = useToasts();
  const [exitflipStatus, setExitflipStatus] = React.useState<ExitFlipStatus>('unavailable');
  const [isSendingToExitflip, setIsSendingToExitflip] = React.useState(false);

  const refreshExitflipStatus = React.useCallback(async () => {
    if (!bridgeSupported() || !getExtensionId()) {
      setExitflipStatus('unavailable');
      return;
    }
    const r = await pingExitFlip();
    setExitflipStatus(r.ok ? 'ready' : 'no-extension');
  }, []);

  const openedFromExitflip = React.useRef(false);
  React.useEffect(() => {
    if (openedFromExitflip.current) return;
    openedFromExitflip.current = true;
    const params = new URLSearchParams(window.location.search);
    const ext = params.get('ext');
    const dom = (params.get('domain') || '').trim().toLowerCase();
    const fromExitflip = params.get('from') === 'exitflip';
    if (ext) saveExtensionId(ext);
    if (dom && /^(?=.{3,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(dom)) {
      setAppMode('studio');
      handleDomainGenerate(dom);
      if (fromExitflip) pushToast('info', 'Opened from ExitFlip — choose a concept and press "Send to ExitFlip".');
    }
    if (params.has('domain') || params.has('from') || params.has('ext')) {
      ['domain', 'from', 'ext'].forEach((k) => params.delete(k));
      const q = params.toString();
      window.history.replaceState(null, '', `${window.location.pathname}${q ? `?${q}` : ''}${window.location.hash}`);
    }
    refreshExitflipStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const onFocus = () => refreshExitflipStatus();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refreshExitflipStatus]);

  const handleSendToExitflip = async () => {
    if (isSendingToExitflip) return;
    setIsSendingToExitflip(true);
    try {
      const r = await sendLogoToExitFlip(state);
      const dom = state.domain.trim().toLowerCase();
      if (r.ok) {
        pushToast(
          'success',
          `Sent to ExitFlip: ${dom}. Go back to the Atom tab and press «Încarcă logo pe Atom».` +
            (r.inPortfolio === false ? ` (${dom} is not in your ExitFlip portfolio yet.)` : ''),
          9000
        );
      } else {
        pushToast('error', r.error || 'ExitFlip refused the logo.');
        if (r.error && /did not answer/.test(r.error)) setExitflipStatus('no-extension');
      }
    } finally {
      setIsSendingToExitflip(false);
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

  // Landing Page View (Defect 19 fix: no overlapping fixed top-right button)
  if (appMode === 'landing') {
    return (
      <LogoStudioLanding
        onLaunchStudio={(dom) => {
          if (dom) handleDomainGenerate(dom);
          setAppMode('studio');
        }}
      />
    );
  }

  const renderLeftDrawerContent = () => (
    <>
      {/* DRAWER VIEW 1: 10 BESPOKE AGENCY CONCEPTS */}
      {leftDockTab === 'concepts' && (
        <Variants10Board
          state={state}
          onSelectVariant={(idx) => {
            handleSelectVariant(idx);
            setIsLaptopLeftDrawerOpen(false);
            if (mobileActivePane === 'concepts') {
              setMobileActivePane('canvas');
            }
          }}
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
              <div className="grid grid-cols-4 gap-1.5 content-start">
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
              Automatically enforces 80% safe zone padding and optical weight balancing across 1500×900 and 1200×1200 exports.
            </p>
          </div>

          <div className="space-y-2 p-2.5 rounded-xl bg-[#06080D] border border-white/[0.07]">
            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
              <span>80% Safe Crop Zone</span>
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
    </>
  );

  const renderRightInspectorContent = () => (
    <>
      {/* Inspector Header */}
      <div className="px-3.5 py-2.5 border-b border-white/[0.07] flex items-center justify-between shrink-0 bg-[#090C13]">
        <div className="flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs font-extrabold tracking-tight text-white">
            Vector &amp; Type Inspector
          </span>
        </div>
        <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-500/25 px-1.5 py-0.5 rounded truncate max-w-[130px]">
          #{state.activeVariantIndex + 1} · {state.activeIcon}
        </span>
      </div>

      {/* Inspector Scrollable Body (pb-6 prevents sticky footer overlap - Defect 8 fix) */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.07] pb-6">
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
          <OpticalSliders state={state} onChange={handleUpdatePatch} onReset={handleResetSliders} />
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
            onClick={() =>
              downloadEmbeddedSvgFile(
                state,
                {
                  width: 750,
                  height: 450,
                  background: state.bgMode,
                  animated: state.motionPreset !== 'none',
                },
                `${(state.domain || 'logo').replace(/[^a-z0-9.-]/gi, '-')}-vector.svg`
              )
            }
            className="py-1.5 px-2.5 rounded-lg bg-[#101522] hover:bg-white/[0.06] border border-white/[0.07] text-[11px] font-bold text-slate-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export Vector SVG</span>
          </button>
        </div>

        {exitflipStatus === 'ready' && (
          <button
            type="button"
            onClick={handleSendToExitflip}
            disabled={isSendingToExitflip}
            className="w-full py-2 px-4 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-400/40 text-indigo-100 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60 disabled:cursor-wait"
          >
            {isSendingToExitflip ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{isSendingToExitflip ? 'Sending…' : 'Send to ExitFlip'}</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => downloadBrandKitZip(state)}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs tracking-tight flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>Download Complete Brand Kit (.ZIP)</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-[#06080D] text-slate-100 select-none overflow-hidden">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      {/* 1. TOP STUDIO COMMAND BAR (54px) */}
      <Header
        domainInput={state.domain}
        setDomainInput={(domain: string) => setState((prev) => ({ ...prev, domain }))}
        onApplyDomain={(dom: string) => handleDomainGenerate(dom)}
        onRemix10={handleRemixVariants}
        onOpenPortfolio={() => setIsPortfolioOpen(true)}
        onOpenLanding={() => setAppMode('landing')}
        onCopySvg={handleCopyFooterSvg}
        onDownloadSvg={() =>
          downloadEmbeddedSvgFile(
            state,
            {
              width: 750,
              height: 450,
              background: state.bgMode,
              animated: state.motionPreset !== 'none',
            },
            `${(state.domain || 'logo').replace(/[^a-z0-9.-]/gi, '-')}-vector.svg`
          )
        }
        onDownloadBrandKit={() => downloadBrandKitZip(state)}
        onExport10Zip={() => downloadAll10VariantsZip(state)}
        onSendToExitflip={exitflipStatus === 'ready' ? handleSendToExitflip : undefined}
        isSendingToExitflip={isSendingToExitflip}
        copiedSvg={copiedFooterSvg}
        isExporting={false}
        isExporting10={false}
        nicheLabel={state.nicheLabel}
        wordCount={
          [state.word1, state.word2, state.word3].filter((w) => w && w.trim() !== '').length || 1
        }
        remixMode={remixMode}
        onChangeRemixMode={handleChangeRemixMode}
        semanticPoolCount={semanticPool.allSemantic.length}
      />

      {/* 2. MAIN WORKSPACE: RESPONSIVE 3-BREAKPOINT STUDIO ARCHITECTURE */}
      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {/* DESKTOP & LAPTOP LEFT DOCK (≥1024px) */}
        <aside className="hidden lg:flex h-full shrink-0 z-30 relative">
          {/* 56px Vertical Icon Tool Rail */}
          <div className="w-14 bg-[#0B0E17] border-r border-white/[0.07] flex flex-col items-center py-3 justify-between shrink-0 z-30">
            <div className="flex flex-col items-center gap-2 w-full px-1.5">
              {/* Tab 1: 10 Bespoke Agency Concepts */}
              <button
                type="button"
                onClick={() => {
                  if (leftDockTab === 'concepts') {
                    setIsLaptopLeftDrawerOpen((p) => !p);
                  } else {
                    setLeftDockTab('concepts');
                    setIsLaptopLeftDrawerOpen(true);
                  }
                }}
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
                onClick={() => {
                  if (leftDockTab === 'vault') {
                    setIsLaptopLeftDrawerOpen((p) => !p);
                  } else {
                    setLeftDockTab('vault');
                    setIsLaptopLeftDrawerOpen(true);
                  }
                }}
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
                onClick={() => {
                  if (leftDockTab === 'ai') {
                    setIsLaptopLeftDrawerOpen((p) => !p);
                  } else {
                    setLeftDockTab('ai');
                    setIsLaptopLeftDrawerOpen(true);
                  }
                }}
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
                title="Toggle 80% Safe Crop Overlay"
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

          {/* 268px Navigator Drawer: Always docked at ≥1440px (min-[1440px]:flex), Overlay Drawer at 1024px–1439px */}
          <div
            className={`w-[268px] bg-[#0B0E17]/95 backdrop-blur-md border-r border-white/[0.07] flex-col h-full overflow-hidden ${
              isLaptopLeftDrawerOpen
                ? 'flex absolute left-14 top-0 bottom-0 z-40 shadow-2xl min-[1440px]:static min-[1440px]:shadow-none'
                : 'hidden min-[1440px]:flex'
            }`}
          >
            {/* Close Drawer Bar on 1024-1439px Laptop Overlay */}
            <div className="flex min-[1440px]:hidden items-center justify-between px-3 py-1.5 bg-[#06080D] border-b border-white/[0.07]">
              <span className="text-[10px] font-mono font-bold text-indigo-300 uppercase">
                Studio Navigator Drawer
              </span>
              <button
                type="button"
                onClick={() => setIsLaptopLeftDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {renderLeftDrawerContent()}
          </div>
        </aside>

        {/* MOBILE & TABLET (<1024px) CONCEPTS PANE */}
        {mobileActivePane === 'concepts' && (
          <div className="flex lg:hidden flex-1 flex-col bg-[#0B0E17] overflow-hidden">
            <div className="flex items-center gap-1 p-2 bg-[#090C13] border-b border-white/[0.07] shrink-0">
              {(
                [
                  { id: 'concepts', label: '10 Concepts' },
                  { id: 'vault', label: '1,600+ Symbols' },
                  { id: 'ai', label: 'AI & Flow Crop' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setLeftDockTab(t.id)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    leftDockTab === t.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-[#06080D] text-slate-400'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-hidden flex flex-col">{renderLeftDrawerContent()}</div>
          </div>
        )}

        {/* ZONE 3: CENTER INFINITE VECTOR VIEWPORT (Always visible on ≥1024px, or when mobileActivePane === 'canvas') */}
        <div
          className={`flex-1 flex flex-col overflow-hidden min-w-0 ${
            mobileActivePane === 'canvas' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <DualCanvasStage
            state={state}
            onUpdateState={handleUpdatePatch}
            showSafeGrid={showSafeGrid}
            onToggleSafeGrid={() => setShowSafeGrid((p) => !p)}
            showVectorGuides={showVectorGuides}
            onToggleVectorGuides={() => setShowVectorGuides((p) => !p)}
            onCyclePalette={handleCyclePalette}
          />
        </div>

        {/* ZONE 4: RIGHT PRECISION INSPECTOR (Docked 336px on ≥1024px, or full pane on <1024px when mobileActivePane === 'inspector') */}
        <aside
          className={`w-full lg:w-[336px] bg-[#0B0E17] border-l border-white/[0.07] flex-col h-full shrink-0 z-20 ${
            mobileActivePane === 'inspector' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {renderRightInspectorContent()}
        </aside>
      </div>

      {/* MOBILE / TABLET (<1024px) FIXED BOTTOM TAB BAR (Concepts · Canvas · Inspector + Brand Kit CTA) */}
      <nav className="flex lg:hidden items-center justify-between gap-2 px-3 py-2 bg-[#090C13] border-t border-white/[0.08] shrink-0 z-40">
        <div className="flex items-center gap-1 flex-1">
          <button
            type="button"
            onClick={() => setMobileActivePane('concepts')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileActivePane === 'concepts'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-[#0B0E17] text-slate-400 border border-white/[0.07]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Concepts</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileActivePane('canvas')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileActivePane === 'canvas'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-[#0B0E17] text-slate-400 border border-white/[0.07]'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Canvas</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileActivePane('inspector')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileActivePane === 'inspector'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-[#0B0E17] text-slate-400 border border-white/[0.07]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Inspector</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => downloadBrandKitZip(state)}
          className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-xs flex items-center gap-1 shrink-0 shadow cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">Brand Kit</span>
          <span>.ZIP</span>
        </button>
      </nav>

      {/* 3. Portfolio Modal (223 Domains + Batch Exporter) */}
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
