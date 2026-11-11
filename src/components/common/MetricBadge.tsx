import React from 'react';

export type MetricType = 'Source data' | 'Derived' | 'Calculated' | 'Source-reported' | 'Unavailable';

interface MetricBadgeProps {
  type: MetricType;
  formula?: string;
  className?: string;
}

export const MetricBadge: React.FC<MetricBadgeProps> = ({ type, formula, className = '' }) => {
  const getStyle = () => {
    switch (type) {
      case 'Source data':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Derived':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Calculated':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Source-reported':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Unavailable':
      default:
        return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium border ${getStyle()} ${className}`}
      title={formula ? `Formula: ${formula}` : undefined}
    >
      {type}
    </span>
  );
};
