import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Search, X, Sparkles } from 'lucide-react';
import { resolveLucideIcon } from '../utils/svgBuilder';
import { DomainIconGroups } from '../data/domainIconGroups';
import { getExtendedSemanticIconsForDomain } from '../data/domainSemanticIcons';

interface SymbolVaultModalProps {
  isOpen: boolean;
  activeIcon: string;
  domain?: string;
  word1?: string;
  word2?: string;
  nicheLabel?: string;
  icons10?: string[];
  iconGroups?: DomainIconGroups;
  onSelectIcon: (iconName: string) => void;
  onClose: () => void;
}

const CATEGORY_FILTERS = [
  { id: 'domain', label: '★ Domain Semantic' },
  { id: 'all', label: 'All (1,638)' },
  { id: 'finance', label: 'Finance & Chart', keywords: ['chart', 'trending', 'dollar', 'coin', 'bank', 'wallet', 'briefcase', 'scale'] },
  { id: 'tech', label: 'Tech, AI & Dev', keywords: ['cpu', 'code', 'bot', 'terminal', 'server', 'chip', 'binary', 'circuit', 'database', 'laptop'] },
  { id: 'design', label: 'Design & Media', keywords: ['palette', 'brush', 'frame', 'image', 'camera', 'layers', 'shapes', 'sparkles', 'pen', 'type'] },
  { id: 'commerce', label: 'Commerce & Retail', keywords: ['shopping', 'cart', 'bag', 'tag', 'store', 'package', 'box', 'percent', 'badge'] },
  { id: 'comm', label: 'Communication', keywords: ['mail', 'message', 'send', 'inbox', 'phone', 'share', 'atsign', 'globe', 'radio'] },
  { id: 'culinary', label: 'Food & Culinary', keywords: ['chef', 'utensils', 'flame', 'coffee', 'pizza', 'cup', 'croissant', 'soup', 'wheat'] },
  { id: 'animals', label: 'Pets & Nature', keywords: ['paw', 'dog', 'cat', 'bone', 'leaf', 'tree', 'sun', 'moon', 'fish', 'flower'] },
  { id: 'auto', label: 'Vehicles & Travel', keywords: ['car', 'bus', 'plane', 'compass', 'navigation', 'map', 'fuel', 'gauge', 'rocket'] },
  { id: 'security', label: 'Security & Shields', keywords: ['shield', 'lock', 'key', 'check', 'eye', 'fingerprint', 'award', 'crown'] },
];

