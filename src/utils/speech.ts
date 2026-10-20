// Speech Recognition and Text-To-Speech utilities

export interface SpeechRecognitionResultHandler {
  onResult: (transcript: string) => void;
  onError: (error: string) => void;
  onEnd: () => void;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  );
}

export function createSpeechRecognizer(
  langCode: string,
  handlers: SpeechRecognitionResultHandler
) {
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    handlers.onError("Voice recognition is not supported in this browser.");
    return null;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = langCode || "en-US";

    recognition.onresult = (event: any) => {
      let currentTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      handlers.onResult(currentTranscript);
    };

    recognition.onerror = (event: any) => {
      handlers.onError(event.error || "Speech recognition error");
    };

    recognition.onend = () => {
      handlers.onEnd();
    };

    return recognition;
  } catch (err: any) {
    handlers.onError(err.message || "Failed to initialize microphone");
    return null;
  }
}

/**
 * Translates math formulas, LaTeX, technical markdown, and symbols into natural spoken text
 */
export function cleanTextForSpeech(text: string): string {
  if (!text) return "";

  let cleaned = text
    // Replace calculator result block
    .replace(/\[CALCULATOR RESULT:\s*([^\]]+)\]/gi, "Calculator result: $1. ")
    // Remove code block markers
    .replace(/```[\s\S]*?```/g, "Code block omitted. ")
    // LaTeX fractions: \frac{a}{b} -> a over b
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1 over $2")
    // Square roots: \sqrt{x} -> square root of x
    .replace(/\\sqrt\{([^}]+)\}/g, "square root of $1")
    .replace(/\\sqrt\(([^)]+)\)/g, "square root of $1")
    .replace(/√\(([^)]+)\)/g, "square root of $1")
    .replace(/√(\w+)/g, "square root of $1")
    // Superscripts/powers
    .replace(/\^2\b/g, " squared ")
    .replace(/\^3\b/g, " cubed ")
    .replace(/\^(\d+)/g, " to the power of $1 ")
    .replace(/\^\{([^}]+)\}/g, " to the power of $1 ")
    // Greek letters & math symbols
    .replace(/\\pi\b/g, " pi ")
    .replace(/π/g, " pi ")
    .replace(/\\theta\b/g, " theta ")
    .replace(/θ/g, " theta ")
    .replace(/\\alpha\b/g, " alpha ")
    .replace(/α/g, " alpha ")
    .replace(/\\beta\b/g, " beta ")
    .replace(/β/g, " beta ")
    .replace(/\\lambda\b/g, " lambda ")
    .replace(/λ/g, " lambda ")
    .replace(/\\Delta\b/g, " delta ")
    .replace(/Δ/g, " delta ")
    .replace(/\\mu\b/g, " micro ")
    .replace(/\\phi\b/g, " phi ")
    .replace(/φ/g, " phi ")
    .replace(/\\omega\b/g, " omega ")
    .replace(/\\times\b/g, " times ")
    .replace(/×/g, " times ")
    .replace(/\\cdot\b/g, " times ")
    .replace(/\\pm\b/g, " plus or minus ")
    .replace(/±/g, " plus or minus ")
    .replace(/\\approx\b/g, " approximately ")
    .replace(/≈/g, " approximately ")
    .replace(/\\neq\b/g, " is not equal to ")
    .replace(/≠/g, " is not equal to ")
    .replace(/\\le\b|\\leq\b/g, " is less than or equal to ")
    .replace(/≤/g, " is less than or equal to ")
    .replace(/\\ge\b|\\geq\b/g, " is greater than or equal to ")
    .replace(/≥/g, " is greater than or equal to ")
    .replace(/\\infty\b/g, " infinity ")
    .replace(/∞/g, " infinity ")
    // Remove LaTeX markup tags like \text{...}, \mathbf{...}, $, $$
    .replace(/\\[a-zA-Z]+\{([^}]+)\}/g, "$1")
    .replace(/\\([a-zA-Z]+)/g, "$1")
    .replace(/\$\$/g, " ")
    .replace(/\$/g, " ")
    // Remove Markdown styling syntax without damaging words or Arabic/Urdu characters
    .replace(/[#*_~`>]/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // markdown links
    .replace(/\s+/g, " ")
    .trim();

  return cleaned;
}

// Global cached voices to handle async browser voice loading
let cachedVoices: SpeechSynthesisVoice[] = [];
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  try {
    cachedVoices = window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      try {
        cachedVoices = window.speechSynthesis.getVoices();
      } catch {
        // ignore
      }
    };
  } catch {
    // ignore
  }
}

