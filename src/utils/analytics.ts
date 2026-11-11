import { CombinedMainRow } from '../types/dashboard';

export interface KPISummary {
  avgSpeed: number | null;
  avgTravelTime: number | null;
  avgVolume: number | null;
  avgDensity: number | null;
  avgSignalWait: number | null;
  avgRoadCondition: number | null;
  avgEDI: number | null;
  avgRainfall: number | null;
  recordCount: number;
}

export function computeKPISummaries(rows: CombinedMainRow[]): KPISummary {
  if (!rows || rows.length === 0) {
    return {
      avgSpeed: null,
      avgTravelTime: null,
      avgVolume: null,
      avgDensity: null,
      avgSignalWait: null,
      avgRoadCondition: null,
      avgEDI: null,
      avgRainfall: null,
      recordCount: 0
    };
  }

  const averageOf = (key: keyof CombinedMainRow): number | null => {
    const valid = rows
      .map(r => r[key])
      .filter((v): v is number => typeof v === 'number' && !isNaN(v) && isFinite(v));
    if (valid.length === 0) return null;
    const sum = valid.reduce((acc, curr) => acc + curr, 0);
    return Number((sum / valid.length).toFixed(1));
  };

  return {
    avgSpeed: averageOf('Avg Vehicle Speed (km/h)'),
    avgTravelTime: averageOf('Travel Time (min per 10 km)'),
    avgVolume: averageOf('Traffic Volume (est. peak hr vehicles)'),
    avgDensity: averageOf('Traffic Density (veh/km peak hr)'),
    avgSignalWait: averageOf('Traffic Signal Wait (min)'),
    avgRoadCondition: averageOf('Road Condition (score/10)'),
    avgEDI: averageOf('EDI Score'),
    avgRainfall: averageOf('Rainfall (mm, annual)'),
    recordCount: rows.length
  };
}

// Compute Pearson correlation matrix
export interface CorrelationCell {
  x: string;
  y: string;
  r: number | null;
  sampleSize: number;
}

export function computeCorrelationMatrix(
  rows: CombinedMainRow[],
  fields: Array<{ key: keyof CombinedMainRow; label: string }>
): { labels: string[]; matrix: (number | null)[][]; details: CorrelationCell[] } {
  const n = fields.length;
  const matrix: (number | null)[][] = Array.from({ length: n }, () => Array(n).fill(null));
  const details: CorrelationCell[] = [];

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 1.0;
        details.push({ x: fields[i].label, y: fields[j].label, r: 1.0, sampleSize: rows.length });
        continue;
      }

      // Collect paired numerical samples
      const pairs: Array<[number, number]> = [];
      rows.forEach(r => {
        const v1 = r[fields[i].key];
        const v2 = r[fields[j].key];
        if (
          typeof v1 === 'number' && !isNaN(v1) && isFinite(v1) &&
          typeof v2 === 'number' && !isNaN(v2) && isFinite(v2)
        ) {
          pairs.push([v1, v2]);
        }
      });

      if (pairs.length < 3) {
        matrix[i][j] = null;
        details.push({ x: fields[i].label, y: fields[j].label, r: null, sampleSize: pairs.length });
        continue;
      }

      const mean1 = pairs.reduce((s, p) => s + p[0], 0) / pairs.length;
      const mean2 = pairs.reduce((s, p) => s + p[1], 0) / pairs.length;

      let num = 0;
      let den1 = 0;
      let den2 = 0;

      pairs.forEach(([p1, p2]) => {
        const d1 = p1 - mean1;
        const d2 = p2 - mean2;
        num += d1 * d2;
        den1 += d1 * d1;
        den2 += d2 * d2;
      });

      const denominator = Math.sqrt(den1 * den2);
      if (denominator === 0) {
        matrix[i][j] = null;
      } else {
        const r = Number((num / denominator).toFixed(2));
        matrix[i][j] = r;
      }

      details.push({
        x: fields[i].label,
        y: fields[j].label,
        r: matrix[i][j],
        sampleSize: pairs.length
      });
    }
  }

  return {
    labels: fields.map(f => f.label),
    matrix,
    details
  };
}

export function formatMetric(val: number | string | null | undefined, unit?: string, fallback = 'No data'): string {
  if (val === null || val === undefined || val === '') {
    return fallback;
  }
  if (typeof val === 'number') {
    return `${val.toLocaleString()}${unit ? ` ${unit}` : ''}`;
  }
  return `${val}${unit ? ` ${unit}` : ''}`;
}
