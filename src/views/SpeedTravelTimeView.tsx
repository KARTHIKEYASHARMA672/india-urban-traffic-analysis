import React from 'react';
import { CombinedMainRow, AllSheetsData } from '../types/dashboard';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ZAxis } from 'recharts';
import { MetricBadge } from '../components/common/MetricBadge';
import { EmptyDataState } from '../components/common/EmptyDataState';
import { Gauge, Info } from 'lucide-react';

interface SpeedTravelTimeViewProps {
  filteredRows: CombinedMainRow[];
  allSheets: AllSheetsData | null;
}

export const SpeedTravelTimeView: React.FC<SpeedTravelTimeViewProps> = ({
  filteredRows,
  allSheets
}) => {
  // Speed and Travel Time progression
  const yearlySpeedTravel = React.useMemo(() => {
    const map = new Map<number, { year: number; speedSum: number; travelSum: number; count: number }>();
    filteredRows.forEach(r => {
      if (!map.has(r.Year)) map.set(r.Year, { year: r.Year, speedSum: 0, travelSum: 0, count: 0 });
      const entry = map.get(r.Year)!;
      if (typeof r['Avg Vehicle Speed (km/h)'] === 'number') entry.speedSum += r['Avg Vehicle Speed (km/h)'];
      if (typeof r['Travel Time (min per 10 km)'] === 'number') entry.travelSum += r['Travel Time (min per 10 km)'];
      entry.count++;
    });

    return Array.from(map.values())
      .map(e => ({
        year: e.year,
        avgSpeed: Number((e.speedSum / e.count).toFixed(1)),
        avgTravelTime: Number((e.travelSum / e.count).toFixed(1))
      }))
      .sort((a, b) => a.year - b.year);
  }, [filteredRows]);

  // City Travel Time per 10 km
  const cityTravelTime = React.useMemo(() => {
    const map = new Map<string, { city: string; travelSum: number; speedSum: number; count: number }>();
    filteredRows.forEach(r => {
      if (!map.has(r.City)) map.set(r.City, { city: r.City, travelSum: 0, speedSum: 0, count: 0 });
      const entry = map.get(r.City)!;
      if (typeof r['Travel Time (min per 10 km)'] === 'number') entry.travelSum += r['Travel Time (min per 10 km)'];
      if (typeof r['Avg Vehicle Speed (km/h)'] === 'number') entry.speedSum += r['Avg Vehicle Speed (km/h)'];
      entry.count++;
    });

    return Array.from(map.values())
      .map(e => ({
        city: e.city,
        travelTime: Number((e.travelSum / e.count).toFixed(1)),
        speed: Number((e.speedSum / e.count).toFixed(1))
      }))
      .sort((a, b) => b.travelTime - a.travelTime);
  }, [filteredRows]);

  // Scatter data: Speed vs Travel Time
  const speedVsTravel = React.useMemo(() => {
    return filteredRows
      .filter(r => 
        typeof r['Avg Vehicle Speed (km/h)'] === 'number' &&
        typeof r['Travel Time (min per 10 km)'] === 'number'
      )
      .map(r => ({
        city: r.City,
        year: r.Year,
        speed: r['Avg Vehicle Speed (km/h)'],
        travelTime: r['Travel Time (min per 10 km)'],
        edi: r['EDI Score']
      }));
  }, [filteredRows]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-brand-600" />
            <span>Vehicle Speed & Travel Time Metrics</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Average driving speeds and commute time required per 10 km urban corridor across Indian metropolises
          </p>
        </div>
        <MetricBadge type="Source data" />
      </div>

      {/* Non-Causality Methodological Note */}
      <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 flex items-start gap-2.5 text-xs text-sky-900">
        <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <div>
          <strong>Statistical Association Notice:</strong> Observed inverse relationships between travel time and vehicle speed reflect empirical physical correlation. As vehicle density increases, average speed diminishes, expanding trip duration. These observations indicate statistical association and should not be interpreted as isolated monocausal determinations.
        </div>
      </div>

      {/* Grid of Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Speed Trend */}
        <div className="card-academic p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Average Vehicle Speed Trend</h3>
              <p className="text-xs text-slate-500">Longitudinal peak driving speed (km/h)</p>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Unit: km/h</span>
          </div>

          <div className="py-2">
            {yearlySpeedTravel.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yearlySpeedTravel} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '12px', borderRadius: '6px' }}
                      formatter={(v: any) => [`${v} km/h`, 'Avg Speed']}
                    />
                    <Line type="monotone" dataKey="avgSpeed" stroke="#10b981" strokeWidth={2.5} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyDataState />
            )}
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Derived from continuous floating vehicle GPS telematics
          </div>
        </div>

        {/* Travel Time per 10 km */}
        <div className="card-academic p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Travel Time per 10 km by City</h3>
              <p className="text-xs text-slate-500">Time required to traverse 10 km during peak hours</p>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Unit: minutes</span>
          </div>

          <div className="py-2">
            {cityTravelTime.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cityTravelTime} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="city" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '12px', borderRadius: '6px' }}
                      formatter={(v: any) => [`${v} min`, 'Travel Time (10 km)']}
                    />
                    <Bar dataKey="travelTime" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyDataState />
            )}
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Peak corridor times: Bengaluru (41.4 min), Kolkata (35.3 min), Mumbai (34.3 min)
          </div>
        </div>

        {/* Speed vs Travel Time Correlation Plot */}
        <div className="card-academic p-4 flex flex-col justify-between lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Speed vs. Travel Time Empirical Distribution</h3>
              <p className="text-xs text-slate-500">Scatter distribution demonstrating inverse physical correlation</p>
            </div>
            <MetricBadge type="Source data" />
          </div>

          <div className="py-2">
            {speedVsTravel.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 15, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" dataKey="speed" name="Speed" unit=" km/h" tick={{ fontSize: 11 }} domain={['dataMin - 2', 'dataMax + 2']} />
                    <YAxis type="number" dataKey="travelTime" name="Travel Time" unit=" min" tick={{ fontSize: 11 }} domain={['dataMin - 2', 'dataMax + 2']} />
                    <ZAxis range={[60, 60]} />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '12px', borderRadius: '6px' }}
                      formatter={(val: any, name: string) => [
                        name === 'Speed' ? `${val} km/h` : `${val} min`,
                        name === 'Speed' ? 'Average Speed' : 'Travel Time (10 km)'
                      ]}
                    />
                    <Scatter name="Corridors" data={speedVsTravel} fill="#0284c7" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyDataState />
            )}
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Corridor records verify that sub-15 km/h speeds expand 10 km travel times beyond 38 minutes
          </div>
        </div>
      </div>
    </div>
  );
};