/**
 * Helper to score voices so natural, neural, warm, and friendly voices are preferred over robotic ones
 */
function scoreVoiceQuality(v: SpeechSynthesisVoice): number {
  const name = v.name.toLowerCase();
  let score = 0;
  // Prioritize modern high-definition neural and natural voices
  if (name.includes("natural")) score += 60;
  if (name.includes("neural")) score += 60;
  if (name.includes("google")) score += 45;
  if (name.includes("premium") || name.includes("enhanced")) score += 40;
  if (name.includes("online")) score += 25;
  // Known friendly and warm educator voices
  if (name.includes("samantha") || name.includes("aria") || name.includes("jenny") || name.includes("guy")) score += 30;
  if (name.includes("swara") || name.includes("hemant") || name.includes("madhur") || name.includes("fatima")) score += 35;
  if (v.default) score += 10;
  return score;
}

/**
 * Detects the proper BCP-47 language code and language name from text and metadata
 */
export function detectLanguageForSpeech(
  text: string,
  declaredLanguage?: string
): { bcp47: string; langName: string } {
  const content = (text || "").trim();
  const declared = (declaredLanguage || "").toLowerCase();

  // 1. Script-based detection
  // Urdu / Arabic / Pashto / Persian
  if (/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(content)) {
    // Pashto distinct characters
    if (/[\u069A\u0681\u0685\u06BC\u0696\u0689\u0693\u067C]/.test(content) || declared.includes("pashto")) {
      return { bcp47: "ps-AF", langName: "Pashto" };
    }
    // Persian distinct characters
    if (/[\u067E\u0686\u0698\u06AF]/.test(content) || declared.includes("persian") || declared.includes("farsi")) {
      return { bcp47: "fa-IR", langName: "Persian/Farsi" };
    }
    // Urdu distinct characters or Urdu declared
    if (/[\u06D2\u0679\u0688\u0691\u06BA\u06C1\u06BE]/.test(content) || declared.includes("urdu")) {
      return { bcp47: "ur-PK", langName: "Urdu" };
    }
    if (declared.includes("arabic")) {
      return { bcp47: "ar-SA", langName: "Arabic" };
    }
    return { bcp47: "ur-PK", langName: "Urdu" };
  }

  // Devanagari (Hindi)
  if (/[\u0900-\u097F]/.test(content) || declared.includes("hindi")) {
    return { bcp47: "hi-IN", langName: "Hindi" };
  }

  // Bengali
  if (/[\u0980-\u09FF]/.test(content) || declared.includes("bengali")) {
    return { bcp47: "bn-BD", langName: "Bengali" };
  }

  // Cyrillic (Russian)
  if (/[\u0400-\u04FF]/.test(content) || declared.includes("russian")) {
    return { bcp47: "ru-RU", langName: "Russian" };
  }

  // Chinese (Mandarin)
  if (/[\u4E00-\u9FFF]/.test(content) || declared.includes("chinese") || declared.includes("mandarin")) {
    return { bcp47: "zh-CN", langName: "Chinese (Mandarin)" };
  }

  // 2. Roman Urdu detection (Hindustani Latin script)
  if (
    declared.includes("roman urdu") ||
    /\b(hai|hain|kya|yeh|woh|karna|karein|karta|karte|hum|aap|tum|mera|meri|mere|aapka|aapki|lekin|magar|pehle|baad|mein|aur|nahi|bohot|bohat|sawal|jawab|koshish|samajh|formula|rakhein)\b/i.test(
      content
    )
  ) {
    return { bcp47: "ur-PK", langName: "Roman Urdu" };
  }

  // 3. European / Latin-script declared languages
  if (declared.includes("spanish") || declared.includes("español")) {
    return { bcp47: "es-ES", langName: "Spanish" };
  }
  if (declared.includes("french") || declared.includes("français")) {
    return { bcp47: "fr-FR", langName: "French" };
  }
  if (declared.includes("german") || declared.includes("deutsch")) {
    return { bcp47: "de-DE", langName: "German" };
  }
  if (declared.includes("turkish") || declared.includes("türkçe")) {
    return { bcp47: "tr-TR", langName: "Turkish" };
  }
  if (declared.includes("indonesian") || declared.includes("bahasa")) {
    return { bcp47: "id-ID", langName: "Indonesian" };
  }
  if (declared.includes("portuguese") || declared.includes("português")) {
    return { bcp47: "pt-BR", langName: "Portuguese" };
  }

  // 4. Content lexical markers for European languages if declared was English
  if (/\b(bonjour|merci|pourquoi|dans|cette|avec|également|vitesse|accélération|solution|réponse)\b/i.test(content)) {
    return { bcp47: "fr-FR", langName: "French" };
  }
  if (/\b(geschwindigkeit|beschleunigung|gleichung|lösung|beispiel|aufgabe|rechnung|nicht|oder)\b/i.test(content)) {
    return { bcp47: "de-DE", langName: "German" };
  }
  if (/\b(velocidad|aceleración|ecuación|solución|ejemplo|problema|porque|entonces|para|con)\b/i.test(content)) {
    return { bcp47: "es-ES", langName: "Spanish" };
  }
  if (/\b(merhaba|teşekkürler|hız|ivme|denklem|çözüm|örnek|çünkü|nasıl)\b/i.test(content)) {
    return { bcp47: "tr-TR", langName: "Turkish" };
  }

  return { bcp47: "en-US", langName: "English" };
}

