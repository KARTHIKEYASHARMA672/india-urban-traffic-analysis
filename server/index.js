import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  syncState, 
  getMemoryStore, 
  pollGoogleSheet, 
  startLivePoller 
} from './sheetsSync.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API: Get complete data bundle
app.get('/api/data', (req, res) => {
  const store = getMemoryStore();
  const nextRefreshIn = syncState.autoRefresh 
    ? Math.max(0, Math.ceil((syncState.lastCheckTimestamp + syncState.pollIntervalMs - Date.now()) / 1000))
    : null;

  res.json({
    success: true,
    status: syncState.status,
    isLive: syncState.status === 'LIVE',
    lastUpdated: syncState.lastUpdated,
    lastSuccessTimestamp: syncState.lastSuccessTimestamp,
    nextRefreshIn,
    autoRefresh: syncState.autoRefresh,
    pollIntervalMs: syncState.pollIntervalMs,
    error: syncState.lastError,
    stats: syncState.dataStats,
    changeLog: syncState.changeLog,
    data: store
  });
});

// API: Force refresh now
app.post('/api/refresh', async (req, res) => {
  console.log('[API] Refresh Now requested via manual trigger');
  const result = await pollGoogleSheet();
  const store = getMemoryStore();
  
  res.json({
    success: result.success,
    status: syncState.status,
    lastUpdated: syncState.lastUpdated,
    error: syncState.lastError,
    stats: syncState.dataStats,
    changeLog: syncState.changeLog,
    data: store
  });
});

// API: Live status healthcheck
app.get('/api/status', (req, res) => {
  res.json({
    status: syncState.status,
    isLive: syncState.status === 'LIVE',
    lastUpdated: syncState.lastUpdated,
    autoRefresh: syncState.autoRefresh,
    error: syncState.lastError,
    retryCount: syncState.retryCount,
    stats: syncState.dataStats
  });
});

// API: Settings toggle
app.post('/api/settings', (req, res) => {
  const { autoRefresh, pollIntervalMs } = req.body;
  if (typeof autoRefresh === 'boolean') {
    syncState.autoRefresh = autoRefresh;
    console.log(`[API] AutoRefresh toggled to: ${autoRefresh}`);
  }
  if (typeof pollIntervalMs === 'number' && pollIntervalMs >= 1000) {
    syncState.pollIntervalMs = pollIntervalMs;
  }
  res.json({
    success: true,
    autoRefresh: syncState.autoRefresh,
    pollIntervalMs: syncState.pollIntervalMs
  });
});

// Serve frontend static assets from dist
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback all other routes to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start Express server and background poller
app.listen(PORT, () => {
  console.log(`[Express Server] Server running on http://localhost:${PORT}`);
  startLivePoller();
});
