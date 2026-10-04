import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  AlertCircle,
  Calendar,
  FileSpreadsheet,
  Trash2,
  Plus,
  ExternalLink,
  Quote,
  CheckCircle2,
  Clock,
  UserCheck,
  Edit2,
  Info,
} from 'lucide-react';
import type { ExtractedActionItem } from '../types/index.ts';

interface ReviewTableProps {
  actionItems: ExtractedActionItem[];
  onUpdateActionItem: (updated: ExtractedActionItem) => void;
  onDeleteActionItem: (id: string) => void;
  onAddActionItem: () => void;
  documentUrl?: string;
  onOpenSheetModal: () => void;
  onOpenCalendarModal: () => void;
  isProcessingSheet: boolean;
  isProcessingCalendar: boolean;
}

export const ReviewTable: React.FC<ReviewTableProps> = ({
  actionItems,
  onUpdateActionItem,
  onDeleteActionItem,
  onAddActionItem,
  documentUrl,
  onOpenSheetModal,
  onOpenCalendarModal,
  isProcessingSheet,
  isProcessingCalendar,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(actionItems.map((a) => a.id)));
  const [expandedQuoteId, setExpandedQuoteId] = useState<string | null>(null);

  // Sync selectedIds if actionItems change
  React.useEffect(() => {
    setSelectedIds(new Set(actionItems.filter((a) => a.approved).map((a) => a.id)));
  }, [actionItems.length]);

  const toggleSelectAll = () => {
    if (selectedIds.size === actionItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(actionItems.map((a) => a.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const selectedItems = actionItems.filter((item) => selectedIds.has(item.id));
  const approvedSelectedItems = selectedItems.filter((item) => item.approved);

  // Calendar eligible items: must have a confirmed date (NOT Missing and not empty)
  const calendarEligibleSelectedItems = selectedItems.filter(
    (item) => item.dueDate && item.dueDate.trim() !== '' && !item.dueDate.toLowerCase().includes('missing')
  );

  const missingDateSelectedCount = selectedItems.length - calendarEligibleSelectedItems.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden mb-6">
      {/* Table Header & Controls Bar */}
      <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base">
              Action Items Review & Approval
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              {actionItems.length} items
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Review, correct owners and dates, or remove items before syncing. Missing data is strictly flagged.
          </p>
        </div>

        {/* Action Buttons Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onAddActionItem}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Action Item</span>
          </button>

          {/* Add approved actions to Sheet */}
          <button
            type="button"
            onClick={onOpenSheetModal}
            disabled={isProcessingSheet || approvedSelectedItems.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm shadow-emerald-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Appends approved action items to a Google Sheet with duplicate protection"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Add approved actions to Sheet</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-800/50 text-emerald-100 text-[10px] font-bold">
              {approvedSelectedItems.length}
            </span>
          </button>

          {/* Create selected Calendar events */}
          <div className="relative group">
            <button
              type="button"
              onClick={onOpenCalendarModal}
              disabled={isProcessingCalendar || calendarEligibleSelectedItems.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                missingDateSelectedCount > 0
                  ? `${missingDateSelectedCount} selected item(s) have Missing due dates and cannot be scheduled.`
                  : 'Schedules confirmed deadline events in Google Calendar'
              }
            >
              <Calendar className="w-4 h-4" />
              <span>Create selected Calendar events</span>
              <span className="px-1.5 py-0.2 rounded-full bg-blue-800/50 text-blue-100 text-[10px] font-bold">
                {calendarEligibleSelectedItems.length}
              </span>
            </button>

            {missingDateSelectedCount > 0 && selectedItems.length > 0 && (
              <div className="absolute right-0 top-full mt-1.5 hidden group-hover:block z-20 w-64 p-2 bg-slate-900 text-white text-[11px] rounded-lg shadow-lg">
                ⚠️ {missingDateSelectedCount} selected item(s) have a <strong className="text-amber-300">Missing</strong> date. Calendar events will only be created for items with confirmed dates.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info notice about strict attribution */}
      <div className="bg-indigo-50/60 border-b border-indigo-100 px-5 py-2 flex items-center justify-between text-[11px] text-indigo-900">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span>
            <strong>Auditing Guardrail Active:</strong> Owners and dates are marked as{' '}
            <span className="font-bold underline text-amber-800">Missing</span> whenever unstated in the source notes. You can edit any field directly in the table.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSelectAll}
            className="text-indigo-700 hover:text-indigo-900 font-semibold underline"
          >
            {selectedIds.size === actionItems.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      </div>

      {/* Table Component */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200 uppercase tracking-wider font-semibold text-[11px]">
            <tr>
              <th className="py-3 px-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={actionItems.length > 0 && selectedIds.size === actionItems.length}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              <th className="py-3 px-3 w-16 text-center">Approval</th>
              <th className="py-3 px-4 min-w-[260px]">Action Item / Task</th>
              <th className="py-3 px-4 min-w-[150px]">Owner</th>
              <th className="py-3 px-4 min-w-[150px]">Due Date</th>
              <th className="py-3 px-4 min-w-[220px]">Source Quote & Link</th>
              <th className="py-3 px-3 w-28 text-center">Sync State</th>
              <th className="py-3 px-3 w-12 text-center">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {actionItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-400">
                  No action items extracted. Run extraction on a meeting document or click "Add Action Item".
                </td>
              </tr>
            ) : (
              actionItems.map((item) => {
                const isSelected = selectedIds.has(item.id);
                const isOwnerMissing =
                  !item.owner || item.owner.trim() === '' || item.owner.toLowerCase().includes('missing');
                const isDateMissing =
                  !item.dueDate || item.dueDate.trim() === '' || item.dueDate.toLowerCase().includes('missing');

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors hover:bg-slate-50/80 ${
                      isSelected ? 'bg-indigo-50/20' : ''
                    }`}
                  >
                    {/* Select Checkbox */}
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(item.id)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>

                    {/* Approved Toggle */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateActionItem({ ...item, approved: !item.approved })
                        }
                        className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-[11px] font-bold transition ${
                          item.approved
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                        title={item.approved ? 'Approved for Sheets sync' : 'Pending approval'}
                      >
                        {item.approved ? 'Approved' : 'Draft'}
                      </button>
                    </td>

                    {/* Task Description Input */}
                    <td className="py-3.5 px-4">
                      <textarea
                        rows={2}
                        value={item.task}
                        onChange={(e) =>
                          onUpdateActionItem({ ...item, task: e.target.value })
                        }
                        className="w-full text-xs text-slate-900 bg-transparent border border-transparent hover:border-slate-300 focus:border-indigo-500 focus:bg-white rounded-md p-1.5 transition leading-snug"
                        placeholder="Action item task..."
                      />
                    </td>

                    {/* Owner Input + Missing Badge */}
                    <td className="py-3.5 px-4">
                      <div className="relative">
                        <input
                          type="text"
                          value={item.owner}
                          onChange={(e) =>
                            onUpdateActionItem({ ...item, owner: e.target.value })
                          }
                          placeholder="e.g. Sarah Chen or Missing"
                          className={`w-full text-xs px-2.5 py-1.5 rounded-lg border transition ${
                            isOwnerMissing
                              ? 'border-amber-300 bg-amber-50/70 text-amber-900 font-semibold'
                              : 'border-slate-200 text-slate-800'
                          } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                        />
                        {isOwnerMissing && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-700 font-bold">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            <span>Missing Owner (Unassigned)</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Due Date Input + Missing Badge */}
                    <td className="py-3.5 px-4">
                      <div className="relative">
                        <input
                          type={isDateMissing ? 'text' : 'date'}
                          value={isDateMissing ? item.dueDate : item.dueDate}
                          onFocus={(e) => {
                            if (isDateMissing) {
                              e.target.type = 'date';
                            }
                          }}
                          onChange={(e) =>
                            onUpdateActionItem({ ...item, dueDate: e.target.value })
                          }
                          placeholder="YYYY-MM-DD or Missing"
                          className={`w-full text-xs px-2.5 py-1.5 rounded-lg border transition ${
                            isDateMissing
                              ? 'border-amber-300 bg-amber-50/70 text-amber-900 font-semibold'
                              : 'border-slate-200 text-slate-800'
                          } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                        />
                        {isDateMissing && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-700 font-bold">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            <span>Missing Date (Calendar Guard)</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Source Quote & Link */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-start gap-1.5 text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-200">
                          <Quote className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">
                            "{item.quote || 'Explicitly stated in meeting notes'}"
                          </span>
                        </div>
                        {documentUrl && (
                          <a
                            href={documentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            <span>Source Doc</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Sync State Badges */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex flex-col gap-1 items-center">
                        {item.sheetSynced ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Sheet Added
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px]">
                            Sheet Pending
                          </span>
                        )}

                        {item.calendarSynced ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-semibold border border-blue-200">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Cal Scheduled
                          </span>
                        ) : isDateMissing ? (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] border border-amber-200"
                            title="Cannot schedule in Calendar without a confirmed date"
                          >
                            Cal Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px]">
                            Cal Pending
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Delete Item */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => onDeleteActionItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Remove action item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
