import React, { useState } from 'react';
import { useLiveData } from './hooks/useLiveData';
import { useGlobalFilters } from './hooks/useGlobalFilters';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { GlobalFiltersBar } from './components/filters/GlobalFiltersBar';
import { TabId } from './types/dashboard';

// Import analytical views
import { OverviewView } from './views/OverviewView';
import { CongestionView } from './views/CongestionView';
import { CityComparisonView } from './views/CityComparisonView';
import { TrafficVolumeDensityView } from './views/TrafficVolumeDensityView';
import { SpeedTravelTimeView } from './views/SpeedTravelTimeView';
import { VehicleAnalysisView } from './views/VehicleAnalysisView';
import { TimeOfDayView } from './views/TimeOfDayView';
import { WeatherRainfallView } from './views/WeatherRainfallView';
import { RoadConditionView } from './views/RoadConditionView';
import { InfrastructureView } from './views/InfrastructureView';
import { TrafficSignalsView } from './views/TrafficSignalsView';
import { RoadSafetyView } from './views/RoadSafetyView';
import { EDIView } from './views/EDIView';
import { CorrelationView } from './views/CorrelationView';
import { IndiaMapView } from './views/IndiaMapView';
import { DataExplorerView } from './views/DataExplorerView';
import { DataQualityView } from './views/DataQualityView';
import { SourcesView } from './views/SourcesView';
import { DataDictionaryView } from './views/DataDictionaryView';
import { Menu } from 'lucide-react';

export const App: React.FC = () => {
  const liveState = useLiveData();
  const { data, lastUpdated, changeLog } = liveState;

  // Global filters bind to Master Dataset 17_Combined_Main_Data
  const masterRows = data?.['17_Combined_Main_Data']?.rows;
  const {
    filters,
    setFilterValue,
    resetFilters,
    options,
    filteredRows,
    totalRecords,
    filteredCount,
    activeFilterCount
  } = useGlobalFilters(masterRows);

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Header with Live Telemetry */}
      <Header liveState={liveState} />

      <div className="flex-1 flex w-full">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 lg:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Mobile Menu Trigger & Active Tab Title */}
          <div className="lg:hidden flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-300 text-xs font-semibold text-slate-800 shadow-xs"
            >
              <Menu className="w-4 h-4 text-brand-600" />
              <span>Analytical Modules</span>
            </button>
            <span className="text-xs font-mono font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
              {activeTab.replace(/-/g, ' ').toUpperCase()}
            </span>
          </div>

          {/* Global Multi-Dimension Filters (visible on all analytics modules) */}
          <GlobalFiltersBar
            filters={filters}
            setFilterValue={setFilterValue}
            resetFilters={resetFilters}
            options={options}
            filteredCount={filteredCount}
            totalRecords={totalRecords}
            activeFilterCount={activeFilterCount}
          />

          {/* Tab Views */}
          {activeTab === 'overview' && (
            <OverviewView
              filteredRows={filteredRows}
              allSheets={data}
              changeLog={changeLog}
            />
          )}

          {activeTab === 'congestion' && (
            <CongestionView allSheets={data} />
          )}

          {activeTab === 'city-comparison' && (
            <CityComparisonView
              masterRows={masterRows || []}
              allSheets={data}
            />
          )}

          {activeTab === 'traffic-volume-density' && (
            <TrafficVolumeDensityView filteredRows={filteredRows} />
          )}

          {activeTab === 'speed-travel-time' && (
            <SpeedTravelTimeView
              filteredRows={filteredRows}
              allSheets={data}
            />
          )}

          {activeTab === 'vehicle-analysis' && (
            <VehicleAnalysisView allSheets={data} />
          )}

          {activeTab === 'time-of-day' && (
            <TimeOfDayView allSheets={data} />
          )}

          {activeTab === 'weather-rainfall' && (
            <WeatherRainfallView allSheets={data} />
          )}

          {activeTab === 'road-condition' && (
            <RoadConditionView allSheets={data} />
          )}

          {activeTab === 'infrastructure' && (
            <InfrastructureView allSheets={data} />
          )}

          {activeTab === 'traffic-signals' && (
            <TrafficSignalsView allSheets={data} />
          )}

          {activeTab === 'road-safety' && (
            <RoadSafetyView allSheets={data} />
          )}

          {activeTab === 'edi-analysis' && (
            <EDIView
              allSheets={data}
              filteredRows={filteredRows}
            />
          )}

          {activeTab === 'correlation' && (
            <CorrelationView filteredRows={filteredRows} />
          )}

          {activeTab === 'india-map' && (
            <IndiaMapView
              filteredRows={filteredRows}
              allSheets={data}
            />
          )}

          {activeTab === 'data-explorer' && (
            <DataExplorerView
              allSheets={data}
              filteredMasterRows={filteredRows}
              lastUpdated={lastUpdated}
            />
          )}

          {activeTab === 'data-quality' && (
            <DataQualityView
              allSheets={data}
              filteredMasterRows={filteredRows}
              lastUpdated={lastUpdated}
            />
          )}

          {activeTab === 'sources' && (
            <SourcesView allSheets={data} />
          )}

          {activeTab === 'data-dictionary' && (
            <DataDictionaryView />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
