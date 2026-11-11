import React from 'react';
import { CombinedMainRow } from '../types/dashboard';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ZAxis } from 'recharts';
import { MetricBadge } from '../components/common/MetricBadge';
import { EmptyDataState } from '../components/common/EmptyDataState';
import { Layers } from 'lucide-react';

interface TrafficVolumeDensityViewProps {
  filteredRows: CombinedMainRow[];
}

export const TrafficVolumeDensityView: React.FC<TrafficVolumeDensityViewProps> = ({
  filteredRows
}) => {
  // Volume and Density over years
  const yearlyData = React.useMemo(() => {
    const map = new Map<number, { year: number; volSum: number; densSum: number; count: number }>();
    filteredRows.forEach(r => {
      if (!map.has(r.Year)) map.set(r.Year, { year: r.Year, volSum: 0, densSum: 0, count: 0 });
      const entry = map.get(r.Year)!;
      if (typeof r['Traffic Volume (est. peak hr vehicles)'] === 'number') entry.volSum += r['Traffic Volume (est. peak hr vehicles)'];
      if (typeof r['Traffic Density (veh/km peak hr)'] === 'number') entry.densSum += r['Traffic Density (veh/km peak hr)'];
      entry.count++;
    });

    return Array.from(map.values())
      .map(e => ({
        year: e.year,
        avgVolume: Number((e.volSum / e.count).toFixed(0)),
        avgDensity: Number((e.densSum / e.count).toFixed(0))
      }))
      .sort((a, b) => a.year - b.year);
  }, [filteredRows]);

  // City Volume and Density
  const cityData = React.useMemo(() => {
    const map = new Map<string, { city: string; volSum: number; densSum: number; count: number }>();
    filteredRows.forEach(r => {
      if (!map.has(r.City)) map.set(r.City, { city: r.City, volSum: 0, densSum: 0, count: 0 });
      const entry = map.get(r.City)!;
      if (typeof r['Traffic Volume (est. peak hr vehicles)'] === 'number') entry.volSum += r['Traffic Volume (est. peak hr vehicles)'];
      if (typeof r['Traffic Density (veh/km peak hr)'] === 'number') entry.densSum += r['Traffic Density (veh/km peak hr)'];
      entry.count++;
    });

    return Array.from(map.values())
      .map(e => ({
        city: e.city,
        avgVolume: Number((e.volSum / e.count).toFixed(0)),
        avgDensity: Number((e.densSum / e.count).toFixed(0))
      }))
      .sort((a, b) => b.avgVolume - a.avgVolume);
  }, [filteredRows]);

  // Scatter plot points: Volume vs Density
  const scatterPoints = React.useMemo(() => {
    return filteredRows
      .filter(r => 
        typeof r['Traffic Volume (est. peak hr vehicles)'] === 'number' &&
        typeof r['Traffic Density (veh/km peak hr)'] === 'number'
      )
      .map(r => ({
        city: r.City,
        year: r.Year,
        volume: r['Traffic Volume (est. peak hr vehicles)'],
        density: r['Traffic Density (veh/km peak hr)'],
        speed: r['Avg Vehicle Speed (km/h)']
      }));
  }, [filteredRows]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-600" />
            <span>Traffic Volume & Vehicular Density Analysis</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluating peak-hour vehicular throughput and spatial concentration per corridor kilometer
          </p>
        </div>
        <MetricBadge type="Source data" />
      </div>

      {/* Grid of Volume & Density Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Traffic Volume Trend */}
        <div className="card-academic p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Traffic Volume Progression</h3>
              <p className="text-xs text-slate-500">Estimated peak hour vehicles per arterial corridor</p>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Unit: veh/hr</span>
          </div>

          <div className="py-2">
            {yearlyData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yearlyData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '12px', borderRadius: '6px' }}
                      formatter={(v: any) => [`${Number(v).toLocaleString()} veh/hr`, 'Peak Volume']}
                    />
                    <Line type="monotone" dataKey="avgVolume" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyDataState />
            )}
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Peak corridor capacity observed in Mumbai (9,500 veh/hr) & Delhi (9,000 veh/hr)
          </div>
        </div>

        {/* Traffic Density Trend */}
        <div className="card-academic p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Traffic Density Progression</h3>
              <p className="text-xs text-slate-500">Peak hour vehicle concentration per lane kilometer</p>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Unit: veh/km</span>
          </div>

          <div className="py-2">
            {yearlyData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yearlyData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '12px', borderRadius: '6px' }}
                      formatter={(v: any) => [`${v} veh/km`, 'Traffic Density']}
                    />
                    <Line type="monotone" dataKey="avgDensity" stroke="#ec4899" strokeWidth={2.5} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyDataState />
            )}
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Bengaluru observed highest density (166 veh/km in 2025; 147 veh/km in 2019)
          </div>
        </div>

        {/* Volume vs Density Scatter Plot */}
        <div className="card-academic p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Volume vs. Density Distribution</h3>
              <p className="text-xs text-slate-500">Empirical fundamental traffic diagram relationship</p>
            </div>
            <MetricBadge type="Source data" />
          </div>

          <div className="py-2">
            {scatterPoints.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 15, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" dataKey="volume" name="Volume" unit=" veh/hr" tick={{ fontSize: 11 }} domain={['dataMin - 500', 'dataMax + 500']} />
                    <YAxis type="number" dataKey="density" name="Density" unit=" veh/km" tick={{ fontSize: 11 }} domain={['dataMin - 10', 'dataMax + 10']} />
                    <ZAxis range={[60, 60]} />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '12px', borderRadius: '6px' }}
                      formatter={(val: any, name: string, item: any) => {
                        const payload = item?.payload;
                        return [
                          `${val}`,
                          name === 'Volume' ? 'Peak Volume' : 'Density'
                        ];
                      }}
                    />
                    <Scatter name="Corridors" data={scatterPoints} fill="#6366f1" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyDataState />
            )}
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Data points reflect observed peak hour records across metro corridors
          </div>
        </div>

        {/* City Traffic Volume & Density Comparison */}
        <div className="card-academic p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Peak Volume by Metropolitan Area</h3>
              <p className="text-xs text-slate-500">Average peak vehicle counts per hour across cities</p>
            </div>
            <MetricBadge type="Source data" />
          </div>

          <div className="py-2">
            {cityData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cityData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="city" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '12px', borderRadius: '6px' }}
                      formatter={(v: any) => [`${Number(v).toLocaleString()} veh/hr`, 'Peak Volume']}
                    />
                    <Bar dataKey="avgVolume" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyDataState />
            )}
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Corridors evaluated include major arterial connectors (Ring Roads, Western Express Highway, NH-48)
          </div>
        </div>
      </div>
    </div>
  );
};
