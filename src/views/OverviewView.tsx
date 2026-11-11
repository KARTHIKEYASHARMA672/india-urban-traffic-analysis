import React from 'react';
import { CombinedMainRow, AllSheetsData } from '../types/dashboard';
import { OverviewKPISection } from '../components/kpis/OverviewKPISection';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { MetricBadge } from '../components/common/MetricBadge';
import { EmptyDataState } from '../components/common/EmptyDataState';
import { Activity, Clock, ShieldAlert, GitCommit, ExternalLink } from 'lucide-react';

interface OverviewViewProps {
  filteredRows: CombinedMainRow[];
  allSheets: AllSheetsData | null;
  changeLog?: any[] | null;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  filteredRows,
  allSheets,
  changeLog
}) => {
  // Prep speed vs travel time comparison by city
  const citySummary = React.useMemo(() => {
    const map = new Map<string, { city: string; speedSum: number; travelTimeSum: number; ediSum: number; count: number }>();
    filteredRows.forEach(r => {
      if (!map.has(r.City)) {
        map.set(r.City, { city: r.City, speedSum: 0, travelTimeSum: 0, ediSum: 0, count: 0 });
      }
      const entry = map.get(r.City)!;
      if (typeof r['Avg Vehicle Speed (km/h)'] === 'number') entry.speedSum += r['Avg Vehicle Speed (km/h)'];
      if (typeof r['Travel Time (min per 10 km)'] === 'number') entry.travelTimeSum += r['Travel Time (min per 10 km)'];
      if (typeof r['EDI Score'] === 'number') entry.ediSum += r['EDI Score'];
      entry.count++;
    });

    return Array.from(map.values()).map(e => ({
      city: e.city,
      avgSpeed: Number((e.speedSum / e.count).toFixed(1)),
      avgTravelTime: Number((e.travelTimeSum / e.count).toFixed(1)),
      avgEDI: Number((e.ediSum / e.count).toFixed(1))
    })).sort((a, b) => b.avgTravelTime - a.avgTravelTime);
  }, [filteredRows]);

  // Year progression
  const yearSummary = React.useMemo(() => {
    const map = new Map<number, { year: number; speedSum: number; densitySum: number; count: number }>();
    filteredRows.forEach(r => {
      if (!map.has(r.Year)) {
        map.set(r.Year, { year: r.Year, speedSum: 0, densitySum: 0, count: 0 });
      }
      const entry = map.get(r.Year)!;
      if (typeof r['Avg Vehicle Speed (km/h)'] === 'number') entry.speedSum += r['Avg Vehicle Speed (km/h)'];
      if (typeof r['Traffic Density (veh/km peak hr)'] === 'number') entry.densitySum += r['Traffic Density (veh/km peak hr)'];
      entry.count++;
    });

    return Array.from(map.values())
      .map(e => ({
        year: e.year,
        avgSpeed: Number((e.speedSum / e.count).toFixed(1)),
        avgDensity: Number((e.densitySum / e.count).toFixed(0))
      }))
      .sort((a, b) => a.year - b.year);
  }, [filteredRows]);

  return (
    <div className="space-y-6">
      {/* KPI Section */}
      <OverviewKPISection filteredRows={filteredRows} allSheets={allSheets} />

      {/* Analytical Narrative & Scope Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white rounded-xl p-6 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-400/40 shadow-xs">
                Live Analytic Intelligence
              </span>
              <span className="text-xs text-slate-300 font-mono font-medium">19 Empirical Datasets</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              India Urban Mobility & Infrastructure Health Observatory
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl mt-1.5 leading-relaxed">
              Evaluating longitudinal trends from 2015 to 2025 across traffic volume, GPS probe speeds, signal wait times, IMD precipitation levels, and expressway expansion across India's largest urban economies.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <div className="text-right font-mono text-xs bg-slate-900/80 px-3.5 py-2 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px] font-medium tracking-wide">CURRENT DATASET</div>
              <div className="font-bold text-brand-300 text-sm">{filteredRows.length} Active City-Year Records</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* City Travel Time & Speed Comparison */}
        <div className="card-academic p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Average Travel Time & Speed by City
              </h3>
              <p className="text-xs text-slate-500">Travel time (min per 10 km) vs average vehicle speed (km/h)</p>
            </div>
            <MetricBadge type="Source data" />
          </div>

          <div className="py-2">
            {citySummary.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={citySummary} margin={{ top: 15, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="city" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" orientation="left" stroke="#0284c7" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '12px', borderRadius: '6px' }}
                      formatter={(val: any, name: string) => [
                        name === 'avgTravelTime' ? `${val} min/10km` : `${val} km/h`,
                        name === 'avgTravelTime' ? 'Travel Time (10 km)' : 'Avg Speed'
                      ]}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar yAxisId="left" dataKey="avgTravelTime" name="Travel Time (min/10 km)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="avgSpeed" name="Avg Speed (km/h)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyDataState />
            )}
          </div>

          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Unit: Minutes per 10 km corridor & km/h</span>
            <span className="font-mono">TomTom GPS Telematics</span>
          </div>
        </div>

        {/* Speed vs Density Trend Over Time */}
        <div className="card-academic p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Speed & Traffic Density Progression (2019–2025)
              </h3>
              <p className="text-xs text-slate-500">Longitudinal relationship between peak density and average speed</p>
            </div>
            <MetricBadge type="Source data" />
          </div>

          <div className="py-2">
            {yearSummary.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yearSummary} margin={{ top: 15, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" stroke="#f59e0b" tick={{ fontSize: 11 }} label={{ value: 'km/h', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#6366f1" tick={{ fontSize: 11 }} label={{ value: 'veh/km', angle: 90, position: 'insideRight', fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '12px', borderRadius: '6px' }}
                      formatter={(val: any, name: string) => [
                        name === 'avgSpeed' ? `${val} km/h` : `${val} veh/km`,
                        name === 'avgSpeed' ? 'Average Speed' : 'Average Density'
                      ]}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Line yAxisId="left" type="monotone" dataKey="avgSpeed" name="Avg Speed (km/h)" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line yAxisId="right" type="monotone" dataKey="avgDensity" name="Avg Density (veh/km)" stroke="#6366f1" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyDataState />
            )}
          </div>

          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Note: Descriptive association; not implying isolated direct causation</span>
            <span className="font-mono">MoRTH / TomTom Index</span>
          </div>
        </div>
      </div>

      {/* Live Sync Audit & Change Detection Table */}
      {changeLog && changeLog.length > 0 && (
        <div className="card-academic p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-brand-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Live Google Sheets Change Detection Log
              </h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Active Poller (~5000 ms)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="py-2 px-3 font-semibold">Timestamp</th>
                  <th className="py-2 px-3 font-semibold">Rows Added</th>
                  <th className="py-2 px-3 font-semibold">Rows Modified</th>
                  <th className="py-2 px-3 font-semibold">Rows Deleted</th>
                  <th className="py-2 px-3 font-semibold">Total Row Count</th>
                  <th className="py-2 px-3 font-semibold">Detected Changes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {changeLog.map((entry, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-slate-500">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2 px-3 text-emerald-600 font-bold">+{entry.added}</td>
                    <td className="py-2 px-3 text-amber-600 font-bold">~{entry.modified}</td>
                    <td className="py-2 px-3 text-rose-600 font-bold">-{entry.deleted}</td>
                    <td className="py-2 px-3 text-slate-800 font-semibold">{entry.totalRows}</td>
                    <td className="py-2 px-3 text-slate-600 font-sans">
                      {entry.changes && entry.changes.length > 0 ? (
                        entry.changes.map((c: any, ci: number) => (
                          <span key={ci} className="mr-2 inline-block px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">
                            {c.summary || `${c.type} (${c.city || ''})`}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400">Snapshot synchronized</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
