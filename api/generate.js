// api/generate.js - fal.ai MiniMax H3 - WITH AUDIO
export const maxDuration = 300;
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({error: 'POST only'});
    const prompt = req.body?.prompt || 'Sindhi boy dancing near Sindh River';
    const KEY = process.env.FAL_KEY;
    if (!KEY) return res.status(500).json({error: 'FAL_KEY missing in Vercel'});

    const sub = await fetch('https://queue.fal.run/minimax/h3/text-to-video', {
      method: 'POST',
      headers: { 'Authorization': 'Key ' + KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: {
        prompt: 'Cinematic, realistic, smooth motion, warm film light, with natural sound, dialogue and ambience: ' + prompt,
        duration: 5,
        resolution: '768P',
        aspect_ratio: '16:9',
        prompt_expansion_mode: 'disabled'
      }})
    });
    const subJ = await sub.json();
    if (!sub.ok) return res.status(500).json({error: 'fal submit: ' + JSON.stringify(subJ).substring(0,600)});
    const requestId = subJ.request_id;

    let done = false;
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const st = await fetch('https://queue.fal.run/minimax/h3/text-to-video/requests/' + requestId + '/status', {
        headers: { 'Authorization': 'Key ' + KEY }
      });
      const stJ = await st.json();
      if (stJ.status === 'COMPLETED') { done = true; break; }
      if (stJ.status === 'FAILED') return res.status(500).json({error: 'fal failed: ' + JSON.stringify(stJ).substring(0,500)});
    }
    if (!done) return res.status(500).json({error: 'fal timeout - dobara try karo'});

    const rs = await fetch('https://queue.fal.run/minimax/h3/text-to-video/requests/' + requestId, {
      headers: { 'Authorization': 'Key ' + KEY }
    });
    const rsJ = await rs.json();
    const videoUrl = rsJ.data?.video?.url || rsJ.video?.url;
    if (!videoUrl) return res.status(500).json({error: 'fal: video url nahi mili'});

    const v = await fetch(videoUrl);
    const buf = Buffer.from(await v.arrayBuffer());
    res.setHeader('Content-Type', 'video/mp4');
    return res.send(buf);
  } catch(e) {
    return res.status(500).json({error: 'Server: ' + e.message});
  }
}
