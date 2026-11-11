import React from 'react';
import { AllSheetsData, SignalWaitRow } from '../types/dashboard';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { MetricBadge } from '../components/common/MetricBadge';
import { EmptyDataState } from '../components/common/EmptyDataState';
import { Activity, Clock } from 'lucide-react';

interface TrafficSignalsViewProps {
  allSheets: AllSheetsData | null;
}

export const TrafficSignalsView: React.FC<TrafficSignalsViewProps> = ({ allSheets }) => {
  const rows: SignalWaitRow[] = allSheets?.['12_Signal_Waiting_Times']?.rows || [];

  // Sort by avg signal wait
  const sortedSignals = React.useMemo(() => {
    return [...rows].sort((a, b) => (b['Avg Signal Wait (min)'] || 0) - (a['Avg Signal Wait (min)'] || 0));
  }, [rows]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-600" />
            <span>Traffic Signal Intersection Waiting Times</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Average signal cycle delays and maximum observed intersection bottleneck waits across major cities (Sheet 12)
          </p>
        </div>
        <MetricBadge type="Source data" />
      </div>

      {/* Grid of Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Signal Wait Comparison Chart */}
        <div className="card-academic p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Average vs. Longest Intersection Wait (min)
              </h3>
              <p className="text-xs text-slate-500">City comparison of standard signal cycles vs bottleneck intersections</p>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Unit: minutes</span>
          </div>

          <div className="py-2">
            {sortedSignals.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sortedSignals} margin={{ top: 15, right: 20, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="City" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} unit=" m" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '12px', borderRadius: '6px' }}
                      formatter={(v: any, name: string) => [
                        `${v} minutes`,
                        name === 'Avg Signal Wait (min)' ? 'Average Cycle Wait' : 'Longest Bottleneck Wait'
                      ]}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="Avg Signal Wait (min)" name="Avg Signal Wait (min)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Longest Intersection Wait (min)" name="Longest Intersection Wait (min)" fill="#e11d48" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyDataState />
            )}
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Bengaluru observes longest intersection wait (9 min), followed by Kolkata (8 min) and Mumbai (7 min)
          </div>
        </div>

        {/* Detailed Table */}
        <div className="card-academic p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">City Signal Waiting Benchmarks</h3>
              <p className="text-xs text-slate-500">Official Municipal & Traffic Police telemetry records</p>
            </div>
            <MetricBadge type="Source data" />
          </div>

          <div className="overflow-x-auto py-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <th className="py-2 px-3 font-semibold">City</th>
                  <th className="py-2 px-3 font-semibold">Avg Wait (min)</th>
                  <th className="py-2 px-3 font-semibold">Longest Wait (min)</th>
                  <th className="py-2 px-3 font-semibold">Reporting Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {sortedSignals.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-bold font-sans text-slate-900">{r.City}</td>
                    <td className="py-2 px-3 text-brand-700 font-semibold">{r['Avg Signal Wait (min)']} min</td>
                    <td className="py-2 px-3 text-rose-600 font-semibold">{r['Longest Intersection Wait (min)']} min</td>
                    <td className="py-2 px-3 font-sans text-slate-500">{r.Source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Signal wait times represent peak hour multi-phase intersection delays
          </div>
        </div>
      </div>
    </div>
  );
};
