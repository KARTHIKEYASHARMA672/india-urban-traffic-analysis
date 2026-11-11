import React, { useState } from 'react';
import { AllSheetsData, WeatherImpactRow, RainfallIMDRow } from '../types/dashboard';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { MetricBadge } from '../components/common/MetricBadge';
import { EmptyDataState } from '../components/common/EmptyDataState';
import { CloudRain, AlertCircle, Info } from 'lucide-react';

interface WeatherRainfallViewProps {
  allSheets: AllSheetsData | null;
}

export const WeatherRainfallView: React.FC<WeatherRainfallViewProps> = ({ allSheets }) => {
  const weatherRows: WeatherImpactRow[] = allSheets?.['14_Weather_Impact']?.rows || [];
  const rainfallRows: RainfallIMDRow[] = allSheets?.['05_Rainfall_IMD']?.rows || [];

  const [selectedCity, setSelectedCity] = useState<string>('ALL');

  const cities = React.useMemo(() => {
    return Array.from(new Set(rainfallRows.map(r => r.City).filter(Boolean))).sort();
  }, [rainfallRows]);

  const filteredRainfall = React.useMemo(() => {
    return rainfallRows.filter(r => {
      if (selectedCity !== 'ALL' && r.City !== selectedCity) return false;
      return true;
    });
  }, [rainfallRows, selectedCity]);

  // Aggregate rainfall by city
  const rainfallByCity = React.useMemo(() => {
    const map = new Map<string, { city: string; sum: number; count: number }>();
    rainfallRows.forEach(r => {
      if (typeof r['Annual Rainfall (mm)'] === 'number') {
        if (!map.has(r.City)) map.set(r.City, { city: r.City, sum: 0, count: 0 });
        const entry = map.get(r.City)!;
        entry.sum += r['Annual Rainfall (mm)'];
        entry.count++;
      }
    });

    return Array.from(map.values())
      .map(e => ({
        city: e.city,
        avgRainfall: Number((e.sum / e.count).toFixed(0))
      }))
      .sort((a, b) => b.avgRainfall - a.avgRainfall);
  }, [rainfallRows]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-brand-600" />
            <span>Weather Impacts & IMD Annual Rainfall</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Empirical weather condition friction factors and official India Meteorological Department annual rainfall records (Sheets 05 & 14)
          </p>
        </div>
        <MetricBadge type="Source-reported" />
      </div>

      {/* Mandatory Non-Causal Explanation */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong>Methodological Clarification:</strong> The dataset demonstrates an empirical association between adverse weather conditions and reduced vehicular speeds / expanded congestion. Rainfall values shown represent <strong>verified IMD Annual Rainfall</strong> and are not real-time radar estimates. Congestion impact factors reflect source-reported observations from MoRTH & traffic police telematics.
        </div>
      </div>

      {/* Weather Impact Factors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Weather Condition Friction Factors */}
        <div className="card-academic p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Weather Condition Impact Factors (%)
              </h3>
              <p className="text-xs text-slate-500">Source-reported congestion increase and vehicle speed reduction</p>
            </div>
            <MetricBadge type="Source-reported" />
          </div>

          <div className="py-2">
            {weatherRows.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weatherRows} margin={{ top: 15, right: 20, left: -10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="Weather Condition" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" interval={0} />
                    <YAxis tick={{ fontSize: 11 }} unit="%" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '12px', borderRadius: '6px' }}
                      formatter={(v: any, name: string) => [
                        `${v}%`,
                        name === 'Congestion Increase (%)' ? 'Congestion Increase' : 'Speed Reduction'
                      ]}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="Congestion Increase (%)" name="Congestion Increase (%)" fill="#e11d48" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Speed Reduction (%)" name="Speed Reduction (%)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyDataState />
            )}
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Very heavy rain conditions (+45% congestion, -35% speed) observe a 2.2× accident risk factor
          </div>
        </div>

        {/* IMD Annual Rainfall by City */}
        <div className="card-academic p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                IMD Verified Annual Rainfall (mm)
              </h3>
              <p className="text-xs text-slate-500">Official India Meteorological Department station averages</p>
            </div>
            <MetricBadge type="Source data" />
          </div>

          <div className="py-2">
            {rainfallByCity.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rainfallByCity} margin={{ top: 15, right: 20, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="city" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} unit=" mm" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '12px', borderRadius: '6px' }}
                      formatter={(v: any) => [`${Number(v).toLocaleString()} mm`, 'Annual Rainfall']}
                    />
                    <Bar dataKey="avgRainfall" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyDataState />
            )}
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Stations: Mumbai (Santacruz & Colaba: 2,500–3,670 mm), Kolkata (~1,600 mm), Bengaluru (~950–1,450 mm), Delhi (~613 mm)
          </div>
        </div>
      </div>

      {/* Detailed Weather Impact Reference Table */}
      <div className="card-academic p-4">
        <h3 className="text-sm font-bold text-slate-900 mb-3">
          Weather Condition Risk Multiplier Matrix
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <th className="py-2.5 px-3 font-semibold">Weather Condition</th>
                <th className="py-2.5 px-3 font-semibold">Congestion Increase (%)</th>
                <th className="py-2.5 px-3 font-semibold">Speed Reduction (%)</th>
                <th className="py-2.5 px-3 font-semibold">Accident Risk Factor</th>
                <th className="py-2.5 px-3 font-semibold">Evidence Provenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {weatherRows.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-900">{r['Weather Condition']}</td>
                  <td className="py-2.5 px-3 text-rose-600 font-bold">+{r['Congestion Increase (%)']}%</td>
                  <td className="py-2.5 px-3 text-amber-600 font-bold">-{r['Speed Reduction (%)']}%</td>
                  <td className="py-2.5 px-3 text-slate-800 font-semibold">{r['Accident Risk Factor (×)']}×</td>
                  <td className="py-2.5 px-3 font-sans text-slate-500">{r.Source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
