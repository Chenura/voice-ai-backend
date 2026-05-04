import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

/* ======================
   🏠 TEST ROUTE
====================== */
app.get("/", (req, res) => {
  res.send("🚀 Gemini AI Voice Backend Running");
});

/* ======================
   🧠 SUMMARIZE (GEMINI)
====================== */
app.post("/summarize", async (req, res) => {
  try {
    const { text } = req.body;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Summarize this in simple points:\n\n${text}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    res.json({
      text:
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No summary generated"
    });

  } catch (err) {
    console.log(err);
    res.json({ text: "Summary error" });
  }
});

/* ======================
   🌍 TRANSLATE (GEMINI)
====================== */
app.post("/translate", async (req, res) => {
  try {
    const { text, lang } = req.body;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Translate this to ${lang}:\n\n${text}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    res.json({
      text:
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Translation failed"
    });

  } catch (err) {
    res.json({ text: "Translation error" });
  }
});

/* ======================
   🚀 SERVER START
====================== */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
