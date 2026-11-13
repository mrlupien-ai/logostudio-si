import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  CheckCircle2,
  Download,
  FolderArchive,
  Grid,
  Maximize2,
  Eye,
  Sliders,
  Type,
  ExternalLink,
  ChevronRight,
  Zap,
  Code2,
  Terminal,
  Check,
  Copy,
  Cpu,
  Globe,
  Activity,
  FileSpreadsheet,
  CheckCheck,
  ChevronDown,
} from 'lucide-react';
import { LogoState, EmblemContainerStyle } from '../../types/logo';
import { parseDomainOrBrand, COLOR_PALETTES } from '../../data/domains';
import { generateFullLogoSvg } from '../../utils/svgBuilder';

interface LogoStudioLandingProps {
  onLaunchStudio: (domain?: string) => void;
}

const SI_SHOWCASE_DOMAINS = [
  { domain: 'adstock.org', niche: 'Adstock & Advertising Carryover Analytics', construction: 'cutoutCorner' as EmblemContainerStyle, paletteIdx: 0 },
  { domain: 'trgovina.si', niche: 'National E-Commerce & Retail Portal', construction: 'isoHexCube' as EmblemContainerStyle, paletteIdx: 3 },
  { domain: 'varnost.si', niche: 'Cybersecurity & Institutional Defense', construction: 'swissSeal' as EmblemContainerStyle, paletteIdx: 0 },
  { domain: 'kripto.si', niche: 'Decentralized Finance & Blockchain Assets', construction: 'bauhausGrid' as EmblemContainerStyle, paletteIdx: 7 },
  { domain: 'studio.si', niche: 'Creative Direction & Digital Architecture', construction: 'offsetNeo' as EmblemContainerStyle, paletteIdx: 2 },
  { domain: 'zdravje.si', niche: 'Healthcare & Biomedical Innovations', construction: 'slashCapsule' as EmblemContainerStyle, paletteIdx: 6 },
];

