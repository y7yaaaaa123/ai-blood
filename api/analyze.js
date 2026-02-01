import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { imageBase64, prompt } = req.body;
  if (!imageBase64 || !prompt) {
    return res.status(400).json({ error: "Missing image or prompt" });
  }

  try {
    const response = await client.responses.create({
      model: "gpt-4o",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            { type: "input_image", image_url: imageBase64 }
          ]
        }
      ]
    });

    const bloodTypeRaw = response.output_text.trim();
    const match = bloodTypeRaw.match(/(A|B|AB|O)[+-]/i);
    const bloodType = match ? match[0].toUpperCase() : "Uncertain";

    res.status(200).json({ bloodType, rawResponse: bloodTypeRaw });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
