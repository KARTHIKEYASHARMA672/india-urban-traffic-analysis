import React, { useState } from 'react';
import { CombinedMainRow, AllSheetsData } from '../types/dashboard';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { MetricBadge } from '../components/common/MetricBadge';
import { EmptyDataState } from '../components/common/EmptyDataState';
import { GitCompare, CheckSquare, Square } from 'lucide-react';

interface CityComparisonViewProps {
  masterRows: CombinedMainRow[];
  allSheets: AllSheetsData | null;
}

export const CityComparisonView: React.FC<CityComparisonViewProps> = ({
  masterRows,
  allSheets
}) => {
  // All available unique cities
  const allCities = React.useMemo(() => {
    return Array.from(new Set(masterRows.map(r => r.City).filter(Boolean))).sort();
  }, [masterRows]);

  // Default selected cities: Bengaluru, Mumbai, Delhi, Pune
  const [selectedCities, setSelectedCities] = useState<string[]>(['Bengaluru', 'Mumbai', 'Delhi', 'Pune']);
  const [comparisonMetric, setComparisonMetric] = useState<string>('speed_travel');

  const toggleCity = (city: string) => {
    setSelectedCities(prev => 
      prev.includes(city)
        ? (prev.length > 1 ? prev.filter(c => c !== city) : prev) // keep at least 1
        : [...prev, city]
    );
  };

  // Compute aggregated values for each selected city (latest or average)
  const cityComparisonData = React.useMemo(() => {
    const tomtom = allSheets?.['02_TomTom_Congestion']?.rows || [];
    const ediRows = allSheets?.['16_EDI_Parameters']?.rows || [];

    return selectedCities.map(city => {
      // Filter rows for this city
      const cRows = masterRows.filter(r => r.City === city);
      const tomtomCityRows = tomtom.filter(r => r.City.toLowerCase() === city.toLowerCase() || (city === 'Delhi' && r.City.toLowerCase() === 'new delhi'));
      const ediCityRows = ediRows.filter(r => r.City.toLowerCase() === city.toLowerCase() || (city === 'Delhi' && r.City.toLowerCase() === 'new delhi'));

      const avg = (nums: (number | null | undefined)[]) => {
        const v = nums.filter((n): n is number => typeof n === 'number' && !isNaN(n));
        return v.length > 0 ? Number((v.reduce((a, b) => a + b, 0) / v.length).toFixed(1)) : null;
      };

      const avgSpeed = avg(cRows.map(r => r['Avg Vehicle Speed (km/h)']));
      const avgTravelTime = avg(cRows.map(r => r['Travel Time (min per 10 km)']));
      const avgVolume = avg(cRows.map(r => r['Traffic Volume (est. peak hr vehicles)']));
      const avgDensity = avg(cRows.map(r => r['Traffic Density (veh/km peak hr)']));
      const avgSignalWait = avg(cRows.map(r => r['Traffic Signal Wait (min)']));
      const avgRoadCondition = avg(cRows.map(r => r['Road Condition (score/10)']));
      
      const avgEDI = avg(cRows.map(r => r['EDI Score']).concat(ediCityRows.map(r => r['EDI Score (computed)'])));
      const avgCongestion = avg(tomtomCityRows.map(r => r['Congestion Level (%)']));

      return {
        city,
        avgSpeed,
        avgTravelTime,
        avgVolume,
        avgDensity,
        avgSignalWait,
        avgRoadCondition,
        avgEDI,
        avgCongestion
      };
    });
  }, [selectedCities, masterRows, allSheets]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-brand-600" />
            <span>Multi-City Cross-Dimensional Comparison</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Objective side-by-side metric comparison across Indian metropolitan clusters (non-ranking comparative analysis)
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600">Metric View:</span>
          <select
            value={comparisonMetric}
            onChange={(e) => setComparisonMetric(e.target.value)}
            className="bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-700 font-medium"
          >
            <option value="speed_travel">Speed vs. Travel Time</option>
            <option value="volume_density">Traffic Volume vs. Density</option>
            <option value="congestion_edi">Congestion % vs. EDI Score</option>
            <option value="signal_road">Signal Wait vs. Road Score</option>
          </select>
        </div>
      </div>

      {/* City Selector Chips */}
      <div className="card-academic p-3">
        <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
          Select Cities to Compare (Minimum 1):
        </div>
        <div className="flex flex-wrap gap-2">
          {allCities.map(city => {
            const isSelected = selectedCities.includes(city);
            return (
              <button
                key={city}
                onClick={() => toggleCity(city)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                }`}
              >
                {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5 text-slate-400" />}
                <span>{city}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="card-academic p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Comparative Analytical Visualization
            </h3>
            <p className="text-xs text-slate-500">Comparing {selectedCities.length} selected metropolitan areas</p>
          </div>
          <MetricBadge type="Source data" />
        </div>

        <div className="py-3">
          {cityComparisonData.length > 0 ? (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cityComparisonData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="city" tick={{ fontSize: 12, fontWeight: 600 }} />
                  <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '12px', borderRadius: '6px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                  {comparisonMetric === 'speed_travel' && (
                    <>
                      <Bar yAxisId="left" dataKey="avgSpeed" name="Avg Speed (km/h)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="right" dataKey="avgTravelTime" name="Travel Time (min/10 km)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </>
                  )}

                  {comparisonMetric === 'volume_density' && (
                    <>
                      <Bar yAxisId="left" dataKey="avgVolume" name="Peak Volume (veh/hr)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="right" dataKey="avgDensity" name="Density (veh/km)" fill="#ec4899" radius={[4, 4, 0, 0]} />
                    </>
                  )}

                  {comparisonMetric === 'congestion_edi' && (
                    <>
                      <Bar yAxisId="left" dataKey="avgCongestion" name="Congestion Level (%)" fill="#e11d48" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="right" dataKey="avgEDI" name="Effective Delay Index (EDI)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </>
                  )}

                  {comparisonMetric === 'signal_road' && (
                    <>
                      <Bar yAxisId="left" dataKey="avgSignalWait" name="Signal Wait (min)" fill="#f97316" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="right" dataKey="avgRoadCondition" name="Road Score (/10)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyDataState />
          )}
        </div>
      </div>

      {/* Multi-Dimensional Comparison Table */}
      <div className="card-academic p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <h3 className="text-sm font-bold text-slate-900">
            Comprehensive Metric Alignment Matrix
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            {selectedCities.length} Metros Evaluated
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <th className="py-2.5 px-3 font-semibold">City</th>
                <th className="py-2.5 px-3 font-semibold">Congestion %</th>
                <th className="py-2.5 px-3 font-semibold">Peak Volume</th>
                <th className="py-2.5 px-3 font-semibold">Density (veh/km)</th>
                <th className="py-2.5 px-3 font-semibold">Avg Speed</th>
                <th className="py-2.5 px-3 font-semibold">Travel Time (10 km)</th>
                <th className="py-2.5 px-3 font-semibold">Signal Wait</th>
                <th className="py-2.5 px-3 font-semibold">EDI Score</th>
                <th className="py-2.5 px-3 font-semibold">Road Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {cityComparisonData.map(row => (
                <tr key={row.city} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold font-sans text-slate-900">{row.city}</td>
                  <td className="py-2.5 px-3 text-rose-600 font-semibold">{row.avgCongestion ? `${row.avgCongestion}%` : 'No data'}</td>
                  <td className="py-2.5 px-3 text-slate-700">{row.avgVolume ? `${row.avgVolume.toLocaleString()} veh/hr` : 'No data'}</td>
                  <td className="py-2.5 px-3 text-slate-700">{row.avgDensity ? `${row.avgDensity} veh/km` : 'No data'}</td>
                  <td className="py-2.5 px-3 text-emerald-700 font-semibold">{row.avgSpeed ? `${row.avgSpeed} km/h` : 'No data'}</td>
                  <td className="py-2.5 px-3 text-amber-700">{row.avgTravelTime ? `${row.avgTravelTime} min` : 'No data'}</td>
                  <td className="py-2.5 px-3 text-slate-700">{row.avgSignalWait ? `${row.avgSignalWait} min` : 'No data'}</td>
                  <td className="py-2.5 px-3 text-purple-700 font-semibold">{row.avgEDI ? row.avgEDI : 'No data'}</td>
                  <td className="py-2.5 px-3 text-slate-700">{row.avgRoadCondition ? `${row.avgRoadCondition}/10` : 'No data'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
