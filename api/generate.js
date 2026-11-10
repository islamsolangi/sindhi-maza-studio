// api/generate.js - Hugging Face Wan 2.1 - Free
export const maxDuration = 300;
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error: 'POST only'});
  const { prompt } = req.body;
  const KEY = process.env.HF_TOKEN;
  if (!KEY) return res.status(500).json({error: 'HF_TOKEN missing in Vercel'});
  try {
    const fullPrompt = 'Cinematic film still, realistic, smooth natural motion, warm film light, ' + prompt;
    const r = await fetch('https://api-inference.huggingface.co/models/Wan-AI/Wan2.1-T2V-1.3B', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: fullPrompt })
    });
    if(!r.ok){ let e = await r.text(); return res.status(500).json({error: 'Hugging Face: ' + e.substring(0,500)}); }
    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader('Content-Type', 'video/mp4');
    return res.send(buf);
  } catch(e){ return res.status(500).json({error: e.message}) }
}
