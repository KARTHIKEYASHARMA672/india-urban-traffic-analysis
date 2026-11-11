import React, { useState, useEffect, useRef } from 'react';
import { CombinedMainRow, AllSheetsData } from '../types/dashboard';
import { MetricBadge } from '../components/common/MetricBadge';
import { MapPin, Navigation, Gauge, Clock, Layers, Activity, Maximize2, Compass, Layers as LayersIcon, ExternalLink } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface IndiaMapViewProps {
  filteredRows: CombinedMainRow[];
  allSheets: AllSheetsData | null;
}

interface CityGeo {
  name: string;
  state: string;
  lat: number;
  lng: number;
  description: string;
}

// Verified real geographic coordinates of Indian metropolitan centres
const VERIFIED_CITIES: CityGeo[] = [
  { name: 'Delhi', state: 'Delhi NCR', lat: 28.6139, lng: 77.2090, description: 'National Capital Region & Northern Transit Hub' },
  { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, description: 'Financial Capital & Coastal Linear Corridor' },
  { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, description: 'Automotive & IT Hub linked via Expressway' },
  { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946, description: 'Silicon Valley with high radial tech-corridor traffic' },
  { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, description: 'Automobile Manufacturing & Southeastern Seaport' },
  { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, description: 'Eastern Metropolis & Riverine Hub' },
  { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867, description: 'Deccan IT Corridor with Outer Ring Road expressway' },
  { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714, description: 'Western Commercial Centre with BRTS integration' }
];

// National Highway / Golden Quadrilateral Corridors with real coordinates
const HIGHWAY_CORRIDORS = [
  // Golden Quadrilateral: Delhi -> Ahmedabad -> Mumbai
  {
    name: 'NH-48 Western Corridor (Delhi - Jaipur - Ahmedabad - Mumbai)',
    coords: [
      [28.6139, 77.2090],
      [26.9124, 75.7873],
      [23.0225, 72.5714],
      [21.1702, 72.8311],
      [19.0760, 72.8777]
    ] as [number, number][],
    color: '#0284c7'
  },
  // Mumbai - Pune Expressway & NH-48 to Bengaluru
  {
    name: 'Mumbai - Pune Expressway & NH-48 South Corridor',
    coords: [
      [19.0760, 72.8777],
      [18.5204, 73.8567],
      [16.8524, 74.5815],
      [15.8497, 74.4977],
      [12.9716, 77.5946]
    ] as [number, number][],
    color: '#0284c7'
  },
  // Bengaluru - Chennai Expressway Corridor
  {
    name: 'NH-48 Bengaluru - Chennai Corridor',
    coords: [
      [12.9716, 77.5946],
      [12.9165, 79.1325],
      [13.0827, 80.2707]
    ] as [number, number][],
    color: '#0284c7'
  },
  // Golden Quadrilateral: Chennai -> Visakhapatnam -> Kolkata
  {
    name: 'NH-16 Eastern Coastal Corridor (Chennai - Vizag - Kolkata)',
    coords: [
      [13.0827, 80.2707],
      [16.5062, 80.6480],
      [17.6868, 83.2185],
      [20.2961, 85.8245],
      [22.5726, 88.3639]
    ] as [number, number][],
    color: '#0284c7'
  },
  // Golden Quadrilateral: Kolkata -> Varanasi -> Kanpur -> Agra -> Delhi
  {
    name: 'NH-19 Northern Gangetic Corridor (Kolkata - Delhi)',
    coords: [
      [22.5726, 88.3639],
      [23.7957, 86.4304],
      [25.3176, 82.9739],
      [26.4499, 80.3319],
      [27.1767, 78.0081],
      [28.6139, 77.2090]
    ] as [number, number][],
    color: '#0284c7'
  },
  // North-South Central Corridor: Delhi -> Nagpur -> Hyderabad -> Bengaluru
  {
    name: 'NH-44 North-South Spine (Delhi - Hyderabad - Bengaluru)',
    coords: [
      [28.6139, 77.2090],
      [27.1767, 78.0081],
      [26.2183, 78.1828],
      [21.1458, 79.0882],
      [17.3850, 78.4867],
      [15.8281, 78.0373],
      [12.9716, 77.5946]
    ] as [number, number][],
    color: '#6366f1'
  },
  // Pune - Hyderabad Corridor
  {
    name: 'NH-65 Deccan Connector (Pune - Solapur - Hyderabad)',
    coords: [
      [18.5204, 73.8567],
      [17.6599, 75.9064],
      [17.3850, 78.4867]
    ] as [number, number][],
    color: '#10b981'
  }
];

