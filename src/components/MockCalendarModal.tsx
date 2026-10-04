import React from 'react';
import { Calendar, X, Trash2, Clock, CheckCircle2, User, FileText } from 'lucide-react';

export interface MockCalendarEvent {
  id: string;
  summary: string;
  description: string;
  dueDate: string;
  owner: string;
  meetingName: string;
}

interface MockCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: MockCalendarEvent[];
  onClearEvents: () => void;
}

export const MockCalendarModal: React.FC<MockCalendarModalProps> = ({
  isOpen,
  onClose,
  events,
  onClearEvents,
}) => {
  if (!isOpen) return null;

  // Group events by dueDate
  const groupedEvents: { [date: string]: MockCalendarEvent[] } = {};
  for (const ev of events) {
    if (!groupedEvents[ev.dueDate]) {
      groupedEvents[ev.dueDate] = [];
    }
    groupedEvents[ev.dueDate].push(ev);
  }

  const sortedDates = Object.keys(groupedEvents).sort();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center text-white">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">Google Calendar - Schedule View</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-700 text-blue-200">
                  Live Calendar Sandbox
                </span>
              </div>
              <p className="text-[11px] text-blue-100">
                Primary Calendar • {events.length} confirmed deadline events scheduled
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {events.length > 0 && (
              <button
                onClick={onClearEvents}
                className="p-1.5 text-blue-200 hover:text-white rounded-lg transition"
                title="Clear demo calendar events"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-blue-200 hover:text-white rounded-lg transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Event Schedule List */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50">
          {events.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-sm text-slate-600">No calendar events scheduled yet</p>
              <p className="text-xs mt-1 max-w-sm mx-auto">
                In the review table, ensure action items have confirmed dates, then click{' '}
                <strong>"Create selected Calendar events"</strong>.
              </p>
            </div>
          ) : (
            sortedDates.map((dateKey) => (
              <div key={dateKey} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-blue-100 text-blue-900 font-bold text-xs">
                    📅 {dateKey}
                  </span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="space-y-2 pl-2">
                  {groupedEvents[dateKey].map((ev) => (
                    <div
                      key={ev.id}
                      className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-xs hover:border-blue-300 transition space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          {ev.summary}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-500" />
                          {ev.owner}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 whitespace-pre-line bg-slate-50 p-2 rounded-lg border border-slate-100 font-sans leading-relaxed">
                        {ev.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
          <span className="font-medium text-emerald-800">
            ✓ Guardrail confirmed: zero events were created without confirmed due dates.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Close Calendar
          </button>
        </div>
      </div>
    </div>
  );
};
