import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.set("trust proxy", true);

// Enable CORS and handle preflight requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Enable JSON body parsing with enough limit for photo/handwriting uploads
app.use(express.json({ limit: "15mb" }));

// Rate limiting map (IP -> timestamps)
const rateLimitWindowMs = 60 * 1000; // 1 minute
const maxRequestsPerWindow = 60; // Generous for normal interaction, protects server
const requestLogs = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = requestLogs.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < rateLimitWindowMs);
  
  if (validTimestamps.length >= maxRequestsPerWindow) {
    return false;
  }
  
  validTimestamps.push(now);
  requestLogs.set(ip, validTimestamps);
  return true;
}

// Lazy Gemini SDK client accessor
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY is not configured or invalid in environment settings.");
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// Candidate Gemini models with fallback priority
// gemini-3.6-flash is high-speed and tested responsive; gemini-3.8-flash is resilient fallback
const CANDIDATE_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.8-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
];

// Circuit breaker tracking: model -> timestamp until which the model is on cooldown
const modelCooldowns = new Map<string, number>();
const COOLDOWN_DURATION_MS = 60 * 1000; // 60 seconds
const PER_MODEL_TIMEOUT_MS = 9000; // 9 seconds max wait before trying next model

// Helper to call Gemini with automatic failover, timeout racing, and low-latency thinking config
async function generateWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
  }
) {
  const now = Date.now();
  // Sort candidate models so currently healthy models are tried first
  const sortedModels = [...CANDIDATE_MODELS].sort((a, b) => {
    const aCool = (modelCooldowns.get(a) || 0) > now ? 1 : 0;
    const bCool = (modelCooldowns.get(b) || 0) > now ? 1 : 0;
    return aCool - bCool;
  });

  let lastError: any = null;

  for (const modelName of sortedModels) {
    try {
      const isGemini3 = modelName.includes("gemini-3");
      const configWithThinking = {
        ...params.config,
        ...(isGemini3 ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } } : {}),
      };

      const callPromise = ai.models.generateContent({
        model: modelName,
        contents: params.contents,
        config: configWithThinking,
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error(`Model ${modelName} timed out after ${PER_MODEL_TIMEOUT_MS / 1000}s`)),
          PER_MODEL_TIMEOUT_MS
        );
      });

      const response: any = await Promise.race([callPromise, timeoutPromise]);

      // Clear cooldown on success
      modelCooldowns.delete(modelName);
      return response;
    } catch (err: any) {
      lastError = err;
      const errMsg = String(err?.message || "");
      const status = err?.status || err?.code;
      const isDemandSpike =
        status === 503 ||
        status === 429 ||
        errMsg.includes("503") ||
        errMsg.includes("429") ||
        errMsg.includes("high demand") ||
        errMsg.includes("timed out") ||
        errMsg.includes("UNAVAILABLE") ||
        errMsg.includes("RESOURCE_EXHAUSTED");

      if (isDemandSpike) {
        modelCooldowns.set(modelName, Date.now() + COOLDOWN_DURATION_MS);
        console.log(`[Gemini Fallback] Model ${modelName} spike/timeout; falling over to next candidate...`);
      } else {
        console.log(`[Gemini Fallback] Model ${modelName} error (${errMsg.slice(0, 80)}); trying next candidate...`);
      }
    }
  }

  throw lastError;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const isKeyConfigured = Boolean(apiKey && apiKey.trim() !== "" && apiKey !== "MY_GEMINI_API_KEY");
  res.json({
    status: "ok",
    geminiConfigured: isKeyConfigured,
    model: "gemini-3.6-flash",
    fallbackModels: CANDIDATE_MODELS,
  });
});

