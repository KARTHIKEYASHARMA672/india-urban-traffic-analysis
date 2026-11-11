import React from 'react';
import { MetricBadge, MetricType } from '../common/MetricBadge';

interface KPICardProps {
  title: string;
  value: string | number | null | undefined;
  unit?: string;
  metricType: MetricType;
  formula?: string;
  sourceText?: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  unit,
  metricType,
  formula,
  sourceText,
  icon: Icon,
  description
}) => {
  const isAvailable = value !== null && value !== undefined && value !== '';
  const displayValue = isAvailable ? (typeof value === 'number' ? value.toLocaleString() : value) : 'No data';

  return (
    <div className="card-academic p-4 flex flex-col justify-between transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
            {title}
          </span>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className={`text-2xl font-bold tracking-tight font-mono ${isAvailable ? 'text-slate-900' : 'text-slate-400 italic text-lg'}`}>
              {displayValue}
            </span>
            {isAvailable && unit && (
              <span className="text-xs font-medium text-slate-500">{unit}</span>
            )}
          </div>
        </div>

        {Icon && (
          <div className="p-2 rounded-md bg-slate-100 text-slate-600 shrink-0">
            <Icon className="w-4 h-4 text-brand-600" />
          </div>
        )}
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 gap-1">
        <div className="shrink-0">
          <MetricBadge type={metricType} formula={formula} className="whitespace-nowrap" />
        </div>
        {sourceText && (
          <span className="truncate max-w-[130px] font-mono text-[10px] text-slate-600 text-right font-medium" title={sourceText}>
            {sourceText}
          </span>
        )}
      </div>

      {description && (
        <p className="text-[11px] text-slate-500 mt-2 line-clamp-1 leading-normal" title={description}>
          {description}
        </p>
      )}
    </div>
  );
};
