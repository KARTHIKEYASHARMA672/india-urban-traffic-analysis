import React from 'react';
import { FileText, Database, Calculator } from 'lucide-react';
import { MetricBadge } from '../components/common/MetricBadge';

interface DictionaryEntry {
  term: string;
  definition: string;
  unit: string;
  type: 'Source data' | 'Derived' | 'Calculated' | 'Source-reported';
  formula?: string;
  sourceAuthority: string;
  validRange: string;
  notes?: string;
}

const DICTIONARY_ENTRIES: DictionaryEntry[] = [
  {
    term: 'Traffic Volume',
    definition: 'Total estimated motorized vehicles passing a defined cross-section of a major arterial road corridor during the peak hour (morning or evening rush window).',
    unit: 'Vehicles per hour (veh/hr)',
    type: 'Source data',
    sourceAuthority: 'MoRTH Highway Manual / Municipal Traffic Police Surveys',
    validRange: '5,000 – 15,000 veh/hr per arterial corridor',
    notes: 'Observed peak volumes reach ~9,500 veh/hr on Mumbai Western Express Highway and ~9,000 veh/hr on Delhi Ring Road.'
  },
  {
    term: 'Traffic Density',
    definition: 'The concentration of vehicles occupying a unit corridor length per kilometer of roadway during peak traffic flow.',
    unit: 'Vehicles per kilometer (veh/km)',
    type: 'Source data',
    sourceAuthority: 'Traffic Police Floating Vehicle Telematics',
    validRange: '50 – 200 veh/km per corridor',
    notes: 'Severe bottleneck densities exceed 140 veh/km in Bengaluru (Outer Ring Road) and Mumbai.'
  },
  {
    term: 'Average Vehicle Speed',
    definition: 'The average realized terrestrial velocity of passenger vehicles and two-wheelers traversing major metropolitan urban corridors during peak congestion periods.',
    unit: 'Kilometers per hour (km/h)',
    type: 'Source data',
    sourceAuthority: 'TomTom GPS Telemetry & Municipal Traffic Police Probe Data',
    validRange: '10.0 – 35.0 km/h (peak urban)',
    notes: 'Recorded speeds range from a low of 12.8 km/h in Bengaluru (2025) to ~22.0 km/h in Delhi (2019).'
  },
  {
    term: 'Travel Time (per 10 km)',
    definition: 'The average elapsed time required for an urban vehicle to traverse a standard 10 km metropolitan corridor during peak commute windows.',
    unit: 'Minutes per 10 km (min)',
    type: 'Source-reported',
    sourceAuthority: 'TomTom Traffic Index Benchmark Methodology',
    validRange: '20 – 50 minutes per 10 km',
    notes: 'Bengaluru observed 41.4 min/10 km in 2019 and ~42 min/10 km in 2024; Kolkata averages ~35.3 min/10 km.'
  },
  {
    term: 'Congestion Level (%)',
    definition: 'The percentage increase in overall travel duration experienced by commuters compared to baseline free-flow (uncongested) conditions.',
    unit: 'Percentage (%)',
    type: 'Source-reported',
    sourceAuthority: 'TomTom Global Traffic Index',
    validRange: '30% – 85%',
    notes: 'A 60% congestion level indicates a standard 30-minute free-flow trip takes 48 minutes (an extra 18 minutes).'
  },
  {
    term: 'Annual Hours Lost',
    definition: 'The total cumulative hours lost by a regular commuter per year during two daily peak-hour trips of standard corridor distance due to traffic congestion.',
    unit: 'Hours per year (hrs/year)',
    type: 'Source-reported',
    sourceAuthority: 'TomTom Traffic Index',
    validRange: '80 – 200 hours / year',
    notes: 'Bengaluru drivers lost 168 hours in 2025; Pune commuters lost 152 hours.'
  },
  {
    term: 'Effective Delay Index (EDI)',
    definition: 'A composite delay burden metric quantifying aggregate commuter friction by multiplying congestion intensity by cumulative annual hours lost, normalized by 100.',
    unit: 'Dimensionless Index (Score)',
    type: 'Derived',
    formula: 'EDI = (Congestion Level % × Annual Hours Lost) / 100',
    sourceAuthority: 'Derived Analytical Benchmark Formula',
    validRange: '50.0 – 150.0 EDI points',
    notes: 'Higher EDI scores reflect compounding severity where both speed reduction and total duration loss are acute.'
  },
  {
    term: 'Annual Rainfall',
    definition: 'Cumulative precipitation recorded across official urban meteorological observation stations over the annual calendar period.',
    unit: 'Millimeters (mm)',
    type: 'Source data',
    sourceAuthority: 'India Meteorological Department (IMD)',
    validRange: '400 – 4,500 mm / year',
    notes: 'Categorized strictly as verified annual historical rainfall, not real-time radar precipitation.'
  },
  {
    term: 'Road Condition Score',
    definition: 'A composite pavement quality rating on a 0 to 10 scale assessing surface distress, roughness index, pothole incidence, and lane continuity.',
    unit: 'Score out of 10 (/10)',
    type: 'Source data',
    sourceAuthority: 'NHAI / MoRTH National Highway Asset Audits (2024)',
    validRange: '1.0 – 10.0',
    notes: 'Corridors scoring above 7.0 represent good/superior pavement; scores below 6.0 denote distressed surfaces.'
  },
  {
    term: 'Traffic Signal Waiting Time',
    definition: 'The average cycle waiting delay encountered by vehicles queuing at major signalized intersections during peak hours.',
    unit: 'Minutes (min)',
    type: 'Source data',
    sourceAuthority: 'City Traffic Police Intelligent Traffic Systems (ITS)',
    validRange: '1.5 – 6.0 minutes (average); up to 10.0 minutes (bottlenecks)',
    notes: 'Bengaluru intersections average 4.5 min wait (peak bottleneck: 9 min); Mumbai averages 3.5 min (bottleneck: 7 min).'
  },
  {
    term: 'Vehicle Type Composition',
    definition: 'The proportional breakdown of motorized vehicular categories comprising the national and metropolitan circulating fleet.',
    unit: 'Percentage of fleet (%)',
    type: 'Source data',
    sourceAuthority: 'MoRTH VAHAN Database & DataForIndia Urban Composition (2022)',
    validRange: '0% – 100%',
    notes: 'Two-wheelers comprise 73% of India total fleet (65% peak volume); passenger cars comprise 13% (18% peak volume).'
  },
  {
    term: 'Day Type',
    definition: 'Classification distinguishing typical working business days from weekends and public statutory holidays.',
    unit: 'Nominal Category',
    type: 'Source data',
    sourceAuthority: 'Standard Urban Transport Planning Conventions',
    validRange: 'Weekday | Weekend',
    notes: 'Weekday traffic profiles exhibit severe twin morning/evening peaks; weekends display dispersed afternoon leisure volumes.'
  },
  {
    term: 'Weather Condition',
    definition: 'Meteorological atmospheric state categorized across standard IMD precipitation intensity and visibility bands.',
    unit: 'Nominal Category',
    type: 'Source data',
    sourceAuthority: 'IMD Meteorological Classifications',
    validRange: 'Clear / sunny | Light rain (<10 mm) | Heavy rain (10-65 mm) | Very heavy rain (>65 mm)',
    notes: 'Associated with empirically documented friction factors reducing corridor speeds by 5% to 35%.'
  }
];

