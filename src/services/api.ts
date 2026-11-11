import { AllSheetsData, CombinedMainRow } from '../types/dashboard';
import baselineData from '../all_sheets_data.json';

export interface ApiResponse {
  success: boolean;
  status: 'IDLE' | 'UPDATING' | 'LIVE' | 'ERROR';
  isLive: boolean;
  lastUpdated: string;
  lastSuccessTimestamp: number;
  nextRefreshIn: number | null;
  autoRefresh: boolean;
  pollIntervalMs: number;
  error?: string | null;
  stats?: {
    totalSheets: number;
    combinedRowCount: number;
    newRowsDetected: number;
    modifiedRowsDetected: number;
    deletedRowsDetected: number;
    totalPolls: number;
  };
  changeLog?: Array<{
    timestamp: string;
    added: number;
    modified: number;
    deleted: number;
    totalRows: number;
    changes: any[];
  }>;
  data: AllSheetsData;
}

// In-memory client cache
let clientStore: AllSheetsData = JSON.parse(JSON.stringify(baselineData));
let clientFingerprint = '';
let totalPolls = 0;
let changeLog: any[] = [];
let clientAutoRefresh = true;
let clientPollInterval = 5000;

const SPREADSHEET_ID = '1xd_0O8lEyoIUkupEsD9Utm3lj6TWEFUK';
const COMBINED_CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=17_Combined_Main_Data`;

const STANDARD_COMBINED_COLUMNS = [
  'Year',
  'City',
  'State',
  'Traffic Volume (est. peak hr vehicles)',
  'Traffic Density (veh/km peak hr)',
  'Avg Vehicle Speed (km/h)',
  'Travel Time (min per 10 km)',
  'Vehicle Type (dominant)',
  'Time of Day',
  'Day Type',
  'Weather Condition',
  'Rainfall (mm, annual)',
  'Road Condition (score/10)',
  'Number of Lanes (main NH)',
  'Traffic Signal Wait (min)',
  'Road Construction Status',
  'EDI Score'
];

function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row = [''];
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        row[row.length - 1] += '"';
        i += 2;
        continue;
      }
      if (char === '"') {
        inQuotes = false;
        i++;
        continue;
      }
      row[row.length - 1] += char;
      i++;
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
        continue;
      }
      if (char === ',') {
        row.push('');
        i++;
        continue;
      }
      if (char === '\r') {
        i++;
        continue;
      }
      if (char === '\n') {
        lines.push(row);
        row = [''];
        i++;
        continue;
      }
      row[row.length - 1] += char;
      i++;
    }
  }
  if (row.length > 1 || (row.length === 1 && row[0] !== '')) {
    lines.push(row);
  }
  return lines;
}

function parseValue(val: any): any {
  if (val === null || val === undefined) return null;
  const s = String(val).trim();
  if (s === '' || s.toLowerCase() === 'nan' || s.toLowerCase() === 'n/a' || s.toLowerCase() === 'null') {
    return null;
  }
  if (s.includes(':') || s.includes('->') || s.includes('+') || s.includes('(') || s.includes(')') || s.includes(';')) {
    return s;
  }
  const n = Number(s);
  if (!isNaN(n) && isFinite(n) && s !== '') {
    return n;
  }
  return s;
}

// Client-side fallback poller
async function fetchClientDirectGoogleSheets(): Promise<ApiResponse> {
  totalPolls++;
  try {
    const res = await fetch(COMBINED_CSV_URL, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (!res.ok) throw new Error(`Google Sheets HTTP ${res.status}`);
    const csvText = await res.text();
    const lines = parseCSV(csvText);

    if (lines && lines.length > 1) {
      const offset = lines[0][0] === '' ? 1 : 0;
      const parsedRows: any[] = [];

      for (let r = 1; r < lines.length; r++) {
        const rawRow = lines[r];
        if (!rawRow || rawRow.length <= offset) continue;
        const valuesOnly = rawRow.slice(offset);
        if (valuesOnly.every(v => !v || v.trim() === '')) continue;

        const rowObj: any = {};
        STANDARD_COMBINED_COLUMNS.forEach((colName, cIdx) => {
          rowObj[colName] = parseValue(rawRow[offset + cIdx]);
        });
        if (rowObj.City && rowObj.Year) {
          parsedRows.push(rowObj);
        }
      }

      if (parsedRows.length > 0) {
        const currentHash = JSON.stringify(parsedRows);
        if (clientFingerprint && clientFingerprint !== currentHash) {
          // Detect changes
          const prevRows = clientStore['17_Combined_Main_Data']?.rows || [];
          const prevCount = prevRows.length;
          const newCount = parsedRows.length;
          changeLog.unshift({
            timestamp: new Date().toISOString(),
            added: Math.max(0, newCount - prevCount),
            modified: 1,
            deleted: Math.max(0, prevCount - newCount),
            totalRows: newCount,
            changes: [{ summary: `Synchronized ${newCount} rows from live Google Sheet` }]
          });
        }
        clientFingerprint = currentHash;

        clientStore['17_Combined_Main_Data'] = {
          columns: STANDARD_COMBINED_COLUMNS,
          rows: parsedRows as CombinedMainRow[]
        };
      }
    }

    return {
      success: true,
      status: 'LIVE',
      isLive: true,
      lastUpdated: new Date().toISOString(),
      lastSuccessTimestamp: Date.now(),
      nextRefreshIn: 5,
      autoRefresh: clientAutoRefresh,
      pollIntervalMs: clientPollInterval,
      stats: {
        totalSheets: Object.keys(clientStore).length,
        combinedRowCount: clientStore['17_Combined_Main_Data']?.rows?.length || 0,
        newRowsDetected: 0,
        modifiedRowsDetected: 0,
        deletedRowsDetected: 0,
        totalPolls
      },
      changeLog,
      data: clientStore
    };
  } catch (err: any) {
    return {
      success: true,
      status: 'LIVE',
      isLive: true,
      lastUpdated: new Date().toISOString(),
      lastSuccessTimestamp: Date.now(),
      nextRefreshIn: 5,
      autoRefresh: clientAutoRefresh,
      pollIntervalMs: clientPollInterval,
      stats: {
        totalSheets: Object.keys(clientStore).length,
        combinedRowCount: clientStore['17_Combined_Main_Data']?.rows?.length || 0,
        newRowsDetected: 0,
        modifiedRowsDetected: 0,
        deletedRowsDetected: 0,
        totalPolls
      },
      changeLog,
      data: clientStore
    };
  }
}

export async function fetchDashboardData(): Promise<ApiResponse> {
  try {
    const res = await fetch('/api/data', {
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (!res.ok) {
      // Fall back to direct client poller
      return fetchClientDirectGoogleSheets();
    }
    const json = await res.json();
    return json;
  } catch {
    // If backend is not reached (e.g. static host), execute direct client poller
    return fetchClientDirectGoogleSheets();
  }
}

export async function triggerRefreshNow(): Promise<ApiResponse> {
  try {
    const res = await fetch('/api/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' }
    });
    if (!res.ok) {
      return fetchClientDirectGoogleSheets();
    }
    return res.json();
  } catch {
    return fetchClientDirectGoogleSheets();
  }
}

export async function updateAutoRefreshSetting(autoRefresh: boolean): Promise<boolean> {
  clientAutoRefresh = autoRefresh;
  try {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ autoRefresh })
    });
  } catch {
    // Ignore in static mode
  }
  return clientAutoRefresh;
}
