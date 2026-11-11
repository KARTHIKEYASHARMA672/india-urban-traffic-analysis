import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const SPREADSHEET_ID = '1xd_0O8lEyoIUkupEsD9Utm3lj6TWEFUK';
export const SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit?gid=138312170#gid=138312170`;
const COMBINED_CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=17_Combined_Main_Data`;
const EDI_CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=16_EDI_Parameters`;

export const STANDARD_COMBINED_COLUMNS = [
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

// Baseline data loaded on boot
const baselinePath = path.resolve(__dirname, '../all_sheets_data.json');
let memoryStore = {};

try {
  if (fs.existsSync(baselinePath)) {
    memoryStore = JSON.parse(fs.readFileSync(baselinePath, 'utf-8'));
    console.log('[Sync Engine] Loaded 19 baseline sheets from all_sheets_data.json');
  } else {
    console.warn('[Sync Engine] Warning: all_sheets_data.json not found');
  }
} catch (err) {
  console.error('[Sync Engine] Failed to load baseline:', err);
}

// RFC 4180 CSV parser
function parseCSV(text) {
  const lines = [];
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

function parseValue(val) {
  if (val === null || val === undefined) return null;
  const s = String(val).trim();
  if (s === '' || s.toLowerCase() === 'nan' || s.toLowerCase() === 'n/a' || s.toLowerCase() === 'null') {
    return null;
  }
  // If string contains non-numeric structural characters, preserve as string
  if (s.includes(':') || s.includes('->') || s.includes('+') || s.includes('(') || s.includes(')') || s.includes(';')) {
    return s;
  }
  // Check if valid numeric
  const n = Number(s);
  if (!isNaN(n) && isFinite(n) && s !== '') {
    return n;
  }
  return s;
}

function computeFingerprint(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

// Global state
export const syncState = {
  isLive: true,
  status: 'IDLE', // 'IDLE' | 'UPDATING' | 'LIVE' | 'ERROR'
  lastUpdated: new Date().toISOString(),
  lastSuccessTimestamp: Date.now(),
  lastCheckTimestamp: Date.now(),
  pollIntervalMs: 5000,
  autoRefresh: true,
  retryCount: 0,
  lastError: null,
  combinedFingerprint: '',
  changeLog: [],
  dataStats: {
    totalSheets: Object.keys(memoryStore).length,
    combinedRowCount: memoryStore['17_Combined_Main_Data']?.rowCount || 0,
    newRowsDetected: 0,
    modifiedRowsDetected: 0,
    deletedRowsDetected: 0,
    totalPolls: 0
  }
};

// Set initial fingerprint from baseline so startup doesn't trigger false diffs
if (memoryStore['17_Combined_Main_Data']?.rows) {
  syncState.combinedFingerprint = computeFingerprint(memoryStore['17_Combined_Main_Data'].rows);
}

export function getMemoryStore() {
  return memoryStore;
}

// Convert CSV from Google Sheet into clean Combined Data rows
function processCombinedCSV(csvText) {
  const lines = parseCSV(csvText);
  if (!lines || lines.length < 2) return null;

  // Google Sheet output has col 0 as empty ""
  // Check whether first row or second row is header
  let dataStartIdx = 1;
  let offset = 0;

  // Let's determine column offset
  const firstRow = lines[0];
  if (firstRow[0] === '' && firstRow.length > 1) {
    offset = 1;
  }

  const parsedRows = [];
  for (let r = dataStartIdx; r < lines.length; r++) {
    const rawRow = lines[r];
    if (!rawRow || rawRow.length <= offset) continue;

    // Check if entire row is empty
    const valuesOnly = rawRow.slice(offset);
    if (valuesOnly.every(v => !v || v.trim() === '')) continue;

    const rowObj = {};
    STANDARD_COMBINED_COLUMNS.forEach((colName, cIdx) => {
      const cellVal = rawRow[offset + cIdx];
      rowObj[colName] = parseValue(cellVal);
    });

    if (rowObj.City && rowObj.Year) {
      parsedRows.push(rowObj);
    }
  }

  return {
    columns: STANDARD_COMBINED_COLUMNS,
    rows: parsedRows,
    rowCount: parsedRows.length
  };
}

// Row-level diff algorithm
function diffRows(oldRows, newRows) {
  const makeKey = (r, idx) => `${r.City || ''}_${r.Year || ''}_${r['Time of Day'] || ''}_${idx}`;
  
  // We can match primarily by City + Year + Time of Day
  const makeContentKey = (r) => `${String(r.City).toLowerCase()}_${r.Year}_${String(r['Time of Day'] || '').toLowerCase()}`;

  const oldMap = new Map();
  oldRows.forEach(r => oldMap.set(makeContentKey(r), r));

  const newMap = new Map();
  newRows.forEach(r => newMap.set(makeContentKey(r), r));

  let added = 0;
  let modified = 0;
  let deleted = 0;
  const changes = [];

  for (const [key, newRow] of newMap.entries()) {
    if (!oldMap.has(key)) {
      added++;
      changes.push({
        type: 'ADDED',
        city: newRow.City,
        year: newRow.Year,
        summary: `Added row for ${newRow.City} (${newRow.Year})`
      });
    } else {
      const oldRow = oldMap.get(key);
      const changedFields = [];
      for (const col of STANDARD_COMBINED_COLUMNS) {
        if (JSON.stringify(oldRow[col]) !== JSON.stringify(newRow[col])) {
          changedFields.push({ field: col, oldVal: oldRow[col], newVal: newRow[col] });
        }
      }
      if (changedFields.length > 0) {
        modified++;
        changes.push({
          type: 'MODIFIED',
          city: newRow.City,
          year: newRow.Year,
          changedFields,
          summary: `Updated ${changedFields.length} field(s) in ${newRow.City} (${newRow.Year})`
        });
      }
    }
  }

  for (const [key, oldRow] of oldMap.entries()) {
    if (!newMap.has(key)) {
      deleted++;
      changes.push({
        type: 'DELETED',
        city: oldRow.City,
        year: oldRow.Year,
        summary: `Deleted row for ${oldRow.City} (${oldRow.Year})`
      });
    }
  }

  return { added, modified, deleted, changes };
}

// Polling core
export async function pollGoogleSheet() {
  syncState.status = 'UPDATING';
  syncState.lastCheckTimestamp = Date.now();
  syncState.dataStats.totalPolls++;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(COMBINED_CSV_URL, {
      signal: controller.signal,
      headers: { 'Cache-Control': 'no-cache' }
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const csvText = await response.text();
    const parsed = processCombinedCSV(csvText);

    if (!parsed || parsed.rowCount === 0) {
      throw new Error('Empty CSV received from Google Sheet');
    }

    const newHash = computeFingerprint(parsed.rows);
    const prevRows = memoryStore['17_Combined_Main_Data']?.rows || [];

    if (newHash !== syncState.combinedFingerprint) {
      const { added, modified, deleted, changes } = diffRows(prevRows, parsed.rows);
      console.log(`[Sync Engine] Live data updated: +${added} row(s), ~${modified} modified, -${deleted} deleted.`);

      memoryStore['17_Combined_Main_Data'] = {
        sheet: '17_Combined_Main_Data',
        headerRow: 3,
        columns: parsed.columns,
        rowCount: parsed.rowCount,
        rows: parsed.rows
      };

      syncState.combinedFingerprint = newHash;
      syncState.dataStats.newRowsDetected += added;
      syncState.dataStats.modifiedRowsDetected += modified;
      syncState.dataStats.deletedRowsDetected += deleted;
      syncState.dataStats.combinedRowCount = parsed.rowCount;

      if (changes.length > 0) {
        syncState.changeLog.unshift({
          timestamp: new Date().toISOString(),
          added,
          modified,
          deleted,
          totalRows: parsed.rowCount,
          changes: changes.slice(0, 5)
        });
        if (syncState.changeLog.length > 25) syncState.changeLog.pop();
      }
    }

    syncState.status = 'LIVE';
    syncState.lastUpdated = new Date().toISOString();
    syncState.lastSuccessTimestamp = Date.now();
    syncState.lastError = null;
    syncState.retryCount = 0;

    return { success: true, changed: newHash !== syncState.combinedFingerprint };
  } catch (err) {
    console.error(`[Sync Engine] Poll error: ${err.message}. Retaining cached dataset.`);
    syncState.status = 'ERROR';
    syncState.lastError = err.message;
    syncState.retryCount++;
    return { success: false, error: err.message, showingCached: true };
  }
}

let pollerInterval = null;

export function startLivePoller() {
  if (pollerInterval) clearInterval(pollerInterval);
  console.log(`[Sync Engine] Background poller started (target: ${syncState.pollIntervalMs}ms).`);
  pollGoogleSheet();
  pollerInterval = setInterval(() => {
    if (syncState.autoRefresh) {
      pollGoogleSheet();
    }
  }, syncState.pollIntervalMs);
}

export function stopLivePoller() {
  if (pollerInterval) {
    clearInterval(pollerInterval);
    pollerInterval = null;
  }
}
