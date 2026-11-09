// api/generate.js - Gemini Omni 1.1 Flash - FIXED
export const maxDuration = 300;
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error: 'POST only'});
  const { prompt } = req.body;
  const KEY = process.env.GEMINI_API_KEY;
  if (!KEY) return res.status(500).json({error: 'KEY missing in Vercel'});

  try {
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-omni-1.1-flash:generateContent', {
      method: 'POST',
      headers: { 'x-goog-api-key': KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Generate a cinematic 8 second video: ' + prompt }] }],
        generationConfig: { responseModalities: ['VIDEO'] }
      })
    });
    const j = await r.json();
    if (j.error) return res.status(500).json({error: 'Gemini Omni: ' + j.error.message});

    const parts = j.candidates?.[0]?.content?.parts || [];
    let videoPart = parts.find(p => p.inlineData && p.inlineData.mimeType?.includes('video'));
    if (!videoPart) return res.status(500).json({error: 'No video - ' + JSON.stringify(j).substring(0,500)});

    const buf = Buffer.from(videoPart.inlineData.data, 'base64');
    res.setHeader('Content-Type', 'video/mp4');
    return res.send(buf);
  } catch(e){ return res.status(500).json({error: e.message}) }
}
