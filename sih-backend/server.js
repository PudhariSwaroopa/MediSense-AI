import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Gemini API endpoint and key
const GEMINI_API_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Emergency symptoms list
const EMERGENCY_SYMPTOMS = [
  "chest pain",
  "shortness of breath",
  "trouble breathing",
  "loss of consciousness",
  "stroke",
  "sudden numbness",
  "severe bleeding",
];

// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message?.toLowerCase() || "";

    if (!userMessage) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Check if message contains emergency symptoms
    const isEmergency = EMERGENCY_SYMPTOMS.some((symptom) =>
      userMessage.includes(symptom)
    );

    let botReply = "";

    if (isEmergency) {
      botReply =
        "⚠️ This seems critical. Please call emergency helplines 108 / 102 immediately. " +
        "Go to the nearest hospital. Stay calm and seek urgent medical help.";
    } else {
      // Create prompt for Gemini
      const prompt = `
You are a multilingual health chatbot.
Respond ONLY in the same language as the user's question.
Follow verified WHO and ICMR guidelines.
If unsure, politely advise consulting a doctor.
The user's question is: "${userMessage}".
`;

      // Call Gemini API
      const response = await axios.post(
        `${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
        }
      );

      if (response.data?.candidates?.length > 0) {
        botReply =
          response.data.candidates[0].content.parts[0].text ||
          "Sorry, I couldn't understand that.";
      } else {
        botReply = "Sorry, I couldn't understand that.";
      }
    }

    res.json({ reply: botReply });
  } catch (err) {
    console.error("❌ Error in /chat:", err.stack || err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