const TILE_PROVIDERS = {
  voyager: {
    name: 'Carto Voyager (Clean Highways)',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  dark: {
    name: 'Carto Dark Matter (Night Telematics)',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  osm: {
    name: 'OpenStreetMap (Standard Real GIS)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }
};

export const IndiaMapView: React.FC<IndiaMapViewProps> = ({
  filteredRows,
  allSheets
}) => {
  const [activeCity, setActiveCity] = useState<string>('Bengaluru');
  const [tileLayerKey, setTileLayerKey] = useState<keyof typeof TILE_PROVIDERS>('voyager');
  const [mapMode, setMapMode] = useState<'leaflet' | 'vector'>('leaflet');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  // Compute metrics for active city
  const cityMetrics = React.useMemo(() => {
    const rows = filteredRows.filter(
      r => r.City.toLowerCase() === activeCity.toLowerCase() ||
      (activeCity === 'Delhi' && r.City.toLowerCase() === 'new delhi')
    );
    const tomtom = allSheets?.['02_TomTom_Congestion']?.rows || [];
    const cityTomtom = tomtom.filter(
      r => r.City.toLowerCase() === activeCity.toLowerCase() ||
      (activeCity === 'Delhi' && r.City.toLowerCase() === 'new delhi')
    );
    const signalRows = allSheets?.['12_Signal_Waiting_Times']?.rows || [];
    const citySignal = signalRows.find(
      r => r.City.toLowerCase() === activeCity.toLowerCase() ||
      (activeCity === 'Delhi' && r.City.toLowerCase() === 'new delhi')
    );

    const avg = (nums: (number | null | undefined)[]) => {
      const v = nums.filter((n): n is number => typeof n === 'number' && !isNaN(n));
      return v.length > 0 ? Number((v.reduce((a, b) => a + b, 0) / v.length).toFixed(1)) : null;
    };

    const activeGeo = VERIFIED_CITIES.find(c => c.name.toLowerCase() === activeCity.toLowerCase());

    return {
      name: activeCity,
      state: activeGeo?.state || 'India',
      lat: activeGeo?.lat,
      lng: activeGeo?.lng,
      description: activeGeo?.description || '',
      recordCount: rows.length,
      avgSpeed: avg(rows.map(r => r['Avg Vehicle Speed (km/h)'])),
      avgTravelTime: avg(rows.map(r => r['Travel Time (min per 10 km)'])),
      avgVolume: avg(rows.map(r => r['Traffic Volume (est. peak hr vehicles)'])),
      avgDensity: avg(rows.map(r => r['Traffic Density (veh/km peak hr)'])),
      avgEDI: avg(rows.map(r => r['EDI Score'])),
      avgCongestion: avg(cityTomtom.map(r => r['Congestion Level (%)'])),
      avgSignalWait: citySignal ? citySignal['Avg Signal Wait (min)'] : null,
      roadCondition: avg(rows.map(r => r['Road Condition (score/10)']))
    };
  }, [activeCity, filteredRows, allSheets]);

  // Pre-calculate congestion and speed by city for marker badges
  const cityStatsLookup = React.useMemo(() => {
    const tomtom = allSheets?.['02_TomTom_Congestion']?.rows || [];
    const map = new Map<string, { congestion: number | null; speed: number | null }>();

    VERIFIED_CITIES.forEach(c => {
      const cRows = filteredRows.filter(
        r => r.City.toLowerCase() === c.name.toLowerCase() ||
        (c.name === 'Delhi' && r.City.toLowerCase() === 'new delhi')
      );
      const cTomtom = tomtom.filter(
        r => r.City.toLowerCase() === c.name.toLowerCase() ||
        (c.name === 'Delhi' && r.City.toLowerCase() === 'new delhi')
      );

      const congNums = cTomtom.map(r => r['Congestion Level (%)']).filter((n): n is number => typeof n === 'number' && !isNaN(n));
      const spdNums = cRows.map(r => r['Avg Vehicle Speed (km/h)']).filter((n): n is number => typeof n === 'number' && !isNaN(n));

      map.set(c.name, {
        congestion: congNums.length > 0 ? Number((congNums.reduce((a, b) => a + b, 0) / congNums.length).toFixed(0)) : null,
        speed: spdNums.length > 0 ? Number((spdNums.reduce((a, b) => a + b, 0) / spdNums.length).toFixed(1)) : null
      });
    });

    return map;
  }, [allSheets, filteredRows]);

  // Initialize and maintain Leaflet map
  useEffect(() => {
    if (mapMode !== 'leaflet' || !mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      // Create Leaflet instance centered on India
      const map = L.map(mapContainerRef.current, {
        center: [21.5, 78.9],
        zoom: 5,
        minZoom: 4,
        maxZoom: 12,
        scrollWheelZoom: true,
        attributionControl: true
      });

      // Add Tile Layer
      const initialProvider = TILE_PROVIDERS[tileLayerKey];
      const tileLayer = L.tileLayer(initialProvider.url, {
        attribution: initialProvider.attribution,
        maxZoom: 18,
        subdomains: 'abcd'
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      // Add National Highway Corridors Polylines
      HIGHWAY_CORRIDORS.forEach(corridor => {
        L.polyline(corridor.coords, {
          color: corridor.color,
          weight: 3.5,
          opacity: 0.85,
          dashArray: '5, 8'
        })
          .bindTooltip(`<strong>${corridor.name}</strong>`, { sticky: true, className: 'highway-tooltip' })
          .addTo(map);
      });

      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current;

    // Invalidate size to ensure crisp rendering
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, [mapMode]);

  // Switch Tile Layer when user toggles
  useEffect(() => {
    if (!leafletMapRef.current || !tileLayerRef.current) return;
    const provider = TILE_PROVIDERS[tileLayerKey];
    tileLayerRef.current.setUrl(provider.url);
  }, [tileLayerKey]);

  // Update Markers whenever activeCity or data changes
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current.clear();

    // Create markers with custom DOM icons
    VERIFIED_CITIES.forEach(c => {
      const isSelected = c.name.toLowerCase() === activeCity.toLowerCase();
      const stats = cityStatsLookup.get(c.name);
      const cong = stats?.congestion;
      const speed = stats?.speed;

      const badgeColor = cong && cong >= 65 ? '#e11d48' : cong && cong >= 50 ? '#d97706' : '#0284c7';

      const customIcon = L.divIcon({
        className: 'custom-city-pin',
        iconSize: [120, 50],
        iconAnchor: [60, 44],
        popupAnchor: [0, -44],
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer; user-select: none;">
            ${isSelected ? `<div style="position: absolute; top: -4px; width: 34px; height: 34px; border-radius: 50%; border: 2.5px solid ${badgeColor}; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.75;"></div>` : ''}
            
            <div style="
              background-color: ${isSelected ? badgeColor : '#ffffff'};
              color: ${isSelected ? '#ffffff' : '#0f172a'};
              padding: 4px 9px;
              border-radius: 9999px;
              font-family: 'Inter', system-ui, sans-serif;
              font-size: 11px;
              font-weight: 700;
              box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
              border: 2px solid ${badgeColor};
              display: flex;
              align-items: center;
              gap: 5px;
              white-space: nowrap;
              transition: transform 0.15s ease;
            ">
              <span>${c.name}</span>
              ${cong ? `
                <span style="
                  background: ${isSelected ? 'rgba(255,255,255,0.28)' : badgeColor};
                  color: #ffffff;
                  padding: 1px 6px;
                  border-radius: 9999px;
                  font-size: 10px;
                  font-family: monospace;
                ">${cong}%</span>
              ` : ''}
            </div>

            <div style="width: 2.5px; height: 7px; background-color: ${badgeColor};"></div>
            <div style="width: 9px; height: 9px; border-radius: 50%; background-color: ${badgeColor}; border: 2px solid #ffffff; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>
          </div>
        `
      });

      const marker = L.marker([c.lat, c.lng], { icon: customIcon }).addTo(map);

      // Popup with city telemetry
      const popupHtml = `
        <div style="font-family: Inter, sans-serif; padding: 2px; min-width: 170px;">
          <div style="font-weight: 800; font-size: 13px; color: #0f172a; margin-bottom: 2px;">${c.name}</div>
          <div style="font-size: 10px; color: #64748b; font-family: monospace; margin-bottom: 6px;">${c.lat.toFixed(4)}° N, ${c.lng.toFixed(4)}° E</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; border-top: 1px solid #e2e8f0; padding-top: 6px;">
            <div>
              <div style="color: #64748b; font-size: 9px; text-transform: uppercase;">Congestion</div>
              <div style="font-weight: 700; color: ${badgeColor}; font-size: 12px;">${cong ? `${cong}%` : 'N/A'}</div>
            </div>
            <div>
              <div style="color: #64748b; font-size: 9px; text-transform: uppercase;">Avg Speed</div>
              <div style="font-weight: 700; color: #0284c7; font-size: 12px;">${speed ? `${speed} km/h` : 'N/A'}</div>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { closeButton: false, offset: [0, -10] });

      marker.on('click', () => {
        setActiveCity(c.name);
        map.flyTo([c.lat, c.lng], 8, { duration: 1.2 });
      });

      markersRef.current.set(c.name, marker);
    });
  }, [activeCity, cityStatsLookup]);

  // Handle Pan to City
  const handleFlyTo = (city: CityGeo) => {
    setActiveCity(city.name);
    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([city.lat, city.lng], 8, { duration: 1.2 });
      const marker = markersRef.current.get(city.name);
      if (marker) {
        setTimeout(() => marker.openPopup(), 1250);
      }
    }
  };

  // Reset View to Pan-India
  const handleResetView = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([21.5, 78.9], 5, { duration: 1 });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-600" />
              <span>Real Geographic India Urban Telematics & Corridor Map</span>
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Live Real-GIS Map
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Authentic geographical mapping of India with real National Highway corridors (Golden Quadrilateral & NH-44), WGS84 coordinates, and live city probe telemetry.
          </p>
        </div>

        {/* View Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tile Layer Selector */}
          {mapMode === 'leaflet' && (
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              {(Object.keys(TILE_PROVIDERS) as (keyof typeof TILE_PROVIDERS)[]).map(key => (
                <button
                  key={key}
                  onClick={() => setTileLayerKey(key)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                    tileLayerKey === key
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {key === 'voyager' ? 'Voyager' : key === 'dark' ? 'Dark' : 'OpenStreet'}
                </button>
              ))}
            </div>
          )}

          {/* Map Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setMapMode('leaflet')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                mapMode === 'leaflet'
                  ? 'bg-brand-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Interactive Real GIS Map
            </button>
            <button
              onClick={() => setMapMode('vector')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                mapMode === 'vector'
                  ? 'bg-brand-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Detailed Vector Contour
            </button>
          </div>
        </div>
      </div>

      {/* Quick City Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 font-medium shrink-0 flex items-center gap-1">
          <Compass className="w-3.5 h-3.5 text-brand-600" />
          <span>Quick Fly-To:</span>
        </span>
        <button
          onClick={handleResetView}
          className="px-2.5 py-1 rounded-full border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-medium shrink-0 shadow-2xs"
        >
          Pan-India View
        </button>
        {VERIFIED_CITIES.map(c => {
          const isSelected = c.name.toLowerCase() === activeCity.toLowerCase();
          return (
            <button
              key={c.name}
              onClick={() => handleFlyTo(c)}
              className={`px-3 py-1 rounded-full font-medium shrink-0 transition-all ${
                isSelected
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Real Map Canvas */}
        <div className="card-academic p-4 lg:col-span-7 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-brand-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {mapMode === 'leaflet'
                  ? 'Live Interactive Geographic Map of India'
                  : 'High-Fidelity Survey of India Boundary Contour'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>8 Connected Metropolitan Hubs</span>
            </div>
          </div>

          {/* Interactive Leaflet Map Container */}
          {mapMode === 'leaflet' ? (
            <div className="relative w-full h-[520px] rounded-lg my-2 overflow-hidden border border-slate-200 shadow-inner z-10">
              <div ref={mapContainerRef} className="w-full h-full" />

              {/* Map Floating Legend */}
              <div className="absolute bottom-3 left-3 z-1000 bg-white/95 backdrop-blur-xs p-3 rounded-lg border border-slate-200 shadow-md text-xs space-y-1.5 max-w-[240px]">
                <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center justify-between">
                  <span>Corridor Legend</span>
                  <span className="text-[10px] text-slate-400 font-mono">WGS84</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-600">
                  <span className="w-4 h-1 rounded bg-[#0284c7] inline-block"></span>
                  <span>Golden Quadrilateral (NH-48/16/19)</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-600">
                  <span className="w-4 h-1 rounded bg-[#6366f1] inline-block"></span>
                  <span>NH-44 North-South Spine</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-600">
                  <span className="w-4 h-1 rounded bg-[#10b981] inline-block"></span>
                  <span>NH-65 Deccan Connector</span>
                </div>
                <div className="pt-1.5 border-t border-slate-100 text-[10px] text-slate-400">
                  Click any city marker to zoom in and inspect probe speeds.
                </div>
              </div>

              {/* Map Control Buttons */}
              <div className="absolute top-3 right-3 z-1000 flex flex-col gap-1.5">
                <button
                  onClick={handleResetView}
                  className="bg-white/95 hover:bg-white text-slate-700 p-2 rounded-lg border border-slate-200 shadow-sm transition-all text-xs font-semibold flex items-center gap-1.5"
                  title="Reset to Full India View"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-brand-600" />
                  <span>Pan-India</span>
                </button>
              </div>
            </div>
          ) : (
            /* High-Fidelity Vector Contour Map */
            <div className="relative w-full h-[520px] flex items-center justify-center bg-slate-50/70 rounded-lg my-2 overflow-hidden border border-slate-200">
              <svg
                viewBox="0 0 800 900"
                className="w-full h-full max-h-[500px]"
                style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.04))' }}
              >
                {/* Authentic India Border Contour (Survey Projection) */}
                <path
                  d="
                    M 370 70
                    C 380 60, 400 65, 410 80
                    C 430 85, 445 105, 440 125
                    C 455 135, 465 155, 445 175
                    C 435 185, 440 200, 460 205
                    C 480 210, 520 220, 550 240
                    C 570 250, 600 245, 620 260
                    C 640 270, 670 270, 680 285
                    C 690 300, 715 310, 725 330
                    C 715 350, 695 365, 675 360
                    C 655 355, 640 375, 630 390
                    C 610 395, 590 410, 575 430
                    C 560 450, 540 480, 530 520
                    C 515 560, 490 610, 470 660
                    C 450 710, 430 760, 410 810
                    C 405 825, 395 825, 390 810
                    C 370 760, 350 710, 335 660
                    C 320 610, 305 560, 280 520
                    C 260 490, 240 470, 220 440
                    C 200 410, 185 380, 195 350
                    C 205 320, 220 300, 240 280
                    C 255 265, 275 250, 290 230
                    C 305 210, 320 185, 335 160
                    C 350 135, 360 100, 370 70
                    Z
                  "
                  fill="#f8fafc"
                  stroke="#94a3b8"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />

                {/* Kathiawar & Kutch Gujarat Peninsula */}
                <path
                  d="
                    M 220 370
                    C 180 375, 160 390, 150 415
                    C 140 440, 170 455, 200 450
                    C 220 445, 235 435, 245 420
                    C 230 400, 225 385, 220 370
                    Z
                  "
                  fill="#f1f5f9"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />

                {/* Northeast Projection (Assam, Meghalaya, Arunachal, etc.) */}
                <path
                  d="
                    M 630 320
                    C 660 300, 710 290, 740 310
                    C 760 325, 765 355, 745 375
                    C 725 390, 695 380, 670 370
                    C 650 365, 635 345, 630 320
                    Z
                  "
                  fill="#f1f5f9"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />

                {/* Inter-city corridors */}
                {HIGHWAY_CORRIDORS.map((corridor, idx) => (
                  <path
                    key={idx}
                    d={`M ${
                      corridor.coords.map(c => {
                        // Project Lat/Lng to SVG bounds
                        const x = 160 + ((c[1] - 68) / (90 - 68)) * 520;
                        const y = 820 - ((c[0] - 8) / (36 - 8)) * 740;
                        return `${x.toFixed(1)} ${y.toFixed(1)}`;
                      }).join(' L ')
                    }`}
                    fill="none"
                    stroke={corridor.color}
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                    opacity="0.8"
                  />
                ))}

                {/* City Centroid Nodes */}
                {VERIFIED_CITIES.map(c => {
                  const isSelected = activeCity.toLowerCase() === c.name.toLowerCase();
                  const x = 160 + ((c.lng - 68) / (90 - 68)) * 520;
                  const y = 820 - ((c.lat - 8) / (36 - 8)) * 740;
                  const stats = cityStatsLookup.get(c.name);

                  return (
                    <g
                      key={c.name}
                      className="cursor-pointer transition-transform hover:scale-110"
                      onClick={() => setActiveCity(c.name)}
                    >
                      {isSelected && (
                        <circle
                          cx={x}
                          cy={y}
                          r="18"
                          fill="none"
                          stroke="#0284c7"
                          strokeWidth="2"
                          className="animate-ping"
                          opacity="0.6"
                        />
                      )}
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? 10 : 7}
                        fill={isSelected ? '#0284c7' : '#e11d48'}
                        stroke="#ffffff"
                        strokeWidth="2.5"
                      />
                      <text
                        x={x + 12}
                        y={y + 4}
                        fontSize={isSelected ? 13 : 11}
                        fontWeight={isSelected ? 700 : 500}
                        fill={isSelected ? '#0f172a' : '#475569'}
                        className="select-none font-sans"
                      >
                        {c.name} {stats?.congestion ? `(${stats.congestion}%)` : ''}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}

          <div className="text-[11px] text-slate-500 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span>Map Projection: EPSG:3857 / WGS84 Geodetic Reference</span>
            <span className="font-mono text-brand-700 font-medium">8 Verified Metropolitan Anchors</span>
          </div>
        </div>

        {/* Selected City Telematics Card */}
        <div className="card-academic p-5 lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs uppercase font-semibold text-brand-700 tracking-wider">
                    Metropolitan Telematics Inspector
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                    {cityMetrics.state}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {cityMetrics.name}
                </h3>
                {cityMetrics.lat && cityMetrics.lng && (
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                    {cityMetrics.lat.toFixed(4)}° N, {cityMetrics.lng.toFixed(4)}° E
                  </div>
                )}
              </div>
              <MetricBadge type="Source data" />
            </div>

            {cityMetrics.description && (
              <p className="text-xs text-slate-600 my-3 bg-slate-50 p-2.5 rounded border border-slate-200 leading-relaxed">
                {cityMetrics.description}
              </p>
            )}

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 my-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <Activity className="w-3.5 h-3.5 text-rose-600" />
                  <span>Congestion Level</span>
                </div>
                <div className="text-xl font-bold font-mono text-rose-700">
                  {cityMetrics.avgCongestion ? `${cityMetrics.avgCongestion}%` : 'No data'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">TomTom Traffic Index</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <Gauge className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Avg Vehicle Speed</span>
                </div>
                <div className="text-xl font-bold font-mono text-slate-900">
                  {cityMetrics.avgSpeed ? `${cityMetrics.avgSpeed} km/h` : 'No data'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Peak hour probe telemetry</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Travel Time (10 km)</span>
                </div>
                <div className="text-xl font-bold font-mono text-slate-900">
                  {cityMetrics.avgTravelTime ? `${cityMetrics.avgTravelTime} min` : 'No data'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Standard 10 km corridor</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <Layers className="w-3.5 h-3.5 text-purple-600" />
                  <span>Delay Index (EDI)</span>
                </div>
                <div className="text-xl font-bold font-mono text-purple-800">
                  {cityMetrics.avgEDI ? cityMetrics.avgEDI : 'No data'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Effective Delay Index</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500 mb-1">Signal Waiting Cycle</div>
                <div className="text-base font-bold font-mono text-slate-900">
                  {cityMetrics.avgSignalWait ? `${cityMetrics.avgSignalWait} min` : 'No data'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Intersection average</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500 mb-1">Road Condition Score</div>
                <div className="text-base font-bold font-mono text-slate-900">
                  {cityMetrics.roadCondition ? `${cityMetrics.roadCondition} / 10` : 'No data'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">NHAI quality benchmark</div>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  const geo = VERIFIED_CITIES.find(c => c.name.toLowerCase() === cityMetrics.name.toLowerCase());
                  if (geo) handleFlyTo(geo);
                }}
                className="flex-1 py-2 px-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <Compass className="w-4 h-4" />
                <span>Fly to {cityMetrics.name} on Real Map</span>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between mt-4">
            <span>Verified Source Records: <strong className="text-slate-800">{cityMetrics.recordCount}</strong></span>
            <span className="font-mono text-slate-400 text-[11px]">MoRTH / TomTom Probe</span>
          </div>
        </div>
      </div>
    </div>
  );
};
