// File: /api/analyze.js (Vercel Serverless Function)

import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages, prompt } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing or invalid 'messages' array." });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: messages
        }
      ]
    });

    const answer = completion.choices[0].message.content;
    res.status(200).json({ response: answer });
  } catch (error) {
    console.error("GPT API error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
