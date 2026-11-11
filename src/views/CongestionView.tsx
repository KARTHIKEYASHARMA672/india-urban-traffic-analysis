import React, { useState } from 'react';
import { AllSheetsData, TomTomRow } from '../types/dashboard';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { MetricBadge } from '../components/common/MetricBadge';
import { EmptyDataState } from '../components/common/EmptyDataState';
import { TrendingUp, Clock, Gauge, Award } from 'lucide-react';

interface CongestionViewProps {
  allSheets: AllSheetsData | null;
}

export const CongestionView: React.FC<CongestionViewProps> = ({ allSheets }) => {
  const rawRows: TomTomRow[] = allSheets?.['02_TomTom_Congestion']?.rows || [];

  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');

  // Dynamic filter options from TomTom sheet
  const cities = React.useMemo(() => Array.from(new Set(rawRows.map(r => r.City).filter(Boolean))).sort(), [rawRows]);
  const states = React.useMemo(() => Array.from(new Set(rawRows.map(r => r.State).filter(Boolean))).sort(), [rawRows]);
  const years = React.useMemo(() => Array.from(new Set(rawRows.map(r => String(r.Year)).filter(Boolean))).sort(), [rawRows]);

  const filtered = React.useMemo(() => {
    return rawRows.filter(r => {
      if (selectedCity !== 'ALL' && r.City !== selectedCity) return false;
      if (selectedState !== 'ALL' && r.State !== selectedState) return false;
      if (selectedYear !== 'ALL' && String(r.Year) !== selectedYear) return false;
      return true;
    });
  }, [rawRows, selectedCity, selectedState, selectedYear]);

  // Congestion by Year trend
  const congestionByYear = React.useMemo(() => {
    const map = new Map<number, { year: number; sum: number; count: number }>();
    filtered.forEach(r => {
      if (typeof r['Congestion Level (%)'] === 'number') {
        if (!map.has(r.Year)) map.set(r.Year, { year: r.Year, sum: 0, count: 0 });
        const entry = map.get(r.Year)!;
        entry.sum += r['Congestion Level (%)'];
        entry.count++;
      }
    });
    return Array.from(map.values())
      .map(e => ({
        year: e.year,
        avgCongestion: Number((e.sum / e.count).toFixed(1))
      }))
      .sort((a, b) => a.year - b.year);
  }, [filtered]);

  // Congestion by City
  const congestionByCity = React.useMemo(() => {
    const map = new Map<string, { city: string; sum: number; count: number; maxYear: number }>();
    filtered.forEach(r => {
      if (typeof r['Congestion Level (%)'] === 'number') {
        if (!map.has(r.City)) map.set(r.City, { city: r.City, sum: 0, count: 0, maxYear: r.Year });
        const entry = map.get(r.City)!;
        entry.sum += r['Congestion Level (%)'];
        entry.count++;
        if (r.Year > entry.maxYear) entry.maxYear = r.Year;
      }
    });
    return Array.from(map.values())
      .map(e => ({
        city: e.city,
        avgCongestion: Number((e.sum / e.count).toFixed(1)),
        latestYear: e.maxYear
      }))
      .sort((a, b) => b.avgCongestion - a.avgCongestion);
  }, [filtered]);

  // Congestion by State
  const congestionByState = React.useMemo(() => {
    const map = new Map<string, { state: string; sum: number; count: number }>();
    filtered.forEach(r => {
      if (typeof r['Congestion Level (%)'] === 'number' && r.State) {
        if (!map.has(r.State)) map.set(r.State, { state: r.State, sum: 0, count: 0 });
        const entry = map.get(r.State)!;
        entry.sum += r['Congestion Level (%)'];
        entry.count++;
      }
    });
    return Array.from(map.values())
      .map(e => ({
        state: e.state,
        avgCongestion: Number((e.sum / e.count).toFixed(1))
      }))
      .sort((a, b) => b.avgCongestion - a.avgCongestion);
  }, [filtered]);

  // Annual Hours Lost
  const hoursLostData = React.useMemo(() => {
    return filtered
      .filter(r => typeof r['Annual Hours Lost'] === 'number' && r['Annual Hours Lost'] > 0)
      .map(r => ({
        cityYear: `${r.City} (${r.Year})`,
        city: r.City,
        year: r.Year,
        hoursLost: r['Annual Hours Lost']
      }))
      .sort((a, b) => (b.hoursLost || 0) - (a.hoursLost || 0));
  }, [filtered]);

  // Rush Hour Speed Trend
  const rushSpeedData = React.useMemo(() => {
    return filtered
      .filter(r => typeof r['Avg Speed Rush Hour (km/h)'] === 'number')
      .map(r => ({
        cityYear: `${r.City} (${r.Year})`,
        city: r.City,
        year: r.Year,
        rushSpeed: r['Avg Speed Rush Hour (km/h)']
      }))
      .sort((a, b) => (a.rushSpeed || 0) - (b.rushSpeed || 0));
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-600" />
            <span>Congestion Dynamics & TomTom Telematics</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Empirical congestion percentages, global city rankings, and commuter hours lost (Sheet 02: TomTom Congestion)
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-700 font-medium"
          >
            <option value="ALL">All Cities ({cities.length})</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-700 font-medium"
          >
            <option value="ALL">All States ({states.length})</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-700 font-medium"
          >
            <option value="ALL">All Years ({years.length})</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Grid of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Congestion by Year */}
        <div className="card-academic p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Congestion % Progression by Year</h3>
              <p className="text-xs text-slate-500">Average peak delay percentage over free-flow conditions</p>
            </div>
            <MetricBadge type="Source-reported" />
          </div>

          <div className="py-2">
            {congestionByYear.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={congestionByYear} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} unit="%" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '12px', borderRadius: '6px' }}
                      formatter={(v: any) => [`${v}%`, 'Congestion Level']}
                    />
                    <Line type="monotone" dataKey="avgCongestion" stroke="#e11d48" strokeWidth={2.5} dot={{ r: 5, fill: '#e11d48' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyDataState />
            )}
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Source: TomTom Traffic Index historical reports (2019–2025)
          </div>
        </div>

        {/* Congestion by City */}
        <div className="card-academic p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Congestion % by City</h3>
              <p className="text-xs text-slate-500">Peak hour delay percentages across reported metros</p>
            </div>
            <MetricBadge type="Source-reported" />
          </div>

          <div className="py-2">
            {congestionByCity.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={congestionByCity} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" domain={[0, 85]} tick={{ fontSize: 11 }} unit="%" />
                    <YAxis dataKey="city" type="category" tick={{ fontSize: 11 }} width={80} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '12px', borderRadius: '6px' }}
                      formatter={(v: any) => [`${v}%`, 'Avg Congestion']}
                    />
                    <Bar dataKey="avgCongestion" fill="#0284c7" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyDataState />
            )}
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Note: Bengaluru 2025 (74.4%), Pune 2025 (71.1%), Mumbai 2025 (63.2%)
          </div>
        </div>

        {/* Annual Hours Lost */}
        <div className="card-academic p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Annual Hours Lost to Congestion</h3>
              <p className="text-xs text-slate-500">Commuter time lost per driver per year (hours/year)</p>
            </div>
            <MetricBadge type="Source-reported" />
          </div>

          <div className="py-2">
            {hoursLostData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hoursLostData} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="cityYear" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" interval={0} />
                    <YAxis tick={{ fontSize: 11 }} unit=" hrs" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '12px', borderRadius: '6px' }}
                      formatter={(v: any) => [`${v} hours`, 'Hours Lost / Year']}
                    />
                    <Bar dataKey="hoursLost" fill="#d97706" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyDataState />
            )}
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Computed by TomTom telemetry based on 2-way daily peak 10 km commute
          </div>
        </div>

        {/* Rush-Hour Speed */}
        <div className="card-academic p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Observed Rush-Hour Speeds</h3>
              <p className="text-xs text-slate-500">Realized average vehicle speed during peak commute windows</p>
            </div>
            <MetricBadge type="Source data" />
          </div>

          <div className="py-2">
            {rushSpeedData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rushSpeedData} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="cityYear" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" interval={0} />
                    <YAxis tick={{ fontSize: 11 }} unit=" km/h" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '12px', borderRadius: '6px' }}
                      formatter={(v: any) => [`${v} km/h`, 'Rush Hour Speed']}
                    />
                    <Bar dataKey="rushSpeed" fill="#059669" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyDataState />
            )}
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Verified speeds range from 12.8 km/h (Bengaluru 2025) to 20.8 km/h (Mumbai 2024)
          </div>
        </div>
      </div>
    </div>
  );
};
