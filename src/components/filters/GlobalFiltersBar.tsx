import React, { useState } from 'react';
import { Filter, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { GlobalFiltersState } from '../../types/dashboard';

interface GlobalFiltersBarProps {
  filters: GlobalFiltersState;
  setFilterValue: (key: keyof GlobalFiltersState, value: string) => void;
  resetFilters: () => void;
  options: {
    years: string[];
    cities: string[];
    states: string[];
    vehicleTypes: string[];
    timesOfDay: string[];
    dayTypes: string[];
    weatherConditions: string[];
    roadConditions: string[];
    roadConstructionStatuses: string[];
  };
  filteredCount: number;
  totalRecords: number;
  activeFilterCount: number;
}

export const GlobalFiltersBar: React.FC<GlobalFiltersBarProps> = ({
  filters,
  setFilterValue,
  resetFilters,
  options,
  filteredCount,
  totalRecords,
  activeFilterCount
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs mb-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-600" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Global Analytics Filters
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-brand-50 text-brand-700 border border-brand-200">
            {filteredCount} of {totalRecords} records
          </span>
          {activeFilterCount > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[11px] bg-amber-50 text-amber-800 border border-amber-200 font-medium">
              {activeFilterCount} active filter{activeFilterCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 font-medium px-2 py-1 rounded hover:bg-slate-100 transition-colors"
          >
            <span>{isExpanded ? 'Fewer Filters' : 'All 9 Filters'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={resetFilters}
            disabled={activeFilterCount === 0}
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Primary 4 filters always visible */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5">
        {/* City */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">City</label>
          <select
            value={filters.city}
            onChange={(e) => setFilterValue('city', e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-2 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-brand-500 font-medium text-slate-800"
          >
            <option value="ALL">All Cities ({options.cities.length})</option>
            {options.cities.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* State */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">State / Region</label>
          <select
            value={filters.state}
            onChange={(e) => setFilterValue('state', e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-2 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-brand-500 font-medium text-slate-800"
          >
            <option value="ALL">All States ({options.states.length})</option>
            {options.states.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Year</label>
          <select
            value={filters.year}
            onChange={(e) => setFilterValue('year', e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-2 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-brand-500 font-medium text-slate-800"
          >
            <option value="ALL">All Years ({options.years.length})</option>
            {options.years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Vehicle Type */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Vehicle Fleet</label>
          <select
            value={filters.vehicleType}
            onChange={(e) => setFilterValue('vehicleType', e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-2 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-brand-500 font-medium text-slate-800"
          >
            <option value="ALL">All Fleet Types</option>
            {options.vehicleTypes.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Extended filters (toggleable) */}
      {isExpanded && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2.5 mt-2 border-t border-slate-100">
          {/* Time of Day */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Time of Day</label>
            <select
              value={filters.timeOfDay}
              onChange={(e) => setFilterValue('timeOfDay', e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-2 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-brand-500 font-medium text-slate-800"
            >
              <option value="ALL">All Time Windows</option>
              {options.timesOfDay.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Day Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Day Type</label>
            <select
              value={filters.dayType}
              onChange={(e) => setFilterValue('dayType', e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-2 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-brand-500 font-medium text-slate-800"
            >
              <option value="ALL">All Day Types</option>
              {options.dayTypes.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Weather Condition */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Weather Condition</label>
            <select
              value={filters.weatherCondition}
              onChange={(e) => setFilterValue('weatherCondition', e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-2 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-brand-500 font-medium text-slate-800"
            >
              <option value="ALL">All Weather Conditions</option>
              {options.weatherConditions.map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>

          {/* Road Condition */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Road Score</label>
            <select
              value={filters.roadCondition}
              onChange={(e) => setFilterValue('roadCondition', e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-2 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-brand-500 font-medium text-slate-800"
            >
              <option value="ALL">All Road Scores</option>
              {options.roadConditions.map(rc => (
                <option key={rc} value={rc}>{rc} / 10</option>
              ))}
            </select>
          </div>

          {/* Road Construction Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Construction Project</label>
            <select
              value={filters.roadConstructionStatus}
              onChange={(e) => setFilterValue('roadConstructionStatus', e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-2 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-brand-500 font-medium text-slate-800"
            >
              <option value="ALL">All Infrastructure Projects</option>
              {options.roadConstructionStatuses.map(st => (
                <option key={st} value={st}>{st.substring(0, 35)}...</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
