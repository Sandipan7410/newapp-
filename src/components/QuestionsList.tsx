import React from 'react';
import {
  HelpCircle,
  AlertOctagon,
  Quote,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';
import type { ExtractedOpenQuestion } from '../types/index.ts';

interface QuestionsListProps {
  openQuestions: ExtractedOpenQuestion[];
  missingInfo: string[];
  documentUrl?: string;
}

export const QuestionsList: React.FC<QuestionsListProps> = ({
  openQuestions,
  missingInfo,
  documentUrl,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Open Questions Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">
              Open Questions & Ambiguities
            </h4>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
            {openQuestions.length}
          </span>
        </div>

        <div className="p-4 space-y-3">
          {openQuestions.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              No open questions detected.
            </div>
          ) : (
            openQuestions.map((q) => (
              <div
                key={q.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-slate-900 leading-snug">{q.question}</p>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                      q.ownerOrTarget.toLowerCase().includes('missing')
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    Target: {q.ownerOrTarget}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1 italic truncate">
                    <Quote className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">"{q.quote}"</span>
                  </div>
                  {documentUrl && (
                    <a
                      href={documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 shrink-0 flex items-center gap-0.5"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Missing Information & Auditing Flags */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">
              Missing Information & Gaps
            </h4>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
            {missingInfo.length}
          </span>
        </div>

        <div className="p-4 space-y-2.5">
          {missingInfo.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              No missing information gaps flagged.
            </div>
          ) : (
            missingInfo.map((info, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-xl border border-rose-100 bg-rose-50/40 text-xs text-rose-900"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                <div className="flex-1 leading-relaxed">
                  <span className="font-semibold">{info}</span>
                </div>
              </div>
            ))
          )}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2 mt-3">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>
              All missing information is explicitly highlighted so managers can resolve ambiguities before taking commitments.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
