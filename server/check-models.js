// Quick script to check available Gemini models
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("❌ No GEMINI_API_KEY found in .env");
  process.exit(1);
}

console.log("🔑 API Key (first 10 chars):", API_KEY.substring(0, 10) + "...");
console.log("🔍 Checking API key validity...\n");

const genAI = new GoogleGenerativeAI(API_KEY);

// Try to fetch a simple response to verify API key works
const modelsToCheck = [
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro-latest',
  'gemini-1.0-pro',
  'gemini-pro-vision',
  'gemini-pro'
];

console.log("Testing models...\n");

for (const modelName of modelsToCheck) {
  try {
    console.log(`Testing: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Say hello");
    const text = result.response.text();
    console.log(`✅ SUCCESS - ${modelName} works!`);
    console.log(`   Response: ${text.substring(0, 50)}...\n`);
    break; // Stop after first success
  } catch (error) {
    console.log(`❌ FAILED - ${modelName}`);
    console.log(`   Error: ${error.message}\n`);
  }
}

console.log("\n📝 Recommendation:");
console.log("If no models worked, your API key may be:");
console.log("1. Invalid or expired");
console.log("2. Not enabled for Gemini API");
console.log("3. Out of quota");
console.log("\nGet a new API key at: https://aistudio.google.com/app/apikey");
