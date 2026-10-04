import type { IncomingMessage, ServerResponse } from 'http';
import { extractMeetingNotes } from './gemini.ts';

export async function handleApiRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = req.url || '';

  if (url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', time: new Date().toISOString() }));
    return true;
  }

  if (url === '/api/extract' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { documentText, documentTitle, documentUrl } = payload;

        if (!documentText || typeof documentText !== 'string' || !documentText.trim()) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'documentText is required and must not be empty.' }));
          return;
        }

        const result = await extractMeetingNotes(documentText, documentTitle, documentUrl);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err: any) {
        console.error('API /api/extract error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            error: err?.message || 'Internal server error while extracting meeting notes.',
          })
        );
      }
    });

    return true;
  }

  return false;
}
