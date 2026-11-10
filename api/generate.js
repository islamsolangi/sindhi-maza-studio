// api/generate.js - Hugging Face - Small Model - Free
export const maxDuration = 300;
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error: 'POST only'});
  const { prompt } = req.body;
  const KEY = process.env.HF_TOKEN;
  if (!KEY) return res.status(500).json({error: 'HF_TOKEN missing in Vercel'});
  try {
    // Chota model - free server pe chalta hai
    const r = await fetch('https://api-inference.huggingface.co/models/damo-vilab/text-to-video-ms-1.7b', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: prompt })
    });
    if(r.status === 503){
      return res.status(500).json({error: 'Model loading hai - 1 min baad dobara try karo'});
    }
    if(!r.ok){ let e = await r.text(); return res.status(500).json({error: 'Hugging Face: ' + e.substring(0,500)}); }
    const buf = 【entity-Buffer¦canonical_name=Buffer】.from(await r.arrayBuffer());
    res.setHeader('Content-Type', 'video/mp4');
    return res.send(buf);
  } catch(e){ return res.status(500).json({error: 'fetch failed - HF server busy, 1 min baad dobara try karo: ' + e.message}) }
}