export const SymbolVaultModal: React.FC<SymbolVaultModalProps> = ({
  isOpen,
  activeIcon,
  domain = 'adstock.org',
  word1 = 'Ad',
  word2 = 'Stock',
  nicheLabel = '',
  icons10 = [],
  iconGroups,
  onSelectIcon,
  onClose,
}) => {
  const [search, setSearch] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState('domain');
  const [visibleLimit, setVisibleLimit] = React.useState(240);

  // Collect strictly the 1,638 canonical valid icon keys from LucideIcons.icons
  const allIconKeys = React.useMemo(() => {
    const canonicalMap = (LucideIcons as unknown as { icons?: Record<string, unknown> }).icons;
    if (canonicalMap && typeof canonicalMap === 'object') {
      return Object.keys(canonicalMap).sort();
    }
    const rawKeys = Object.keys(LucideIcons).filter(
      (key) =>
        key !== 'icons' &&
        key !== 'createLucideIcon' &&
        !key.startsWith('Lucide') &&
        !key.endsWith('Icon') &&
        typeof (LucideIcons as unknown as Record<string, unknown>)[key] === 'object'
    );
    return Array.from(new Set(rawKeys)).sort();
  }, []);

  // Compute domain-specific semantic pool (Tier 1 curated 10 + Tier 2 morpheme matches)
  const domainSemanticPool = React.useMemo(() => {
    return getExtendedSemanticIconsForDomain(domain, word1, word2, nicheLabel, icons10, iconGroups);
  }, [domain, word1, word2, nicheLabel, icons10, iconGroups]);

  const filteredIcons = React.useMemo(() => {
    const q = search.trim().toLowerCase();

    if (activeCategory === 'domain' && !q) {
      return domainSemanticPool.allSemantic;
    }

    const cat = CATEGORY_FILTERS.find((c) => c.id === activeCategory);

    return allIconKeys.filter((key) => {
      const lowKey = key.toLowerCase();
      if (q && !lowKey.includes(q)) return false;

      if (activeCategory === 'domain') {
        return domainSemanticPool.allSemantic.some((dKey) => dKey.toLowerCase() === lowKey);
      }

      if (cat && cat.keywords) {
        return cat.keywords.some((kw) => lowKey.includes(kw));
      }
      return true;
    });
  }, [allIconKeys, search, activeCategory, domainSemanticPool]);

  // Reset visible limit when changing category or search
  React.useEffect(() => {
    setVisibleLimit(240);
  }, [activeCategory, search]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const coreSet = new Set(domainSemanticPool.core);
  const tier1Set = new Set(domainSemanticPool.tier1);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0b0f1a] border border-[#1b2333] rounded-2xl max-w-5xl w-full p-5 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-[#1b2333]">
          <div>
            <h3 className="font-extrabold text-base lg:text-lg text-white">
              Vector Symbol Vault ({allIconKeys.length.toLocaleString()} Canonical Symbols)
            </h3>
            <p className="text-xs text-slate-400">
              {domainSemanticPool.allSemantic.length} semantic symbols matched for{' '}
              <strong className="text-indigo-300">{domain}</strong> ({domainSemanticPool.tier1.length} primary +{' '}
              {domainSemanticPool.tier2.length} extended morpheme matches).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Category Filters */}
        <div className="space-y-2.5 my-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search all 1,638 canonical vector symbols (e.g. chart, camera, rocket, coffee, bot, lock)..."
              className="w-full bg-[#06080f] border border-[#232c42] focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap text-xs overflow-x-auto pb-1">
            {CATEGORY_FILTERS.map((cat) => {
              const label =
                cat.id === 'domain'
                  ? `★ Domain Semantic (${domainSemanticPool.allSemantic.length})`
                  : cat.id === 'all'
                  ? `All (${allIconKeys.length.toLocaleString()})`
                  : cat.label;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer whitespace-nowrap ${
                    activeCategory === cat.id
                      ? cat.id === 'domain'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow'
                        : 'bg-indigo-600 text-white'
                      : 'bg-[#111726] hover:bg-[#182137] text-slate-300 border border-[#232d44]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Icon Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 overflow-y-auto p-1 flex-1 min-h-[300px]">
          {filteredIcons.slice(0, visibleLimit).map((iconKey) => {
            const IconComp = resolveLucideIcon(iconKey);
            const isSelected = iconKey.toLowerCase() === activeIcon.toLowerCase();
            const isCore = coreSet.has(iconKey);
            const isTier1 = tier1Set.has(iconKey);

            return (
              <button
                key={iconKey}
                type="button"
                onClick={() => {
                  onSelectIcon(iconKey);
                  onClose();
                }}
                title={iconKey}
                className={`relative p-2 rounded-xl flex flex-col items-center justify-center gap-1.5 border transition cursor-pointer group ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-md ring-2 ring-indigo-400/50'
                    : isCore
                    ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/40 text-amber-200 hover:text-white'
                    : isTier1
                    ? 'bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/30 text-indigo-200 hover:text-white'
                    : 'bg-[#06080f] hover:bg-[#131b2e] border-[#1b2333] hover:border-indigo-500/50 text-slate-300 hover:text-white'
                }`}
              >
                {isCore && (
                  <span className="absolute top-1 right-1 text-[7px] font-extrabold px-1 rounded bg-amber-500/30 text-amber-300">
                    CORE
                  </span>
                )}
                <IconComp size={20} strokeWidth={2.2} />
                <span className="text-[9px] font-mono truncate w-full text-center">
                  {iconKey}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer with Load More */}
        <div className="pt-3 border-t border-[#1b2333] flex flex-wrap justify-between items-center gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              Showing {Math.min(filteredIcons.length, visibleLimit)} of {filteredIcons.length} canonical symbols
            </span>
            {filteredIcons.length > visibleLimit && (
              <button
                type="button"
                onClick={() => setVisibleLimit((prev) => prev + 360)}
                className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Show more (+360)</span>
              </button>
            )}
          </div>
          <span className="text-[11px] text-slate-500">
            Click any symbol to apply to emblem
          </span>
        </div>
      </div>
    </div>
  );
};

