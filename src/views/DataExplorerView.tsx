import React, { useState, useMemo } from 'react';
import { AllSheetsData, CombinedMainRow } from '../types/dashboard';
import { MetricBadge } from '../components/common/MetricBadge';
import { 
  Table, 
  Search, 
  Download, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Check, 
  Layers 
} from 'lucide-react';

interface DataExplorerViewProps {
  allSheets: AllSheetsData | null;
  filteredMasterRows: CombinedMainRow[];
  lastUpdated: string | null;
}

export const DataExplorerView: React.FC<DataExplorerViewProps> = ({
  allSheets,
  filteredMasterRows,
  lastUpdated
}) => {
  const [selectedSheetName, setSelectedSheetName] = useState<string>('17_Combined_Main_Data');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<string>('Year');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [showColumnDropdown, setShowColumnDropdown] = useState<boolean>(false);

  // Available sheets list
  const availableSheets = useMemo(() => {
    return allSheets ? Object.keys(allSheets) : [];
  }, [allSheets]);

  // Active raw sheet rows
  const activeSheetRows = useMemo(() => {
    if (!allSheets) return [];
    if (selectedSheetName === '17_Combined_Main_Data') {
      return filteredMasterRows;
    }
    return allSheets[selectedSheetName as keyof AllSheetsData]?.rows || [];
  }, [allSheets, selectedSheetName, filteredMasterRows]);

  // All columns in active sheet
  const allColumns = useMemo(() => {
    if (activeSheetRows.length === 0) return [];
    return Object.keys(activeSheetRows[0]);
  }, [activeSheetRows]);

  // Set initial visible columns
  React.useEffect(() => {
    if (allColumns.length > 0) {
      setVisibleColumns(allColumns.slice(0, 10));
    }
  }, [selectedSheetName, allColumns.length]);

  const toggleColumn = (col: string) => {
    setVisibleColumns(prev => 
      prev.includes(col)
        ? (prev.length > 1 ? prev.filter(c => c !== col) : prev)
        : [...prev, col]
    );
  };

  // Filtered rows by search query
  const searchedRows = useMemo(() => {
    if (!searchQuery.trim()) return activeSheetRows;
    const q = searchQuery.toLowerCase();
    return activeSheetRows.filter((r: any) => {
      return Object.values(r).some(val => 
        val !== null && val !== undefined && String(val).toLowerCase().includes(q)
      );
    });
  }, [activeSheetRows, searchQuery]);

  // Sorted rows
  const sortedRows = useMemo(() => {
    if (!sortField) return searchedRows;
    return [...searchedRows].sort((a: any, b: any) => {
      const va = a[sortField];
      const vb = b[sortField];
      if (va === null || va === undefined) return 1;
      if (vb === null || vb === undefined) return -1;
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDirection === 'asc' ? va - vb : vb - va;
      }
      return sortDirection === 'asc' 
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
  }, [searchedRows, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (sortedRows.length === 0) return;
    const cols = visibleColumns.length > 0 ? visibleColumns : allColumns;
    const headers = cols.join(',');
    const lines = sortedRows.map((r: any) => {
      return cols.map(c => {
        const val = r[c];
        if (val === null || val === undefined) return '""';
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...lines].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${selectedSheetName}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Table className="w-5 h-5 text-brand-600" />
            <span>Interactive Multi-Dataset Explorer</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Full-text search, column filter, multi-sheet inspection, and real-time live synchronization table
          </p>
        </div>

        {/* Sheet Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600">Dataset Sheet:</span>
          <select
            value={selectedSheetName}
            onChange={(e) => {
              setSelectedSheetName(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-semibold max-w-[240px]"
          >
            {availableSheets.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Toolbar Controls */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative min-w-[220px] flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search records across all fields..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:outline-hidden focus:ring-1 focus:ring-brand-500 font-medium text-slate-900"
          />
        </div>

        {/* Stats & Actions */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
            {sortedRows.length} Rows Available
          </span>

          {/* Column Visibility Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowColumnDropdown(!showColumnDropdown)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 font-medium text-slate-700"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>Columns ({visibleColumns.length})</span>
            </button>

            {showColumnDropdown && (
              <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-md shadow-lg z-50 p-2 max-h-64 overflow-y-auto">
                <div className="text-[11px] font-bold text-slate-600 mb-1">Toggle Columns</div>
                {allColumns.map(col => (
                  <label key={col} className="flex items-center gap-2 text-xs py-1 px-1.5 hover:bg-slate-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleColumns.includes(col)}
                      onChange={() => toggleColumn(col)}
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    <span className="truncate">{col}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* CSV Export */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1 px-3 py-1 rounded bg-brand-600 hover:bg-brand-700 text-white font-medium shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="card-academic overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold select-none">
                {visibleColumns.map((col) => (
                  <th
                    key={col}
                    onClick={() => handleSort(col)}
                    className="py-2.5 px-3 whitespace-nowrap cursor-pointer hover:bg-slate-200/80 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col}</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {paginatedRows.length > 0 ? (
                paginatedRows.map((row: any, rIdx: number) => (
                  <tr key={rIdx} className="hover:bg-brand-50/40 transition-colors">
                    {visibleColumns.map((col) => {
                      const val = row[col];
                      const isNull = val === null || val === undefined || val === '';
                      return (
                        <td key={col} className="py-2.5 px-3 whitespace-nowrap text-slate-800">
                          {isNull ? (
                            <span className="text-slate-400 italic font-sans text-[10px]">No data</span>
                          ) : typeof val === 'number' ? (
                            val.toLocaleString()
                          ) : (
                            String(val)
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={visibleColumns.length} className="py-8 text-center text-slate-400 font-sans">
                    No matching records found in {selectedSheetName}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="text-slate-500 font-sans">
            Showing <strong>{sortedRows.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to{' '}
            <strong>{Math.min(currentPage * pageSize, sortedRows.length)}</strong> of <strong>{sortedRows.length}</strong> records
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-300 rounded px-2 py-0.5 font-medium text-slate-700"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>

            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <span className="px-2 font-mono font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
