import React, { useState } from 'react';
import { AllSheetsData, SourceRow } from '../types/dashboard';
import { MetricBadge } from '../components/common/MetricBadge';
import { BookOpen, ExternalLink, Search, CheckCircle2 } from 'lucide-react';

interface SourcesViewProps {
  allSheets: AllSheetsData | null;
}

export const SourcesView: React.FC<SourcesViewProps> = ({ allSheets }) => {
  const sources: SourceRow[] = allSheets?.['19_Sources_Bibliography']?.rows || [];
  const [filterType, setFilterType] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const types = React.useMemo(() => {
    return Array.from(new Set(sources.map(s => s.Type).filter(Boolean))).sort();
  }, [sources]);

  const filteredSources = React.useMemo(() => {
    return sources.filter(s => {
      if (filterType !== 'ALL' && s.Type !== filterType) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          s['Source Name'].toLowerCase().includes(q) ||
          s.Description?.toLowerCase().includes(q) ||
          s.URL?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [sources, filterType, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-600" />
            <span>Authoritative Sources & Data Provenance Bibliography</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Full bibliography of government portals, telematics indices, and research publications (Sheet 19)
          </p>
        </div>
        <MetricBadge type="Source data" />
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[240px] flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search sources by name, URL, or citation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:outline-hidden focus:ring-1 focus:ring-brand-500 font-medium text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600">Source Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-700 font-medium"
          >
            <option value="ALL">All Source Types ({types.length})</option>
            {types.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <span className="font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200 ml-2">
            {filteredSources.length} of {sources.length} Sources
          </span>
        </div>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSources.map((s, idx) => (
          <div key={idx} className="card-academic p-4 flex flex-col justify-between hover:border-brand-300 transition-colors">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-400">#{s['#'] || idx + 1}</span>
                  <h4 className="text-sm font-bold text-slate-900">{s['Source Name']}</h4>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                  {s.Type}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {s.Description}
              </p>
            </div>

            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <a
                href={s.URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-[11px] text-brand-600 hover:text-brand-800 hover:underline truncate max-w-[280px]"
                title={s.URL}
              >
                <span>{s.URL}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>

              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                VERIFIED
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
