import React from 'react';
import { Search, X, Globe, Zap, CheckSquare, Square, Ban } from 'lucide-react';
import { TLDWATCH_223_DOMAINS, parseDomainOrBrand } from '../data/domains';
import { constructionsForDomain, familyToLegacyContainerStyle } from '../utils/constructionEngine';
import { resolveLucideIcon } from '../utils/svgBuilder';
import { downloadPortfolioBatchZip } from '../utils/exporter';

interface PortfolioModalProps {
  isOpen: boolean;
  currentDomain: string;
  onSelectDomain: (domain: string) => void;
  onClose: () => void;
}

export const PortfolioModal: React.FC<PortfolioModalProps> = ({
  isOpen,
  currentDomain,
  onSelectDomain,
  onClose,
}) => {
  const [search, setSearch] = React.useState('');
  const [tldFilter, setTldFilter] = React.useState('ALL');
  const [selectedDomains, setSelectedDomains] = React.useState<Set<string>>(() => new Set());
  const [isBatchExporting, setIsBatchExporting] = React.useState(false);
  const [batchProgress, setBatchProgress] = React.useState<{
    current: number;
    total: number;
    domain: string;
  } | null>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isBatchExporting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isBatchExporting]);

  if (!isOpen) return null;

  const filteredDomains = TLDWATCH_223_DOMAINS.filter((d) => {
    const low = d.toLowerCase();
    if (search && !low.includes(search.toLowerCase().trim())) return false;
    if (tldFilter === 'ALL') return true;
    if (tldFilter === 'OTHER') {
      return (
        !low.endsWith('.com') &&
        !low.endsWith('.net') &&
        !low.endsWith('.onl') &&
        !low.endsWith('.org') &&
        !low.endsWith('.ad') &&
        !low.endsWith('.cool')
      );
    }
    return low.endsWith(tldFilter);
  });

  const handleToggleDomainSelection = (dom: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(dom)) {
        next.delete(dom);
      } else if (next.size < 25) {
        next.add(dom);
      }
      return next;
    });
  };

  const handleSelectVisible = () => {
    setSelectedDomains((prev) => {
      const next = new Set(prev);
      for (const dom of filteredDomains) {
        if (next.size >= 25) break;
        next.add(dom);
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedDomains(new Set());
  };

  const handleBatchExport = async () => {
    if (selectedDomains.size === 0 || isBatchExporting) return;
    const batch = Array.from(selectedDomains).slice(0, 25);
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsBatchExporting(true);
    setBatchProgress({ current: 1, total: batch.length, domain: batch[0] });

    try {
      await downloadPortfolioBatchZip(
        batch,
        (dom: string) => {
          const parsed = parseDomainOrBrand(dom);
          const spec = constructionsForDomain(dom, 0, 1)[0];
          return {
            id: 1,
            domain: parsed.domain,
            word1: parsed.word1,
            word2: parsed.word2,
            ext: parsed.ext,
            keepExt: parsed.keepExt,
            extStyle: 'pill',
            typoContrast: 'bold-bold',
            activeIcon: parsed.iconGroups?.core[0] || parsed.icons10[0] || 'Sparkles',
            secondaryIcon: parsed.icons10[1] || 'Sparkles',
            emblemFusion: 'single',
            containerStyle: familyToLegacyContainerStyle(spec.family),
            construction: spec,
            primary: parsed.palette.primary,
            secondary: parsed.palette.secondary,
            accent: parsed.palette.accent,
            fontFamily: 'Outfit',
            mainLayout: 'horizontal',
            tracking: -1.5,
            tracking1Em: -0.02,
            tracking2Em: -0.01,
            wordmarkAccent: 'none',
            gap: 26,
            tagline: '',
            showTagline: false,
          };
        },
        (current: number, total: number, domain: string) => {
          setBatchProgress({ current, total, domain });
        },
        () => controller.signal.aborted
      );
    } catch (err) {
      console.error('Portfolio batch export failed:', err);
    } finally {
      setIsBatchExporting(false);
      setBatchProgress(null);
      abortControllerRef.current = null;
    }
  };

  const handleCancelBatch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0b0f1a] border border-[#1b2333] rounded-2xl max-w-5xl w-full p-5 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-[#1b2333] gap-3">
          <div>
            <h3 className="font-extrabold text-base lg:text-lg text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-400" />
              <span>Domain Portfolio Vault (223 Curated Domains)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Click any card to load into the studio, or check up to 25 domains to batch-export vector &amp; PNG brand kits.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isBatchExporting}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sticky Batch Action Bar */}
        <div className="mt-3 p-2.5 rounded-xl bg-[#06080f] border border-[#1b2333] flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSelectVisible}
              disabled={isBatchExporting}
              className="px-2.5 py-1 rounded-lg bg-[#111726] hover:bg-[#182137] border border-[#232d44] text-[11px] font-bold text-indigo-300 flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Select visible (max 25)</span>
            </button>
            <button
              type="button"
              onClick={handleClearSelection}
              disabled={isBatchExporting || selectedDomains.size === 0}
              className="px-2.5 py-1 rounded-lg bg-[#111726] hover:bg-[#182137] border border-[#232d44] text-[11px] font-semibold text-slate-300 cursor-pointer disabled:opacity-40"
            >
              Clear
            </button>
            <span className="text-xs font-mono font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/25">
              {selectedDomains.size} / 25 selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isBatchExporting && batchProgress ? (
              <div className="flex items-center gap-2.5">
                <div className="flex flex-col items-end">
                  <span className="text-[11px] font-mono font-bold text-emerald-300">
                    Exporting {batchProgress.current} / {batchProgress.total}:{' '}
                    {batchProgress.domain}...
                  </span>
                  <div className="w-44 h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
                    <div
                      className="h-full bg-emerald-400 transition-all"
                      style={{
                        width: `${Math.round(
                          (batchProgress.current / Math.max(1, batchProgress.total)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCancelBatch}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-[11px] font-bold text-rose-300 flex items-center gap-1 cursor-pointer"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleBatchExport}
                disabled={selectedDomains.size === 0}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition cursor-pointer disabled:opacity-40"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>Batch Export Selected (.zip)</span>
              </button>
            )}
          </div>
        </div>

        {/* Search & TLD Pills */}
        <div className="space-y-2.5 my-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search domains by name or keyword..."
              className="w-full bg-[#06080f] border border-[#232c42] focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            {['ALL', '.com', '.net', '.onl', '.org', '.ad', '.cool', 'OTHER'].map((tld) => (
              <button
                key={tld}
                type="button"
                onClick={() => setTldFilter(tld)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                  tldFilter === tld
                    ? 'bg-indigo-600 text-white'
                    : 'bg-[#111726] hover:bg-[#182137] text-slate-300 border border-[#232d44]'
                }`}
              >
                {tld === 'ALL' ? 'All (223)' : tld === 'OTHER' ? 'Special TLDs' : tld}
              </button>
            ))}
          </div>
        </div>

        {/* Domains Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 overflow-y-auto p-1 flex-1 min-h-[300px] content-start">
          {filteredDomains.map((dom) => {
            const info = parseDomainOrBrand(dom);
            const isCurrent = dom.toLowerCase() === currentDomain.toLowerCase();
            const isChecked = selectedDomains.has(dom);
            const IconComp = resolveLucideIcon(info.icons10[0]);

            return (
              <div
                key={dom}
                onClick={() => {
                  if (isBatchExporting) return;
                  onSelectDomain(dom);
                  onClose();
                }}
                className={`p-2.5 rounded-xl text-left transition cursor-pointer flex items-center gap-2.5 border group ${
                  isCurrent
                    ? 'bg-indigo-950/70 border-indigo-500 shadow-md ring-1 ring-indigo-400'
                    : isChecked
                    ? 'bg-emerald-950/40 border-emerald-500/60'
                    : 'bg-[#06080f] hover:bg-[#111728] border-[#1b2333] hover:border-indigo-500/50'
                }`}
              >
                {/* Batch Selection Checkbox */}
                <button
                  type="button"
                  onClick={(e) => handleToggleDomainSelection(dom, e)}
                  title={isChecked ? 'Deselect from batch export' : 'Select for batch export (max 25)'}
                  className="p-0.5 text-slate-400 hover:text-emerald-400 transition shrink-0 cursor-pointer"
                >
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Square className="w-4 h-4 opacity-60 group-hover:opacity-100" />
                  )}
                </button>

                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow text-white"
                  style={{ backgroundColor: info.palette.primary }}
                >
                  <IconComp size={16} strokeWidth={2.2} />
                </div>
                <div className="overflow-hidden flex-1">
                  <div className="font-bold text-xs text-white group-hover:text-indigo-300 truncate">
                    {dom}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{info.nicheLabel}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-[#1b2333] text-xs text-slate-400 flex justify-between items-center">
          <span>{filteredDomains.length} domains matching</span>
          <span className="text-[11px] text-slate-500">
            Click card to load in Studio · Check box for Batch Export (.zip)
          </span>
        </div>
      </div>
    </div>
  );
};
