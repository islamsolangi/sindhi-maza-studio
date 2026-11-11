// api/generate.js - HF Router - NEW Endpoint 2026
export const maxDuration = 300;
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({error: 'POST only'});
    const prompt = req.body?.prompt || 'Sindhi boy';
    const KEY = process.env.HF_TOKEN;
    if (!KEY) return res.status(500).json({error: 'HF_TOKEN missing in Vercel'});

    // ✅ NAYA Router endpoint - purana band hai
    const r = await fetch('https://router.huggingface.co/hf-inference/models/damo-vilab/text-to-video-ms-1.7b', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: prompt, parameters: { wait_for_model: true } })
    });

    const ctype = r.headers.get('content-type') || '';
    if (!r.ok || ctype.includes('application/json')) {
      let txt = await r.text();
      return res.status(500).json({error: 'Hugging Face Router: ' + txt.substring(0,500)});
    }

    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 1000) return res.status(500).json({error: 'HF ne khaali video bheji, dobara try karo'});
    res.setHeader('Content-Type', 'video/mp4');
    return res.send(buf);
  } catch(e) {
    return res.status(500).json({error: 'Server: ' + e.message});
  }
}
