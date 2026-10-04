import { GoogleGenAI, Type } from '@google/genai';
import type { MeetingExtractionResult } from '../types/index.ts';

const EXTRACTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    meetingName: {
      type: Type.STRING,
      description: 'The title, name, or subject of the meeting. If unstated, use a clear summary title.',
    },
    meetingDate: {
      type: Type.STRING,
      description: 'The date the meeting took place (YYYY-MM-DD format if possible, or readable date string). If not mentioned in the text, return "Missing".',
    },
    decisions: {
      type: Type.ARRAY,
      description: 'Decisions that were ACTUALLY finalized and agreed upon. CRITICAL: Strictly exclude undecided debates, proposals that were rejected or not adopted, brainstorms, or postponed discussions.',
      items: {
        type: Type.OBJECT,
        properties: {
          decision: {
            type: Type.STRING,
            description: 'Clear statement of the finalized decision.',
          },
          quote: {
            type: Type.STRING,
            description: 'Verbatim short quote directly from the notes supporting this decision.',
          },
          context: {
            type: Type.STRING,
            description: 'Brief context or rationale mentioned.',
          },
        },
        required: ['decision', 'quote'],
      },
    },
    actionItems: {
      type: Type.ARRAY,
      description: 'Explicit action items or tasks assigned to individuals or teams.',
      items: {
        type: Type.OBJECT,
        properties: {
          task: {
            type: Type.STRING,
            description: 'The task description to be performed.',
          },
          owner: {
            type: Type.STRING,
            description: 'The assigned person or team. CRITICAL RULE: If the notes do not explicitly state an owner, return exactly "Missing". Never invent or assume an owner.',
          },
          dueDate: {
            type: Type.STRING,
            description: 'The due date or deadline (prefer YYYY-MM-DD format if determinable). CRITICAL RULE: If the notes do not explicitly state a date, return exactly "Missing". Never invent a date.',
          },
          quote: {
            type: Type.STRING,
            description: 'Verbatim short quote directly from the notes where this task was mentioned.',
          },
        },
        required: ['task', 'owner', 'dueDate', 'quote'],
      },
    },
    openQuestions: {
      type: Type.ARRAY,
      description: 'Unresolved questions, blockers, or items requiring further discussion or clarification.',
      items: {
        type: Type.OBJECT,
        properties: {
          question: {
            type: Type.STRING,
            description: 'The unresolved question or ambiguity.',
          },
          ownerOrTarget: {
            type: Type.STRING,
            description: 'Person or department asked, or "Missing" if unassigned.',
          },
          quote: {
            type: Type.STRING,
            description: 'Verbatim short quote from the text.',
          },
        },
        required: ['question', 'quote'],
      },
    },
    missingInfo: {
      type: Type.ARRAY,
      description: 'Key gaps or missing information noticed in the meeting notes (e.g. unassigned action items, missing deadlines, unclear ownership).',
      items: {
        type: Type.STRING,
      },
    },
  },
  required: ['meetingName', 'meetingDate', 'decisions', 'actionItems', 'openQuestions', 'missingInfo'],
};

export async function extractMeetingNotes(
  documentText: string,
  docTitle?: string,
  docUrl?: string
): Promise<MeetingExtractionResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please set GEMINI_API_KEY.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemPrompt = `You are an expert executive meeting recorder and decision auditor.
Analyze the provided meeting notes with absolute fidelity to the source text.

CRITICAL INSTRUCTIONS:
1. DECISIONS:
   - Extract ONLY decisions that were actually agreed upon, finalized, or approved.
   - DO NOT include proposals, suggestions, discussions, or debates that concluded without a decision or were tabled/deferred to later meetings.
   - For every decision, provide a short verbatim quote from the text.

2. ACTION ITEMS:
   - Extract actionable tasks.
   - If an owner is not explicitly stated in the text, you MUST set the owner field to "Missing". DO NOT guess, hallucinate, or invent an owner.
   - If a due date or deadline is not explicitly stated in the text, you MUST set the dueDate field to "Missing". DO NOT invent a date.
   - Provide a short verbatim quote from the text.

3. OPEN QUESTIONS & MISSING INFO:
   - Extract any open questions, unresolved topics, or missing information explicitly flagged or implied by the notes.
   - If action items lack owners or dates, highlight that in missingInfo as well.

Document Title: ${docTitle || 'Untitled Meeting Document'}
Source Document URL: ${docUrl || ''}
`;

  const userPrompt = `Here are the meeting notes:\n\n---\n${documentText}\n---`;

  const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let responseText: string | undefined;
  let lastError: any = null;

  for (const model of candidateModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
          ],
          config: {
            responseMimeType: 'application/json',
            responseSchema: EXTRACTION_SCHEMA,
          },
        });
        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Extraction with ${model} attempt ${attempt + 1} failed:`, err?.message || err);
        // Wait briefly before retry if 503
        await new Promise((r) => setTimeout(r, 600));
      }
    }
    if (responseText) break;
  }

  if (!responseText) {
    throw new Error(
      lastError?.message || 'No response received from Gemini extraction model. Please try again.'
    );
  }

  const parsed = JSON.parse(responseText);

  // Map to MeetingExtractionResult with IDs and approval states
  const result: MeetingExtractionResult = {
    meetingName: parsed.meetingName || docTitle || 'Meeting Notes',
    meetingDate: parsed.meetingDate || 'Missing',
    documentTitle: docTitle,
    documentUrl: docUrl,
    decisions: (parsed.decisions || []).map((d: any, index: number) => ({
      id: `dec-${Date.now()}-${index}`,
      decision: d.decision || '',
      quote: d.quote || '',
      context: d.context || '',
      approved: true,
    })),
    actionItems: (parsed.actionItems || []).map((a: any, index: number) => ({
      id: `act-${Date.now()}-${index}`,
      task: a.task || '',
      owner: (a.owner && a.owner.trim()) ? a.owner.trim() : 'Missing',
      dueDate: (a.dueDate && a.dueDate.trim()) ? a.dueDate.trim() : 'Missing',
      quote: a.quote || '',
      approved: true,
      sheetSynced: false,
      calendarSynced: false,
    })),
    openQuestions: (parsed.openQuestions || []).map((q: any, index: number) => ({
      id: `q-${Date.now()}-${index}`,
      question: q.question || '',
      ownerOrTarget: q.ownerOrTarget || 'Missing',
      quote: q.quote || '',
    })),
    missingInfo: parsed.missingInfo || [],
  };

  return result;
}