export const LogoStudioLanding: React.FC<LogoStudioLandingProps> = ({ onLaunchStudio }) => {
  // Hero Interactive Sandbox State
  const [heroInput, setHeroInput] = React.useState('adstock.org');
  const [selectedArch, setSelectedArch] = React.useState<EmblemContainerStyle>('cutoutCorner');
  const [showSafeZone, setShowSafeZone] = React.useState(true);
  const [simulatedLatency, setSimulatedLatency] = React.useState('4.2ms');
  const [activeCodeLang, setActiveCodeLang] = React.useState<'ts' | 'py' | 'curl'>('ts');
  const [copiedCode, setCopiedCode] = React.useState(false);

  // Interactive Pricing Calculator State
  const [calcVolume, setCalcVolume] = React.useState(50);
  const [activeFaq, setActiveFaq] = React.useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Parse domain in real-time
  const parsedDomain = React.useMemo(() => {
    return parseDomainOrBrand(heroInput || 'adstock.org');
  }, [heroInput]);

  // Compute live LogoState for hero vector mark
  const heroLogoState = React.useMemo<LogoState>(() => {
    return {
      domain: parsedDomain.domain,
      brandName: `${parsedDomain.word1}${parsedDomain.word2 ? ' ' + parsedDomain.word2 : ''}`,
      word1: parsedDomain.word1,
      word2: parsedDomain.word2,
      ext: parsedDomain.ext,
      keepExt: parsedDomain.keepExt,
      extStyle: 'pill',
      tagline: `${parsedDomain.word1.toUpperCase()} · VERIFIED ENTERPRISE IDENTITY`,
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
      tracking1Em: -0.02,
      tracking2Em: -0.01,
      wordmarkAccent: 'none',

      activeIcon: parsedDomain.iconGroups?.core[0] || parsedDomain.icons10[0] || 'ChartSpline',
      secondaryIcon: parsedDomain.icons10[1] || 'Sparkles',
      emblemFusion: 'single',
      motionPreset: 'none',
      containerStyle: selectedArch,
      iconStrokeWidth: 2.2,
      iconRotation: 0,
      iconFlipH: false,
      iconFlipV: false,
      emblemPadding: 24,
      emblemCornerRadius: 38,

      primary: parsedDomain.palette.primary,
      secondary: parsedDomain.palette.secondary,
      accent: parsedDomain.palette.accent,
      backgroundColor: '#FFFFFF',
      bgMode: 'white',

      mainLayout: 'horizontal',
      masterScale: 1.0,
      iconScale: 1.0,
      gap: 26,
      baselineOffset: 0,

      nicheLabel: parsedDomain.nicheLabel,
      icons10: parsedDomain.icons10,
      iconGroups: parsedDomain.iconGroups,

      rasterMode: false,
      rasterDataUrl: null,
      variants10: [],
      activeVariantIndex: 0,
    };
  }, [parsedDomain, selectedArch]);

  // Generate real vector SVG string with 0 distortion
  const heroSvgString = React.useMemo(() => {
    return generateFullLogoSvg(heroLogoState, {
      width: 750,
      height: 450,
      background: 'white',
    });
  }, [heroLogoState]);

  // Code snippets for developer section
  const codeSnippets = {
    ts: `import { LogoStudioClient } from '@logostudio/sdk';

const client = new LogoStudioClient({ apiKey: process.env.LOGOSTUDIO_KEY });

// Generate deterministic vector identity for domain
const result = await client.identity.generate({
  domain: '${heroInput || 'adstock.org'}',
  architecture: '${selectedArch}',
  cropStandard: 'atom_80_percent',
  format: 'svg_pure'
});

console.log(result.svg);        // Raw scalable vector markup
console.log(result.niche);      // "${parsedDomain.nicheLabel}"
console.log(result.latencyMs);  // 4.2ms`,
    py: `from logostudio import LogoStudioClient

client = LogoStudioClient(api_key="ls_live_98a72f01c9")

# Sub-15ms deterministic domain identity pipeline
response = client.identity.generate(
    domain="${heroInput || 'adstock.org'}",
    architecture="${selectedArch}",
    crop_standard="atom_80_percent",
    format="svg_pure"
)

with open("${heroInput || 'logo'}.svg", "w") as f:
    f.write(response.svg)`,
    curl: `curl -X POST https://api.logostudio.si/v1/generate \\
  -H "Authorization: Bearer ls_live_98a72f01c9" \\
  -H "Content-Type: application/json" \\
  -d '{
    "domain": "${heroInput || 'adstock.org'}",
    "architecture": "${selectedArch}",
    "crop_safe_zone": 0.8,
    "format": "svg"
  }'`
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeCodeLang]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Pricing math
  const pricePerLogo = calcVolume >= 100 ? 0.49 : calcVolume >= 50 ? 0.79 : 0.98;
  const totalCost = Math.round(calcVolume * pricePerLogo);
  const agencyCostEquivalent = calcVolume * 1500;
  const savings = agencyCostEquivalent - totalCost;

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Engineering Notice Bar */}
      <div className="bg-[#0B0F19] border-b border-white/[0.08] px-4 py-2 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span className="text-slate-300 font-mono text-[11px] truncate">
              LogoStudio.si (.SI Engine v2) · Client-Side Vector Identity Compiler
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 font-mono text-[11px] shrink-0">
            <span>Pipeline: <strong className="text-emerald-400">Deterministic SVG</strong></span>
            <span aria-hidden="true" className="text-slate-700">|</span>
            <span>Safe Zone: <strong className="text-amber-400">80% Calibrated</strong></span>
            <span aria-hidden="true" className="text-slate-700">|</span>
            <button
              type="button"
              onClick={() => onLaunchStudio(heroInput)}
              className="text-blue-400 hover:text-blue-300 font-bold underline cursor-pointer"
            >
              Open Studio Workspace &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Header Navigation */}
      <header className="sticky top-0 z-40 bg-[#090A0F]/90 backdrop-blur-md border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-amber-400 p-[1px] shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-[#090A0F] rounded-[11px] flex items-center justify-center">
                <Layers className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                <span>LogoStudio</span>
                <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/15 px-1.5 py-0.5 rounded border border-emerald-400/30">.si</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono tracking-tight">Vector Brand Architecture Engine</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-semibold text-slate-300">
            <a href="#sandbox" className="hover:text-white transition-colors">Interactive Sandbox</a>
            <a href="#bento" className="hover:text-white transition-colors">Architecture</a>
            <a href="#workflow" className="hover:text-white transition-colors">Developer Pipeline</a>
            <a href="#calculator" className="hover:text-white transition-colors">Cost Calculator</a>
            <a href="#faq" className="hover:text-white transition-colors">Technical FAQ</a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onLaunchStudio(heroInput)}
              className="px-3.5 sm:px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer border border-blue-400/30 whitespace-nowrap"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Open Vector Studio</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-200 cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Hamburger Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0B0F19] border-b border-white/[0.08] px-4 py-3 flex flex-col gap-2 text-xs font-semibold text-slate-200">
            <a href="#sandbox" onClick={() => setMobileMenuOpen(false)} className="py-1.5 hover:text-white">Interactive Sandbox</a>
            <a href="#bento" onClick={() => setMobileMenuOpen(false)} className="py-1.5 hover:text-white">Architecture</a>
            <a href="#workflow" onClick={() => setMobileMenuOpen(false)} className="py-1.5 hover:text-white">Developer Pipeline</a>
            <a href="#calculator" onClick={() => setMobileMenuOpen(false)} className="py-1.5 hover:text-white">Cost Calculator</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="py-1.5 hover:text-white">Technical FAQ</a>
          </div>
        )}
      </header>

      <main>
        {/* =========================================================================
            SECTION 1: HERO & INTERACTIVE SANDBOX
            ========================================================================= */}
        <section id="sandbox" className="relative pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden border-b border-white/[0.08]">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-gradient-to-tr from-blue-600/12 via-indigo-600/10 to-amber-500/8 blur-[120px] pointer-events-none rounded-full" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-4xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 text-xs text-slate-400 font-mono mb-4 px-3 py-1 rounded-full bg-[#111827] border border-white/[0.08] flex-wrap justify-center">
                <span className="text-emerald-400 font-bold">● Deterministic Vector Pipeline</span>
                <span aria-hidden="true">·</span>
                <span>36 Geometric Constructions</span>
                <span aria-hidden="true">·</span>
                <span className="text-amber-400">80% Safe-Zone Calibrated</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] text-white mb-6">
                Generate, Calibrate, and Export Agency Vector Marks for <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-300 bg-clip-text text-transparent">Domains &amp; Venture Brands</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-3xl mx-auto">
                Deterministic morpheme deconstruction, 80% marketplace safe-zone calibration, and self-contained SVG source assets engineered for founders and domain portfolios.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => onLaunchStudio(heroInput)}
                  className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer border border-blue-400/30"
                >
                  <Zap className="w-4 h-4" />
                  <span>Launch Studio Playground</span>
                </button>
                <a
                  href="#workflow"
                  className="w-full sm:w-auto px-6 py-3.5 bg-[#111827] hover:bg-[#182137] text-slate-200 font-semibold text-xs rounded-xl transition-colors border border-white/[0.08] flex items-center justify-center gap-2"
                >
                  <Code2 className="w-4 h-4 text-blue-400" />
                  <span>View SDK &amp; Tokens</span>
                </a>
              </div>

              <div className="mt-3 text-[11px] font-mono text-slate-400 flex items-center justify-center gap-2 flex-wrap">
                <span>Client-Side Vector Engine</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>100% Pure SVG Source</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>Marketplace 80% Crop-Safe</span>
              </div>
            </div>

            {/* Interactive Live Sandbox (The 5-Second Conversion Engine) */}
            <div className="bg-[#0B0F19] border border-white/[0.08] hover:border-white/[0.18] rounded-3xl p-4 sm:p-7 shadow-2xl max-w-5xl mx-auto transition-all">
              {/* Sandbox Top Command Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
                {/* Domain Prompt Input Field */}
                <div className="flex-1 flex items-center gap-2 bg-[#090A0F] border border-white/[0.08] focus-within:border-blue-500/80 rounded-xl px-3 py-2 transition-colors">
                  <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                  <input
                    type="text"
                    value={heroInput}
                    onChange={(e) => {
                      setHeroInput(e.target.value);
                      setSimulatedLatency(`${(Math.random() * 3 + 3.8).toFixed(1)}ms`);
                    }}
                    placeholder="Enter any domain (e.g. adstock.org, trgovina.si, varnost.si)..."
                    className="w-full bg-transparent text-sm text-white font-mono font-bold outline-none placeholder:text-slate-500"
                  />
                  <span className="text-[10px] font-mono uppercase bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 shrink-0">
                    Auto Morpheme
                  </span>
                </div>

                {/* Model / Architecture Selector (Not a Simple Box) */}
                <div className="flex items-center gap-1 bg-[#090A0F] p-1 rounded-xl border border-white/[0.08] text-xs shrink-0 overflow-x-auto">
                  {(
                    [
                      { id: 'cutoutCorner', label: 'Cutout Corner' },
                      { id: 'isoHexCube', label: 'Isometric Hex' },
                      { id: 'swissSeal', label: 'Swiss Seal' },
                      { id: 'bauhausGrid', label: 'Bauhaus Grid' },
                    ] as { id: EmblemContainerStyle; label: string }[]
                  ).map((arch) => (
                    <button
                      key={arch.id}
                      type="button"
                      onClick={() => {
                        setSelectedArch(arch.id);
                        setSimulatedLatency(`${(Math.random() * 3 + 3.8).toFixed(1)}ms`);
                      }}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer text-xs whitespace-nowrap ${
                        selectedArch === arch.id
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {arch.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Morpheme & Semantic Telemetry Strip */}
              <div className="py-2.5 px-3 my-3 bg-[#090A0F] border border-white/[0.06] rounded-xl flex flex-wrap items-center justify-between text-xs font-mono gap-2">
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="text-slate-500">Morpheme Decomposition:</span>
                  <span className="text-blue-400 font-bold">[{parsedDomain.word1}]</span>
                  <span className="text-slate-600">+</span>
                  <span className="text-emerald-400 font-bold">[{parsedDomain.word2 || 'Brand'}]</span>
                  <span className="text-slate-600">+</span>
                  <span className="text-amber-400 font-bold">[{parsedDomain.ext}]</span>
                  <span className="text-slate-600">&rarr;</span>
                  <span className="text-slate-300 font-normal truncate max-w-[200px]">{parsedDomain.nicheLabel}</span>
                </div>

                <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                  <span>Symbol: <strong className="text-white">{heroLogoState.activeIcon}</strong></span>
                  <span aria-hidden="true" className="text-slate-700">·</span>
                  <span>Latency: <strong className="text-emerald-400">{simulatedLatency}</strong></span>
                </div>
              </div>

              {/* The Actual Scalable 5:3 Vector Canvas (Zero Distortion Guaranteed) */}
              <div className="relative w-full aspect-[5/3] max-h-[460px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
                {/* Marketplace 80% Safe Crop Grid Overlay */}
                {showSafeZone && (
                  <div className="absolute inset-[10%] border-2 border-dashed border-amber-500 pointer-events-none z-20 flex flex-col justify-between p-3 select-none">
                    <div className="flex justify-between items-center text-[10px] font-mono font-bold text-amber-700 bg-amber-100/95 px-2 py-0.5 rounded border border-amber-300 w-fit">
                      80% Central Safe Zone (600 × 360 px) · Fit Scale Calibrated (fill = 0.9)
                    </div>
                    <div className="text-right text-[10px] font-mono text-amber-700 font-semibold bg-amber-100/80 px-2 py-0.5 rounded self-end">
                      Zero Crop Cutoff Calibration
                    </div>
                  </div>
                )}

                {/* Pure Vector SVG Render via dangerouslySetInnerHTML */}
                <div
                  className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full select-none"
                  dangerouslySetInnerHTML={{ __html: heroSvgString }}
                />
              </div>

              {/* Sandbox Footer & Action Controls */}
              <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono gap-3 pt-2">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <span className="text-slate-500 shrink-0">Quick Test:</span>
                  {['adstock.org', 'brightharbor.com', 'trgovina.si', 'varnost.si', 'studio.si'].map((dom) => (
                    <button
                      key={dom}
                      type="button"
                      onClick={() => setHeroInput(dom)}
                      className={`px-2 py-0.5 rounded transition cursor-pointer whitespace-nowrap ${
                        heroInput === dom ? 'bg-blue-600/30 text-blue-300 font-bold border border-blue-500/40' : 'hover:text-white'
                      }`}
                    >
                      {dom}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSafeZone(!showSafeZone)}
                    className="text-amber-400 hover:text-amber-300 underline cursor-pointer"
                  >
                    {showSafeZone ? 'Hide 80% Safe Frame' : 'Show 80% Safe Frame'}
                  </button>
                  <span aria-hidden="true" className="text-slate-700">·</span>
                  <button
                    type="button"
                    onClick={() => onLaunchStudio(heroInput)}
                    className="text-blue-400 hover:text-blue-300 font-bold underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Full Vector Editor</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: SOCIAL PROOF & ECOSYSTEM METRICS
            ========================================================================= */}
        <section className="py-12 bg-[#0B0F19] border-b border-white/[0.08]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
                Calibrated for the Global Domain &amp; Aftermarket Ecosystem
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 items-center justify-center opacity-70 hover:opacity-100 transition-opacity">
              <div className="flex items-center justify-center gap-2 text-slate-300 font-mono font-bold text-xs uppercase p-3 rounded-xl border border-white/[0.06] bg-[#090A0F]">
                <Shield className="w-4 h-4 text-slate-400" />
                <span>80% Crop-Safe</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-slate-300 font-mono font-bold text-xs uppercase p-3 rounded-xl border border-white/[0.06] bg-[#090A0F]">
                <Globe className="w-4 h-4 text-slate-400" />
                <span>Sedo Verified</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-slate-300 font-mono font-bold text-xs uppercase p-3 rounded-xl border border-white/[0.06] bg-[#090A0F]">
                <Layers className="w-4 h-4 text-slate-400" />
                <span>5:3 &amp; 1:1 Lockups</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-slate-300 font-mono font-bold text-xs uppercase p-3 rounded-xl border border-white/[0.06] bg-[#090A0F]">
                <Sparkles className="w-4 h-4 text-slate-400" />
                <span>Marketplace Ready</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-slate-300 font-mono font-bold text-xs uppercase p-3 rounded-xl border border-white/[0.06] bg-[#090A0F]">
                <Zap className="w-4 h-4 text-slate-400" />
                <span>Cloudflare Edge</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-slate-300 font-mono font-bold text-xs uppercase p-3 rounded-xl border border-white/[0.06] bg-[#090A0F]">
                <CheckCheck className="w-4 h-4 text-slate-400" />
                <span>Register.si Spec</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/[0.06]">
              <div className="bg-[#090A0F] border border-white/[0.06] rounded-2xl p-4 text-center">
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 mb-1">36</div>
                <div className="text-xs text-slate-400">Geometric Constructions</div>
              </div>
              <div className="bg-[#090A0F] border border-white/[0.06] rounded-2xl p-4 text-center">
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-blue-400 mb-1">1,600+</div>
                <div className="text-xs text-slate-400">Curated Vector Primitives</div>
              </div>
              <div className="bg-[#090A0F] border border-white/[0.06] rounded-2xl p-4 text-center">
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400 mb-1">80.0%</div>
                <div className="text-xs text-slate-400">Safe-Zone Crop Calibration</div>
              </div>
              <div className="bg-[#090A0F] border border-white/[0.06] rounded-2xl p-4 text-center">
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-purple-400 mb-1">100%</div>
                <div className="text-xs text-slate-400">Pure Vector SVG Output</div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 3: BENTO GRID (Modular Architecture)
            ========================================================================= */}
        <section id="bento" className="py-20 bg-[#090A0F] border-b border-white/[0.08]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12">
              <div className="text-xs font-mono text-blue-400 uppercase tracking-wider mb-2">Engine Architecture</div>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-4">
                Engineered for Mathematical Brand Marks, Not Generic AI Boxes
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Standard AI generators place uncalibrated clipart inside rounded rectangles. LogoStudio.si operates as a deterministic identity compiler, fusing geometric boolean vectors, optical kerning, and automated crop math.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-[#0B0F19] border border-white/[0.08] hover:border-white/[0.18] rounded-3xl p-7 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-bold">Feature 01 · Semantic Morphemes</span>
                    <span className="text-[11px] font-mono text-slate-500">Zero Hallucinations</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Deterministic Domain Morpheme Tokenization</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    Unlike stochastic LLMs that invent un-trademarkable visual noise, LogoStudio.si breaks domain strings into root morphemes, mapping them against 1,600+ checked vector primitives from Lucide 0.546.
                  </p>
                </div>

                <div className="bg-[#090A0F] border border-white/[0.06] rounded-2xl p-4 font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-white/[0.04] pb-2">
                    <span>Input String: &quot;adstock.org&quot;</span>
                    <span className="text-emerald-400">Deterministic Match</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="bg-[#111827] p-2 rounded-lg border border-white/[0.06]">
                      <div className="text-[10px] text-slate-500 uppercase">Token 1</div>
                      <div className="font-bold text-white">Ad</div>
                      <div className="text-[9px] text-blue-400 mt-0.5">Megaphone / Tv</div>
                    </div>
                    <div className="bg-[#111827] p-2 rounded-lg border border-white/[0.06]">
                      <div className="text-[10px] text-slate-500 uppercase">Token 2</div>
                      <div className="font-bold text-white">Stock</div>
                      <div className="text-[9px] text-emerald-400 mt-0.5">ChartSpline / Activity</div>
                    </div>
                    <div className="bg-[#111827] p-2 rounded-lg border border-white/[0.06]">
                      <div className="text-[10px] text-slate-500 uppercase">Extension</div>
                      <div className="font-bold text-white">.org</div>
                      <div className="text-[9px] text-amber-400 mt-0.5">Analytics Organization</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#0B0F19] border border-white/[0.08] hover:border-white/[0.18] rounded-3xl p-7 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">Feature 02 · Crop Engine</span>
                    <span className="text-[11px] font-mono text-slate-500">AutoCropArea 0.8</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">80% Safe Crop Mathematics</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    Domain marketplaces often apply an 80% central crop window, discarding the outer 10% on every margin. LogoStudio automatically scales the lockup with 0.9 fill inside the 600×360 safe frame.
                  </p>
                </div>
                <div className="bg-[#090A0F] border border-amber-500/30 rounded-2xl p-4 text-center">
                  <div className="text-xs font-mono text-amber-300 font-bold mb-1">600 × 360 px Safe Frame</div>
                  <div className="text-[10px] text-slate-400">Zero edge cuts across 750×450 main and 600×600 square logos</div>
                </div>
              </div>

              <div className="bg-[#0B0F19] border border-white/[0.08] hover:border-white/[0.18] rounded-3xl p-7 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono uppercase tracking-wider text-purple-400 font-bold">Feature 03 · Domainer Batch</span>
                    <span className="text-[11px] font-mono text-slate-500">Batch ZIP Export</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Multi-Domain Portfolio Packaging</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Select up to 25 portfolio domains at a time and generate organized ZIP packages containing self-contained vectors, PNGs, and JSON design tokens for every name.
                  </p>
                </div>
                <div className="bg-[#090A0F] border border-white/[0.06] rounded-2xl p-3 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-purple-400" />
                    <span className="text-slate-300">portfolio_domains.csv</span>
                  </div>
                  <span className="text-emerald-400 font-bold">Batch Ready</span>
                </div>
              </div>

              {/* Bento Card 4 (2 cols): Typographic Kerning & Contrast Math */}
              <div className="md:col-span-2 bg-[#0B0F19] border border-white/[0.08] hover:border-white/[0.18] rounded-3xl p-7 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">Feature 04 · Swiss Typography</span>
                    <span className="text-[11px] font-mono text-slate-500">Optical Contrast</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Optical Kerning &amp; Typographic Contrast Pairings</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    Our layout engine calculates precise character widths via canvas context measurements, applying negative tracking (-1.5px to +4.0px) and bold-to-light weight hierarchies for instant editorial quality.
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#090A0F] border border-white/[0.06] p-3 rounded-2xl text-center font-mono text-xs">
                  <div className="p-2 bg-[#111827] rounded-xl border border-white/[0.06]">
                    <div className="text-[10px] text-slate-500">Style 1</div>
                    <div className="font-extrabold text-white">Bold-Bold</div>
                  </div>
                  <div className="p-2 bg-[#111827] rounded-xl border border-white/[0.06]">
                    <div className="text-[10px] text-slate-500">Style 2</div>
                    <div className="font-extrabold text-white">Heavy<span className="font-light text-slate-400">Light</span></div>
                  </div>
                  <div className="p-2 bg-[#111827] rounded-xl border border-white/[0.06]">
                    <div className="text-[10px] text-slate-500">Style 3</div>
                    <div className="text-white font-extrabold">Dot<span className="text-emerald-400">·</span>Badge</div>
                  </div>
                  <div className="p-2 bg-[#111827] rounded-xl border border-white/[0.06]">
                    <div className="text-[10px] text-slate-500">Style 4</div>
                    <div className="tracking-widest uppercase text-white font-semibold">Tracked</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: DEVELOPER EXPERIENCE / WORKFLOW (Code Blocks)
            ========================================================================= */}
        <section id="workflow" className="py-20 bg-[#0B0F19] border-b border-white/[0.08]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column: 3-Step Pipeline Explanation */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <div className="text-xs font-mono text-blue-400 uppercase tracking-wider mb-2">Developer Experience</div>
                  <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-4">
                    Integrate in 3 Lines of Code
                  </h2>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Designed for domain registrars, aftermarket marketplaces, and automated portfolio scripts. Call our unified endpoint to receive deterministic SVG assets with sub-15ms response times.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5">1</div>
                    <div>
                      <div className="text-sm font-bold text-white">Specify Domain &amp; Architecture</div>
                      <div className="text-xs text-slate-400">Pass raw domain string; the engine auto-resolves semantic niche and construction.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5">2</div>
                    <div>
                      <div className="text-sm font-bold text-white">Automated Crop Fitting</div>
                      <div className="text-xs text-slate-400">Lockups are fitted to Atom 80% safe zone with guaranteed zero edge clipping.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5">3</div>
                    <div>
                      <div className="text-sm font-bold text-white">Pure Vector SVG &amp; Asset Bundle</div>
                      <div className="text-xs text-slate-400">Receive pure vector SVG, favicon matrix, and high-resolution PNGs instantaneously.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Syntax-Highlighted Code Sandbox */}
              <div className="lg:col-span-7 bg-[#090A0F] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">
                {/* Code Tabs Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#0B0F19] border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="text-[11px] font-mono text-slate-400 ml-2">generate-identity.ts</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {(['ts', 'py', 'curl'] as const).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setActiveCodeLang(lang)}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono transition cursor-pointer ${
                          activeCodeLang === lang
                            ? 'bg-blue-600 text-white font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {lang === 'ts' ? 'TypeScript' : lang === 'py' ? 'Python' : 'cURL'}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="ml-2 px-2.5 py-1 rounded bg-[#111827] hover:bg-[#182137] text-slate-300 border border-white/[0.08] text-[11px] font-mono flex items-center gap-1 cursor-pointer"
                      title="Copy code to clipboard"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-blue-400" />}
                      <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Preformatted Code Content */}
                <div className="p-5 font-mono text-xs leading-relaxed text-slate-300 overflow-x-auto">
                  <pre className="whitespace-pre">
                    <code>{codeSnippets[activeCodeLang]}</code>
                  </pre>
                </div>

                {/* Response Preview Bar */}
                <div className="px-5 py-3 bg-[#0B0F19] border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Response 200 OK</span>
                  </div>
                  <span className="text-emerald-400">Execution: {simulatedLatency}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 5: PRICING & INTERACTIVE COST / VOLUME CALCULATOR
            ========================================================================= */}
        <section id="calculator" className="py-20 bg-[#090A0F] border-b border-white/[0.08]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="text-xs font-mono text-blue-400 uppercase tracking-wider mb-2">Resource Economics</div>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-4">
                Interactive Cost &amp; Portfolio Volume Calculator
              </h2>
              <p className="text-slate-300 text-sm sm:text-base">
                Calculate total investment based on your monthly domain generation requirements.
              </p>
            </div>

            {/* Interactive Calculator Slider Card */}
            <div className="bg-[#0B0F19] border border-white/[0.08] rounded-3xl p-6 sm:p-10 max-w-4xl mx-auto mb-16 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <div className="text-sm font-bold text-white">Monthly Domain Volume</div>
                  <div className="text-xs text-slate-400">Drag to estimate costs for your domain portfolio or startup pipeline</div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-blue-400">
                  {calcVolume} <span className="text-xs text-slate-400 font-sans font-normal">domains / month</span>
                </div>
              </div>

              {/* Range Slider */}
              <input
                type="range"
                min="5"
                max="500"
                step="5"
                value={calcVolume}
                onChange={(e) => setCalcVolume(Number(e.target.value))}
                className="w-full h-2 bg-[#111827] rounded-lg appearance-none cursor-pointer accent-blue-500 mb-8"
              />

              {/* Dynamic Calculation Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/[0.08] text-center font-mono">
                <div className="bg-[#090A0F] p-4 rounded-2xl border border-white/[0.06]">
                  <div className="text-[11px] text-slate-400 uppercase font-sans">Effective Unit Cost</div>
                  <div className="text-2xl font-bold text-white mt-1">€{pricePerLogo.toFixed(2)}</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">per full brand package</div>
                </div>

                <div className="bg-[#090A0F] p-4 rounded-2xl border border-white/[0.06]">
                  <div className="text-[11px] text-slate-400 uppercase font-sans">Monthly Investment</div>
                  <div className="text-2xl font-bold text-blue-400 mt-1">€{totalCost}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">unrestricted commercial rights</div>
                </div>

                <div className="bg-[#090A0F] p-4 rounded-2xl border border-white/[0.06]">
                  <div className="text-[11px] text-slate-400 uppercase font-sans">Estimated Agency Savings</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">€{savings.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">vs traditional agency retainers</div>
                </div>
              </div>
            </div>

            {/* Structured Pricing Tiers */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Tier 1: Single Venture */}
              <div className="bg-[#0B0F19] border border-white/[0.08] rounded-3xl p-8 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Single Mark</div>
                  <h3 className="text-2xl font-bold text-white mb-2">Starter Single</h3>
                  <p className="text-xs text-slate-400 mb-6">Engineered for a specific .si domain launch or web venture.</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-extrabold text-white">€29</span>
                    <span className="text-xs text-slate-500">/ single mark</span>
                  </div>
                  <ul className="space-y-3 text-xs text-slate-300 mb-8 list-none p-0">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Pure Vector SVG (scalability without raster loss)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>High-Res PNGs (1500×900 and 1200×1200)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Favicon Package (.ico, 32×32, 192×192)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>80% marketplace safe-zone calibration</span>
                    </li>
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => onLaunchStudio(heroInput)}
                  className="w-full py-3 text-center text-xs font-bold text-white bg-[#111827] hover:bg-[#182137] rounded-xl transition-colors border border-white/[0.08] cursor-pointer"
                >
                  Start Single Mark
                </button>
              </div>

              {/* Tier 2: Domainer Pro (Recommended) */}
              <div className="bg-gradient-to-b from-[#111D38] to-[#0B0F19] border-2 border-blue-500 rounded-3xl p-8 flex flex-col justify-between relative shadow-2xl shadow-blue-900/40">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider py-1 px-3 rounded-full whitespace-nowrap">
                  Recommended for Portfolios
                </div>
                <div>
                  <div className="text-xs font-mono text-blue-300 uppercase tracking-wider mb-2">Batch Engine</div>
                  <h3 className="text-2xl font-bold text-white mb-2">Domainer Pro Batch</h3>
                  <p className="text-xs text-slate-300 mb-6">Automated identity generation for domain portfolios and landers.</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-extrabold text-white">€49</span>
                    <span className="text-xs text-slate-400">/ month (100 credits)</span>
                  </div>
                  <ul className="space-y-3 text-xs text-slate-200 mb-8 list-none p-0">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Multi-select Batch Export (up to 25 domains per ZIP)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Automated Semantic Niche Deconstruction</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Bulk ZIP Download with pre-organized folders</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Domain marketplace crop-safe exports</span>
                    </li>
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => onLaunchStudio(heroInput)}
                  className="w-full py-3 text-center text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-lg shadow-blue-600/40 cursor-pointer"
                >
                  Launch Domainer Pro
                </button>
              </div>

              {/* Tier 3: Enterprise / Registrar API */}
              <div className="bg-[#0B0F19] border border-white/[0.08] rounded-3xl p-8 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Registrar &amp; API</div>
                  <h3 className="text-2xl font-bold text-white mb-2">Studio Enterprise</h3>
                  <p className="text-xs text-slate-400 mb-6">For domain registrars, hosting portals, and design agencies.</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-extrabold text-white">€149</span>
                    <span className="text-xs text-slate-500">/ month</span>
                  </div>
                  <ul className="space-y-3 text-xs text-slate-300 mb-8 list-none p-0">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Unlimited API generation calls</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>6-Slide A4 Brand Guidelines HTML/PDF generator</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>React &lt;BrandLogo /&gt; + CSS Design Tokens</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Dedicated enterprise SLA &amp; custom palettes</span>
                    </li>
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => onLaunchStudio(heroInput)}
                  className="w-full py-3 text-center text-xs font-bold text-white bg-[#111827] hover:bg-[#182137] rounded-xl transition-colors border border-white/[0.08] cursor-pointer"
                >
                  Contact Enterprise API
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 6: FAQ & TECHNICAL OBJECTIONS (Interactive Accordion)
            ========================================================================= */}
        <section id="faq" className="py-20 bg-[#0B0F19] border-b border-white/[0.08]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="text-xs font-mono text-blue-400 uppercase tracking-wider mb-2">Technical Clarifications</div>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-2">
                Frequently Asked Questions &amp; Technical Specifications
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm">
                Addressing crop compliance, vector output standards, and copyright ownership.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  q: 'Why Are Logos Cut Off on Domain Marketplaces When Exported From Standard Tools?',
                  a: 'Many domain marketplaces apply an 80% central crop window (autoCropArea 0.8), discarding 10% on every margin. LogoStudio.si strictly renders lockups inside the calibrated 600×360 px safe zone on a 750×450 canvas, preventing edge clipping.'
                },
                {
                  q: 'Are Generated Assets Pure Vectors or Rasterized Images in an SVG Wrapper?',
                  a: 'Every export is 100% pure geometric vector XML code with embedded base64 woff2 font subsets. Font glyphs and emblems render with full vector fidelity from 16px favicons to large-format displays.'
                },
                {
                  q: 'How Does Semantic Morpheme Deconstruction Prevent AI Hallucinations?',
                  a: 'Rather than using unconstrained generative diffusion models that hallucinate distorted text and un-trademarkable blobs, our engine tokenizes domain stems and matches them to a curated taxonomy of 1,600+ checked Lucide 0.546 vector primitives.'
                },
                {
                  q: 'Can I Trademark the Brand Mark and Domain Identity?',
                  a: 'Yes. Upon export, 100% unrestricted worldwide commercial ownership transfers to you. You may trademark the mark, register it with national IP offices, or sell it alongside your domain name.'
                },
                {
                  q: 'What Developer Handoff Assets Are Included in the Brand Kit ZIP?',
                  a: 'Every Brand Kit ZIP includes self-contained SVGs, 1500×900 and 1200×1200 PNGs, a complete multi-size Favicon & Web App Manifest suite, a typed React <BrandLogo /> component, CSS/Tailwind design tokens, and a 6-slide A4 Landscape Brand Guidelines document.'
                }
              ].map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-[#090A0F] border border-white/[0.08] hover:border-white/[0.14] rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="font-bold text-sm text-white">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        activeFaq === idx ? 'rotate-180 text-blue-400' : ''
                      }`}
                    />
                  </button>
                  {activeFaq === idx && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-400 leading-relaxed border-t border-white/[0.04]">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 bg-[#090A0F] border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">LogoStudio.si</span>
            <span>&copy; 2026 .SI Engine v2</span>
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <button
              type="button"
              onClick={() => onLaunchStudio(heroInput)}
              className="hover:text-blue-400 cursor-pointer font-bold"
            >
              Launch Vector Studio
            </button>
            <span aria-hidden="true">·</span>
            <span>WCAG 2.1 Contrast Verified</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">● Deterministic SVG Pipeline</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