// Helper system prompt builder
function buildSystemInstruction(level: string, subject: string, language: string, mode: string) {
  return `You are "StudyMate AI", an elite AI Tutor, Universal Knowledge Engine, and Educational Assistant.

MANDATORY OUTPUT LANGUAGE DIRECTIVE:
The student has explicitly selected "${language}" as their learning language.
You MUST write your entire response, explanations, step-by-step breakdown, friendly advice, and educational guidance strictly and completely in "${language}".
- The selected language "${language}" controls your output language directly. Do NOT reply in English unless the selected language is "English".
- Even if the student typed their question in English or submitted a photo/equation written in English, you MUST translate your explanation and teach the solution entirely in "${language}".
- If "${language}" is "Urdu": Respond entirely in proper Urdu script (اردو).
- If "${language}" is "Roman Urdu": Respond entirely in natural, friendly Roman Urdu (e.g., "Is sawal ko hal karne ke liye pehle hum formula samajhte hain...").
- If "${language}" is "Hindi": Respond entirely in Hindi (हिन्दी).
- If "${language}" is "Arabic": Respond entirely in Arabic (العربية).
- If "${language}" is "Spanish", "French", "German", "Chinese (Mandarin)", "Turkish", "Bengali", "Pashto", "Persian/Farsi", "Russian", "Portuguese", or "Indonesian": Respond entirely in that target language.
Standard mathematical expressions, formulas, and numbers (such as $F = ma$, $x = 5$, $\\sqrt{2}$) should remain in standard math notation, but all surrounding words, explanations, and step labels must be in "${language}".

CORE ROLE & GUIDELINES:
1. Dual Calculator Rule: For any math, physics, engineering, chemistry, or finance calculation, ALWAYS provide a clear block at the very top:
[CALCULATOR RESULT: <exact numerical or algebraic final answer>]
Followed immediately by clean, numbered step-by-step working and explanation in "${language}".
2. Every Subject & Level: Answer questions of all difficulty levels without refusal. The user is currently at academic level: "${level}". Selected subject context: "${subject}".
   - Primary School: Fun, simple analogies, gentle vocabulary, clear short steps.
   - Middle School: Foundational principles, structured steps, encouraging tone.
   - High School (Matric/O-Level): Rigorous standard definitions, formulas, detailed working.
   - Intermediate (F.Sc/A-Level): In-depth derivations, proper scientific/academic notation, exam-focused clarity.
   - Undergraduate (College/University): Comprehensive analytical rigor, formal proofs, practical applications, references.
   - Postgraduate (Masters/Research): Advanced theoretical depth, edge cases, research literature context.
3. Concept Teaching: When asked to learn a concept, provide an overview, intuitive breakdown, step-by-step logic, and relatable real-life examples in "${language}".
4. Tone: Encouraging, warm, friendly, highly accurate, structured with beautiful clean Markdown (headings, bullet points, code blocks, bold key terms).
5. LaTeX Mathematical & Scientific Notation:
All mathematical expressions, scientific equations, formulas, fractions, powers, roots, matrices, and algebraic symbols MUST be written in proper LaTeX notation:
- Use inline LaTeX $...$ for variables, expressions, and values inside sentences (e.g., $x = 3$, $E = mc^2$, $\\lambda = \\frac{h}{p}$, $\\sqrt{x}$).
- Use display LaTeX $$...$$ on their own separate lines for important equations, proofs, and multi-step math derivations (e.g., $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$ or $$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$).
- Do NOT output crude plain ASCII approximations (like "x = (-b +- sqrt(b^2 - 4ac))/(2a)" or "int_0^inf"); always use proper LaTeX notation.

SPECIAL REQUEST MODES:
- "hint": DO NOT give the full final answer or full solution. Provide a subtle, guiding hint in "${language}", point out the relevant formula or principle, and ask an insightful guiding question to spark their independent thinking.
- "compare": The user has provided their own attempt or answer. First evaluate whether their reasoning/answer is correct, partially correct, or incorrect. If incorrect or partially correct, kindly pinpoint exactly where the misunderstanding or miscalculation occurred in "${language}", praise the effort, and provide the correct method.
- "explain_differently": The user found the previous explanation difficult. Break it down using a completely different angle in "${language}": a vivid everyday analogy, visual description, simpler language, and fewer jargon terms.
- "standard": Provide the full dynamic step-by-step educational solution in "${language}".`;
}

