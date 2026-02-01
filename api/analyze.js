import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageBase64, prompt } = req.body;

  if (!imageBase64 || !prompt) {
    return res.status(400).json({ error: 'Missing image or prompt' });
  }

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4.1-vision", // تأكد من النموذج الصحيح
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageBase64 } },
          ],
        },
      ],
    });

    const bloodTypeRaw = response.choices[0].message.content.trim();

    // تنظيف النص لاستخراج فصيلة الدم فقط
    const bloodTypeMatch = bloodTypeRaw.match(/(A|B|AB|O)[+-]/i);
    const bloodType = bloodTypeMatch ? bloodTypeMatch[0].toUpperCase() : null;

    res.status(200).json({ bloodType, rawResponse: bloodTypeRaw });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}