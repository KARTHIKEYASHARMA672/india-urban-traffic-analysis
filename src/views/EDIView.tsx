import React from 'react';
import { AllSheetsData, EDIPRow, CombinedMainRow } from '../types/dashboard';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { MetricBadge } from '../components/common/MetricBadge';
import { EmptyDataState } from '../components/common/EmptyDataState';
import { Calculator, HelpCircle, Info } from 'lucide-react';

interface EDIViewProps {
  allSheets: AllSheetsData | null;
  filteredRows: CombinedMainRow[];
}

export const EDIView: React.FC<EDIViewProps> = ({ allSheets, filteredRows }) => {
  const ediRows: EDIPRow[] = allSheets?.['16_EDI_Parameters']?.rows || [];

  // Sort by EDI score descending
  const sortedEDI = React.useMemo(() => {
    return [...ediRows].sort((a, b) => (b['EDI Score (computed)'] || 0) - (a['EDI Score (computed)'] || 0));
  }, [ediRows]);

  // EDI from combined data by city
  const combinedCityEDI = React.useMemo(() => {
    const map = new Map<string, { city: string; sum: number; count: number }>();
    filteredRows.forEach(r => {
      if (typeof r['EDI Score'] === 'number') {
        if (!map.has(r.City)) map.set(r.City, { city: r.City, sum: 0, count: 0 });
        const entry = map.get(r.City)!;
        entry.sum += r['EDI Score'];
        entry.count++;
      }
    });

    return Array.from(map.values())
      .map(e => ({
        city: e.city,
        avgEDI: Number((e.sum / e.count).toFixed(1))
      }))
      .sort((a, b) => b.avgEDI - a.avgEDI);
  }, [filteredRows]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-purple-600" />
            <span>Effective Delay Index (EDI) Composite Burden</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Synthesized analytical metric combining peak congestion intensity and cumulative lost commute hours (Sheet 16)
          </p>
        </div>
        <MetricBadge type="Derived" formula="EDI = (Congestion % × Annual Hours Lost) / 100" />
      </div>

      {/* Formula Explanation Card */}
      <div className="card-academic p-4 bg-purple-50/50 border border-purple-200">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded bg-purple-100 text-purple-700">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wider">
              Mathematical Derivation & Definition
            </h4>
            <div className="font-mono text-sm font-bold text-purple-900 my-1 bg-white px-3 py-1.5 rounded border border-purple-200 inline-block shadow-xs">
              EDI = (Congestion Level % × Annual Hours Lost) / 100
            </div>
            <p className="text-xs text-purple-800 leading-relaxed mt-1">
              <strong>Tooltip Notice:</strong> Effective Delay Index is a derived analytical metric calculated from congestion percentage and annual hours lost. Higher scores signify compound cumulative travel friction experienced by average daily urban commuters.
            </p>
          </div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* EDI by City (Sheet 16 Official Computations) */}
        <div className="card-academic p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">EDI Score by City (2024–2025 Benchmarks)</h3>
              <p className="text-xs text-slate-500">Official composite delay burden computed from TomTom metrics</p>
            </div>
            <MetricBadge type="Derived" formula="(Congestion% × Hours) / 100" />
          </div>

          <div className="py-2">
            {sortedEDI.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sortedEDI} margin={{ top: 15, right: 20, left: -10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="City" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={[0, 140]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '12px', borderRadius: '6px' }}
                      formatter={(v: any) => [`${v} EDI`, 'Computed EDI']}
                    />
                    <Bar dataKey="EDI Score (computed)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyDataState />
            )}
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Bengaluru 2025: 125.0 (74.4% × 168h), Pune 2025: 108.1 (71.1% × 152h), Kolkata: 88.4 (58.9% × 150h)
          </div>
        </div>

        {/* EDI in Active Filtered Master Dataset */}
        <div className="card-academic p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">EDI Under Active Global Filters</h3>
              <p className="text-xs text-slate-500">Average EDI values within current filtered city-year subset</p>
            </div>
            <MetricBadge type="Derived" />
          </div>

          <div className="py-2">
            {combinedCityEDI.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={combinedCityEDI} margin={{ top: 15, right: 20, left: -10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="city" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '12px', borderRadius: '6px' }}
                      formatter={(v: any) => [`${v} EDI`, 'Filter Subset EDI']}
                    />
                    <Bar dataKey="avgEDI" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyDataState />
            )}
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Reflects live recalculation when filter selections or Google Sheets live rows change
          </div>
        </div>
      </div>

      {/* Verified EDI Data Table */}
      <div className="card-academic p-4">
        <h3 className="text-sm font-bold text-slate-900 mb-3">
          Verified EDI Input Parameters & Mathematical Proof
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <th className="py-2.5 px-3 font-semibold">City</th>
                <th className="py-2.5 px-3 font-semibold">Year</th>
                <th className="py-2.5 px-3 font-semibold">Congestion Level (%)</th>
                <th className="py-2.5 px-3 font-semibold">Annual Hours Lost</th>
                <th className="py-2.5 px-3 font-semibold">EDI Score (computed)</th>
                <th className="py-2.5 px-3 font-semibold">Derivation Formula / Citation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {sortedEDI.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold font-sans text-slate-900">{r.City}</td>
                  <td className="py-2.5 px-3 text-slate-600">{r.Year}</td>
                  <td className="py-2.5 px-3 text-rose-600 font-semibold">{r['Congestion Level (%)']}%</td>
                  <td className="py-2.5 px-3 text-amber-700 font-semibold">{r['Annual Hours Lost']} hrs</td>
                  <td className="py-2.5 px-3 text-purple-700 font-bold text-xs">{r['EDI Score (computed)']}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-500">{r['Source / Formula']}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
