# Meeting Decision Tracker

Turns raw meeting notes into a verified list of decisions, action items and open questions, then pushes the approved tasks to Google Sheets and Google Calendar.

**Live demo:** [meetingapp-tau.vercel.app](https://meetingapp-tau.vercel.app) — sample mode works without signing in.

## The problem

After a meeting, decisions and tasks sit in free-text notes. Owners and deadlines get lost, and someone has to copy everything into a tracker by hand. This app does that extraction with an LLM, but keeps a person in the loop before anything is written.

## How it works

```text
Meeting notes (paste, sample, or a Google Doc)
        ↓
Gemini extraction with a strict JSON schema
        ↓
Review table: edit, approve or reject each item
        ↓
Approved tasks → Google Sheets rows + Google Calendar events
```

## Key features

- **Grounded extraction.** Every decision, task and question carries a verbatim quote from the notes, so each item can be checked against its source.
- **No invented data.** The schema tells the model to return "Missing" when an owner or due date isn't stated, rather than guessing. Missing information is listed separately so it can be chased up.
- **Only real decisions.** Proposals, debates and postponed topics are excluded from the decisions list.
- **Human review before sync.** Nothing reaches Sheets or Calendar until it's approved in the review table.
- **Model fallback.** If one Gemini model fails, the server retries with the next one in the list.
- **Least-privilege Google access.** Drive and Docs are read-only; write access is limited to Sheets and Calendar events.

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS · Express · Google Gemini API (`@google/genai`) · Firebase Authentication (Google sign-in) · Google Drive, Docs, Sheets and Calendar APIs · Vercel

## Project structure

```text
server.ts                       # Express server: /api/extract endpoint
src/server/gemini.ts            # extraction schema, prompt and model fallback
src/services/googleWorkspace.ts # Drive, Docs, Sheets and Calendar calls
src/services/googleAuth.ts      # Google sign-in and OAuth scopes
src/components/                 # review table, doc picker, confirmation modals
src/data/sampleNotes.ts         # sample meetings for the demo mode
```

## Run it locally

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and set `GEMINI_API_KEY` ([get a key](https://aistudio.google.com/apikey))
3. Start the app: `npm run dev`, then open http://localhost:3000

The Gemini key is only read on the server, never sent to the browser.

## How it was built

Prototyped with Google AI Studio and Gemini, then deployed on Vercel.

## Next steps

- Measure extraction accuracy against a labelled set of meeting notes
- Add Microsoft 365 (Outlook, Excel) as a second sync target
