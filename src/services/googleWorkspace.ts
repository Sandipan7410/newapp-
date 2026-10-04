import type { DriveDocumentItem, SpreadsheetItem } from '../types/index.ts';

export interface WorkspaceError {
  status?: number;
  message: string;
  details?: string;
  service: 'drive' | 'docs' | 'sheets' | 'calendar';
}

function handleWorkspaceHttpError(response: Response, service: WorkspaceError['service'], data?: any): never {
  let errorMsg = `Google ${service.toUpperCase()} API returned status ${response.status}`;
  if (data?.error?.message) {
    errorMsg = data.error.message;
  } else if (response.status === 401) {
    errorMsg = 'Google authentication session expired. Please sign in again.';
  } else if (response.status === 403) {
    errorMsg = `Permission denied. Please ensure you granted ${service} access permissions during sign-in.`;
  } else if (response.status === 404) {
    errorMsg = `Requested ${service} resource was not found. Please check document ID or URL.`;
  }

  const err = new Error(errorMsg) as Error & WorkspaceError;
  err.status = response.status;
  err.service = service;
  err.details = JSON.stringify(data || {});
  throw err;
}

/**
 * List recent Google Docs from the user's Drive.
 */
export async function listGoogleDocs(accessToken: string): Promise<DriveDocumentItem[]> {
  try {
    const query = encodeURIComponent("mimeType = 'application/vnd.google-apps.document' and trashed = false");
    const fields = encodeURIComponent('files(id, name, modifiedTime, webViewLink)');
    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&orderBy=modifiedTime desc&pageSize=20`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      handleWorkspaceHttpError(res, 'drive', data);
    }

    return (data.files || []).map((f: any) => ({
      id: f.id,
      name: f.name,
      modifiedTime: f.modifiedTime,
      webViewLink: f.webViewLink || `https://docs.google.com/document/d/${f.id}/edit`,
    }));
  } catch (err: any) {
    if (!err.service) {
      err.service = 'drive';
    }
    throw err;
  }
}

/**
 * Extract clean plain text from Google Docs document structure.
 */
export function extractTextFromGoogleDoc(docData: any): string {
  if (!docData || !docData.body || !docData.body.content) {
    return '';
  }

  const buffer: string[] = [];

  for (const element of docData.body.content) {
    if (element.paragraph) {
      const paragraphText = (element.paragraph.elements || [])
        .map((el: any) => el.textRun?.content || '')
        .join('');
      buffer.push(paragraphText);
    } else if (element.table) {
      for (const row of element.table.tableRows || []) {
        const rowCells: string[] = [];
        for (const cell of row.tableCells || []) {
          const cellText = (cell.content || [])
            .map((c: any) =>
              (c.paragraph?.elements || [])
                .map((el: any) => el.textRun?.content || '')
                .join('')
            )
            .join(' ')
            .trim();
          if (cellText) rowCells.push(cellText);
        }
        if (rowCells.length > 0) {
          buffer.push(rowCells.join(' | ') + '\n');
        }
      }
    }
  }

  return buffer.join('');
}

/**
 * Fetch a Google Doc by ID.
 */
export async function fetchGoogleDoc(
  accessToken: string,
  docId: string
): Promise<{ title: string; content: string; webViewLink: string; rawDoc: any }> {
  try {
    const cleanId = docId.trim();
    const docUrl = `https://docs.googleapis.com/v1/documents/${cleanId}`;

    const res = await fetch(docUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const docData = await res.json();
    if (!res.ok) {
      handleWorkspaceHttpError(res, 'docs', docData);
    }

    const text = extractTextFromGoogleDoc(docData);
    const title = docData.title || 'Untitled Document';
    const webViewLink = `https://docs.google.com/document/d/${cleanId}/edit`;

    return {
      title,
      content: text,
      webViewLink,
      rawDoc: docData,
    };
  } catch (err: any) {
    if (!err.service) {
      err.service = 'docs';
    }
    throw err;
  }
}

/**
 * List existing Google Sheets from Drive.
 */
export async function listGoogleSheets(accessToken: string): Promise<SpreadsheetItem[]> {
  try {
    const query = encodeURIComponent("mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false");
    const fields = encodeURIComponent('files(id, name, modifiedTime, webViewLink)');
    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&orderBy=modifiedTime desc&pageSize=20`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      handleWorkspaceHttpError(res, 'drive', data);
    }

    return (data.files || []).map((f: any) => ({
      id: f.id,
      name: f.name,
      modifiedTime: f.modifiedTime,
      webViewLink: f.webViewLink || `https://docs.google.com/spreadsheets/d/${f.id}/edit`,
    }));
  } catch (err: any) {
    if (!err.service) {
      err.service = 'sheets';
    }
    throw err;
  }
}

/**
 * Create a new Google Spreadsheet with standard Meeting Action Items headers.
 */
export async function createGoogleSpreadsheet(
  accessToken: string,
  title: string
): Promise<{ id: string; webViewLink: string; title: string }> {
  try {
    const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title,
        },
        sheets: [
          {
            properties: {
              title: 'Action Items',
              gridProperties: {
                frozenRowCount: 1,
              },
            },
          },
        ],
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      handleWorkspaceHttpError(res, 'sheets', data);
    }

    const spreadsheetId = data.spreadsheetId;
    const webViewLink = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

    // Append standard headers
    const headerRow = [
      'Meeting Name',
      'Meeting Date',
      'Action Item',
      'Owner',
      'Due Date',
      'Source Quote',
      'Approved On',
      'Source Doc',
    ];

    await appendRowsToSpreadsheet(accessToken, spreadsheetId, [headerRow], 'Action Items');

    return {
      id: spreadsheetId,
      webViewLink,
      title,
    };
  } catch (err: any) {
    if (!err.service) {
      err.service = 'sheets';
    }
    throw err;
  }
}

/**
 * Append rows to an existing Google Spreadsheet.
 */
export async function appendRowsToSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  rows: (string | number)[][],
  sheetTab: string = 'Sheet1'
): Promise<{ updatedRows: number }> {
  try {
    const range = `${encodeURIComponent(sheetTab)}!A:H`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: rows,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      handleWorkspaceHttpError(res, 'sheets', data);
    }

    return {
      updatedRows: data?.updates?.updatedRows || rows.length,
    };
  } catch (err: any) {
    if (!err.service) {
      err.service = 'sheets';
    }
    throw err;
  }
}

/**
 * Schedule a Google Calendar event.
 */
export async function createGoogleCalendarEvent(
  accessToken: string,
  event: {
    summary: string;
    description: string;
    dueDate: string; // YYYY-MM-DD
  }
): Promise<{ id: string; htmlLink: string }> {
  try {
    if (!event.dueDate || event.dueDate.toLowerCase().includes('missing')) {
      throw new Error('Cannot schedule a Google Calendar event without a valid, confirmed due date.');
    }

    const payload = {
      summary: event.summary,
      description: event.description,
      start: {
        date: event.dueDate,
      },
      end: {
        date: event.dueDate,
      },
      reminders: {
        useDefault: true,
      },
    };

    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      handleWorkspaceHttpError(res, 'calendar', data);
    }

    return {
      id: data.id,
      htmlLink: data.htmlLink,
    };
  } catch (err: any) {
    if (!err.service) {
      err.service = 'calendar';
    }
    throw err;
  }
}

/**
 * Helper to parse Doc ID from full URL or return ID if raw ID was provided.
 */
export function parseGoogleDocId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}
