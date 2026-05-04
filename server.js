import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🏠 Health check
app.get("/", (req, res) => {
  res.send("🚀 Pro Gemini AI Backend Running");
});

// 🧠 SUMMARIZE
app.post("/summarize", async (req, res) => {
  const { text } = req.body;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `Summarize this clearly:\n\n${text}` }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    res.json({
      result:
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response"
    });
  } catch (err) {
    res.json({ result: "Error generating summary" });
  }
});

// 🌍 TRANSLATE
app.post("/translate", async (req, res) => {
  const { text, lang } = req.body;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `Translate to ${lang}:\n\n${text}` }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    res.json({
      result:
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response"
    });
  } catch (err) {
    res.json({ result: "Error translating" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on", PORT);
});
