import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchDashboardData, triggerRefreshNow, updateAutoRefreshSetting, ApiResponse } from '../services/api';
import { AllSheetsData } from '../types/dashboard';

export interface LiveDataHookState {
  data: AllSheetsData | null;
  status: 'LIVE' | 'UPDATING' | 'ERROR';
  isLive: boolean;
  lastUpdated: string | null;
  countdown: number;
  autoRefresh: boolean;
  error: string | null;
  stats: ApiResponse['stats'] | null;
  changeLog: ApiResponse['changeLog'] | null;
  toggleAutoRefresh: () => void;
  refreshNow: () => Promise<void>;
}

export function useLiveData(): LiveDataHookState {
  const [data, setData] = useState<AllSheetsData | null>(null);
  const [status, setStatus] = useState<'LIVE' | 'UPDATING' | 'ERROR'>('UPDATING');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(5);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ApiResponse['stats'] | null>(null);
  const [changeLog, setChangeLog] = useState<ApiResponse['changeLog'] | null>(null);

  const countdownRef = useRef<number>(5);
  const autoRefreshRef = useRef<boolean>(true);
  autoRefreshRef.current = autoRefresh;

  // Fetch function that updates state safely
  const performFetch = useCallback(async (isManual: boolean = false) => {
    try {
      if (isManual) {
        setStatus('UPDATING');
        const res = await triggerRefreshNow();
        if (res.data) {
          setData(res.data);
          setStatus('LIVE');
          setLastUpdated(res.lastUpdated || new Date().toISOString());
          setError(null);
          if (res.stats) setStats(res.stats);
          if (res.changeLog) setChangeLog(res.changeLog);
        }
      } else {
        const res = await fetchDashboardData();
        if (res.data) {
          setData(res.data);
          setStatus(res.status === 'ERROR' ? 'ERROR' : 'LIVE');
          setLastUpdated(res.lastUpdated || new Date().toISOString());
          setError(res.error || null);
          if (res.stats) setStats(res.stats);
          if (res.changeLog) setChangeLog(res.changeLog);
        }
      }
    } catch (err: any) {
      console.warn('[LiveData] Fetch error:', err.message);
      setStatus('ERROR');
      setError(err.message || 'Connection to data server failed');
      // Intentionally do NOT clear data state - retain last successfully retrieved data
    } finally {
      countdownRef.current = 5;
      setCountdown(5);
    }
  }, []);

  // Initial load
  useEffect(() => {
    performFetch(false);
  }, [performFetch]);

  // 1-second interval timer for smooth countdown and 5s polling trigger
  useEffect(() => {
    const timer = setInterval(() => {
      if (!autoRefreshRef.current) return;

      countdownRef.current -= 1;
      if (countdownRef.current <= 0) {
        countdownRef.current = 5;
        setCountdown(5);
        performFetch(false);
      } else {
        setCountdown(countdownRef.current);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [performFetch]);

  // Manual Refresh Now
  const refreshNow = useCallback(async () => {
    countdownRef.current = 5;
    setCountdown(5);
    await performFetch(true);
  }, [performFetch]);

  // Toggle Auto Refresh
  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(prev => {
      const next = !prev;
      updateAutoRefreshSetting(next).catch(() => {});
      if (next) {
        countdownRef.current = 5;
        setCountdown(5);
      }
      return next;
    });
  }, []);

  return {
    data,
    status,
    isLive: status === 'LIVE',
    lastUpdated,
    countdown,
    autoRefresh,
    error,
    stats,
    changeLog,
    toggleAutoRefresh,
    refreshNow
  };
}
