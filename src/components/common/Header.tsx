import React from 'react';
import { RefreshCw, Radio, CheckCircle, AlertCircle, Database } from 'lucide-react';
import { LiveDataHookState } from '../../hooks/useLiveData';

interface HeaderProps {
  liveState: LiveDataHookState;
}

export const Header: React.FC<HeaderProps> = ({ liveState }) => {
  const {
    status,
    lastUpdated,
    countdown,
    autoRefresh,
    error,
    toggleAutoRefresh,
    refreshNow
  } = liveState;

  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })
    : '--:--:--';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 lg:px-6 py-3 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Title and Subtitle */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-slate-900 truncate">
              India Urban Traffic Congestion Pattern Analysis
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
              <Database className="w-3 h-3 text-brand-600" />
              SOURCE: Google Sheets
            </span>
          </div>
          <p className="text-xs lg:text-sm text-slate-500 font-normal mt-0.5 truncate">
            2015–2025 | Data-driven analysis of traffic congestion, mobility, road conditions and urban transport patterns in India
          </p>
        </div>

        {/* Live Controls & Telemetry */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          {/* Live Status Badge */}
          <div className="flex items-center">
            {status === 'LIVE' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 font-semibold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-live" />
                <span>LIVE</span>
              </span>
            )}
            {status === 'UPDATING' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 font-semibold">
                <RefreshCw className="w-3 h-3 text-amber-600 animate-spin" />
                <span>UPDATING...</span>
              </span>
            )}
            {status === 'ERROR' && (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-300 text-rose-800 font-semibold"
                title={error ? `${error} - Showing last successfully retrieved data` : 'Connection Error'}
              >
                <AlertCircle className="w-3 h-3 text-rose-600" />
                <span>CONNECTION ERROR</span>
              </span>
            )}
          </div>

          {/* Timestamp and Countdown */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono">
            <span>Last Updated: <strong className="font-semibold">{formattedTime}</strong></span>
            <span className="text-slate-300">|</span>
            <span>Next Refresh: <strong className="font-semibold text-brand-700">{autoRefresh ? `${countdown}s` : 'Paused'}</strong></span>
          </div>

          {/* Auto Refresh Toggle */}
          <button
            onClick={toggleAutoRefresh}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border font-medium transition-colors ${
              autoRefresh
                ? 'bg-brand-50 border-brand-300 text-brand-800 hover:bg-brand-100'
                : 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200'
            }`}
            title={autoRefresh ? 'Click to pause automatic polling' : 'Click to enable 5s auto refresh'}
          >
            <Radio className={`w-3.5 h-3.5 ${autoRefresh ? 'text-brand-600' : 'text-slate-400'}`} />
            <span>Auto Refresh: <strong>{autoRefresh ? 'ON' : 'OFF'}</strong></span>
          </button>

          {/* Refresh Now Button */}
          <button
            onClick={refreshNow}
            disabled={status === 'UPDATING'}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-brand-600 hover:bg-brand-700 text-white font-medium shadow-xs disabled:opacity-50 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${status === 'UPDATING' ? 'animate-spin' : ''}`} />
            <span>Refresh Now</span>
          </button>
        </div>
      </div>

      {/* Warning banner if running on cached data after error */}
      {status === 'ERROR' && (
        <div className="mt-2 text-[11px] text-rose-700 bg-rose-50 px-3 py-1 rounded border border-rose-200 flex items-center justify-between">
          <span>
            ⚠️ <strong>Connection Error:</strong> Showing last successfully retrieved data. The system will automatically retry on the next 5-second cycle.
          </span>
          <span className="font-mono text-xs">{countdown}s until retry</span>
        </div>
      )}
    </header>
  );
};
