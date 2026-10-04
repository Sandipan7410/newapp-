import React from 'react';
import {
  HelpCircle,
  X,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Calendar,
  Sparkles,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Recruiter & Evaluator Demonstration Guide
              </h3>
              <p className="text-xs text-slate-500">
                How to verify the AI Generalist portfolio criteria in under 3 minutes.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 leading-relaxed">
          {/* Quick 3-Minute Walkthrough */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 space-y-2">
            <h4 className="font-bold text-indigo-950 text-sm flex items-center gap-2">
              <span>⚡ 3-Minute Demonstration Path</span>
            </h4>
            <ol className="list-decimal pl-4 space-y-1.5 text-indigo-900">
              <li>
                <strong>Select Test Case 1:</strong> Click <em>"Extract Meeting Intelligence"</em>. Notice the extraction runs server-side with Gemini 3.8 Flash.
              </li>
              <li>
                <strong>Verify Strict Attribution:</strong> Notice the undecided Redis vs KeyDB debate is completely excluded from Decisions. Action 2 has owner marked as <span className="font-bold text-amber-800">"Missing"</span>, never hallucinated.
              </li>
              <li>
                <strong>Audit Human-in-the-Loop:</strong> Edit the owner inline (e.g. type "David Kim") and change date. Uncheck an unapproved row.
              </li>
              <li>
                <strong>Test Sheet Export & Duplicate Guard:</strong> Click <em>"Add approved actions to Sheet"</em>. Review the exact row preview modal, confirm, then click it again — observe duplicate prevention blocks duplicate rows!
              </li>
              <li>
                <strong>Test Calendar Guard:</strong> Notice items with "Missing" dates cannot be scheduled on Calendar until a confirmed date is supplied.
              </li>
            </ol>
          </div>

          {/* Core Required Test Cases */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3">
              5 Test Cases Built into the Sandbox:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="font-bold text-slate-900 block">Case 1: Core Synthesis (Full Workflow)</span>
                <p className="text-slate-600 text-[11px]">
                  Extracts 2 decisions, flags 1 action with Missing owner, flags 1 with Missing date, and excludes the undecided KeyDB debate.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="font-bold text-slate-900 block">Case 2: Debate vs Finalized Decision</span>
                <p className="text-slate-600 text-[11px]">
                  Intense Kafka migration discussion ends without agreement; verifies only the PostgreSQL replica decision is captured.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="font-bold text-slate-900 block">Case 3: Ambiguous Action Item (No Owner)</span>
                <p className="text-slate-600 text-[11px]">
                  "Consolidate customer survey quotes" has no assignee; verified that owner is explicitly "Missing", never invented.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="font-bold text-slate-900 block">Case 4: Calendar Guardrail (Missing Date)</span>
                <p className="text-slate-600 text-[11px]">
                  Figma dark mode tokens task has no deadline; verifies the app prohibits creating a calendar event until confirmed.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1 md:col-span-2">
                <span className="font-bold text-slate-900 block">Case 5: Security Post-Mortem & High Urgency Actions</span>
                <p className="text-slate-600 text-[11px]">
                  Verifies exact verbatim quote grounding for multi-stage compliance decisions and unassigned drill exercises.
                </p>
              </div>
            </div>
          </div>

          {/* Live Workspace Schema Requirements */}
          <div className="border-t border-slate-200 pt-4 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">
              Live Google Doc & Google Sheet Structure
            </h4>
            <div className="space-y-2 text-[11px] text-slate-600">
              <p>
                <strong>Google Doc Structure:</strong> Standard Google Doc with clear headings (e.g. "Decisions", "Discussion", "Next Steps / Action Items"). The AI parser reads all body paragraphs and tables.
              </p>
              <p>
                <strong>Google Sheet Structure:</strong> When creating or appending to Google Sheets, columns are automatically formatted:
                <br />
                <code>[Meeting Name | Meeting Date | Action Item | Owner | Due Date | Source Quote | Approved On | Source Doc]</code>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
