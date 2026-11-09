// api/generate.js - OpenAI Sora Video
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error: 'POST only'});
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({error: 'Prompt missing'});

  // 1. Video job start karo
  const create = await fetch('https://api.openai.com/v1/videos', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ model: 'sora-2', prompt: prompt, size: '720x1280', seconds: '8' })
  });
  const job = await create.json();
  if (job.error) return res.status(500).json({error: job.error.message});

  // 2. Wait karo jab tak video ready thiye
  let videoId = job.id;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const check = await fetch('https://api.openai.com/v1/videos/' + videoId, {
      headers: { 'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY }
    });
    const status = await check.json();
    if (status.status === 'completed') {
      const file = await fetch('https://api.openai.com/v1/videos/' + videoId + '/content', {
        headers: { 'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY }
      });
      const buf = await file.arrayBuffer();
      res.setHeader('Content-Type', 'video/mp4');
      return res.send(Buffer.from(buf));
    }
    if (status.status === 'failed') return res.status(500).json({error: 'Video failed'});
  }
  return res.status(500).json({error: 'Timeout - try again'});
}
