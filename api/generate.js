// api/generate.js - Gemini Veo Video
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error: 'POST only'});
  const { prompt } = req.body;
  const KEY = process.env.GEMINI_API_KEY;
  if (!KEY) return res.status(500).json({error: 'GEMINI_API_KEY missing in Vercel'});

  // 1. Veo job start
  const create = await fetch('https://generativelanguage.googleapis.com/v1beta/models/veo-3.0-fast-generate-preview:generateContent?key=' + KEY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ instances: [{ prompt: prompt }], parameters: { aspectRatio: '16:9', durationSeconds: 8 } })
  });
  const job = await create.json();
  if (job.error) return res.status(500).json({error: job.error.message});

  let opName = job.name;
  // 2. Wait karo
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const check = await fetch('https://generativelanguage.googleapis.com/v1beta/' + opName + '?key=' + KEY);
    const status = await check.json();
    if (status.done) {
      if (status.error) return res.status(500).json({error: status.error.message});
      const videoUri = status.response?.generatedSamples?.[0]?.video?.uri;
      if (!videoUri) return res.status(500).json({error: 'No video returned'});
      const file = await fetch(videoUri + '&key=' + KEY);
      const buf = await file.arrayBuffer();
      res.setHeader('Content-Type', 'video/mp4');
      return res.send(Buffer.from(buf));
    }
  }
  return res.status(500).json({error: 'Timeout - try again'});
}