/**
 * Finds the highest quality, native voice for the given language with robust multi-language support.
 * Returns NULL if no compatible voice is found, so the browser uses its native OS voice for that BCP-47 tag.
 * NEVER defaults to an English voice for foreign languages!
 */
export function findBestVoiceForLanguage(
  synth: SpeechSynthesis,
  langCode: string,
  langName?: string
): SpeechSynthesisVoice | null {
  let voices = synth.getVoices();
  if (!voices || voices.length === 0) {
    voices = cachedVoices;
  }
  if (!voices || voices.length === 0) return null;

  // Sort available voices by quality score descending
  const sortedVoices = [...voices].sort((a, b) => scoreVoiceQuality(b) - scoreVoiceQuality(a));

  const targetLang = (langCode || "en-US").toLowerCase().replace("_", "-");
  const baseTarget = targetLang.split("-")[0]; // e.g. "ur", "hi", "es", "fr", "ar", "zh", "de", "ru", "tr", "pt"
  const nameQuery = (langName || "").toLowerCase();

  // 1. Exact BCP-47 match (e.g. ur-PK, hi-IN, es-ES, fr-FR, ar-SA, de-DE, zh-CN, ru-RU, tr-TR)
  const exactMatches = sortedVoices.filter(
    (v) => v.lang.toLowerCase().replace("_", "-") === targetLang
  );
  if (exactMatches.length > 0) return exactMatches[0];

  // 2. Base language prefix match (e.g. any voice starting with "ur-", "hi-", "es-", "fr-", "ar-", "ru-", "de-")
  const baseMatches = sortedVoices.filter((v) => {
    const vLang = v.lang.toLowerCase().replace("_", "-");
    return vLang.startsWith(baseTarget + "-") || vLang === baseTarget;
  });
  if (baseMatches.length > 0) return baseMatches[0];

  // 3. Cultural & Phonetic pairings for languages:
  // Roman Urdu:
  if (nameQuery.includes("roman urdu")) {
    // Look for Urdu voice
    const urduVoice = sortedVoices.find((v) => v.lang.toLowerCase().startsWith("ur"));
    if (urduVoice) return urduVoice;
    // Hindi voice has the exact Hindustani phonology for Roman Urdu
    const hindiVoice = sortedVoices.find((v) => v.lang.toLowerCase().startsWith("hi"));
    if (hindiVoice) return hindiVoice;
    // Indian English voice handles South Asian phonetics accurately
    const indianEngVoice = sortedVoices.find(
      (v) =>
        v.lang.toLowerCase().replace("_", "-") === "en-in" ||
        v.name.toLowerCase().includes("india")
    );
    if (indianEngVoice) return indianEngVoice;
  }

  // Urdu (ur-PK) without an Urdu voice installed:
  if (baseTarget === "ur" || nameQuery.includes("urdu")) {
    const urduVoice = sortedVoices.find(
      (v) =>
        v.lang.toLowerCase().startsWith("ur") ||
        v.name.toLowerCase().includes("urdu")
    );
    if (urduVoice) return urduVoice;

    // Hindi voice shares identical phonology with Urdu
    const hindiVoice = sortedVoices.find(
      (v) =>
        v.lang.toLowerCase().startsWith("hi") ||
        v.name.toLowerCase().includes("hindi")
    );
    if (hindiVoice) return hindiVoice;
  }

  // Hindi:
  if (baseTarget === "hi" || nameQuery.includes("hindi")) {
    const hindiVoice = sortedVoices.find(
      (v) =>
        v.lang.toLowerCase().startsWith("hi") ||
        v.name.toLowerCase().includes("hindi")
    );
    if (hindiVoice) return hindiVoice;
    const urduVoice = sortedVoices.find((v) => v.lang.toLowerCase().startsWith("ur"));
    if (urduVoice) return urduVoice;
  }

  // Arabic:
  if (baseTarget === "ar" || nameQuery.includes("arabic")) {
    const arVoice = sortedVoices.find(
      (v) =>
        v.lang.toLowerCase().startsWith("ar") ||
        v.name.toLowerCase().includes("arabic")
    );
    if (arVoice) return arVoice;
  }

  // Persian / Pashto:
  if (baseTarget === "ps" || baseTarget === "fa") {
    const relatedVoice = sortedVoices.find(
      (v) =>
        v.lang.toLowerCase().startsWith("fa") ||
        v.lang.toLowerCase().startsWith("ar") ||
        v.lang.toLowerCase().startsWith("ur")
    );
    if (relatedVoice) return relatedVoice;
  }

  // Check if voice name contains target language name (e.g. "Spanish", "French", "German")
  if (nameQuery && nameQuery !== "english") {
    const nameMatch = sortedVoices.find((v) => v.name.toLowerCase().includes(nameQuery));
    if (nameMatch) return nameMatch;
  }

  // 4. For English only: default browser voice
  if (baseTarget === "en") {
    return sortedVoices.find((v) => v.default && v.lang.toLowerCase().startsWith("en")) ||
      sortedVoices.find((v) => v.lang.toLowerCase().startsWith("en")) ||
      null;
  }

  // CRITICAL: DO NOT return an English voice for foreign languages!
  // Return null so the browser uses its native speech synthesis engine for langCode
  return null;
}

