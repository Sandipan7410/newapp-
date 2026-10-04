import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  X,
  ExternalLink,
  ShieldCheck,
  Plus,
  RefreshCw,
} from 'lucide-react';
import type { ExtractedActionItem, SpreadsheetItem } from '../types/index.ts';
import { listGoogleSheets } from '../services/googleWorkspace.ts';

interface SheetConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionItems: ExtractedActionItem[];
  meetingName: string;
  meetingDate: string;
  documentUrl?: string;
  isSampleMode: boolean;
  accessToken: string | null;
  onConfirmAppend: (spreadsheetId: string, sheetTitle: string, newRows: (string | number)[][]) => Promise<void>;
  isProcessing: boolean;
}

export const SheetConfirmationModal: React.FC<SheetConfirmationModalProps> = ({
  isOpen,
  onClose,
  actionItems,
  meetingName,
  meetingDate,
  documentUrl,
  isSampleMode,
  accessToken,
  onConfirmAppend,
  isProcessing,
}) => {
  const [spreadsheets, setSpreadsheets] = useState<SpreadsheetItem[]>([]);
  const [selectedSpreadsheetId, setSelectedSpreadsheetId] = useState<string>('new');
  const [newSpreadsheetTitle, setNewSpreadsheetTitle] = useState<string>(
    `Meeting Action Items - ${meetingName.slice(0, 30)}`
  );
  const [isLoadingSheets, setIsLoadingSheets] = useState(false);

  // Filter approved items
  const approvedItems = actionItems.filter((item) => item.approved);

  // Duplicate detection: split items into Fresh vs Already Synced
  const freshItems = approvedItems.filter((item) => !item.sheetSynced);
  const alreadySyncedItems = approvedItems.filter((item) => item.sheetSynced);

  useEffect(() => {
    if (isOpen && !isSampleMode && accessToken) {
      loadUserSheets();
    }
  }, [isOpen, isSampleMode, accessToken]);

  const loadUserSheets = async () => {
    if (!accessToken) return;
    setIsLoadingSheets(true);
    try {
      const sheets = await listGoogleSheets(accessToken);
      setSpreadsheets(sheets);
    } catch (err) {
      console.error('Failed to load user spreadsheets:', err);
    } finally {
      setIsLoadingSheets(false);
    }
  };

  if (!isOpen) return null;

  const nowIso = new Date().toLocaleString();

  // Prepare exact row representation to be written
  const rowsToAppend = freshItems.map((item) => [
    meetingName,
    meetingDate,
    item.task,
    item.owner,
    item.dueDate,
    item.quote,
    nowIso,
    documentUrl || '',
  ]);

  const handleConfirm = async () => {
    if (freshItems.length === 0) return;
    await onConfirmAppend(selectedSpreadsheetId, newSpreadsheetTitle, rowsToAppend);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Confirm Google Sheets Export
              </h3>
              <p className="text-xs text-slate-500">
                Exact preview of rows and target spreadsheet before write execution.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Target Spreadsheet Destination Selection */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Destination Spreadsheet:
            </label>
            {isSampleMode ? (
              <div className="flex items-center justify-between text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="font-medium">
                  📊 [Demo Sandbox] 'Meeting Action Items' Spreadsheet
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                  Interactive Mock View
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <select
                    value={selectedSpreadsheetId}
                    onChange={(e) => setSelectedSpreadsheetId(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="new">➕ Create New Spreadsheet: "{newSpreadsheetTitle}"</option>
                    {spreadsheets.map((s) => (
                      <option key={s.id} value={s.id}>
                        📄 Existing Sheet: {s.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={loadUserSheets}
                    disabled={isLoadingSheets}
                    className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-600"
                    title="Refresh spreadsheets"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingSheets ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {selectedSpreadsheetId === 'new' && (
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">New Spreadsheet Title:</label>
                    <input
                      type="text"
                      value={newSpreadsheetTitle}
                      onChange={(e) => setNewSpreadsheetTitle(e.target.value)}
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Duplicate Prevention Guard Notice */}
          {alreadySyncedItems.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Duplicate Prevention Active</p>
                <p className="text-[11px] mt-0.5">
                  {alreadySyncedItems.length} action item(s) have already been exported to Sheet during this session. To prevent duplicate rows, they will be skipped automatically.
                </p>
              </div>
            </div>
          )}

          {/* Exact Rows Table Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Rows to be Appended ({freshItems.length}):
              </span>
              <span className="text-[11px] text-slate-500">
                Columns: Meeting, Date, Task, Owner, Due Date, Quote, Approved On
              </span>
            </div>

            {freshItems.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                All approved action items are already synced! No duplicate rows will be written.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 text-slate-600 font-semibold text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Action Item</th>
                      <th className="py-2.5 px-3">Owner</th>
                      <th className="py-2.5 px-3">Due Date</th>
                      <th className="py-2.5 px-3">Source Quote</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {freshItems.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-mono text-slate-400 text-[10px]">{idx + 1}</td>
                        <td className="py-2 px-3 font-medium text-slate-800">{item.task}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              item.owner.toLowerCase().includes('missing')
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.owner}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              item.dueDate.toLowerCase().includes('missing')
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.dueDate}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-500 italic max-w-xs truncate">
                          "{item.quote}"
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={isProcessing || freshItems.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Appending to Spreadsheet...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Append ({freshItems.length} Rows)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
