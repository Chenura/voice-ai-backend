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

const upload = multer({ dest: "uploads/" });

// 🎤 Voice → Text
app.post("/transcribe", upload.single("audio"), async (req, res) => {
  const formData = new FormData();
  formData.append("file", fs.createReadStream(req.file.path));
  formData.append("model", "whisper-1");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.API_KEY}`
    },
    body: formData
  });

  const data = await response.json();
  res.json({ text: data.text });
});

// 🧠 Summarize
app.post("/summarize", async (req, res) => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Summarize shortly." },
        { role: "user", content: req.body.text }
      ]
    })
  });

  const data = await response.json();
  res.json({ text: data.choices[0].message.content });
});

// 🌍 Translate
app.post("/translate", async (req, res) => {
  const { text, lang } = req.body;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: `Translate to ${lang}` },
        { role: "user", content: text }
      ]
    })
  });

  const data = await response.json();
  res.json({ text: data.choices[0].message.content });
});

app.listen(3000, () => console.log("Server running"));