// Keep active utterance references on window to prevent browser GC from cutting audio
declare global {
  interface Window {
    __studyMateActiveUtterance?: SpeechSynthesisUtterance | null;
  }
}

// Text-to-Speech Engine
export class TextToSpeechEngine {
  private static isCurrentlyPlaying = false;
  private static activeUtterance: SpeechSynthesisUtterance | null = null;

  private static getSynth(): SpeechSynthesis | null {
    try {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        return window.speechSynthesis;
      }
    } catch {
      return null;
    }
    return null;
  }

  public static isSupported(): boolean {
    return Boolean(this.getSynth());
  }

  /**
   * Speaks the provided text in the target language clearly.
   * Splits into natural chunks to avoid Chrome's 15-second cutoff bug.
   * Supports English, Urdu, Roman Urdu, Hindi, Arabic, and all major languages.
   */
  public static speak(
    text: string,
    langCode: string = "en-US",
    langNameOrOnEnd?: string | (() => void),
    maybeOnEnd?: () => void
  ) {
    let langName: string | undefined;
    let onEnd: (() => void) | undefined;

    if (typeof langNameOrOnEnd === "function") {
      onEnd = langNameOrOnEnd;
      langName = undefined;
    } else {
      langName = langNameOrOnEnd;
      onEnd = maybeOnEnd;
    }

    try {
      const synth = this.getSynth();
      if (!synth || typeof window === "undefined" || typeof SpeechSynthesisUtterance === "undefined") {
        if (onEnd) onEnd();
        return;
      }

      // Stop any prior speech and clear stuck paused state
      this.stop();
      if (synth.paused) {
        synth.resume();
      }

      const cleanText = cleanTextForSpeech(text);
      if (!cleanText) {
        if (onEnd) onEnd();
        return;
      }

      // Split text into natural chunks (sentences, clauses, max ~140 chars)
      const chunks = this.splitIntoSpeechChunks(cleanText);
      if (chunks.length === 0) {
        if (onEnd) onEnd();
        return;
      }

      // Detect language from text content and user preference
      const detected = detectLanguageForSpeech(cleanText, langName || langCode);
      const targetLangCode = detected.bcp47 || langCode || "en-US";
      const targetLangName = detected.langName || langName;

      // Preload / get voices with multilingual matching (never defaults to English for foreign languages)
      const voice = findBestVoiceForLanguage(synth, targetLangCode, targetLangName);

      this.isCurrentlyPlaying = true;
      let currentIndex = 0;

      const speakNextChunk = () => {
        if (!this.isCurrentlyPlaying) {
          if (onEnd) onEnd();
          return;
        }

        if (currentIndex >= chunks.length) {
          this.isCurrentlyPlaying = false;
          this.activeUtterance = null;
          if (typeof window !== "undefined") {
            window.__studyMateActiveUtterance = null;
          }
          if (onEnd) onEnd();
          return;
        }

        const chunkText = chunks[currentIndex];
        currentIndex++;

        const utterance = new SpeechSynthesisUtterance(chunkText);
        this.activeUtterance = utterance;
        if (typeof window !== "undefined") {
          window.__studyMateActiveUtterance = utterance;
        }

        // Assign voice if matching target language
        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang || targetLangCode;
        } else {
          // Tell the browser's OS TTS engine which language to synthesize
          utterance.lang = targetLangCode;
        }

        // Adjust rate and pitch for natural, warm, friendly educational listening (not robotic or flat)
        utterance.rate = 0.93; // comfortable, articulate tutoring pace
        utterance.pitch = 1.04; // subtle lift adds warmth, friendly inflection, and approachable tone

        utterance.onend = () => {
          speakNextChunk();
        };

        utterance.onerror = (e: any) => {
          console.warn("SpeechSynthesis utterance error:", e);
          // If error is language-unavailable, fallback to default voice
          if (e?.error === "language-unavailable" || e?.error === "synthesis-failed") {
            try {
              const allVoices = synth.getVoices();
              const fallback = allVoices.find((v) => v.default) || allVoices[0];
              if (fallback && utterance.voice !== fallback) {
                utterance.voice = fallback;
                utterance.lang = fallback.lang;
                synth.speak(utterance);
                return;
              }
            } catch {
              // ignore
            }
          }
          speakNextChunk();
        };

        // Resume if browser audio pipeline went dormant
        if (synth.paused) {
          synth.resume();
        }
        synth.speak(utterance);
      };

      speakNextChunk();
    } catch (err) {
      console.warn("TextToSpeechEngine.speak error:", err);
      this.isCurrentlyPlaying = false;
      this.activeUtterance = null;
      if (onEnd) onEnd();
    }
  }

  /**
   * Splits text into short, natural speech chunks.
   * Handles English, Urdu (۔), Arabic (؟،), and standard punctuation.
   */
  private static splitIntoSpeechChunks(text: string, maxLen: number = 140): string[] {
    // Split on sentence boundaries including Urdu and Arabic punctuation (. ! ? \n ۔ ؟ ،)
    const rawSentences = text.split(/(?<=[.!?\n۔؟،])\s+/);
    const chunks: string[] = [];

    for (const sentence of rawSentences) {
      const trimmed = sentence.trim();
      if (!trimmed) continue;

      if (trimmed.length <= maxLen) {
        chunks.push(trimmed);
      } else {
        // Sub-split by comma, colon, semicolon or space
        const words = trimmed.split(" ");
        let currentChunk = "";
        for (const w of words) {
          if ((currentChunk + " " + w).length <= maxLen) {
            currentChunk = currentChunk ? currentChunk + " " + w : w;
          } else {
            if (currentChunk) chunks.push(currentChunk);
            currentChunk = w;
          }
        }
        if (currentChunk) chunks.push(currentChunk);
      }
    }

    return chunks;
  }

  public static stop() {
    try {
      this.isCurrentlyPlaying = false;
      this.activeUtterance = null;
      if (typeof window !== "undefined") {
        window.__studyMateActiveUtterance = null;
      }
      const synth = this.getSynth();
      if (synth) {
        synth.cancel();
      }
    } catch (err) {
      console.warn("TextToSpeechEngine.stop error:", err);
    }
  }

  public static isSpeaking(): boolean {
    return this.isCurrentlyPlaying;
  }
}


