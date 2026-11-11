export interface CombinedMainRow {
  Year: number;
  City: string;
  State: string;
  'Traffic Volume (est. peak hr vehicles)': number | null;
  'Traffic Density (veh/km peak hr)': number | null;
  'Avg Vehicle Speed (km/h)': number | null;
  'Travel Time (min per 10 km)': number | null;
  'Vehicle Type (dominant)': string | null;
  'Time of Day': string | null;
  'Day Type': string | null;
  'Weather Condition': string | null;
  'Rainfall (mm, annual)': number | null;
  'Road Condition (score/10)': number | null;
  'Number of Lanes (main NH)': string | null;
  'Traffic Signal Wait (min)': number | null;
  'Road Construction Status': string | null;
  'EDI Score': number | null;
}

export interface TomTomRow {
  Year: number;
  City: string;
  State: string;
  'Congestion Level (%)': number | null;
  'World Rank': number | null;
  'Avg Speed Rush Hour (km/h)': number | null;
  'Annual Hours Lost': number | null;
  Source: string;
}

export interface MoRTHAccidentRow {
  Year: number;
  'Total Accidents': number;
  'Persons Killed': number;
  'Persons Injured': number;
  'Accidents per 10000 Vehicles': number | null;
  Source: string;
}

export interface StatewiseAccidentRow {
  'State / UT': string;
  'Accidents 2022': number;
  'Persons Killed 2022': number;
  'Share of Fatalities (%)': number;
  'Road Density (km per 1000 sq km)': number | null;
  Source: string;
}

export interface RainfallIMDRow {
  City: string;
  'IMD Station': string;
  Year: number;
  'Annual Rainfall (mm)': number;
  Source: string;
}

export interface NHAIHighwayRow {
  'Year (FY)': string | number;
  'NH Constructed (km)': number;
  'Avg km per Day': number;
  'Total NH Length (km)': number;
  Source: string;
}

export interface ExpresswayRow {
  'Expressway Name': string;
  State: string;
  'Opened (Year)': number;
  'Length (km)': number;
  Lanes: number | string;
  Source: string;
}

export interface MetroOpeningRow {
  City: string;
  'Opened (Date)': string;
  'Initial Network Length (km)': number;
  Source: string;
}

export interface RegisteredVehicleRow {
  Year: number;
  'Total Registered Vehicles (crore)': number;
  'Two-wheeler Share (%)': number;
  'Car Share (%)': number;
  Source: string;
}

export interface VehicleCompositionRow {
  'Vehicle Type': string;
  '% of Total Fleet (India Avg)': number;
  '% Share Peak Hour Urban': number;
  Source: string;
}

export interface HighwayLaneRow {
  Highway: string;
  Route: string;
  'Length (km)': number;
  'Lane Configuration (2024)': string;
  Source: string;
}

export interface SignalWaitRow {
  City: string;
  'Avg Signal Wait (min)': number;
  'Longest Intersection Wait (min)': number;
  Source: string;
}

export interface TimeOfDayRow {
  'Time Window': string;
  'Day Type': string;
  'Typical Congestion (%)': number;
  'Typical Speed (km/h)': number;
  Source: string;
}

export interface WeatherImpactRow {
  'Weather Condition': string;
  'Congestion Increase (%)': number;
  'Speed Reduction (%)': number;
  'Accident Risk Factor (×)': number;
  Source: string;
}

export interface RoadConditionRow {
  'State / UT': string;
  'Total Road Length (km)': number;
  'Road Quality Score (out of 10)': number;
  'Pothole Incidents Reported (annual)': number;
  'Active Road Construction Projects': string;
  Source: string;
}

export interface EDIPRow {
  City: string;
  Year: number;
  'Congestion Level (%)': number;
  'Annual Hours Lost': number;
  'EDI Score (computed)': number;
  'Source / Formula': string;
}

export interface ValidationRow {
  '#': number;
  'Claim / Data Point': string;
  'Verified Value': string;
  'Source URL 1': string;
  'Source URL 2'?: string;
  Status: string;
}

export interface SourceRow {
  '#': number;
  'Source Name': string;
  Type: string;
  URL: string;
  Description: string;
}

export interface AllSheetsData {
  '01_Overview'?: { rows: any[] };
  '02_TomTom_Congestion'?: { rows: TomTomRow[] };
  '03_MoRTH_Accidents'?: { rows: MoRTHAccidentRow[] };
  '04_Statewise_Accidents'?: { rows: StatewiseAccidentRow[] };
  '05_Rainfall_IMD'?: { rows: RainfallIMDRow[] };
  '06_NHAI_Highways'?: { rows: NHAIHighwayRow[] };
  '07_Expressways'?: { rows: ExpresswayRow[] };
  '08_Metro_Openings'?: { rows: MetroOpeningRow[] };
  '09_Registered_Vehicles'?: { rows: RegisteredVehicleRow[] };
  '10_Vehicle_Type_Composition'?: { rows: VehicleCompositionRow[] };
  '11_National_Highway_Lanes'?: { rows: HighwayLaneRow[] };
  '12_Signal_Waiting_Times'?: { rows: SignalWaitRow[] };
  '13_Time_of_Day_Pattern'?: { rows: TimeOfDayRow[] };
  '14_Weather_Impact'?: { rows: WeatherImpactRow[] };
  '15_Road_Condition'?: { rows: RoadConditionRow[] };
  '16_EDI_Parameters'?: { rows: EDIPRow[] };
  '17_Combined_Main_Data'?: { rows: CombinedMainRow[]; columns: string[] };
  '18_Validation_Sheet'?: { rows: ValidationRow[] };
  '19_Sources_Bibliography'?: { rows: SourceRow[] };
}

export interface GlobalFiltersState {
  year: string;
  city: string;
  state: string;
  vehicleType: string;
  timeOfDay: string;
  dayType: string;
  weatherCondition: string;
  roadCondition: string;
  roadConstructionStatus: string;
}

export type TabId = 
  | 'overview'
  | 'congestion'
  | 'city-comparison'
  | 'traffic-volume-density'
  | 'speed-travel-time'
  | 'vehicle-analysis'
  | 'time-of-day'
  | 'weather-rainfall'
  | 'road-condition'
  | 'infrastructure'
  | 'traffic-signals'
  | 'road-safety'
  | 'edi-analysis'
  | 'correlation'
  | 'india-map'
  | 'data-explorer'
  | 'data-quality'
  | 'sources'
  | 'data-dictionary';
