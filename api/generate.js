// api/generate.js - Gemini Veo - FIXED MODEL
export const maxDuration = 300;
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error: 'POST only'});
  const { prompt } = req.body;
  const KEY = process.env.GEMINI_API_KEY;
  if (!KEY) return res.status(500).json({error: 'KEY missing in Vercel'});

  try {
    // ✅ صحيح ماڊل: veo-3.0-generate-001 + predictLongRunning
    const create = await fetch('https://generativelanguage.googleapis.com/v1beta/models/veo-3.0-generate-001:predictLongRunning', {
      method: 'POST',
      headers: { 'x-goog-api-key': KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt: prompt }],
        parameters: { aspectRatio: '16:9', personGeneration: 'allow_all' }
      })
    });
    const job = await create.json();
    if (job.error) return res.status(500).json({error: 'Gemini: ' + job.error.message});

    let opName = job.name; // operations/...
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const check = await fetch('https://generativelanguage.googleapis.com/v1beta/' + opName, {
        headers: { 'x-goog-api-key': KEY }
      });
      const status = await check.json();
      if (status.done) {
        if (status.error) return res.status(500).json({error: 'Gemini: ' + status.error.message});
        const videoUri = status.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
        if (!videoUri) return res.status(500).json({error: 'No video - Veo ko billing chahiye ho sakta hai'});
        const file = await fetch(videoUri, { headers: { 'x-goog-api-key': KEY } });
        const buf = await file.arrayBuffer();
        res.setHeader('Content-Type', 'video/mp4');
        return res.send(Buffer.from(buf));
      }
    }
    return res.status(500).json({error: 'Timeout - 3 min se zyada laga'});
  } catch(e){ return res.status(500).json({error: e.message}) }
}
