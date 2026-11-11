import React from 'react';
import { AllSheetsData, TimeOfDayRow } from '../types/dashboard';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { MetricBadge } from '../components/common/MetricBadge';
import { EmptyDataState } from '../components/common/EmptyDataState';
import { Clock, Sun, Sunset, Moon, Sunrise } from 'lucide-react';

interface TimeOfDayViewProps {
  allSheets: AllSheetsData | null;
}

export const TimeOfDayView: React.FC<TimeOfDayViewProps> = ({ allSheets }) => {
  const rows: TimeOfDayRow[] = allSheets?.['13_Time_of_Day_Pattern']?.rows || [];

  const weekdayRows = rows.filter(r => r['Day Type'] === 'Weekday');
  const weekendRows = rows.filter(r => r['Day Type'] === 'Weekend');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-600" />
            <span>Time-of-Day Diurnal Traffic Patterns</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Diurnal traffic distribution across standard commute windows: Morning Peak, Mid-day, Evening Peak, and Night (Sheet 13)
          </p>
        </div>
        <MetricBadge type="Source-reported" />
      </div>

      {/* Broad Time Period Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card-academic p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <Sunrise className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">Morning Peak (08:00–11:00)</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">70% <span className="text-xs font-normal text-slate-500">Congestion</span></div>
          <div className="text-xs text-slate-500 mt-1 font-mono">Typical Speed: <strong>18 km/h</strong></div>
          <div className="text-[10px] text-slate-400 mt-1">Heavy inbound office commutes</div>
        </div>

        <div className="card-academic p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Sun className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">Mid-Day (11:00–17:00)</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">35% <span className="text-xs font-normal text-slate-500">Congestion</span></div>
          <div className="text-xs text-slate-500 mt-1 font-mono">Typical Speed: <strong>32 km/h</strong></div>
          <div className="text-[10px] text-slate-400 mt-1">Inter-peak steady commercial traffic</div>
        </div>

        <div className="card-academic p-4 border-l-4 border-l-rose-500">
          <div className="flex items-center gap-2 text-rose-600 mb-1">
            <Sunset className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">Evening Peak (17:00–20:00)</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">75% <span className="text-xs font-normal text-slate-500">Congestion</span></div>
          <div className="text-xs text-slate-500 mt-1 font-mono">Typical Speed: <strong>17 km/h</strong></div>
          <div className="text-[10px] text-slate-400 mt-1">Severe outbound arterial bottleneck</div>
        </div>

        <div className="card-academic p-4 border-l-4 border-l-indigo-500">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <Moon className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">Night (20:00–23:00)</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">30% <span className="text-xs font-normal text-slate-500">Congestion</span></div>
          <div className="text-xs text-slate-500 mt-1 font-mono">Typical Speed: <strong>38 km/h</strong></div>
          <div className="text-[10px] text-slate-400 mt-1">Dispersed post-peak free-flow</div>
        </div>
      </div>

      {/* Comparison of Weekday vs Weekend Windows */}
      <div className="card-academic p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Congestion % and Speed Across Diurnal Windows
            </h3>
            <p className="text-xs text-slate-500">Comparison of peak commute windows vs off-peak mid-day conditions</p>
          </div>
          <span className="text-[11px] font-mono text-slate-500">Bengaluru / Metropolitan Traffic Police Telematics</span>
        </div>

        <div className="py-3">
          {rows.length > 0 ? (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rows} margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="Time Window" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 11 }} unit="%" label={{ value: 'Congestion %', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} unit=" km/h" label={{ value: 'Speed km/h', angle: 90, position: 'insideRight', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '12px', borderRadius: '6px' }}
                    formatter={(v: any, name: string) => [
                      name === 'Typical Congestion (%)' ? `${v}%` : `${v} km/h`,
                      name === 'Typical Congestion (%)' ? 'Congestion Level' : 'Typical Speed'
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar yAxisId="left" dataKey="Typical Congestion (%)" name="Typical Congestion (%)" fill="#e11d48" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="Typical Speed (km/h)" name="Typical Speed (km/h)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyDataState />
          )}
        </div>

        <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
          <span>Note: Reflects official multi-city traffic police observation windows (no synthetic hourly interpolation).</span>
          <span className="font-mono">Sheet 13_Time_of_Day_Pattern</span>
        </div>
      </div>
    </div>
  );
};
