// api/generate.js - FREE IMAGE - Pollinations image is FREE
export const maxDuration = 60;
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({error: 'POST only'});
    const prompt = req.body?.prompt || 'Sindhi boy near Sindh River';
    const KEY = process.env.POLLINATIONS_KEY;
    const full = encodeURIComponent('Cinematic photo, realistic, warm sunset light, high detail: ' + prompt);
    // Image model flux is FREE / very low pollen
    const url = 'https://gen.pollinations.ai/image/' + full + '?model=flux&width=1024&height=768&nologo=true&safe=true&token=' + (KEY || '');
    const r = await fetch(url, { headers: { 'Authorization': 'Bearer ' + (KEY || '') } });
    if (!r.ok) {
      const t = await r.text().catch(()=> '');
      return res.status(500).json({error: 'Pollinations Image: ' + r.status + ' ' + t.substring(0,400)});
    }
    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader('Content-Type', 'image/jpeg');
    return res.send(buf);
  } catch(e){ return res.status(500).json({error: 'Server: ' + e.message}); }
}
