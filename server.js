import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import fs from "fs";
import FormData from "form-data";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 📁 upload setup
const upload = multer({ dest: "uploads/" });

/* =========================
   🌐 HEALTH CHECK ROUTE
========================= */
app.get("/", (req, res) => {
  res.send("🚀 AI Voice Backend is Running!");
});

/* =========================
   🎤 VOICE → TEXT
========================= */
app.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ text: "No audio file received" });
    }

    const formData = new FormData();
    formData.append("file", fs.createReadStream(req.file.path));
    formData.append("model", "whisper-1");

    const response = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`
        },
        body: formData
      }
    );

    const data = await response.json();

    res.json({
      text: data.text || "⚠️ Could not detect speech"
    });
  } catch (error) {
    console.error(error);
    res.json({ text: "❌ Transcription error" });
  }
});

/* =========================
   🧠 SUMMARIZE TEXT
========================= */
app.post("/summarize", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.json({ text: "No text provided" });
    }

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: `Summarize this in simple points:\n\n${text}`
            }
          ]
        })
      }
    );

    const data = await response.json();

    res.json({
      text:
        data.choices?.[0]?.message?.content ||
        "⚠️ No summary generated"
    });
  } catch (error) {
    console.error(error);
    res.json({ text: "❌ Summarization error" });
  }
});

/* =========================
   🌍 TRANSLATE TEXT
========================= */
app.post("/translate", async (req, res) => {
  try {
    const { text, lang } = req.body;

    if (!text) {
      return res.json({ text: "No text provided" });
    }

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: `Translate this into ${lang}:\n\n${text}`
            }
          ]
        })
      }
    );

    const data = await response.json();

    res.json({
      text:
        data.choices?.[0]?.message?.content ||
        "⚠️ Translation failed"
    });
  } catch (error) {
    console.error(error);
    res.json({ text: "❌ Translation error" });
  }
});

/* =========================
   🚀 START SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
