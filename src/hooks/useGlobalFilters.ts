import { useState, useMemo, useCallback } from 'react';
import { CombinedMainRow, GlobalFiltersState } from '../types/dashboard';

const initialFilters: GlobalFiltersState = {
  year: 'ALL',
  city: 'ALL',
  state: 'ALL',
  vehicleType: 'ALL',
  timeOfDay: 'ALL',
  dayType: 'ALL',
  weatherCondition: 'ALL',
  roadCondition: 'ALL',
  roadConstructionStatus: 'ALL'
};

export function useGlobalFilters(masterRows: CombinedMainRow[] | undefined) {
  const [filters, setFilters] = useState<GlobalFiltersState>(initialFilters);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const setFilterValue = useCallback((key: keyof GlobalFiltersState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Compute available unique options dynamically from current masterRows
  const options = useMemo(() => {
    if (!masterRows || masterRows.length === 0) {
      return {
        years: [],
        cities: [],
        states: [],
        vehicleTypes: [],
        timesOfDay: [],
        dayTypes: [],
        weatherConditions: [],
        roadConditions: [],
        roadConstructionStatuses: []
      };
    }

    const uniqueSorted = (extractor: (r: CombinedMainRow) => string | number | null | undefined) => {
      const set = new Set<string>();
      masterRows.forEach(r => {
        const val = extractor(r);
        if (val !== null && val !== undefined && String(val).trim() !== '') {
          set.add(String(val).trim());
        }
      });
      return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    };

    return {
      years: uniqueSorted(r => r.Year),
      cities: uniqueSorted(r => r.City),
      states: uniqueSorted(r => r.State),
      vehicleTypes: uniqueSorted(r => r['Vehicle Type (dominant)']),
      timesOfDay: uniqueSorted(r => r['Time of Day']),
      dayTypes: uniqueSorted(r => r['Day Type']),
      weatherConditions: uniqueSorted(r => r['Weather Condition']),
      roadConditions: uniqueSorted(r => r['Road Condition (score/10)']),
      roadConstructionStatuses: uniqueSorted(r => r['Road Construction Status'])
    };
  }, [masterRows]);

  // Apply filters to master dataset
  const filteredRows = useMemo(() => {
    if (!masterRows) return [];

    return masterRows.filter(row => {
      if (filters.year !== 'ALL' && String(row.Year) !== filters.year) return false;
      if (filters.city !== 'ALL' && row.City !== filters.city) return false;
      if (filters.state !== 'ALL' && row.State !== filters.state) return false;
      if (filters.vehicleType !== 'ALL' && row['Vehicle Type (dominant)'] !== filters.vehicleType) return false;
      if (filters.timeOfDay !== 'ALL' && row['Time of Day'] !== filters.timeOfDay) return false;
      if (filters.dayType !== 'ALL' && row['Day Type'] !== filters.dayType) return false;
      if (filters.weatherCondition !== 'ALL' && row['Weather Condition'] !== filters.weatherCondition) return false;
      if (filters.roadCondition !== 'ALL' && String(row['Road Condition (score/10)']) !== filters.roadCondition) return false;
      if (filters.roadConstructionStatus !== 'ALL' && row['Road Construction Status'] !== filters.roadConstructionStatus) return false;
      return true;
    });
  }, [masterRows, filters]);

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(v => v !== 'ALL').length;
  }, [filters]);

  return {
    filters,
    setFilterValue,
    resetFilters,
    options,
    filteredRows,
    totalRecords: masterRows?.length || 0,
    filteredCount: filteredRows.length,
    activeFilterCount
  };
}