// POST /api/chat - Main AI answering endpoint
app.post("/api/chat", async (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || "unknown";

  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      error: "Please wait a moment before sending another question to StudyMate AI.",
      retryAfter: 3,
    });
  }

  const {
    question,
    userAnswer,
    previousContext,
    level = "High School (Matric/O-Level)",
    subject = "Math",
    language = "English",
    mode = "standard", // "standard" | "hint" | "compare" | "explain_differently"
    imageData, // optional base64 string
    mimeType = "image/jpeg",
  } = req.body;

  // Character limit validation
  if (!question && !imageData) {
    return res.status(400).json({ error: "Please provide a question or upload an image." });
  }

  if (question && question.length > 5000) {
    return res.status(400).json({
      error: "Your question exceeds the 5,000 character limit. Please shorten your question and try again.",
    });
  }

  try {
    const ai = getGeminiClient();

    const systemInstruction = buildSystemInstruction(level, subject, language, mode);

    let promptText = "";
    if (mode === "hint") {
      promptText = `[MODE: HINT FIRST]
[REQUIRED OUTPUT LANGUAGE: ${language} - You MUST write your explanation and hints strictly in ${language}!]
The student wants a helpful hint for this question:
Question: "${question}"
Academic Level: ${level}
Subject: ${subject}
Selected Learning Language: ${language}

Provide ONLY a gentle, encouraging hint and highlight the starting formula or rule, written entirely in ${language}. Do NOT reveal the final answer.`;
    } else if (mode === "compare") {
      promptText = `[MODE: COMPARE MY ANSWER]
[REQUIRED OUTPUT LANGUAGE: ${language} - You MUST write your evaluation and feedback strictly in ${language}!]
Question: "${question}"
Student's Proposed Answer/Working: "${userAnswer || "No answer provided"}"
Academic Level: ${level}
Subject: ${subject}
Selected Learning Language: ${language}

Check the student's answer in ${language}. State clearly if they are correct, partially correct, or incorrect. Explain the exact step where an error happened (if any) and show how to reach the right result. Write all explanations in ${language}.`;
    } else if (mode === "explain_differently") {
      promptText = `[MODE: EXPLAIN DIFFERENTLY]
[REQUIRED OUTPUT LANGUAGE: ${language} - You MUST write this entire explanation strictly in ${language}!]
Original Question: "${question}"
Previous Explanation / Context: "${previousContext || "The student found the standard explanation too complex."}"
Academic Level: ${level}
Subject: ${subject}
Selected Learning Language: ${language}

Explain this concept or problem completely differently in ${language}. Use a simple real-world analogy, break it into smaller bite-sized steps, and avoid unnecessary jargon. Write entirely in ${language}.`;
    } else {
      promptText = `[REQUIRED OUTPUT LANGUAGE: ${language} - You MUST write your entire step-by-step response strictly in ${language}!]
Question: "${question}"
Academic Level: ${level}
Subject: ${subject}
Selected Learning Language: ${language}

Please provide a comprehensive, step-by-step solution written entirely in ${language} tailored to this academic level. If it involves calculations or formulas, remember the [CALCULATOR RESULT: <value>] block at the start.`;
    }

    // Build contents payload
    const parts: any[] = [{ text: promptText }];

    // If an image (handwritten photo or screenshot) was attached
    if (imageData) {
      const cleanBase64 = imageData.replace(/^data:image\/[a-z]+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: cleanBase64,
        },
      });
      // Mention in prompt to transcribe and solve handwritten question
      parts[0].text = `[IMAGE ATTACHED - TRANSCRIBE & SOLVE]\n` + parts[0].text + `\nPlease read the handwriting or printed problem in the attached image carefully, transcribe it, and provide the solution.`;
    }

    const response = await generateWithFallback(ai, {
      contents: [
        {
          role: "user",
          parts: parts,
        },
      ],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.4,
      },
    });

    const reply = response.text || "I was unable to generate a response. Please try asking again.";

    // Parse calculator result if present
    let calculatorResult: string | null = null;
    const calcMatch = reply.match(/\[CALCULATOR RESULT:\s*([^\]]+)\]/i);
    if (calcMatch && calcMatch[1]) {
      calculatorResult = calcMatch[1].trim();
    }

    return res.json({
      answer: reply,
      calculatorResult: calculatorResult,
      mode: mode,
      level: level,
      subject: subject,
    });
  } catch (error: any) {
    console.error("Gemini API Error in /api/chat:", error);
    const errorMessage = error?.message || "Unknown error";
    
    if (errorMessage.includes("GEMINI_API_KEY is not configured") || errorMessage.includes("API key not valid")) {
      return res.status(500).json({
        error: "Gemini API key is not configured or invalid in environment settings.",
        setupRequired: true,
      });
    }

    if (
      errorMessage.includes("high demand") ||
      errorMessage.includes("503") ||
      errorMessage.includes("UNAVAILABLE")
    ) {
      return res.status(429).json({
        error: "StudyMate AI is currently experiencing high demand. Please click 'Retry' to resubmit.",
        details: errorMessage,
        retryable: true,
      });
    }

    return res.status(500).json({
      error: "Something went wrong while communicating with StudyMate AI. Please click 'Retry'.",
      details: errorMessage,
      retryable: true,
    });
  }
});

