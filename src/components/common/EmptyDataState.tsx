import React from 'react';
import { Database } from 'lucide-react';

interface EmptyDataStateProps {
  message?: string;
  subtext?: string;
}

export const EmptyDataState: React.FC<EmptyDataStateProps> = ({
  message = 'No data available for the selected filters.',
  subtext = 'Try adjusting your filter selection (City, Year, Day Type) to display records.'
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-lg border border-dashed border-slate-300 bg-slate-50/50 my-2 min-h-[220px]">
      <div className="p-3 rounded-full bg-slate-100 text-slate-400 mb-2">
        <Database className="w-5 h-5 text-slate-400" />
      </div>
      <p className="text-sm font-semibold text-slate-700">{message}</p>
      {subtext && <p className="text-xs text-slate-400 mt-1 max-w-sm">{subtext}</p>}
    </div>
  );
};
