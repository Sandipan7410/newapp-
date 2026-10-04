export interface ExtractedDecision {
  id: string;
  decision: string;
  quote: string;
  context?: string;
  approved: boolean;
}

export interface ExtractedActionItem {
  id: string;
  task: string;
  owner: string; // "Missing" if not stated
  dueDate: string; // YYYY-MM-DD or "Missing"
  quote: string;
  approved: boolean;
  sheetSynced?: boolean;
  calendarSynced?: boolean;
}

export interface ExtractedOpenQuestion {
  id: string;
  question: string;
  ownerOrTarget: string; // or "Missing"
  quote: string;
}

export interface MeetingExtractionResult {
  meetingName: string;
  meetingDate: string; // YYYY-MM-DD or string or "Missing"
  documentTitle?: string;
  documentUrl?: string;
  decisions: ExtractedDecision[];
  actionItems: ExtractedActionItem[];
  openQuestions: ExtractedOpenQuestion[];
  missingInfo: string[];
  rawNotesSummary?: string;
}

export interface DriveDocumentItem {
  id: string;
  name: string;
  modifiedTime?: string;
  webViewLink?: string;
}

export interface SpreadsheetItem {
  id: string;
  name: string;
  modifiedTime?: string;
  webViewLink?: string;
}
