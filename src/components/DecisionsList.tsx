import React from 'react';
import {
  CheckCircle,
  Quote,
  ExternalLink,
  Trash2,
  Plus,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import type { ExtractedDecision } from '../types/index.ts';

interface DecisionsListProps {
  decisions: ExtractedDecision[];
  onUpdateDecision: (updated: ExtractedDecision) => void;
  onDeleteDecision: (id: string) => void;
  onAddDecision: () => void;
  documentUrl?: string;
}

export const DecisionsList: React.FC<DecisionsListProps> = ({
  decisions,
  onUpdateDecision,
  onDeleteDecision,
  onAddDecision,
  documentUrl,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden mb-6">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              Decisions Finalized & Approved
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
              {decisions.length} verified
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Strictly contains decisions with consensus. Undecided debates, proposals, and brainstorms are excluded.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddDecision}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Decision</span>
        </button>
      </div>

      {/* Decisions List */}
      <div className="p-5">
        {decisions.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No finalized decisions extracted yet. Run extraction on meeting notes above.
          </div>
        ) : (
          <div className="space-y-3">
            {decisions.map((dec, idx) => (
              <div
                key={dec.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition space-y-2.5 relative group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 flex-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <textarea
                        rows={2}
                        value={dec.decision}
                        onChange={(e) =>
                          onUpdateDecision({ ...dec, decision: e.target.value })
                        }
                        className="w-full text-xs font-medium text-slate-900 bg-transparent border border-transparent hover:border-slate-300 focus:border-indigo-500 focus:bg-white rounded-md p-1.5 transition leading-snug"
                        placeholder="State finalized decision..."
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteDecision(dec.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Remove decision"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Source Quote snippet & Link */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/70 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 italic bg-white px-2.5 py-1 rounded-md border border-slate-200 flex-1 max-w-2xl">
                    <Quote className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span className="truncate">"{dec.quote}"</span>
                  </div>

                  {documentUrl && (
                    <a
                      href={documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      <span>Source Doc</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
