// File: /api/analyze.js (Updated with GPT payload logging)

import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages, prompt } = req.body;

    if (!Array.isArray(messages) || !messages.some(m => m.type === "image_url")) {
      return res.status(400).json({ error: "Missing or invalid message format. Ensure it includes image_url blocks." });
    }

    console.log("📤 GPT Payload:", JSON.stringify(messages, null, 2));

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: messages
        }
      ]
    });

    const answer = chatCompletion.choices[0]?.message?.content || "No response from GPT.";
    return res.status(200).json({ response: answer });

  } catch (error) {
    console.error("GPT Vision API error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
