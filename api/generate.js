export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { prompt, price } = req.body;
  const KIE_KEY = process.env.KIE_API_KEY;
  if (!KIE_KEY) return res.status(500).json({ error: 'KIE key missing' });

  // 90 واري = Hailuo - سستي
  // 180 واري = Kling - شاندار
  const model = price == 180 ? 'kling' : 'hailuo';
  const duration = price == 180 ? 10 : 5;

  try {
    const r = await fetch('https://kie.ai/api/v1/video/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KIE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        duration: duration,
        aspect_ratio: '9:16'
      })
    });
    const data = await r.json();
    return res.status(200).json({ success: true, data });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
