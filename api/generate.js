// api/generate.js
export const maxDuration = 300;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const { prompt } = req.body || {};
  const KEY = process.env.GEMINI_API_KEY;

  if (!KEY) {
    return res.status(500).json({ error: "KEY missing" });
  }

  if (!prompt || prompt.length > 2000) {
    return res.status(400).json({ error: "Invalid prompt" });
  }

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",
        headers: {
          "x-goog-api-key": KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gemini-omni-1.1-flash",
          input: "Create an 8-second cinematic video with audio: " + prompt,
          response_format: {
            type: "video"
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "Video generation failed"
      });
    }

    const steps = data.steps || [];
    const output = steps.find(s => s.type === "model_output");
    const video = output?.content?.find(
      item => item.type === "video" && item.data
    );

    if (!video) {
      return res.status(500).json({
        error: "Video output not found",
        status: data.status
      });
    }

    const buffer = Buffer.from(video.data, "base64");

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="sindhi-maza.mp4"'
    );

    return res.send(buffer);

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
