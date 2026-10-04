import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { extractMeetingNotes } from './src/server/gemini.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Meeting Decision Tracker' });
});

app.post('/api/extract', async (req, res) => {
  try {
    const { documentText, documentTitle, documentUrl } = req.body;
    if (!documentText || typeof documentText !== 'string' || !documentText.trim()) {
      return res.status(400).json({ error: 'documentText is required and must not be empty.' });
    }

    const result = await extractMeetingNotes(documentText, documentTitle, documentUrl);
    return res.json(result);
  } catch (error: any) {
    console.error('Server extraction error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to extract meeting notes.' });
  }
});

// Serve frontend in production
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
