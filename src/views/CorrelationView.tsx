import React from 'react';
import { CombinedMainRow } from '../types/dashboard';
import { computeCorrelationMatrix, CorrelationCell } from '../utils/analytics';
import { MetricBadge } from '../components/common/MetricBadge';
import { Network, Info } from 'lucide-react';

interface CorrelationViewProps {
  filteredRows: CombinedMainRow[];
}

export const CorrelationView: React.FC<CorrelationViewProps> = ({ filteredRows }) => {
  const fields: Array<{ key: keyof CombinedMainRow; label: string }> = [
    { key: 'Traffic Volume (est. peak hr vehicles)', label: 'Volume' },
    { key: 'Traffic Density (veh/km peak hr)', label: 'Density' },
    { key: 'Avg Vehicle Speed (km/h)', label: 'Avg Speed' },
    { key: 'Travel Time (min per 10 km)', label: 'Travel Time' },
    { key: 'Traffic Signal Wait (min)', label: 'Signal Wait' },
    { key: 'Road Condition (score/10)', label: 'Road Score' },
    { key: 'Rainfall (mm, annual)', label: 'Rainfall' },
    { key: 'EDI Score', label: 'EDI Score' }
  ];

  const { labels, matrix, details } = React.useMemo(() => {
    return computeCorrelationMatrix(filteredRows, fields);
  }, [filteredRows]);

  // Color helper for Pearson r (-1 to +1)
  const getCellColor = (r: number | null) => {
    if (r === null) return 'bg-slate-100 text-slate-400';
    if (r === 1) return 'bg-slate-200 text-slate-800 font-bold';
    if (r > 0.6) return 'bg-rose-500 text-white font-semibold';
    if (r > 0.3) return 'bg-rose-300 text-rose-950';
    if (r > 0.05) return 'bg-rose-100 text-rose-900';
    if (r < -0.6) return 'bg-blue-600 text-white font-semibold';
    if (r < -0.3) return 'bg-blue-300 text-blue-950';
    if (r < -0.05) return 'bg-blue-100 text-blue-900';
    return 'bg-slate-50 text-slate-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Network className="w-5 h-5 text-brand-600" />
            <span>Multi-Variate Correlation Matrix</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pairwise Pearson correlation coefficients calculated across 8 key urban mobility and physical variables
          </p>
        </div>
        <MetricBadge type="Calculated" formula="Pearson r = Cov(X,Y) / (σX · σY)" />
      </div>

      {/* Mandatory Non-Causality Warning Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong>Strict Statistical Notice:</strong> Correlation indicates statistical association and does not by itself establish causation. High positive or negative coefficients represent simultaneous empirical co-variation under observed metropolitan conditions and should not be cited as direct isolated causal mechanisms without controlled econometric analysis.
        </div>
      </div>

      {/* Heatmap Matrix Card */}
      <div className="card-academic p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <h3 className="text-sm font-bold text-slate-900">
            Empirical Correlation Heatmap Matrix ({filteredRows.length} Active Records)
          </h3>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-xs" /> Positive r
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-blue-600 rounded-xs" /> Negative r
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-slate-100 border border-slate-200 rounded-xs" /> Insufficient n
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <th className="py-2.5 px-3 text-left font-semibold">Variable</th>
                {labels.map((l, i) => (
                  <th key={i} className="py-2.5 px-2 font-semibold text-[11px] whitespace-nowrap">
                    {l}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {labels.map((rowLabel, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 text-left font-sans font-bold text-slate-900 whitespace-nowrap bg-slate-50/30">
                    {rowLabel}
                  </td>
                  {labels.map((colLabel, j) => {
                    const r = matrix[i][j];
                    return (
                      <td
                        key={j}
                        className={`py-2.5 px-2 text-center transition-colors ${getCellColor(r)}`}
                        title={`${rowLabel} vs ${colLabel}: r = ${r !== null ? r : 'N/A'}`}
                      >
                        {r !== null ? (r > 0 && r < 1 ? `+${r.toFixed(2)}` : r.toFixed(2)) : '—'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <span>Variables: Volume, Density, Speed, Travel Time, Signal Wait, Road Condition, Rainfall, EDI</span>
          <span className="font-mono">Formula: r = Σ(x - x̄)(y - ȳ) / √[Σ(x - x̄)² Σ(y - ȳ)²]</span>
        </div>
      </div>
    </div>
  );
};
