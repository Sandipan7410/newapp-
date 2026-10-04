import React, { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import {
  Sparkles,
  FileSpreadsheet,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import type {
  ExtractedActionItem,
  ExtractedDecision,
  MeetingExtractionResult,
} from './types/index.ts';
import { SAMPLE_TEST_CASES, type SampleTestCase } from './data/sampleNotes.ts';
import { initAuth, googleSignIn, logout, getAccessToken } from './services/googleAuth.ts';
import {
  fetchGoogleDoc,
  createGoogleSpreadsheet,
  appendRowsToSpreadsheet,
  createGoogleCalendarEvent,
} from './services/googleWorkspace.ts';
import { Header } from './components/Header.tsx';
import { DocSelector } from './components/DocSelector.tsx';
import { ReviewTable } from './components/ReviewTable.tsx';
import { DecisionsList } from './components/DecisionsList.tsx';
import { QuestionsList } from './components/QuestionsList.tsx';
import { SheetConfirmationModal } from './components/SheetConfirmationModal.tsx';
import { CalendarConfirmationModal } from './components/CalendarConfirmationModal.tsx';
import { MockSheetModal } from './components/MockSheetModal.tsx';
import { MockCalendarModal, type MockCalendarEvent } from './components/MockCalendarModal.tsx';
import { HelpModal } from './components/HelpModal.tsx';

// Initial pre-loaded state for Test Case 1 so recruiter sees instant value
const INITIAL_MEETING_STATE: MeetingExtractionResult = {
  meetingName: 'Atlas Platform Q4 Architecture & Planning Notes',
  meetingDate: '2026-10-02',
  documentTitle: 'Atlas Platform Q4 Architecture & Planning Notes',
  documentUrl: 'https://docs.google.com/document/d/1AtlasPlatform_Q4Notes_Sample/edit',
  decisions: [
    {
      id: 'dec-init-1',
      decision: 'Standardize all new customer-facing backend services on Node.js and TypeScript starting in Q4.',
      quote: 'We will standardize all new customer-facing backend services on Node.js and TypeScript starting in Q4.',
      context: 'Adopted unanimously by engineering committee.',
      approved: true,
    },
    {
      id: 'dec-init-2',
      decision: 'Shift engineering roadmaps to quarterly milestone reviews starting November 1, replacing bi-weekly roadmap churn.',
      quote: 'Shift engineering roadmaps to quarterly milestone reviews starting November 1, replacing bi-weekly roadmap churn.',
      context: 'Agreed to document in team wiki.',
      approved: true,
    },
  ],
  actionItems: [
    {
      id: 'act-init-1',
      task: 'Draft the TypeScript service template and linting configuration',
      owner: 'Sarah Chen',
      dueDate: '2026-10-15',
      quote: 'Sarah Chen will draft the TypeScript service template and linting configuration by Oct 15.',
      approved: true,
      sheetSynced: false,
      calendarSynced: false,
    },
    {
      id: 'act-init-2',
      task: 'Benchmark database query performance under 10k RPS load before Oct 22',
      owner: 'Missing',
      dueDate: '2026-10-22',
      quote: 'Someone needs to benchmark database query performance under 10k RPS load before Oct 22.',
      approved: true,
      sheetSynced: false,
      calendarSynced: false,
    },
    {
      id: 'act-init-3',
      task: 'Audit third-party API rate limits and alert thresholds',
      owner: 'Marcus Vance',
      dueDate: 'Missing',
      quote: 'Marcus Vance agreed to audit third-party API rate limits and alert thresholds, but no deadline was set.',
      approved: true,
      sheetSynced: false,
      calendarSynced: false,
    },
  ],
  openQuestions: [
    {
      id: 'q-init-1',
      question: 'Will the staging cloud budget accommodate the additional high-memory instances needed for the Q4 load test?',
      ownerOrTarget: 'Elena Rostova / Finance',
      quote: 'Will the staging cloud budget accommodate the additional high-memory instances needed for the Q4 load test?',
    },
  ],
  missingInfo: [
    'Unassigned Owner: Action item "Benchmark database query performance under 10k RPS" lacks an assigned engineer.',
    'Undefined Deadline: Action item "Audit third-party API rate limits" does not specify a completion date.',
  ],
};

export default function App() {
  // App Mode (Sample Sandbox vs Live Workspace)
  const [isSampleMode, setIsSampleMode] = useState<boolean>(true);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  // Sample data & custom notes selection
  const [selectedTestCase, setSelectedTestCase] = useState<SampleTestCase>(SAMPLE_TEST_CASES[0]);
  const [customNotes, setCustomNotes] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('');

  // Meeting Extraction State
  const [meetingData, setMeetingData] = useState<MeetingExtractionResult>(INITIAL_MEETING_STATE);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);

  // Workspace error state (displayed clearly when a connection or API call fails)
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);

  // Interactive Mock Destinations for Sample Mode
  const [mockSheetRows, setMockSheetRows] = useState<(string | number)[][]>([
    [
      'Atlas Platform Q4 Architecture & Planning Notes',
      '2026-10-02',
      'Setup GitHub Actions CI for Node.js services',
      'Liam Kelly',
      '2026-10-08',
      'Agreed during sprint kickoff',
      new Date(Date.now() - 86400000).toLocaleString(),
      'https://docs.google.com/document/d/1AtlasPlatform_Q4Notes_Sample/edit',
    ],
  ]);

  const [mockCalendarEvents, setMockCalendarEvents] = useState<MockCalendarEvent[]>([
    {
      id: 'mock-cal-init-1',
      summary: '[Action] Setup GitHub Actions CI for Node.js services (Liam Kelly)',
      description: 'Meeting: Atlas Platform Q4 Architecture & Planning Notes\nOwner: Liam Kelly',
      dueDate: '2026-10-08',
      owner: 'Liam Kelly',
      meetingName: 'Atlas Platform Q4 Architecture & Planning Notes',
    },
  ]);

  // Modal Dialogs
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isMockSheetOpen, setIsMockSheetOpen] = useState(false);
  const [isMockCalendarOpen, setIsMockCalendarOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Operation loading states
  const [isProcessingSheet, setIsProcessingSheet] = useState(false);
  const [isProcessingCalendar, setIsProcessingCalendar] = useState(false);

  // Banner feedback toast
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'warning' | 'info';
    title: string;
    description: string;
    link?: { label: string; url: string };
  } | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Listen to Firebase Auth state on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setWorkspaceError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setAccessToken(res.accessToken);
        setToastMessage({
          type: 'success',
          title: 'Google Workspace Connected',
          description: `Signed in as ${res.user.email}. Drive, Docs, Sheets, and Calendar APIs authorized.`,
        });
      }
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      setWorkspaceError(
        err?.message || 'Google sign-in popup was cancelled or blocked. Please verify browser settings.'
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setCurrentUser(null);
      setAccessToken(null);
      setToastMessage({
        type: 'info',
        title: 'Signed Out',
        description: 'Google Workspace session closed.',
      });
    } catch (err: any) {
      console.error('Sign-out error:', err);
    }
  };

  // Perform Gemini extraction
  const handleExtract = async (docText: string, docTitle: string, docUrl: string) => {
    setIsExtracting(true);
    setWorkspaceError(null);

    try {
      let textToAnalyze = docText;

      // In Live Workspace mode, if requested to fetch doc via Google Docs API
      if (docText.startsWith('FETCH_GOOGLE_DOC:')) {
        const docId = docText.replace('FETCH_GOOGLE_DOC:', '');
        const currentToken = accessToken || (await getAccessToken());
        if (!currentToken) {
          throw new Error('Google Workspace session required. Please sign in with Google first.');
        }

        const fetchedDoc = await fetchGoogleDoc(currentToken, docId);
        textToAnalyze = fetchedDoc.content;
        docTitle = fetchedDoc.title;
        docUrl = fetchedDoc.webViewLink;

        if (!textToAnalyze.trim()) {
          throw new Error(
            'The selected Google Doc appears empty or contains no readable text paragraphs.'
          );
        }
      }

      // Call server-side Gemini extractor endpoint
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentText: textToAnalyze,
          documentTitle: docTitle,
          documentUrl: docUrl,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server extraction failed with status ${response.status}`);
      }

      const result: MeetingExtractionResult = await response.json();
      setMeetingData(result);

      setToastMessage({
        type: 'success',
        title: 'Meeting Intelligence Extracted',
        description: `Successfully extracted ${result.decisions.length} decisions, ${result.actionItems.length} action items, and ${result.openQuestions.length} open questions.`,
      });
    } catch (err: any) {
      console.error('Extraction error:', err);
      // Requirement: When a Workspace connection fails, display a useful error rather than showing sample data as though it came from Google
      setWorkspaceError(
        err?.message || 'Failed to extract meeting intelligence from document.'
      );
    } finally {
      setIsExtracting(false);
    }
  };

  // Action Items CRUD
  const handleUpdateActionItem = (updated: ExtractedActionItem) => {
    setMeetingData((prev) => ({
      ...prev,
      actionItems: prev.actionItems.map((item) =>
        item.id === updated.id ? updated : item
      ),
    }));
  };

  const handleDeleteActionItem = (id: string) => {
    setMeetingData((prev) => ({
      ...prev,
      actionItems: prev.actionItems.filter((item) => item.id !== id),
    }));
  };

  const handleAddActionItem = () => {
    const newItem: ExtractedActionItem = {
      id: `act-manual-${Date.now()}`,
      task: 'New actionable item...',
      owner: 'Missing',
      dueDate: 'Missing',
      quote: 'Added during human-in-the-loop review',
      approved: true,
      sheetSynced: false,
      calendarSynced: false,
    };
    setMeetingData((prev) => ({
      ...prev,
      actionItems: [newItem, ...prev.actionItems],
    }));
  };

  // Decisions CRUD
  const handleUpdateDecision = (updated: ExtractedDecision) => {
    setMeetingData((prev) => ({
      ...prev,
      decisions: prev.decisions.map((d) => (d.id === updated.id ? updated : d)),
    }));
  };

  const handleDeleteDecision = (id: string) => {
    setMeetingData((prev) => ({
      ...prev,
      decisions: prev.decisions.filter((d) => d.id !== id),
    }));
  };

  const handleAddDecision = () => {
    const newDec: ExtractedDecision = {
      id: `dec-manual-${Date.now()}`,
      decision: 'New agreed decision...',
      quote: 'Confirmed by meeting participants',
      context: 'Human-in-the-loop manual addition',
      approved: true,
    };
    setMeetingData((prev) => ({
      ...prev,
      decisions: [newDec, ...prev.decisions],
    }));
  };

  // Handle Sheet Export Confirmation
  const handleConfirmAppendSheet = async (
    spreadsheetId: string,
    sheetTitle: string,
    newRows: (string | number)[][]
  ) => {
    setIsProcessingSheet(true);
    setWorkspaceError(null);

    try {
      if (isSampleMode) {
        // Sample Mode simulation: Append to interactive mock sheet
        await new Promise((resolve) => setTimeout(resolve, 600)); // smooth realistic latency
        setMockSheetRows((prev) => [...prev, ...newRows]);

        // Mark items as synced to prevent duplicate writes!
        const approvedIds = new Set(
          meetingData.actionItems.filter((a) => a.approved).map((a) => a.id)
        );
        setMeetingData((prev) => ({
          ...prev,
          actionItems: prev.actionItems.map((item) =>
            approvedIds.has(item.id) ? { ...item, sheetSynced: true } : item
          ),
        }));

        setIsSheetModalOpen(false);
        setIsMockSheetOpen(true);

        setToastMessage({
          type: 'success',
          title: 'Appended to Demo Google Sheet',
          description: `Successfully added ${newRows.length} action row(s) to the demo spreadsheet. Duplicate prevention is now active.`,
        });
      } else {
        // Live Google Workspace Mode
        const token = accessToken || (await getAccessToken());
        if (!token) {
          throw new Error('Google authentication session expired. Please sign in again.');
        }

        let targetId = spreadsheetId;
        let sheetUrl = '';

        if (spreadsheetId === 'new') {
          const createdSheet = await createGoogleSpreadsheet(token, sheetTitle);
          targetId = createdSheet.id;
          sheetUrl = createdSheet.webViewLink;
          await appendRowsToSpreadsheet(token, targetId, newRows, 'Action Items');
        } else {
          await appendRowsToSpreadsheet(token, targetId, newRows, 'Sheet1');
          sheetUrl = `https://docs.google.com/spreadsheets/d/${targetId}/edit`;
        }

        // Mark items as synced
        const approvedIds = new Set(
          meetingData.actionItems.filter((a) => a.approved).map((a) => a.id)
        );
        setMeetingData((prev) => ({
          ...prev,
          actionItems: prev.actionItems.map((item) =>
            approvedIds.has(item.id) ? { ...item, sheetSynced: true } : item
          ),
        }));

        setIsSheetModalOpen(false);
        setToastMessage({
          type: 'success',
          title: 'Google Sheet Updated',
          description: `Added ${newRows.length} approved action row(s) to your Google Sheet.`,
          link: { label: 'Open in Google Sheets ↗', url: sheetUrl },
        });
      }
    } catch (err: any) {
      console.error('Sheet export error:', err);
      setWorkspaceError(
        err?.message || 'Failed to append approved actions to Google Sheets. Verify permissions.'
      );
    } finally {
      setIsProcessingSheet(false);
    }
  };

  // Handle Calendar Scheduling Confirmation
  const handleConfirmScheduleCalendar = async (
    eventsToCreate: {
      item: ExtractedActionItem;
      summary: string;
      description: string;
      dueDate: string;
    }[]
  ) => {
    setIsProcessingCalendar(true);
    setWorkspaceError(null);

    try {
      // Guardrail Check: Prohibit any event without a confirmed date
      const invalidEvent = eventsToCreate.find(
        (e) => !e.dueDate || e.dueDate.toLowerCase().includes('missing')
      );
      if (invalidEvent) {
        throw new Error(
          `Guardrail Violation: Cannot create a calendar event for "${invalidEvent.item.task}" because the due date is Missing.`
        );
      }

      if (isSampleMode) {
        // Sample Mode simulation: Schedule in interactive mock calendar
        await new Promise((resolve) => setTimeout(resolve, 600));

        const newMockEvents: MockCalendarEvent[] = eventsToCreate.map((e) => ({
          id: `cal-${Date.now()}-${e.item.id}`,
          summary: e.summary,
          description: e.description,
          dueDate: e.dueDate,
          owner: e.item.owner,
          meetingName: meetingData.meetingName,
        }));

        setMockCalendarEvents((prev) => [...prev, ...newMockEvents]);

        // Mark items as calendar synced
        const scheduledIds = new Set(eventsToCreate.map((e) => e.item.id));
        setMeetingData((prev) => ({
          ...prev,
          actionItems: prev.actionItems.map((item) =>
            scheduledIds.has(item.id) ? { ...item, calendarSynced: true } : item
          ),
        }));

        setIsCalendarModalOpen(false);
        setIsMockCalendarOpen(true);

        setToastMessage({
          type: 'success',
          title: 'Scheduled in Demo Google Calendar',
          description: `Scheduled ${eventsToCreate.length} event(s) on their confirmed due dates. Actions with missing dates were excluded.`,
        });
      } else {
        // Live Google Workspace Mode
        const token = accessToken || (await getAccessToken());
        if (!token) {
          throw new Error('Google authentication session expired. Please sign in again.');
        }

        for (const ev of eventsToCreate) {
          await createGoogleCalendarEvent(token, {
            summary: ev.summary,
            description: ev.description,
            dueDate: ev.dueDate,
          });
        }

        // Mark items as calendar synced
        const scheduledIds = new Set(eventsToCreate.map((e) => e.item.id));
        setMeetingData((prev) => ({
          ...prev,
          actionItems: prev.actionItems.map((item) =>
            scheduledIds.has(item.id) ? { ...item, calendarSynced: true } : item
          ),
        }));

        setIsCalendarModalOpen(false);
        setToastMessage({
          type: 'success',
          title: 'Google Calendar Events Created',
          description: `Created ${eventsToCreate.length} event(s) in your Primary Google Calendar.`,
          link: { label: 'Open Google Calendar ↗', url: 'https://calendar.google.com' },
        });
      }
    } catch (err: any) {
      console.error('Calendar scheduling error:', err);
      setWorkspaceError(
        err?.message || 'Failed to create calendar events. Please check date validity.'
      );
    } finally {
      setIsProcessingCalendar(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Header */}
      <Header
        isSampleMode={isSampleMode}
        onToggleSampleMode={(sample) => {
          setIsSampleMode(sample);
          setWorkspaceError(null);
        }}
        currentUser={currentUser}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        isAuthenticating={isAuthenticating}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenMockSheet={() => setIsMockSheetOpen(true)}
        onOpenMockCalendar={() => setIsMockCalendarOpen(true)}
        mockSheetRowCount={mockSheetRows.length}
        mockCalendarEventCount={mockCalendarEvents.length}
      />

      {/* Floating Feedback Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md w-full animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div
            className={`p-4 rounded-2xl shadow-xl border flex items-start gap-3 ${
              toastMessage.type === 'success'
                ? 'bg-slate-900 text-white border-slate-800'
                : toastMessage.type === 'warning'
                ? 'bg-amber-900 text-white border-amber-800'
                : 'bg-slate-800 text-white border-slate-700'
            }`}
          >
            <div className="p-1 rounded-lg bg-white/10 text-white shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex-1 text-xs">
              <p className="font-bold text-sm leading-tight">{toastMessage.title}</p>
              <p className="mt-1 text-slate-300 leading-relaxed">
                {toastMessage.description}
              </p>
              {toastMessage.link && (
                <a
                  href={toastMessage.link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 font-semibold text-emerald-400 hover:text-emerald-300 underline"
                >
                  <span>{toastMessage.link.label}</span>
                </a>
              )}
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Document Selection / Notes Input Section */}
        <DocSelector
          isSampleMode={isSampleMode}
          selectedTestCase={selectedTestCase}
          onSelectTestCase={(tc) => {
            setSelectedTestCase(tc);
            setMeetingData((prev) => ({
              ...prev,
              meetingName: tc.documentTitle,
              documentTitle: tc.documentTitle,
              documentUrl: tc.documentUrl,
              meetingDate: tc.date,
            }));
          }}
          customNotes={customNotes}
          onChangeCustomNotes={setCustomNotes}
          customTitle={customTitle}
          onChangeCustomTitle={setCustomTitle}
          onExtract={handleExtract}
          isExtracting={isExtracting}
          accessToken={accessToken}
          onSignInRequired={handleSignIn}
          workspaceError={workspaceError}
          onClearWorkspaceError={() => setWorkspaceError(null)}
        />

        {/* Meeting Header Banner */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                Audited Document
              </span>
              <span className="text-xs text-slate-500">
                Date: <strong className="text-slate-800">{meetingData.meetingDate}</strong>
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {meetingData.meetingName}
            </h2>
            {meetingData.documentUrl && (
              <a
                href={meetingData.documentUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                <span>Google Doc Source Reference</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right border-r border-slate-200 pr-4 hidden sm:block">
              <p className="text-xs text-slate-500">Extracted Decisions</p>
              <p className="text-lg font-bold text-slate-900">{meetingData.decisions.length}</p>
            </div>
            <div className="text-right border-r border-slate-200 pr-4 hidden sm:block">
              <p className="text-xs text-slate-500">Action Items</p>
              <p className="text-lg font-bold text-slate-900">{meetingData.actionItems.length}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Missing Info Flags</p>
              <p className="text-lg font-bold text-rose-600">{meetingData.missingInfo.length}</p>
            </div>
          </div>
        </div>

        {/* 1. Verified Decisions Section */}
        <DecisionsList
          decisions={meetingData.decisions}
          onUpdateDecision={handleUpdateDecision}
          onDeleteDecision={handleDeleteDecision}
          onAddDecision={handleAddDecision}
          documentUrl={meetingData.documentUrl}
        />

        {/* 2. Action Items Editable Review Table */}
        <ReviewTable
          actionItems={meetingData.actionItems}
          onUpdateActionItem={handleUpdateActionItem}
          onDeleteActionItem={handleDeleteActionItem}
          onAddActionItem={handleAddActionItem}
          documentUrl={meetingData.documentUrl}
          onOpenSheetModal={() => setIsSheetModalOpen(true)}
          onOpenCalendarModal={() => setIsCalendarModalOpen(true)}
          isProcessingSheet={isProcessingSheet}
          isProcessingCalendar={isProcessingCalendar}
        />

        {/* 3. Open Questions & Missing Info Section */}
        <QuestionsList
          openQuestions={meetingData.openQuestions}
          missingInfo={meetingData.missingInfo}
          documentUrl={meetingData.documentUrl}
        />
      </main>

      {/* Sheet Confirmation Preview Modal */}
      <SheetConfirmationModal
        isOpen={isSheetModalOpen}
        onClose={() => setIsSheetModalOpen(false)}
        actionItems={meetingData.actionItems}
        meetingName={meetingData.meetingName}
        meetingDate={meetingData.meetingDate}
        documentUrl={meetingData.documentUrl}
        isSampleMode={isSampleMode}
        accessToken={accessToken}
        onConfirmAppend={handleConfirmAppendSheet}
        isProcessing={isProcessingSheet}
      />

      {/* Calendar Confirmation Preview Modal */}
      <CalendarConfirmationModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        actionItems={meetingData.actionItems}
        meetingName={meetingData.meetingName}
        documentUrl={meetingData.documentUrl}
        isSampleMode={isSampleMode}
        onConfirmSchedule={handleConfirmScheduleCalendar}
        isProcessing={isProcessingCalendar}
      />

      {/* Interactive Mock Sheet Viewer Modal */}
      <MockSheetModal
        isOpen={isMockSheetOpen}
        onClose={() => setIsMockSheetOpen(false)}
        rows={mockSheetRows}
        onClearRows={() => setMockSheetRows([])}
      />

      {/* Interactive Mock Calendar Viewer Modal */}
      <MockCalendarModal
        isOpen={isMockCalendarOpen}
        onClose={() => setIsMockCalendarOpen(false)}
        events={mockCalendarEvents}
        onClearEvents={() => setMockCalendarEvents([])}
      />

      {/* Recruiter Evaluation Guide Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
