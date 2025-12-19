// server.js (Gemini Version - ES modules)

import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

// Load .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

// Validate env
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ Missing GEMINI_API_KEY in .env");
}
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing Supabase env vars");
}

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Check if we should use AI processing
const USE_AI = process.env.USE_AI !== 'false'; // Set USE_AI=false in .env to skip AI

// Robust model selection - try models in order of preference
async function selectGenerativeModel() {
  if (!USE_AI) {
    console.log("⚠️  AI processing disabled (USE_AI=false)");
    return null;
  }

  const preferred = process.env.GEMINI_MODEL?.trim();
  
  // List of model names to try, in order of preference
  const modelsToTry = [
    preferred,
    'models/gemini-1.5-flash',
    'models/gemini-1.5-pro', 
    'models/gemini-pro',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro'
  ].filter(Boolean); // Remove undefined/empty values

  console.log("🔍 Trying to find a working Gemini model...");

  for (const modelName of modelsToTry) {
    try {
      console.log(`   Testing model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      // Try a simple test generation to verify the model works
      const testResponse = await model.generateContent("Hello");
      
      if (testResponse && testResponse.response) {
        console.log(`✅ Successfully connected with model: ${modelName}`);
        return model;
      }
    } catch (err) {
      console.log(`   ❌ Model '${modelName}' failed: ${err.message}`);
      continue;
    }
  }

  console.warn("⚠️  No working Gemini models found. Running without AI processing.");
  return null;
}

// Call this at startup and keep the model reference
let generativeModel = null;
try {
  generativeModel = await selectGenerativeModel();
  if (!generativeModel && USE_AI) {
    console.log("⚠️  Continuing without AI - data will be saved as-is to Supabase");
  }
} catch (err) {
  console.error("❌ Error initializing Gemini:", err.message);
  console.log("⚠️  Continuing without AI - data will be saved as-is to Supabase");
}

// Initialize Supabase (server-side)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize Express
const app = express();
const port = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json({ limit: "12mb" }));
app.use(express.text({ type: "*/*", limit: "12mb" }));

// Basic rate limit
app.use(
  rateLimit({
    windowMs: 30 * 1000,
    max: 10,
    standardHeaders: true,
  })
);

// ---- Helpers ----

const extractAllUrls = (text) => text.match(/https?:\/\/[^\s<>"')]+/gi) || [];
const mediaRegex =
  /\.(png|jpe?g|gif|svg|webp|mp4|webm|mov|avi|mkv|m4v)(\?.*)?$/i;
const isMedia = (url) => mediaRegex.test(url);

// Strip ```json fences if Gemini returns them
const cleanFencedJSON = (txt) =>
  txt.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();

// Call Python NLP Service
async function callNLPService(text) {
  const NLP_SERVICE_URL = process.env.NLP_SERVICE_URL || "http://localhost:5002";
  
  try {
    console.log("🐍 Calling Python NLP service...");
    const response = await fetch(`${NLP_SERVICE_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      throw new Error(`NLP service returned ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ NLP analysis complete");
    return result;
  } catch (error) {
    console.error("⚠️  NLP service error:", error.message);
    return null;
  }
}

// ---- Main Route ----

app.post("/receive_data", async (req, res) => {
  try {
    console.log("📥 Received request body:", JSON.stringify(req.body).substring(0, 200));
    
    // Accept either raw text or { text: "..."}
    let rawText = typeof req.body === "string"
      ? req.body
      : req.body?.text || req.body?.content || "";

    console.log("📝 Raw text length:", rawText.length);

    if (!rawText || rawText.length < 20) {
      console.log("❌ Insufficient text data");
      return res.status(400).json({ error: "Insufficient text data." });
    }

    const todaysTimestamp = new Date().toISOString();

    // Create basic structured data from the raw text
    const urls = extractAllUrls(rawText);
    const mediaFromText = urls.filter(isMedia);
    const sourceUrl = urls.find((u) => !isMedia(u)) || null;

    // Extract title from the text (first line usually)
    const lines = rawText.split('\n').filter(l => l.trim());
    const titleLine = lines.find(l => l.startsWith('Title:')) || lines[0] || 'Untitled';
    const extractedTitle = titleLine.replace('Title:', '').trim();

    let structured;

    // Try Python NLP service first
    const nlpResult = await callNLPService(rawText);
    
    if (nlpResult) {
      console.log("🧠 Using Python NLP analysis");
      structured = {
        title: extractedTitle.substring(0, 100),
        summary: nlpResult.summary || rawText.substring(0, 300).trim() + '...',
        keywords: nlpResult.keywords || [],
        emotions: [nlpResult.sentiment?.label || 'NEUTRAL'],
        sentiment_score: nlpResult.sentiment?.score || 0,
        timestamp: todaysTimestamp,
        source_url: sourceUrl,
        media_urls: mediaFromText,
        embedding: nlpResult.embedding || null,
        nlp_processed: true
      };
    }
    // Fallback to Gemini if available and NLP failed
    else if (generativeModel) {
      try {
        const systemPrompt = `
You are a structured JSON extraction engine. Analyze the raw text and output ONLY a valid JSON object.

Output keys:
- "title": short title
- "summary": 2–3 sentence summary
- "keywords": array of 3–6 keywords
- "emotions": array of 1–3 tones/emotions
- "timestamp": ISO timestamp from text if found, otherwise "${todaysTimestamp}"
- "source_url": main reference URL or null
- "media_urls": array of media URLs (may be empty)

Return ONLY JSON. No extra commentary.
`;

        const fullPrompt = `${systemPrompt}\n\nText:\n${rawText}`;

        console.log("🔮 Sending text to Gemini for analysis...");

        // Gemini API call using the pre-selected model
        const response = await generativeModel.generateContent(fullPrompt);

        let aiText = response.response.text();
        aiText = cleanFencedJSON(aiText);

        // Parse JSON
        structured = JSON.parse(aiText);
        console.log("🧠 Gemini structured output:", structured);

      } catch (e) {
        console.error("⚠️  AI processing failed:", e.message);
        console.log("📦 Using basic extraction instead");
        structured = null;
      }
    }

    // Fallback: create basic structured data without AI
    if (!structured) {
      console.log("📦 Creating structured data without AI");
      structured = {
        title: extractedTitle.substring(0, 100),
        summary: rawText.substring(0, 300).trim() + '...',
        keywords: [],
        emotions: [],
        timestamp: todaysTimestamp,
        source_url: sourceUrl,
        media_urls: mediaFromText,
        raw_content: rawText.substring(0, 1000)
      };
    }

    // Augment with detected URLs
    const mergedMedia = Array.from(
      new Set([...(structured.media_urls || []), ...mediaFromText])
    );

    structured.media_urls = mergedMedia;

    if (!structured.timestamp) {
      structured.timestamp = todaysTimestamp;
    }

    if (!structured.source_url || typeof structured.source_url !== "string") {
      structured.source_url = sourceUrl;
    }

    console.log("📄 Final structured output:", structured);

    // Save to Supabase - Clean JSON structure (no stringification)
    const { data, error } = await supabase
      .from("content_documents")
      .insert([
        {
          title: structured.title || null,
          summary: structured.summary || null,
          keywords: structured.keywords || [],
          emotions: structured.emotions || [],
          sentiment_score: structured.sentiment_score || null,
          source_url: structured.source_url || null,
          media_urls: structured.media_urls || [],
          captured_at: structured.timestamp || todaysTimestamp,
          embedding: structured.embedding || null,
          nlp_processed: structured.nlp_processed || false,
          raw_content: rawText.substring(0, 5000) // Store first 5000 chars
        },
      ])
      .select();

    if (error) {
      console.error("❌ Supabase insert error:", error);
      return res.status(500).json({ error: "Failed to save to database", details: error.message });
    } else {
      console.log("💾 Saved to Supabase:", data[0]?.id);
    }

    res.status(200).json(structured);
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ error: "Server failed." });
  }
});

// Image analysis endpoint for reverse image search
app.post("/analyze_image", async (req, res) => {
  try {
    console.log("🖼️ Image analysis request received");
    
    // For now, return mock keywords since we don't have image processing set up
    // In production, you would use a vision API or ML model
    const mockKeywords = ["technology", "web", "digital", "content"];
    
    res.status(200).json({ 
      keywords: mockKeywords,
      message: "Image analysis not yet implemented - using mock keywords"
    });
  } catch (err) {
    console.error("❌ Image analysis error:", err);
    res.status(500).json({ error: "Image analysis failed" });
  }
});

app.listen(port, () =>
  console.log(`🚀 Gemini server running at http://localhost:${port}`)
);

async function runNLP(text) {
  const resp = await fetch("http://localhost:5000/analyze", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ text })
  });
  return await resp.json();
}