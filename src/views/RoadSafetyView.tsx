import React from 'react';
import { AllSheetsData, MoRTHAccidentRow, StatewiseAccidentRow } from '../types/dashboard';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { MetricBadge } from '../components/common/MetricBadge';
import { EmptyDataState } from '../components/common/EmptyDataState';
import { ShieldAlert, AlertOctagon, HeartCrack, Info } from 'lucide-react';

interface RoadSafetyViewProps {
  allSheets: AllSheetsData | null;
}

export const RoadSafetyView: React.FC<RoadSafetyViewProps> = ({ allSheets }) => {
  const nationalAccidents: MoRTHAccidentRow[] = allSheets?.['03_MoRTH_Accidents']?.rows || [];
  const statewiseAccidents: StatewiseAccidentRow[] = allSheets?.['04_Statewise_Accidents']?.rows || [];

  // Sort statewise by persons killed
  const sortedStates = React.useMemo(() => {
    return [...statewiseAccidents].sort((a, b) => (b['Persons Killed 2022'] || 0) - (a['Persons Killed 2022'] || 0));
  }, [statewiseAccidents]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <span>National Road Safety & Trauma Epidemiology</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Official Ministry of Road Transport & Highways road accident, injury, and fatality statistics (Sheets 03 & 04)
          </p>
        </div>
        <MetricBadge type="Source data" />
      </div>

      {/* Mandatory Analytical Guardrail Notice */}
      <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <strong>Crucial Analytical Distinction:</strong> Road accident, fatality, and injury statistics represent critical road safety indicators and <strong>must NOT be interpreted as direct traffic congestion metrics</strong>. While congestion and geometric road factors influence traffic behavior, road accidents are governed by multidimensional factors including driver behavior, helmet/seatbelt adherence, road design, speed enforcement, and pedestrian infrastructure.
        </div>
      </div>

      {/* National Trend Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* National Total Accidents & Fatalities Over Time */}
        <div className="card-academic p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">National Road Accidents & Fatalities (2015–2023)</h3>
              <p className="text-xs text-slate-500">Longitudinal counts published in MoRTH Annual Reports</p>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Source: MoRTH</span>
          </div>

          <div className="py-2">
            {nationalAccidents.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={nationalAccidents} margin={{ top: 15, right: 20, left: 15, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="Year" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="accidents" orientation="left" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="fatalities" orientation="right" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '12px', borderRadius: '6px' }}
                      formatter={(v: any, name: string) => [
                        `${Number(v).toLocaleString()} persons`,
                        name === 'Total Accidents' ? 'Total Accidents' : (name === 'Persons Killed' ? 'Fatalities' : 'Injuries')
                      ]}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Line yAxisId="accidents" type="monotone" dataKey="Total Accidents" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
                    <Line yAxisId="fatalities" type="monotone" dataKey="Persons Killed" stroke="#e11d48" strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line yAxisId="accidents" type="monotone" dataKey="Persons Injured" stroke="#f59e0b" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyDataState />
            )}
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Fatalities rose from 146,133 (2015) to 173,860 (2023) nationally despite intermittent drops during 2020 lockdowns
          </div>
        </div>

        {/* State-Wise Fatalities Bar Chart */}
        <div className="card-academic p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Road Fatalities by State (2022)</h3>
              <p className="text-xs text-slate-500">Official verified deaths reported by state transport departments</p>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Sheet 04</span>
          </div>

          <div className="py-2">
            {sortedStates.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sortedStates.slice(0, 10)} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="State / UT" type="category" tick={{ fontSize: 11 }} width={90} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '12px', borderRadius: '6px' }}
                      formatter={(v: any) => [`${Number(v).toLocaleString()} killed`, 'Persons Killed']}
                    />
                    <Bar dataKey="Persons Killed 2022" fill="#e11d48" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyDataState />
            )}
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Uttar Pradesh (22,595), Tamil Nadu (17,884), Maharashtra (15,224), and Madhya Pradesh (13,427) recorded top fatality burdens
          </div>
        </div>
      </div>
    </div>
  );
};
