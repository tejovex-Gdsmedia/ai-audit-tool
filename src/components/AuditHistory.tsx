import { useState } from 'react';
import type { HistoricalAudit, AuditReport } from '../types';
import { Search, Trash2, Eye } from 'lucide-react';

interface AuditHistoryProps {
  history: HistoricalAudit[];
  onSelectAudit: (report: AuditReport) => void;
  onDeleteAudit: (reportId: string) => void;
}

export default function AuditHistory({ history, onSelectAudit, onDeleteAudit }: AuditHistoryProps) {
  const [search, setSearch] = useState('');

  const filteredHistory = history.filter(item => {
    return (
      item.companyName.toLowerCase().includes(search.toLowerCase()) ||
      item.taskDescription.toLowerCase().includes(search.toLowerCase()) ||
      item.reportId.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col space-y-4 text-left shadow-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Your Audit History</h3>
          <p className="text-xs text-slate-400">Review your previously generated audits</p>
        </div>
        <span className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-xs px-2.5 py-1 rounded-full font-bold">
          {history.length} Saved
        </span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by company name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:border-indigo-500 transition-all"
        />
      </div>

      {/* List */}
      <div className="overflow-y-auto space-y-2 max-h-[380px] pr-1">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No saved audits found.
          </div>
        ) : (
          filteredHistory.map(item => (
            <div
              key={item.reportId}
              className="p-3 bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10 border border-slate-100 dark:border-slate-850 rounded-xl flex items-center justify-between gap-3 group transition-all"
            >
              <div 
                onClick={() => onSelectAudit(item.report)}
                className="flex-1 cursor-pointer min-w-0"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400">{item.reportId}</span>
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-semibold">
                    {item.department}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate mt-1">
                  {item.companyName}
                </h4>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {item.taskDescription}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onSelectAudit(item.report)}
                  className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors cursor-pointer"
                  title="Open Report"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDeleteAudit(item.reportId)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                  title="Delete Audit"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
