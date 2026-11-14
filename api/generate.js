export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { prompt, price, duration, type } = req.body;
  const FAL_KEY = process.env.FAL_KEY;
  if (!FAL_KEY) return res.status(500).json({ error: 'FAL key missing' });

  // نئون فڪس ريٽ:
  // 110 = سادي 6 سيڪنڊ - Hailuo
  // 200 = سادي 10 سيڪنڊ - Hailuo
  // 180 = شاندار 5 سيڪنڊ - Kling
  // 300 = شاندار 10 سيڪنڊ - Kling
  const isPremium = type === 'premium' || price == 180 || price == 300;
  const videoDuration = duration || (isPremium ? '5' : '6');

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
        duration: String(videoDuration),
        aspect_ratio: '9:16'
      })
    });
    const data = await r.json();
    const videoUrl = data.video?.url || data.video_url || data.output?.[0] || data.video?.url || '';
    return res.status(200).json({ success: true, data: { video_url: videoUrl, raw: data } });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
