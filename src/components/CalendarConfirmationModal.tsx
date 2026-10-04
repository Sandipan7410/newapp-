import React from 'react';
import {
  Calendar,
  AlertTriangle,
  CheckCircle2,
  X,
  ExternalLink,
  ShieldCheck,
  Clock,
  RefreshCw,
  AlertOctagon,
} from 'lucide-react';
import type { ExtractedActionItem } from '../types/index.ts';

interface CalendarConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionItems: ExtractedActionItem[];
  meetingName: string;
  documentUrl?: string;
  isSampleMode: boolean;
  onConfirmSchedule: (eventsToCreate: {
    item: ExtractedActionItem;
    summary: string;
    description: string;
    dueDate: string;
  }[]) => Promise<void>;
  isProcessing: boolean;
}

export const CalendarConfirmationModal: React.FC<CalendarConfirmationModalProps> = ({
  isOpen,
  onClose,
  actionItems,
  meetingName,
  documentUrl,
  isSampleMode,
  onConfirmSchedule,
  isProcessing,
}) => {
  if (!isOpen) return null;

  // Separate items into:
  // 1. Confirmed date items eligible for scheduling
  // 2. Missing date items (STRICTLY BLOCKED by guardrail)
  // 3. Already scheduled items (duplicate protection)
  const confirmedDateItems = actionItems.filter(
    (item) =>
      item.dueDate &&
      item.dueDate.trim() !== '' &&
      !item.dueDate.toLowerCase().includes('missing')
  );

  const missingDateItems = actionItems.filter(
    (item) =>
      !item.dueDate ||
      item.dueDate.trim() === '' ||
      item.dueDate.toLowerCase().includes('missing')
  );

  const freshEligibleItems = confirmedDateItems.filter((item) => !item.calendarSynced);
  const alreadyScheduledItems = confirmedDateItems.filter((item) => item.calendarSynced);

  // Exact event payload preview
  const eventsToCreate = freshEligibleItems.map((item) => ({
    item,
    summary: `[Action] ${item.task} (${item.owner})`,
    description: `Task: ${item.task}\nAssigned to: ${item.owner}\nMeeting: ${meetingName}\nSource Quote: "${item.quote}"\nDocument: ${documentUrl || 'N/A'}\nCreated via Meeting Decision Tracker`,
    dueDate: item.dueDate,
  }));

  const handleConfirm = async () => {
    if (eventsToCreate.length === 0) return;
    await onConfirmSchedule(eventsToCreate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Confirm Google Calendar Scheduling
              </h3>
              <p className="text-xs text-slate-500">
                Shows exact event details before adding to calendar. Guardrail strictly blocks missing dates.
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
          {/* Target Calendar Destination */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-700 uppercase tracking-wider block text-[11px]">
                Target Calendar:
              </span>
              <span className="text-slate-800 font-medium">
                {isSampleMode
                  ? '📅 [Demo Sandbox] User Primary Calendar Schedule'
                  : '📅 Primary Google Calendar (Account default)'}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold border border-blue-200 text-[11px]">
              All-Day Deadline Event
            </span>
          </div>

          {/* STRICT DATE GUARDRAIL WARNING */}
          {missingDateItems.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-rose-900">
              <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-950">
                  Calendar Guardrail Active ({missingDateItems.length} Item Blocked)
                </p>
                <p className="text-[11px] mt-0.5 text-rose-800 leading-relaxed">
                  Per strict requirements, the app will <strong>NEVER</strong> create a Calendar event for an action without a confirmed date. The following item(s) have <span className="font-bold underline">Missing</span> due dates and are excluded:
                </p>
                <ul className="list-disc pl-4 mt-1.5 space-y-0.5 text-[11px] text-rose-700 font-medium">
                  {missingDateItems.map((m) => (
                    <li key={m.id}>
                      "{m.task}" <span className="text-rose-500 font-normal">(due date: Missing)</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* DUPLICATE PREVENTION NOTICE */}
          {alreadyScheduledItems.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Duplicate Prevention Active</p>
                <p className="text-[11px] mt-0.5">
                  {alreadyScheduledItems.length} action item(s) have already been scheduled on Calendar. To prevent duplicate calendar clutter, they will not be created again.
                </p>
              </div>
            </div>
          )}

          {/* Exact Events Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Events to be Created ({freshEligibleItems.length}):
              </span>
            </div>

            {freshEligibleItems.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                No eligible events to create. Either all items already exist in Calendar, or the items have Missing dates that must be confirmed first in the review table.
              </div>
            ) : (
              <div className="space-y-2.5">
                {eventsToCreate.map(({ item, summary, description, dueDate }, idx) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/40 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-950 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        {summary}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-200/70 text-blue-900 font-bold text-[11px]">
                        📅 {dueDate}
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-blue-100 text-[11px] text-slate-600 font-mono whitespace-pre-wrap leading-relaxed">
                      {description}
                    </div>
                  </div>
                ))}
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
            disabled={isProcessing || freshEligibleItems.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Scheduling Events...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Create ({freshEligibleItems.length} Events)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
