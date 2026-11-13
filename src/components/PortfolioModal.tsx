import React from 'react';
import { Search, X, Globe } from 'lucide-react';
import { TLDWATCH_223_DOMAINS, parseDomainOrBrand } from '../data/domains';
import { resolveLucideIcon } from '../utils/svgBuilder';

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

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0b0f1a] border border-[#1b2333] rounded-2xl max-w-5xl w-full p-5 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-[#1b2333]">
          <div>
            <h3 className="font-extrabold text-base lg:text-lg text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-400" />
              <span>Complete Portfolio (223 Domains from tldwatch.csv)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Pick any domain to generate 10 tailored agency concepts with industry-specific vector symbols.
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 overflow-y-auto p-1 flex-1 min-h-[320px]">
          {filteredDomains.map((dom) => {
            const info = parseDomainOrBrand(dom);
            const isSelected = dom.toLowerCase() === currentDomain.toLowerCase();
            const IconComp = resolveLucideIcon(info.icons10[0]);

            return (
              <button
                key={dom}
                type="button"
                onClick={() => {
                  onSelectDomain(dom);
                  onClose();
                }}
                className={`p-2.5 rounded-xl text-left transition cursor-pointer flex items-center gap-2.5 border group ${
                  isSelected
                    ? 'bg-indigo-950/70 border-indigo-500 shadow-md ring-1 ring-indigo-400'
                    : 'bg-[#06080f] hover:bg-[#111728] border-[#1b2333] hover:border-indigo-500/50'
                }`}
              >
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
              </button>
            );
          })}
        </div>

        <div className="pt-3 border-t border-[#1b2333] text-xs text-slate-400 flex justify-between items-center">
          <span>{filteredDomains.length} domains matching</span>
          <span className="text-[11px] text-slate-500">Instant vector generation on click</span>
        </div>
      </div>
    </div>
  );
};
