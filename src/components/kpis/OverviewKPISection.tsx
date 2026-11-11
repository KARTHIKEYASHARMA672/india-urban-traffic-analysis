import React from 'react';
import { 
  TrendingUp, 
  Layers, 
  Activity, 
  Gauge, 
  Clock, 
  AlertTriangle, 
  Calculator, 
  Car, 
  CloudRain, 
  Timer 
} from 'lucide-react';
import { KPICard } from './KPICard';
import { CombinedMainRow, AllSheetsData } from '../../types/dashboard';

interface OverviewKPISectionProps {
  filteredRows: CombinedMainRow[];
  allSheets: AllSheetsData | null;
}

export const OverviewKPISection: React.FC<OverviewKPISectionProps> = ({
  filteredRows,
  allSheets
}) => {
  // Aggregate from filtered CombinedMainRows
  const count = filteredRows.length;

  const avgOf = (key: keyof CombinedMainRow): number | null => {
    if (count === 0) return null;
    const nums = filteredRows
      .map(r => r[key])
      .filter((v): v is number => typeof v === 'number' && !isNaN(v) && isFinite(v));
    if (nums.length === 0) return null;
    return Number((nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1));
  };

  const avgSpeed = avgOf('Avg Vehicle Speed (km/h)');
  const avgTravelTime = avgOf('Travel Time (min per 10 km)');
  const avgVolume = avgOf('Traffic Volume (est. peak hr vehicles)');
  const avgDensity = avgOf('Traffic Density (veh/km peak hr)');
  const avgSignalWait = avgOf('Traffic Signal Wait (min)');
  const avgRoadCondition = avgOf('Road Condition (score/10)');
  const avgEDI = avgOf('EDI Score');

  // Congestion Level (%) - TomTom sheet correlation or Combined
  // In TomTom sheet, let's filter if city matches
  const tomtomRows = allSheets?.['02_TomTom_Congestion']?.rows || [];
  const avgCongestion = React.useMemo(() => {
    if (tomtomRows.length === 0) return null;
    const valid = tomtomRows
      .map(r => r['Congestion Level (%)'])
      .filter((v): v is number => typeof v === 'number' && !isNaN(v));
    if (valid.length === 0) return null;
    return Number((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(1));
  }, [tomtomRows]);

  const avgAnnualHoursLost = React.useMemo(() => {
    if (tomtomRows.length === 0) return null;
    const valid = tomtomRows
      .map(r => r['Annual Hours Lost'])
      .filter((v): v is number => typeof v === 'number' && !isNaN(v));
    if (valid.length === 0) return null;
    return Number((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(0));
  }, [tomtomRows]);

  // Total registered vehicles from 09_Registered_Vehicles (most recent year reported, e.g. 2024: 38 crore)
  const regVehiclesRows = allSheets?.['09_Registered_Vehicles']?.rows || [];
  const latestRegVehicles = React.useMemo(() => {
    if (regVehiclesRows.length === 0) return null;
    const sorted = [...regVehiclesRows].sort((a, b) => b.Year - a.Year);
    return sorted[0]?.['Total Registered Vehicles (crore)'] || null;
  }, [regVehiclesRows]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      <KPICard
        title="Average Congestion"
        value={avgCongestion}
        unit="%"
        metricType="Source-reported"
        sourceText="TomTom Index"
        icon={TrendingUp}
        description="Average congestion index across major Indian metropolitan centers"
      />

      <KPICard
        title="Avg Traffic Volume"
        value={avgVolume}
        unit="veh/hr"
        metricType="Source data"
        sourceText="MoRTH / City Police"
        icon={Layers}
        description="Estimated peak hour traffic volume"
      />

      <KPICard
        title="Avg Traffic Density"
        value={avgDensity}
        unit="veh/km"
        metricType="Source data"
        sourceText="City Police"
        icon={Activity}
        description="Peak hour vehicle concentration per lane km"
      />

      <KPICard
        title="Avg Vehicle Speed"
        value={avgSpeed}
        unit="km/h"
        metricType="Source data"
        sourceText="TomTom GPS Speed"
        icon={Gauge}
        description="Average city driving speed during peak congestion hours"
      />

      <KPICard
        title="Average Travel Time"
        value={avgTravelTime}
        unit="min/10 km"
        metricType="Source-reported"
        sourceText="TomTom City Benchmark"
        icon={Clock}
        description="Average time taken to travel a standard 10 km city corridor"
      />

      <KPICard
        title="Signal Waiting Time"
        value={avgSignalWait}
        unit="min"
        metricType="Source data"
        sourceText="City Traffic Police"
        icon={Timer}
        description="Average signal intersection waiting time"
      />

      <KPICard
        title="Total Registered Fleet"
        value={latestRegVehicles}
        unit="Crore Vehicles"
        metricType="Source data"
        sourceText="MoRTH VAHAN"
        icon={Car}
        description="Total registered motorized vehicles nationally (latest MoRTH report)"
      />

      <KPICard
        title="Annual Hours Lost"
        value={avgAnnualHoursLost}
        unit="hrs/year"
        metricType="Source-reported"
        sourceText="TomTom Index"
        icon={Clock}
        description="Average commute hours lost per driver annually due to congestion"
      />

      <KPICard
        title="Road Condition Score"
        value={avgRoadCondition}
        unit="/ 10"
        metricType="Source data"
        sourceText="NHAI / MoRTH"
        icon={AlertTriangle}
        description="Composite road infrastructure quality rating (out of 10)"
      />

      <KPICard
        title="Effective Delay Index"
        value={avgEDI}
        unit="EDI"
        metricType="Derived"
        formula="EDI = (Congestion % × Annual Hours Lost) / 100"
        sourceText="Derived Metric"
        icon={Calculator}
        description="Composite delay burden combining congestion severity and lost time"
      />
    </div>
  );
};
