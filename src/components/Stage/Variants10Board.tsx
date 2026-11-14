import React from 'react';
import { RefreshCw, Archive, Sparkles } from 'lucide-react';
import { LogoState } from '../../types/logo';
import { buildEmblemSvgMarkup, emblemConfigFromState } from '../../utils/svgBuilder';
import { drawLogoOnCanvas, loadSvgToImage } from '../../utils/canvasRenderer';
import { getExtendedSemanticIconsForDomain } from '../../data/domainSemanticIcons';
import { downloadAll10VariantsZip } from '../../utils/exporter';

interface Variants10BoardProps {
  state: LogoState;
  onSelectVariant: (index: number) => void;
  remixMode?: 'core-focus' | 'deep-semantic';
  onChangeRemixMode?: (mode: 'core-focus' | 'deep-semantic') => void;
  onRemixVariants?: () => void;
  onOpenVault?: () => void;
}

export const Variants10Board: React.FC<Variants10BoardProps> = ({
  state,
  onSelectVariant,
  remixMode = 'core-focus',
  onChangeRemixMode,
  onRemixVariants,
  onOpenVault,
}) => {
  const canvasRefs = React.useRef<(HTMLCanvasElement | null)[]>([]);
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

  const coreSet = React.useMemo(() => new Set(semanticPool.core), [semanticPool.core]);

  const handleExportZip = async () => {
    try {
      setIsExportingZip(true);
      await downloadAll10VariantsZip(state, (msg: string) => setExportStatus(msg));
    } catch (err) {
      console.error(err);
    } finally {
      setIsExportingZip(false);
      setExportStatus('');
    }
  };

  // Render miniature canvases for each variant
  React.useEffect(() => {
    state.variants10.forEach((variant, idx) => {
      const canvas = canvasRefs.current[idx];
      if (!canvas) return;

      const mergedVariant = {
        ...variant,
        word1: state.word1,
        word2: state.word2,
        word3: state.word3,
        letterCase1: state.letterCase1,
        letterCase2: state.letterCase2,
        letterCase3: state.letterCase3,
        ext: state.ext,
        keepExt: state.keepExt,
        extStyle: variant.extStyle || state.extStyle,
        tracking1Em: variant.tracking1Em ?? state.tracking1Em,
        tracking2Em: variant.tracking2Em ?? state.tracking2Em,
        wordmarkAccent: variant.wordmarkAccent || state.wordmarkAccent,
        secondaryIcon: variant.secondaryIcon || state.secondaryIcon,
        emblemFusion: variant.emblemFusion || state.emblemFusion,
        customSvgPath: variant.customSvgPath || state.customSvgPath,
        iconStrokeWidth: state.iconStrokeWidth,
        iconRotation: state.iconRotation,
        iconFlipH: state.iconFlipH,
        iconFlipV: state.iconFlipV,
        showEmblemBg: state.showEmblemBg,
        showEmblemIcon: state.showEmblemIcon,
        emblemBgColor: state.emblemBgColor,
        emblemBgAccentColor: state.emblemBgAccentColor,
        emblemIconColor: state.emblemIconColor,
        emblemBgScale: state.emblemBgScale,
        emblemBgOffsetX: state.emblemBgOffsetX,
        emblemBgOffsetY: state.emblemBgOffsetY,
        emblemIconScale: state.emblemIconScale,
        emblemIconOffsetX: state.emblemIconOffsetX,
        emblemIconOffsetY: state.emblemIconOffsetY,
      };

      const emblemSvg = buildEmblemSvgMarkup(emblemConfigFromState(mergedVariant), 160);

      loadSvgToImage(emblemSvg)
        .then((img) => {
          drawLogoOnCanvas(canvas, img, mergedVariant, 320, 192, false, false);
        })
        .catch((err) => {
          console.error('Failed to render variant thumbnail:', err);
        });
    });
  }, [
    state.variants10,
    state.word1,
    state.word2,
    state.word3,
    state.letterCase1,
    state.letterCase2,
    state.letterCase3,
    state.ext,
    state.keepExt,
    state.extStyle,
    state.tracking1Em,
    state.tracking2Em,
    state.wordmarkAccent,
    state.emblemFusion,
    state.secondaryIcon,
    state.customSvgPath,
    state.iconStrokeWidth,
    state.iconRotation,
    state.iconFlipH,
    state.iconFlipV,
    state.showEmblemBg,
    state.showEmblemIcon,
    state.emblemBgColor,
    state.emblemBgAccentColor,
    state.emblemIconColor,
    state.emblemBgScale,
    state.emblemBgOffsetX,
    state.emblemBgOffsetY,
    state.emblemIconScale,
    state.emblemIconOffsetX,
    state.emblemIconOffsetY,
  ]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Drawer Header */}
      <div className="px-3 py-2.5 border-b border-white/[0.07] shrink-0 space-y-2 bg-[#090C13]">
        <div className="flex items-center justify-between gap-1">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-white">
                10 Bespoke Concepts
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              for <strong className="text-indigo-400 font-mono">{state.domain}</strong> ·{' '}
              {semanticPool.allSemantic.length * 10} Pairs
            </p>
          </div>

          {onRemixVariants && (
            <button
              type="button"
              onClick={onRemixVariants}
              className="text-[10px] font-bold px-2 py-1 rounded-md bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition cursor-pointer shrink-0 flex items-center gap-1"
              title="Remix 10 Concepts & Architectures"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              <span>Remix</span>
            </button>
          )}
        </div>

        {/* Pool Switcher: Core 10 vs Deep Semantic */}
        {onChangeRemixMode && (
          <div className="grid grid-cols-2 p-0.5 rounded-lg bg-[#06080D] border border-white/[0.07] text-[10px] font-semibold">
            <button
              type="button"
              onClick={() => onChangeRemixMode('core-focus')}
              className={`py-1 rounded-md transition cursor-pointer ${
                remixMode === 'core-focus'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Core 10 ({semanticPool.tier1.length})
            </button>
            <button
              type="button"
              onClick={() => onChangeRemixMode('deep-semantic')}
              className={`py-1 rounded-md transition cursor-pointer flex items-center justify-center gap-1 ${
                remixMode === 'deep-semantic'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-2.5 h-2.5" />
              <span>Deep Semantic ({semanticPool.allSemantic.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* Scrollable 2-Column Grid of 10 Concept Cards */}
      <div className="flex-1 overflow-y-auto p-2.5 grid grid-cols-2 gap-2 content-start">
        {state.variants10.map((v, idx) => {
          const isActive = idx === state.activeVariantIndex;
          const isCoreIcon = coreSet.has(v.activeIcon);

          return (
            <div
              key={`${v.id}-${idx}`}
              onClick={() => onSelectVariant(idx)}
              title={`#${v.id} · ${v.activeIcon} · ${
                v.construction ? v.construction.label : v.containerStyle
              }`}
              className={`rounded-xl p-1.5 border transition cursor-pointer flex flex-col justify-between group ${
                isActive
                  ? 'bg-indigo-950/60 border-amber-400/90 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/50'
                  : 'bg-[#06080D] hover:bg-[#101522] border-white/[0.07] hover:border-indigo-500/40'
              }`}
            >
              {/* Card Top Row: #id·Symbol + CORE badge */}
              <div className="flex items-center justify-between text-[9px] mb-1 px-0.5 gap-1">
                <span
                  className={`font-mono font-bold truncate ${
                    isActive ? 'text-amber-300' : 'text-slate-300 group-hover:text-white'
                  }`}
                >
                  #{v.id}·{v.activeIcon}
                </span>
                {isCoreIcon && (
                  <span className="text-[7px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold shrink-0">
                    CORE
                  </span>
                )}
              </div>

              {/* Card Preview Canvas */}
              <div className="bg-white rounded-lg overflow-hidden flex items-center justify-center p-1 border border-slate-800/20 shadow-inner">
                <canvas
                  ref={(el) => {
                    canvasRefs.current[idx] = el;
                  }}
                  width={320}
                  height={192}
                  className="w-full h-auto"
                />
              </div>

              {/* Card Bottom Row: Font Name + 3 Color Dots */}
              <div className="flex items-center justify-between mt-1 px-0.5 gap-1">
                <span className="text-[8px] text-slate-400 font-medium truncate">
                  {v.fontFamily}
                </span>
                <div className="flex items-center gap-0.5 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: v.primary }} />
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: v.secondary }}
                  />
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: v.accent }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drawer Footer: Semantic Pool Info + Remix & Export 10 (.ZIP) */}
      <div className="p-2 border-t border-white/[0.07] bg-[#06080D]/90 shrink-0 space-y-1.5">
        <div className="grid grid-cols-2 gap-1.5">
          {onRemixVariants && (
            <button
              type="button"
              onClick={onRemixVariants}
              className="py-1.5 px-2 rounded-lg bg-[#101522] hover:bg-white/[0.06] border border-white/[0.07] text-[10px] font-bold text-amber-300 flex items-center justify-center gap-1 transition cursor-pointer"
              title="Remix icon-to-architecture pairings, typography contrast, and palettes"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Remix ↻</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleExportZip}
            disabled={isExportingZip || state.variants10.length === 0}
            className="py-1.5 px-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-[10px] font-bold text-emerald-300 flex items-center justify-center gap-1 transition cursor-pointer disabled:opacity-50"
            title="Export all 10 concepts as SVGs and PNGs in a .ZIP file"
          >
            <Archive className="w-3 h-3" />
            <span>{isExportingZip ? exportStatus || 'Exporting...' : 'Export 10 (.ZIP)'}</span>
          </button>
        </div>
        {onOpenVault && (
          <div className="flex items-center justify-between px-1 pt-0.5">
            <span className="text-[9px] text-slate-400 font-mono">
              {semanticPool.allSemantic.length} Semantic Symbols
            </span>
            <button
              type="button"
              onClick={onOpenVault}
              className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
            >
              Browse All 1,600+ →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
