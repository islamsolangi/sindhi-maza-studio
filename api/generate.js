// api/generate.js - Pollinations FREE model WAN
export const maxDuration = 300;
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({error: 'POST only'});
    const prompt = req.body?.prompt || 'Sindhi boy dancing near Sindh River';
    const KEY = process.env.POLLINATIONS_KEY;
    if (!KEY) return res.status(500).json({error: 'POLLINATIONS_KEY missing'});
    const fullPrompt = encodeURIComponent('Cinematic, realistic, smooth motion, warm film light: ' + prompt);
    const url = 'https://gen.pollinations.ai/video/' + fullPrompt + '?model=wan&width=720&height=480&nologo=true&safe=true&token=' + KEY;
    const v = await fetch(url, { headers: { 'Accept': 'video/mp4', 'Authorization': 'Bearer ' + KEY } });
    if (!v.ok) {
      const t = await v.text().catch(()=> '');
      return res.status(500).json({error: 'Pollinations: ' + v.status + ' ' + t.substring(0,400)});
    }
    const buf = Buffer.from(await v.arrayBuffer());
    if (buf.length < 10000) return res.status(500).json({error: 'Pollinations: khali video - dobara try karo'});
    res.setHeader('Content-Type', 'video/mp4');
    return res.send(buf);
  } catch(e) {
    return res.status(500).json({error: 'Server: ' + e.message});
  }
}
