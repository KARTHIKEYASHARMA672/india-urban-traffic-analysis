import React from 'react';
import { AllSheetsData, NHAIHighwayRow, ExpresswayRow, MetroOpeningRow, HighwayLaneRow } from '../types/dashboard';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { MetricBadge } from '../components/common/MetricBadge';
import { EmptyDataState } from '../components/common/EmptyDataState';
import { Navigation, Train, Construction, Route, Info } from 'lucide-react';

interface InfrastructureViewProps {
  allSheets: AllSheetsData | null;
}

export const InfrastructureView: React.FC<InfrastructureViewProps> = ({ allSheets }) => {
  const nhaiRows: NHAIHighwayRow[] = allSheets?.['06_NHAI_Highways']?.rows || [];
  const expresswayRows: ExpresswayRow[] = allSheets?.['07_Expressways']?.rows || [];
  const metroRows: MetroOpeningRow[] = allSheets?.['08_Metro_Openings']?.rows || [];
  const laneRows: HighwayLaneRow[] = allSheets?.['11_National_Highway_Lanes']?.rows || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-brand-600" />
            <span>National Highways, Expressways & Urban Metro Infrastructure</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Physical infrastructure development trajectories across NHAI, state expressways, and urban rapid transit (Sheets 06, 07, 08 & 11)
          </p>
        </div>
        <MetricBadge type="Source data" />
      </div>

      {/* Non-Causality Disclaimer */}
      <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 text-xs text-sky-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <div>
          <strong>Infrastructure Evaluation Rule:</strong> Rapid physical expansion of national highways and expressways runs parallel to rapid vehicular fleet expansion. Descriptive comparison allows examining simultaneous trends; however, highway openings should not be presumed to automatically eliminate metropolitan arterial bottlenecks without rigorous localized network study.
        </div>
      </div>

      {/* Charts Grid: NH Construction Rate & Total Length */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* NH Construction Rate (km per Day) */}
        <div className="card-academic p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">NH Construction Velocity (km/day)</h3>
              <p className="text-xs text-slate-500">Average national highway construction pace per day</p>
            </div>
            <span className="text-[11px] font-mono text-slate-500">NHAI / MoRTH</span>
          </div>

          <div className="py-2">
            {nhaiRows.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={nhaiRows} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="Year (FY)" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} unit=" km" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '12px', borderRadius: '6px' }}
                      formatter={(v: any) => [`${v} km/day`, 'Avg Daily Pace']}
                    />
                    <Line type="monotone" dataKey="Avg km per Day" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyDataState />
            )}
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Construction rate expanded from 11.2 km/day (FY15) to 34.2 km/day (FY24)
          </div>
        </div>

        {/* Total National Highway Network Length */}
        <div className="card-academic p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Total National Highway Network (km)</h3>
              <p className="text-xs text-slate-500">Cumulative NH length under operation in India</p>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Unit: km</span>
          </div>

          <div className="py-2">
            {nhaiRows.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={nhaiRows} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="Year (FY)" tick={{ fontSize: 11 }} />
                    <YAxis domain={['dataMin - 10000', 'auto']} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '12px', borderRadius: '6px' }}
                      formatter={(v: any) => [`${Number(v).toLocaleString()} km`, 'Total NH Length']}
                    />
                    <Bar dataKey="Total NH Length (km)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyDataState />
            )}
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Total NH length increased from 101,011 km (2015) to 146,145 km (2024)
          </div>
        </div>
      </div>

      {/* Expressways and Metro Openings Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Expressways Table */}
        <div className="card-academic p-4">
          <div className="flex items-center gap-2 mb-3">
            <Route className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900">Major Expressways Commissioned</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <th className="py-2 px-3 font-semibold">Expressway</th>
                  <th className="py-2 px-3 font-semibold">State</th>
                  <th className="py-2 px-3 font-semibold">Year</th>
                  <th className="py-2 px-3 font-semibold">Length</th>
                  <th className="py-2 px-3 font-semibold">Lanes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {expresswayRows.map((e, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-medium text-slate-900">{e['Expressway Name']}</td>
                    <td className="py-2 px-3 text-slate-600">{e.State}</td>
                    <td className="py-2 px-3 font-mono text-slate-700">{e['Opened (Year)']}</td>
                    <td className="py-2 px-3 font-mono font-semibold text-slate-800">{e['Length (km)']} km</td>
                    <td className="py-2 px-3 text-slate-600">{e.Lanes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Metro Openings Table */}
        <div className="card-academic p-4">
          <div className="flex items-center gap-2 mb-3">
            <Train className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900">Major Metro System Commissioning</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <th className="py-2 px-3 font-semibold">City</th>
                  <th className="py-2 px-3 font-semibold">Opening Date</th>
                  <th className="py-2 px-3 font-semibold">Initial Length</th>
                  <th className="py-2 px-3 font-semibold">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {metroRows.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-bold text-slate-900">{m.City}</td>
                    <td className="py-2 px-3 font-mono text-slate-600">{m['Opened (Date)']}</td>
                    <td className="py-2 px-3 font-mono font-semibold text-brand-700">{m['Initial Network Length (km)']} km</td>
                    <td className="py-2 px-3 text-slate-500 font-sans">{m.Source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* National Highway Lanes Configuration */}
      <div className="card-academic p-4">
        <h3 className="text-sm font-bold text-slate-900 mb-3">
          Major National Highway Corridors & Lane Configurations (2024)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <th className="py-2 px-3 font-semibold">Highway</th>
                <th className="py-2 px-3 font-semibold">Primary Corridor Route</th>
                <th className="py-2 px-3 font-semibold">Total Length</th>
                <th className="py-2 px-3 font-semibold">Lane Configuration (2024)</th>
                <th className="py-2 px-3 font-semibold">Verification Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {laneRows.map((l, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-bold text-slate-900 font-mono">{l.Highway}</td>
                  <td className="py-2 px-3 text-slate-700">{l.Route}</td>
                  <td className="py-2 px-3 font-mono font-semibold text-slate-800">{Number(l['Length (km)']).toLocaleString()} km</td>
                  <td className="py-2 px-3 text-slate-800 font-medium">{l['Lane Configuration (2024)']}</td>
                  <td className="py-2 px-3 text-slate-500">{l.Source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
