import React from 'react';
import { AllSheetsData, VehicleCompositionRow, RegisteredVehicleRow } from '../types/dashboard';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { MetricBadge } from '../components/common/MetricBadge';
import { EmptyDataState } from '../components/common/EmptyDataState';
import { Car, Bike, Bus } from 'lucide-react';

interface VehicleAnalysisViewProps {
  allSheets: AllSheetsData | null;
}

export const VehicleAnalysisView: React.FC<VehicleAnalysisViewProps> = ({ allSheets }) => {
  const compRows: VehicleCompositionRow[] = allSheets?.['10_Vehicle_Type_Composition']?.rows || [];
  const regRows: RegisteredVehicleRow[] = allSheets?.['09_Registered_Vehicles']?.rows || [];

  // Sort registered vehicle rows by year
  const sortedReg = React.useMemo(() => {
    return [...regRows].sort((a, b) => a.Year - b.Year);
  }, [regRows]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Car className="w-5 h-5 text-brand-600" />
            <span>Urban Vehicle Fleet & Modal Composition</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            National fleet breakdown, two-wheeler dominance, and vehicle growth trends (Sheets 09 & 10)
          </p>
        </div>
        <MetricBadge type="Source data" />
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-academic p-4 flex items-center gap-3">
          <div className="p-2.5 rounded bg-emerald-50 text-emerald-700">
            <Bike className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Two-Wheeler Fleet Share</span>
            <div className="text-xl font-bold font-mono text-slate-900">73% of Total Fleet</div>
            <p className="text-[10px] text-slate-400">65% of peak-hour urban traffic volume</p>
          </div>
        </div>

        <div className="card-academic p-4 flex items-center gap-3">
          <div className="p-2.5 rounded bg-blue-50 text-blue-700">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Passenger Car Share</span>
            <div className="text-xl font-bold font-mono text-slate-900">13% of Total Fleet</div>
            <p className="text-[10px] text-slate-400">18% of peak-hour urban traffic share</p>
          </div>
        </div>

        <div className="card-academic p-4 flex items-center gap-3">
          <div className="p-2.5 rounded bg-amber-50 text-amber-700">
            <Bus className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Public & Private Buses</span>
            <div className="text-xl font-bold font-mono text-slate-900">1% of Total Fleet</div>
            <p className="text-[10px] text-slate-400">2% of peak-hour urban traffic share</p>
          </div>
        </div>
      </div>

      {/* Grid of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Vehicle Composition Bar Chart */}
        <div className="card-academic p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Fleet Share vs. Peak Hour Share (%)</h3>
              <p className="text-xs text-slate-500">National vehicle categories compared during peak traffic hours</p>
            </div>
            <span className="text-[11px] font-mono text-slate-500">MoRTH 2022</span>
          </div>

          <div className="py-2">
            {compRows.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={compRows} margin={{ top: 15, right: 20, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="Vehicle Type" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" interval={0} />
                    <YAxis tick={{ fontSize: 11 }} unit="%" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '12px', borderRadius: '6px' }}
                      formatter={(v: any, name: string) => [
                        `${v}%`,
                        name === '% of Total Fleet (India Avg)' ? 'Total Fleet Share' : 'Peak Hour Share'
                      ]}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="% of Total Fleet (India Avg)" name="Total Fleet Share (%)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="% Share Peak Hour Urban" name="Peak Hour Share (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyDataState />
            )}
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Two-wheelers account for nearly three-quarters of all vehicles across Indian metropolitan centers
          </div>
        </div>

        {/* National Vehicle Growth Line Chart */}
        <div className="card-academic p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Total Registered Vehicles (2015–2024)</h3>
              <p className="text-xs text-slate-500">National motorized vehicle fleet growth trajectory (crore units)</p>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Unit: Crore</span>
          </div>

          <div className="py-2">
            {sortedReg.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sortedReg} margin={{ top: 15, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="Year" tick={{ fontSize: 11 }} />
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} unit=" Cr" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '12px', borderRadius: '6px' }}
                      formatter={(v: any) => [`${v} Crore Vehicles (~${v * 10} Million)`, 'Registered Fleet']}
                    />
                    <Line type="monotone" dataKey="Total Registered Vehicles (crore)" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyDataState />
            )}
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Source: MoRTH Annual Transport Research Yearbooks (21 crore in 2015 to 38 crore in 2024)
          </div>
        </div>
      </div>
    </div>
  );
};