// POST /api/quiz - Generate a 5-question multiple choice quiz on demand
app.post("/api/quiz", async (req, res) => {
  const { subject = "Math", level = "High School (Matric/O-Level)", topic = "", language = "English" } = req.body;

  try {
    const ai = getGeminiClient();
    const prompt = `Generate a 5-question multiple choice practice quiz for:
Subject: ${subject}
Academic Level: ${level}
Topic: ${topic || "Core concepts in " + subject}
Language: ${language}
Math/Science notation: Use LaTeX notation $...$ for any mathematical formulas or scientific expressions.

Return strictly a valid JSON array of 5 question objects. DO NOT wrap with markdown code blocks if possible, or return raw JSON.
Schema:
[
  {
    "id": 1,
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Detailed explanation of why Option A is correct."
  }
]`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const text = response.text || "[]";
    const cleaned = text.trim().replace(/^```json\s*/, "").replace(/\s*```$/, "");
    const quizData = JSON.parse(cleaned);
    return res.json({ quiz: quizData, subject, level });
  } catch (error: any) {
    console.error("Quiz generation error:", error);
    return res.status(500).json({
      error: "Could not generate practice quiz at this moment. Please try again.",
      details: error?.message,
    });
  }
});

// POST /api/flashcards - Generate revision flashcards on demand
app.post("/api/flashcards", async (req, res) => {
  const { subject = "Physics", level = "High School (Matric/O-Level)", topic = "", language = "English" } = req.body;

  try {
    const ai = getGeminiClient();
    const prompt = `Generate 8 high-impact revision flashcards for:
Subject: ${subject}
Academic Level: ${level}
Topic/Focus: ${topic || "Key definitions and formulas in " + subject}
Language: ${language}

Return strictly a valid JSON array of objects:
[
  {
    "id": 1,
    "front": "Term, question, or formula name",
    "back": "Clear definition, formula expression, and brief takeaway",
    "category": "${subject}"
  }
]`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const text = response.text || "[]";
    const cleaned = text.trim().replace(/^```json\s*/, "").replace(/\s*```$/, "");
    const flashcards = JSON.parse(cleaned);
    return res.json({ flashcards, subject, level });
  } catch (error: any) {
    console.error("Flashcards generation error:", error);
    return res.status(500).json({
      error: "Could not generate flashcards at this moment. Please try again.",
      details: error?.message,
    });
  }
});

// Vite middleware & Static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`StudyMate AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