export const DataDictionaryView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-600" />
            <span>Comprehensive Data Dictionary & Variable Definitions</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Exhaustive operational definitions, physical units, measurement standards, and validation bounds for all 14 core analytics fields
          </p>
        </div>
        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
          13 Standard Parameters
        </span>
      </div>

      {/* Dictionary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DICTIONARY_ENTRIES.map((entry, idx) => (
          <div key={idx} className="card-academic p-4 flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className="text-sm font-bold text-slate-900">{entry.term}</h3>
                <MetricBadge type={entry.type} formula={entry.formula} />
              </div>

              <div className="text-xs font-mono text-brand-700 font-semibold mb-2">
                Unit: {entry.unit}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {entry.definition}
              </p>

              {entry.formula && (
                <div className="mb-2 p-2 rounded bg-purple-50 border border-purple-200 font-mono text-[11px] text-purple-900 font-semibold">
                  Formula: {entry.formula}
                </div>
              )}
            </div>

            <div className="pt-2.5 border-t border-slate-100 text-[11px] space-y-1 text-slate-500">
              <div className="flex items-center justify-between">
                <span>Authority:</span>
                <span className="font-medium text-slate-700">{entry.sourceAuthority}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Empirical Range:</span>
                <span className="font-mono text-slate-700">{entry.validRange}</span>
              </div>
              {entry.notes && (
                <div className="text-[10px] text-slate-400 italic pt-1">
                  Note: {entry.notes}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
