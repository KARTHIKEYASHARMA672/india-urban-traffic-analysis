import React from 'react';
import { AllSheetsData, RoadConditionRow } from '../types/dashboard';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { MetricBadge } from '../components/common/MetricBadge';
import { EmptyDataState } from '../components/common/EmptyDataState';
import { AlertTriangle, Hammer, ShieldCheck } from 'lucide-react';

interface RoadConditionViewProps {
  allSheets: AllSheetsData | null;
}

export const RoadConditionView: React.FC<RoadConditionViewProps> = ({ allSheets }) => {
  const rows: RoadConditionRow[] = allSheets?.['15_Road_Condition']?.rows || [];

  // Sort by road quality score
  const sortedQuality = React.useMemo(() => {
    return [...rows].sort((a, b) => (b['Road Quality Score (out of 10)'] || 0) - (a['Road Quality Score (out of 10)'] || 0));
  }, [rows]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-brand-600" />
            <span>State-Wise Road Quality & Infrastructure Health</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Road condition indices, annual pothole complaints, and active highway construction corridors (Sheet 15)
          </p>
        </div>
        <MetricBadge type="Source data" />
      </div>

      {/* Road Quality Scoring Legend */}
      <div className="card-academic p-3.5 bg-slate-50 border border-slate-200">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          <span>Road Quality Index Calibration Scale (0.0 to 10.0)</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">
            <div className="font-bold">8.0 – 10.0: Superior Grade</div>
            <div className="text-[11px] text-emerald-700">Access-controlled expressways, paved multi-lane corridors with continuous maintenance.</div>
          </div>
          <div className="p-2 rounded bg-blue-50 border border-blue-200 text-blue-800">
            <div className="font-bold">7.0 – 7.9: Standard Urban Arterial</div>
            <div className="text-[11px] text-blue-700">Bituminous primary highways, minor surface roughness, moderate intersection quality.</div>
          </div>
          <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-800">
            <div className="font-bold">6.0 – 6.9: Moderate Quality</div>
            <div className="text-[11px] text-amber-700">Frequent potholes, monsoon deterioration, active corridor construction detours.</div>
          </div>
          <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-800">
            <div className="font-bold">&lt; 6.0: Distressed Surface</div>
            <div className="text-[11px] text-rose-700">Severe localized distress, recurring structural pavement failures.</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Road Quality Score by State */}
        <div className="card-academic p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Road Quality Score by State</h3>
              <p className="text-xs text-slate-500">Official composite rating out of 10 (MoRTH / NHAI 2024)</p>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Score / 10</span>
          </div>

          <div className="py-2">
            {sortedQuality.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sortedQuality} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="State / UT" type="category" tick={{ fontSize: 11 }} width={90} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '12px', borderRadius: '6px' }}
                      formatter={(v: any) => [`${v} / 10`, 'Road Quality Score']}
                    />
                    <Bar dataKey="Road Quality Score (out of 10)" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyDataState />
            )}
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Top scores: Gujarat (7.8), Delhi (7.5), Karnataka (7.2), Tamil Nadu (7.0)
          </div>
        </div>

        {/* Pothole Incidents Reported */}
        <div className="card-academic p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Annual Pothole Incidents Reported</h3>
              <p className="text-xs text-slate-500">Annual verified complaints across municipal networks</p>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Source: MoRTH 2024</span>
          </div>

          <div className="py-2">
            {rows.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rows} margin={{ top: 15, right: 20, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="State / UT" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" interval={0} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '12px', borderRadius: '6px' }}
                      formatter={(v: any) => [`${Number(v).toLocaleString()} incidents`, 'Reported Potholes']}
                    />
                    <Bar dataKey="Pothole Incidents Reported (annual)" fill="#e11d48" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyDataState />
            )}
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Maharashtra (~12,000) and Uttar Pradesh (~9,000) report largest municipal complaint volumes
          </div>
        </div>
      </div>

      {/* Active Construction Corridors Table */}
      <div className="card-academic p-4">
        <div className="flex items-center gap-2 mb-3">
          <Hammer className="w-4 h-4 text-brand-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Active Highway & Expressway Construction Projects
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <th className="py-2.5 px-3 font-semibold">State / UT</th>
                <th className="py-2.5 px-3 font-semibold">Total Road Length (km)</th>
                <th className="py-2.5 px-3 font-semibold">Quality Score</th>
                <th className="py-2.5 px-3 font-semibold">Active Major Construction Projects</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {rows.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{r['State / UT']}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">{Number(r['Total Road Length (km)']).toLocaleString()} km</td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-emerald-700">{r['Road Quality Score (out of 10)']} / 10</td>
                  <td className="py-2.5 px-3 text-slate-700 font-sans">{r['Active Road Construction Projects']}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
