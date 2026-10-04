import React, { useState, useEffect } from 'react';
import {
  FileText,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Edit3,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { DriveDocumentItem } from '../types/index.ts';
import { SAMPLE_TEST_CASES, type SampleTestCase } from '../data/sampleNotes.ts';
import { listGoogleDocs, parseGoogleDocId } from '../services/googleWorkspace.ts';

interface DocSelectorProps {
  isSampleMode: boolean;
  selectedTestCase: SampleTestCase;
  onSelectTestCase: (tc: SampleTestCase) => void;
  customNotes: string;
  onChangeCustomNotes: (notes: string) => void;
  customTitle: string;
  onChangeCustomTitle: (title: string) => void;
  onExtract: (docText: string, docTitle: string, docUrl: string) => void;
  isExtracting: boolean;
  accessToken: string | null;
  onSignInRequired: () => void;
  workspaceError: string | null;
  onClearWorkspaceError: () => void;
}

export const DocSelector: React.FC<DocSelectorProps> = ({
  isSampleMode,
  selectedTestCase,
  onSelectTestCase,
  customNotes,
  onChangeCustomNotes,
  customTitle,
  onChangeCustomTitle,
  onExtract,
  isExtracting,
  accessToken,
  onSignInRequired,
  workspaceError,
  onClearWorkspaceError,
}) => {
  const [activeTab, setActiveTab] = useState<'preset' | 'custom'>('preset');
  const [showNotesPreview, setShowNotesPreview] = useState(false);

  // Google Workspace state
  const [recentDocs, setRecentDocs] = useState<DriveDocumentItem[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [manualDocInput, setManualDocInput] = useState<string>('');
  const [docsFetchError, setDocsFetchError] = useState<string | null>(null);

  // When in live mode and accessToken changes, load recent docs
  useEffect(() => {
    if (!isSampleMode && accessToken) {
      loadDriveDocs();
    }
  }, [isSampleMode, accessToken]);

  const loadDriveDocs = async () => {
    if (!accessToken) return;
    setIsLoadingDocs(true);
    setDocsFetchError(null);
    try {
      const docs = await listGoogleDocs(accessToken);
      setRecentDocs(docs);
      if (docs.length > 0 && !selectedDocId) {
        setSelectedDocId(docs[0].id);
      }
    } catch (err: any) {
      console.error('Failed to list Google Docs:', err);
      setDocsFetchError(
        err.message || 'Could not load Google Docs from Drive. Please check permissions.'
      );
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleStartSampleExtraction = () => {
    if (activeTab === 'preset') {
      onExtract(selectedTestCase.text, selectedTestCase.documentTitle, selectedTestCase.documentUrl);
    } else {
      if (!customNotes.trim()) return;
      onExtract(
        customNotes,
        customTitle || 'Custom Meeting Document',
        'https://docs.google.com/document/d/sample-custom-doc/edit'
      );
    }
  };

  const handleStartLiveExtraction = () => {
    if (!accessToken) {
      onSignInRequired();
      return;
    }

    const docIdToUse = manualDocInput.trim()
      ? parseGoogleDocId(manualDocInput)
      : selectedDocId;

    if (!docIdToUse) {
      return;
    }

    // Pass docId as instruction for parent fetcher
    const docUrl = `https://docs.google.com/document/d/${docIdToUse}/edit`;
    const docTitle =
      recentDocs.find((d) => d.id === docIdToUse)?.name || `Google Doc (${docIdToUse.slice(0, 8)}...)`;

    onExtract(`FETCH_GOOGLE_DOC:${docIdToUse}`, docTitle, docUrl);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden mb-6">
      {/* Top Banner indicating Active Mode */}
      <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isSampleMode ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
            }`}
          />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {isSampleMode ? 'Sample-Data Sandbox' : 'Connected to Google Workspace'}
          </span>
          <span className="text-xs text-slate-500 hidden sm:inline">
            {isSampleMode
              ? '• Zero configuration required — tests edge cases & extraction instantly'
              : '• Live Drive, Docs, Sheets & Calendar integration'}
          </span>
        </div>

        {isSampleMode && (
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setActiveTab('preset')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                activeTab === 'preset'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              5 Test Cases
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                activeTab === 'custom'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Custom Notes Editor
            </button>
          </div>
        )}
      </div>

      {/* Workspace Error Notification (When Live Connection Fails) */}
      {workspaceError && !isSampleMode && (
        <div className="bg-rose-50 border-b border-rose-200 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm text-rose-800">
            <p className="font-semibold text-rose-900">Google Workspace Operation Error</p>
            <p className="text-xs mt-0.5">{workspaceError}</p>
            <p className="text-[11px] text-rose-600 mt-1">
              (Note: The app intentionally displays this honest error rather than disguising failures with mock data.)
            </p>
          </div>
          <button
            onClick={onClearWorkspaceError}
            className="text-xs text-rose-700 hover:text-rose-900 font-medium underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Content Body */}
      <div className="p-5">
        {isSampleMode ? (
          /* SAMPLE MODE CONTROLS */
          <div>
            {activeTab === 'preset' ? (
              <div>
                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Select Test Scenario for 3-Minute Recruiter Evaluation:
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                    {SAMPLE_TEST_CASES.map((tc, idx) => {
                      const isSelected = selectedTestCase.id === tc.id;
                      return (
                        <button
                          key={tc.id}
                          type="button"
                          onClick={() => onSelectTestCase(tc)}
                          className={`text-left p-3 rounded-xl border text-xs transition relative ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-900">Case {idx + 1}</span>
                            {isSelected && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                            )}
                          </div>
                          <p className="font-medium text-slate-700 truncate">{tc.badge}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                            {tc.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Test Case Card Details */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span className="font-semibold text-sm text-slate-900">
                        {selectedTestCase.documentTitle}
                      </span>
                      <span className="text-xs text-slate-500">({selectedTestCase.date})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={selectedTestCase.documentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        <span>Simulated Source Doc</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        onClick={() => setShowNotesPreview(!showNotesPreview)}
                        className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-800 font-medium ml-2 px-2 py-1 rounded-md bg-white border border-slate-200"
                      >
                        {showNotesPreview ? (
                          <>
                            <span>Hide Notes</span>
                            <ChevronUp className="w-3 h-3" />
                          </>
                        ) : (
                          <>
                            <span>View Raw Notes</span>
                            <ChevronDown className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expected criteria pill indicators */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] mt-2 pt-2 border-t border-slate-200/80">
                    <span className="font-semibold text-slate-600">Verification Targets:</span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                      🎯 {selectedTestCase.expectedOutcomes.missingOwnerCheck}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                      🎯 {selectedTestCase.expectedOutcomes.undecidedDiscussionCheck}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                      🎯 {selectedTestCase.expectedOutcomes.missingDateCheck}
                    </span>
                  </div>

                  {/* Notes Text Preview Drawer */}
                  {showNotesPreview && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200 text-xs font-mono text-slate-700 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                      {selectedTestCase.text}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* CUSTOM NOTES EDITOR */
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Meeting Document Title:
                    </label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => onChangeCustomTitle(e.target.value)}
                      placeholder="e.g. Q4 Executive Leadership Sync"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Paste Meeting Notes or Type Freely:
                  </label>
                  <textarea
                    rows={6}
                    value={customNotes}
                    onChange={(e) => onChangeCustomNotes(e.target.value)}
                    placeholder="Paste meeting transcript, minutes, or notes here. Include decisions, action items, dates, and discussions..."
                    className="w-full text-xs font-mono p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    💡 Tip: Include an action item without an owner or date, and an undecided debate to watch the AI adhere to the guardrails.
                  </p>
                </div>
              </div>
            )}

            {/* Run Extraction Button */}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Powered by server-side Gemini 3.8 Flash with structured schema auditing.
              </span>
              <button
                type="button"
                onClick={handleStartSampleExtraction}
                disabled={isExtracting || (activeTab === 'custom' && !customNotes.trim())}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-semibold shadow-md shadow-indigo-100 transition disabled:opacity-50"
              >
                {isExtracting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Extracting Decisions & Actions...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Extract Meeting Intelligence</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* GOOGLE WORKSPACE LIVE MODE */
          <div>
            {!accessToken ? (
              <div className="text-center py-6 px-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  Connect Your Google Workspace Account
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                  Sign in to select documents directly from your Google Drive, read notes via Google Docs API, and sync to your personal Google Sheets & Calendar.
                </p>
                <button
                  onClick={onSignInRequired}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs transition"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Pick from recent drive docs */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Select Google Doc from Drive:
                    </label>
                    <button
                      onClick={loadDriveDocs}
                      disabled={isLoadingDocs}
                      className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoadingDocs ? 'animate-spin' : ''}`} />
                      <span>Refresh Drive</span>
                    </button>
                  </div>

                  {docsFetchError ? (
                    <div className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                      {docsFetchError}
                    </div>
                  ) : isLoadingDocs ? (
                    <div className="py-4 text-center text-xs text-slate-500">
                      <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1 text-indigo-500" />
                      Loading recent Google Docs from your Drive...
                    </div>
                  ) : recentDocs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                      {recentDocs.map((doc) => {
                        const isSelected = selectedDocId === doc.id && !manualDocInput.trim();
                        return (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => {
                              setSelectedDocId(doc.id);
                              setManualDocInput('');
                            }}
                            className={`text-left p-2.5 rounded-xl border text-xs transition flex items-start gap-2 ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-50/70 font-semibold'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <FileText className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                            <div className="truncate flex-1">
                              <p className="truncate text-slate-900">{doc.name}</p>
                              <p className="text-[10px] text-slate-400">
                                {doc.modifiedTime
                                  ? `Modified ${new Date(doc.modifiedTime).toLocaleDateString()}`
                                  : 'Google Doc'}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 py-3 text-center border border-dashed border-slate-300 rounded-xl">
                      No Google Docs found in your Google Drive. Enter a Doc URL or ID below.
                    </div>
                  )}
                </div>

                {/* Or Paste Direct Doc URL / ID */}
                <div className="pt-2 border-t border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Or Enter Google Doc URL / Document ID:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualDocInput}
                      onChange={(e) => setManualDocInput(e.target.value)}
                      placeholder="https://docs.google.com/document/d/1A2B3C.../edit or doc ID"
                      className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                </div>

                {/* Live Extraction Button */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Reads raw document text via Google Docs API and parses with Gemini server-side.
                  </span>
                  <button
                    type="button"
                    onClick={handleStartLiveExtraction}
                    disabled={isExtracting || (!selectedDocId && !manualDocInput.trim())}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-semibold shadow-md shadow-indigo-100 transition disabled:opacity-50"
                  >
                    {isExtracting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Fetching Doc & Extracting...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Fetch & Extract Google Doc</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
