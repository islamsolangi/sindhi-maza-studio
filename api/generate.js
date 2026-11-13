export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { prompt, price } = req.body;
  const FAL_KEY = process.env.FAL_KEY;
  if (!FAL_KEY) return res.status(500).json({ error: 'FAL key missing' });

  // 90 واري = Hailuo - سادي
  // 180 واري = Kling - شاندار
  const isPremium = price == 180;
  const modelUrl = isPremium 
    ? 'https://fal.run/fal-ai/kling-video/v2.1/standard/text-to-video'
    : 'https://fal.run/fal-ai/minimax-hailuo-02/standard/text-to-video';

  try {
    const r = await fetch(modelUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        duration: isPremium ? '10' : '5',
        aspect_ratio: '9:16'
      })
    });
    const data = await r.json();
    const videoUrl = data.video?.url || data.video_url || data.output?.[0] || '';
    return res.status(200).json({ success: true, data: { video_url: videoUrl, raw: data } });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
