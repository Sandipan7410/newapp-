import React from 'react';
import { FileSpreadsheet, X, Download, Trash2, CheckCircle2, ExternalLink } from 'lucide-react';

interface MockSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  rows: (string | number)[][];
  onClearRows: () => void;
}

export const MockSheetModal: React.FC<MockSheetModalProps> = ({
  isOpen,
  onClose,
  rows,
  onClearRows,
}) => {
  if (!isOpen) return null;

  const headers = [
    'Meeting Name',
    'Meeting Date',
    'Action Item',
    'Owner',
    'Due Date',
    'Source Quote',
    'Approved On',
    'Source Doc',
  ];

  const exportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers, ...rows]
        .map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'meeting_action_items_demo.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-5xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Google Sheets Header Mockup */}
        <div className="bg-emerald-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center text-white">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">Meeting Action Items Tracker.xlsx</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-800 text-emerald-200">
                  Live Sheet Sandbox
                </span>
              </div>
              <p className="text-[11px] text-emerald-200">
                Tab: <span className="font-semibold underline">Action Items</span> • {rows.length} rows written
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCsv}
              disabled={rows.length === 0}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-xs font-semibold text-white transition disabled:opacity-50"
              title="Download as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            {rows.length > 0 && (
              <button
                onClick={onClearRows}
                className="p-1.5 text-emerald-200 hover:text-white rounded-lg transition"
                title="Clear demo sheet rows"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-emerald-200 hover:text-white rounded-lg transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Spreadsheet Grid Viewer */}
        <div className="flex-1 overflow-auto bg-slate-50 font-sans text-xs">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-200/90 text-slate-700 sticky top-0 border-b border-slate-300">
                <th className="w-10 py-1.5 px-2 border-r border-slate-300 text-center font-mono text-[10px] text-slate-500 bg-slate-200">
                  #
                </th>
                {headers.map((h, i) => (
                  <th
                    key={i}
                    className="py-1.5 px-3 border-r border-slate-300 text-left font-bold text-slate-800 uppercase tracking-tight text-[11px]"
                  >
                    {String.fromCharCode(65 + i)}: {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={headers.length + 1} className="py-16 text-center text-slate-400">
                    <p className="font-semibold text-sm text-slate-600">No rows synced yet</p>
                    <p className="text-xs mt-1">
                      In the review table, click <strong>"Add approved actions to Sheet"</strong> to append action items here!
                    </p>
                  </td>
                </tr>
              ) : (
                rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-emerald-50/40">
                    <td className="py-2 px-2 text-center border-r border-slate-200 font-mono text-[10px] text-slate-400 bg-slate-100">
                      {rowIdx + 2}
                    </td>
                    {row.map((cell, colIdx) => (
                      <td
                        key={colIdx}
                        className={`py-2 px-3 border-r border-slate-200 text-slate-800 ${
                          colIdx === 2 ? 'font-medium max-w-xs' : ''
                        } ${
                          colIdx === 3 && String(cell).toLowerCase().includes('missing')
                            ? 'text-amber-800 font-bold bg-amber-50'
                            : ''
                        } ${
                          colIdx === 4 && String(cell).toLowerCase().includes('missing')
                            ? 'text-amber-800 font-bold bg-amber-50'
                            : ''
                        }`}
                      >
                        {String(cell)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
          <span>
            Duplicate protection ensures clicking "Add approved actions to Sheet" twice will never insert duplicate rows.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Close Sheet
          </button>
        </div>
      </div>
    </div>
  );
};
