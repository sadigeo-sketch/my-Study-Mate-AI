import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Mic,
  MicOff,
  Image as ImageIcon,
  X,
  Sparkles,
  Lightbulb,
  GitCompare,
  RotateCcw,
  AlertTriangle,
  RefreshCw,
  WifiOff,
  Search,
  Bookmark,
  Trash2,
  ArrowUpRight,
  BookOpen,
  Calculator as CalcIcon,
  Zap,
  ArrowLeftRight,
  Atom,
  Gauge,
  Binary,
} from "lucide-react";

import {
  AcademicLevel,
  Subject,
  ALL_SUBJECTS,
  SupportedLanguage,
  SUPPORTED_LANGUAGES,
  AppTheme,
  ChatMessage,
  UserStats,
  ExamCountdown,
  SampleQuestion,
  LearningObjective,
} from "./types";
import { SAMPLE_QUESTIONS } from "./data/starterBank";
import { DEFAULT_LEARNING_OBJECTIVES } from "./data/defaultObjectives";
import { Header } from "./components/Header";
import { ChatMessageItem } from "./components/ChatMessageItem";
import { CalculatorModal } from "./components/CalculatorModal";
import { QuizModal } from "./components/QuizModal";
import { FlashcardsModal } from "./components/FlashcardsModal";
import { FormulaSheetModal } from "./components/FormulaSheetModal";
import { ExamCountdownModal } from "./components/ExamCountdownModal";
import { ProgressModal } from "./components/ProgressModal";
import { CompareAnswerModal } from "./components/CompareAnswerModal";
import { LearningObjectivesModal } from "./components/LearningObjectivesModal";
import { createSpeechRecognizer, isSpeechRecognitionSupported } from "./utils/speech";
import { safeGetItem, safeSetItem, safeGetJSON, safeSetJSON } from "./utils/storage";
import { getThemeDefinition } from "./data/themes";

const MAX_CHARACTERS = 5000;

const PRIMARY_SUBJECTS: Subject[] = [
  "Math",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "English",
  "General Knowledge",
  "Islamic Studies",
  "Economics",
  "History",
];

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<AppTheme>(() => {
    return (safeGetItem("studymate_theme", "dark") as AppTheme) || "dark";
  });

  // Academic preferences
  const [currentLevel, setCurrentLevel] = useState<AcademicLevel>(() => {
    return (safeGetItem("studymate_level", "High School (Matric/O-Level)") as AcademicLevel) || "High School (Matric/O-Level)";
  });
  const [currentSubject, setCurrentSubject] = useState<Subject>("Math");
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>("English");

  // Independent chat conversation threads per subject
  const [chatsBySubject, setChatsBySubject] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = safeGetJSON<Record<string, ChatMessage[]>>("studymate_chats_by_subject", {});
    // Check if legacy single chat history exists and migrate
    const legacy = safeGetJSON<ChatMessage[]>("studymate_chat_history", []);
    if (legacy && Array.isArray(legacy) && legacy.length > 0 && Object.keys(saved).length === 0) {
      const migrated: Record<string, ChatMessage[]> = {};
      for (const msg of legacy) {
        const sub = (msg.subject as string) || "Math";
        if (!migrated[sub]) migrated[sub] = [];
        migrated[sub].push(msg);
      }
      return migrated;
    }
    return saved;
  });

  // Current active subject's messages
  const messages = chatsBySubject[currentSubject] || [];

  // Helper to update messages for the active subject thread
  const setMessages = (
    updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])
  ) => {
    setChatsBySubject((prev) => {
      const curList = prev[currentSubject] || [];
      const nextList = typeof updater === "function" ? updater(curList) : updater;
      return {
        ...prev,
        [currentSubject]: nextList,
      };
    });
  };

  // User Stats & Daily Streak
  const [stats, setStats] = useState<UserStats>(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const defaultStats: UserStats = {
      streakCount: 1,
      lastActiveDate: todayStr,
      totalQuestionsAsked: 0,
      quizzesCompleted: 0,
      flashcardsReviewed: 0,
      subjectCounts: {},
      levelCounts: {},
    };
    return safeGetJSON<UserStats>("studymate_user_stats", defaultStats);
  });

  // Exam Countdown deadlines
  const [exams, setExams] = useState<ExamCountdown[]>(() => {
    return safeGetJSON<ExamCountdown[]>("studymate_exams", []);
  });

  // Input states
  const [inputText, setInputText] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedMimeType, setAttachedMimeType] = useState<string>("image/jpeg");
  const [isThinking, setIsThinking] = useState(false);
  const [hintModeActive, setHintModeActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<{
    text: string;
    retryable: boolean;
    lastPayload?: any;
  } | null>(null);

  // Clear history confirmation state
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  // Voice recording state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  // Modals visibility
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [calcModalTab, setCalcModalTab] = useState<"calc" | "converter" | "values" | "physics" | "math">("calc");
  const [calcInitialVal, setCalcInitialVal] = useState<string>("");
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);
  const [isFormulasOpen, setIsFormulasOpen] = useState(false);
  const [isExamsOpen, setIsExamsOpen] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [isObjectivesOpen, setIsObjectivesOpen] = useState(false);

  // Learning Objectives & Subject Goals
  const [objectives, setObjectives] = useState<LearningObjective[]>(() => {
    return safeGetJSON<LearningObjective[]>(
      "studymate_learning_objectives_v1",
      DEFAULT_LEARNING_OBJECTIVES
    );
  });

  // Sync objectives to local storage safely
  useEffect(() => {
    safeSetJSON("studymate_learning_objectives_v1", objectives);
  }, [objectives]);

  // Objectives handlers
  const handleAddObjective = (newObj: Omit<LearningObjective, "id" | "createdAt">) => {
    const created: LearningObjective = {
      ...newObj,
      id: "obj-" + Date.now(),
      createdAt: Date.now(),
    };
    setObjectives((prev) => [created, ...prev]);
  };

  const handleUpdateObjective = (updated: LearningObjective) => {
    setObjectives((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  };

  const handleDeleteObjective = (id: string) => {
    setObjectives((prev) => prev.filter((o) => o.id !== id));
  };

  const handleResetDefaultObjectives = () => {
    setObjectives(DEFAULT_LEARNING_OBJECTIVES);
  };

  const activeObjectivesCount = objectives.filter((o) => o.status === "in_progress").length;

  const handleOpenCalculator = (
    tab: "calc" | "converter" | "values" | "physics" | "math" = "calc",
    initVal: string = ""
  ) => {
    setCalcModalTab(tab);
    setCalcInitialVal(initVal);
    setIsCalcOpen(true);
  };

  // Compare Answer modal state
  const [compareTargetMsg, setCompareTargetMsg] = useState<ChatMessage | null>(null);

  // Offline detection
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Online/Offline listeners
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Sync state to local storage safely
  useEffect(() => {
    safeSetItem("studymate_theme", theme);
  }, [theme]);

  useEffect(() => {
    safeSetItem("studymate_level", currentLevel);
  }, [currentLevel]);

  useEffect(() => {
    // Sanitize chat messages by subject before saving to protect localStorage quota
    const sanitizedChats: Record<string, ChatMessage[]> = {};
    for (const [sub, msgs] of Object.entries(chatsBySubject)) {
      if (Array.isArray(msgs)) {
        sanitizedChats[sub] = msgs.slice(-30).map((m) => ({
          ...m,
          // Large base64 image strings should not bloat long-term storage
          imagePreview: m.imagePreview && m.imagePreview.length > 500 ? undefined : m.imagePreview,
        }));
      }
    }
    safeSetJSON("studymate_chats_by_subject", sanitizedChats);
  }, [chatsBySubject]);

  useEffect(() => {
    safeSetJSON("studymate_user_stats", stats);
  }, [stats]);

  useEffect(() => {
    safeSetJSON("studymate_exams", exams);
  }, [exams]);

  // Update streak when user visits on new day
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    if (stats.lastActiveDate !== today) {
      const last = new Date(stats.lastActiveDate);
      const cur = new Date(today);
      const diffTime = Math.abs(cur.getTime() - last.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let newStreak = stats.streakCount;
      if (diffDays === 1) {
        newStreak += 1; // Consecutive day
      } else if (diffDays > 1) {
        newStreak = 1; // Streak reset
      }

      setStats((prev) => ({
        ...prev,
        streakCount: newStreak,
        lastActiveDate: today,
      }));
    }
  }, []);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // Find language BCP-47
  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.name === currentLanguage);
  const bcp47Code = currentLangObj ? currentLangObj.bcp47 : "en-US";

  // Voice recognition toggle
  const toggleVoiceRecording = () => {
    if (!isSpeechRecognitionSupported()) {
      setErrorMessage({
        text: "Speech recognition is not supported in this browser or iframe. Please type your question directly.",
        retryable: false,
      });
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      return;
    }

    const recognizer = createSpeechRecognizer(bcp47Code, {
      onResult: (transcript) => {
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      },
      onError: (err) => {
        console.warn("Speech recognition error:", err);
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });

    if (recognizer) {
      recognitionRef.current = recognizer;
      try {
        recognizer.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
        setIsListening(false);
      }
    }
  };

  // Image Upload handler
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage({
        text: "Please upload a valid image file (PNG, JPG, or WEBP).",
        retryable: false,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAttachedImage(result);
      setAttachedMimeType(file.type || "image/jpeg");
    };
    reader.onerror = () => {
      setErrorMessage({
        text: "Could not read the selected image file. Please try another.",
        retryable: false,
      });
    };
    reader.readAsDataURL(file);
  };

  // Main AI Submission
  const sendQuestion = async (
    questionText: string,
    mode: "standard" | "hint" | "compare" | "explain_differently" = "standard",
    userAttempt?: string,
    previousContext?: string
  ) => {
    if (!questionText.trim() && !attachedImage) return;

    if (isOffline) {
      setErrorMessage({
        text: "You are currently offline. Please check your network connection and try again.",
        retryable: true,
      });
      return;
    }

    setIsThinking(true);
    setErrorMessage(null);

    const userMessage: ChatMessage = {
      id: "u-" + Date.now(),
      role: "user",
      text: questionText.trim() || "[Attached Image Question]",
      timestamp: Date.now(),
      subject: currentSubject,
      level: currentLevel,
      language: currentLanguage,
      mode: mode,
      imagePreview: attachedImage || undefined,
      userAttempt: userAttempt,
    };

    setMessages((prev) => [...prev, userMessage]);

    // Update study analytics
    setStats((prev) => {
      const subCounts = { ...prev.subjectCounts };
      subCounts[currentSubject] = (subCounts[currentSubject] || 0) + 1;

      const lvlCounts = { ...prev.levelCounts };
      lvlCounts[currentLevel] = (lvlCounts[currentLevel] || 0) + 1;

      return {
        ...prev,
        totalQuestionsAsked: prev.totalQuestionsAsked + 1,
        subjectCounts: subCounts,
        levelCounts: lvlCounts,
      };
    });

    // Automatically credit active learning objectives in this subject
    setObjectives((prev) =>
      prev.map((obj) => {
        if (obj.subject === currentSubject && obj.status === "in_progress") {
          const newQ = obj.currentQuestions + 1;
          const isComplete =
            newQ >= obj.targetQuestions &&
            (obj.currentQuizzes || 0) >= (obj.targetQuizzes || 0) &&
            obj.milestones.every((m) => m.completed);
          return {
            ...obj,
            currentQuestions: newQ,
            status: isComplete ? "completed" : obj.status,
            completedAt: isComplete ? Date.now() : obj.completedAt,
          };
        }
        return obj;
      })
    );

    const payload = {
      question: questionText.trim(),
      userAnswer: userAttempt,
      previousContext: previousContext,
      level: currentLevel,
      subject: currentSubject,
      language: currentLanguage,
      mode: mode,
      imageData: attachedImage,
      mimeType: attachedMimeType,
    };

    // Reset inputs
    setInputText("");
    setAttachedImage(null);
    setHintModeActive(false);

    try {
      const executeFetch = async (attempt = 1): Promise<any> => {
        try {
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `Server responded with error status ${response.status}`);
          }

          return await response.json();
        } catch (fetchErr: any) {
          const isNetworkFailure =
            fetchErr.name === "TypeError" ||
            String(fetchErr.message || "").toLowerCase().includes("failed to fetch") ||
            String(fetchErr.message || "").toLowerCase().includes("network");

          if (isNetworkFailure && attempt === 1) {
            // Wait 1 second and retry once before raising error to UI
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return executeFetch(2);
          }
          throw fetchErr;
        }
      };

      const data = await executeFetch();

      const assistantMessage: ChatMessage = {
        id: "a-" + Date.now(),
        role: "assistant",
        text: data.answer,
        timestamp: Date.now(),
        subject: currentSubject,
        level: currentLevel,
        language: currentLanguage,
        mode: mode,
        calculatorResult: data.calculatorResult,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error("AI Answering Error:", err);
      const isNetworkErr =
        err.name === "TypeError" ||
        String(err.message || "").toLowerCase().includes("failed to fetch");

      const displayMessage = isNetworkErr
        ? "Network connection was momentarily interrupted while contacting StudyMate AI. Please click 'Retry' to resubmit."
        : (err.message || "Something went wrong, please try again.");

      setErrorMessage({
        text: displayMessage,
        retryable: true,
        lastPayload: payload,
      });
    } finally {
      setIsThinking(false);
    }
  };

  // Retry previous failed request
  const handleRetry = () => {
    if (!errorMessage?.lastPayload) return;
    const { question, mode, userAnswer, previousContext } = errorMessage.lastPayload;
    sendQuestion(question, mode, userAnswer, previousContext);
  };

  // Toggle bookmark on message
  const handleBookmarkToggle = (id: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, bookmarked: !msg.bookmarked } : msg))
    );
  };

  // Explain differently action
  const handleExplainDifferently = (assistantMsg: ChatMessage) => {
    // Find the preceding question
    const msgIndex = messages.findIndex((m) => m.id === assistantMsg.id);
    let originalQuestion = "";
    if (msgIndex > 0 && messages[msgIndex - 1].role === "user") {
      originalQuestion = messages[msgIndex - 1].text;
    } else {
      originalQuestion = assistantMsg.text.slice(0, 150);
    }

    sendQuestion(
      originalQuestion,
      "explain_differently",
      undefined,
      assistantMsg.text
    );
  };

  // Get hint action
  const handleAskHint = (assistantMsg: ChatMessage) => {
    const msgIndex = messages.findIndex((m) => m.id === assistantMsg.id);
    let originalQuestion = "";
    if (msgIndex > 0 && messages[msgIndex - 1].role === "user") {
      originalQuestion = messages[msgIndex - 1].text;
    } else {
      originalQuestion = assistantMsg.text.slice(0, 150);
    }

    sendQuestion(originalQuestion, "hint");
  };

  // Clear conversation history with two-step inline confirmation (no window.confirm)
  const handleClearHistory = () => {
    if (isConfirmingClear) {
      setMessages([]);
      setIsConfirmingClear(false);
    } else {
      setIsConfirmingClear(true);
      setTimeout(() => setIsConfirmingClear(false), 4000);
    }
  };

  // Insert calculator result into question input
  const handleInsertCalcResult = (resultVal: string) => {
    setInputText((prev) => (prev ? `${prev} ${resultVal}` : resultVal));
  };

  // Edit user message in chat history with option to regenerate response
  const handleEditUserMessage = (messageId: string, newText: string, resubmit: boolean) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? { ...m, text: newText, isEdited: true, timestamp: Date.now() }
          : m
      )
    );

    if (resubmit) {
      sendQuestion(newText, hintModeActive ? "hint" : "standard");
    }
  };

  // Load message text directly into bottom question prompt box
  const handleLoadIntoInput = (text: string) => {
    setInputText(text);
    const inputEl = document.getElementById("question-input");
    if (inputEl) {
      inputEl.focus();
    }
    // Scroll to bottom
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  // Filter messages for display
  const displayedMessages = messages.filter((msg) => {
    if (showBookmarksOnly && !msg.bookmarked) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesText = msg.text.toLowerCase().includes(q);
      const matchesSubject = msg.subject.toLowerCase().includes(q);
      return matchesText || matchesSubject;
    }
    return true;
  });

  // Filter starter practice questions for active subject and level
  const starterQuestions = SAMPLE_QUESTIONS.filter(
    (q) => q.subject === currentSubject || q.level === currentLevel
  ).slice(0, 4);

  // Active theme definition from THEMES registry
  const activeTheme = getThemeDefinition(theme);

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${activeTheme.containerClass}`}>
      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="bg-amber-600 text-stone-950 px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span>
            You are currently offline. Check your internet connection. (Saved history and the Dual Calculator remain functional offline!)
          </span>
        </div>
      )}

      {/* Main Header & Sub-bar */}
      <Header
        currentLevel={currentLevel}
        onLevelChange={setCurrentLevel}
        currentSubject={currentSubject}
        onSubjectChange={setCurrentSubject}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        streakCount={stats.streakCount}
        currentTheme={theme}
        onThemeChange={setTheme}
        onOpenCalculator={() => handleOpenCalculator("calc")}
        onOpenValues={() => handleOpenCalculator("values")}
        onOpenQuiz={() => setIsQuizOpen(true)}
        onOpenFlashcards={() => setIsFlashcardsOpen(true)}
        onOpenFormulas={() => setIsFormulasOpen(true)}
        onOpenExamCountdown={() => setIsExamsOpen(true)}
        onOpenProgress={() => setIsProgressOpen(true)}
        onOpenObjectives={() => setIsObjectivesOpen(true)}
        activeObjectivesCount={activeObjectivesCount}
        showBookmarksOnly={showBookmarksOnly}
        onToggleBookmarksOnly={() => setShowBookmarksOnly((prev) => !prev)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Study Arena */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-6 py-4 flex flex-col min-h-0">
        {/* Subject Chat Thread Switcher Bar */}
        <div className="w-full mb-3.5">
          <div className="flex items-center justify-between gap-2 mb-1.5 text-xs text-stone-400">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="text-amber-400 font-semibold">Subject Chat:</span>
              <span className={activeTheme.category === "light" ? "text-stone-800 font-semibold" : "text-stone-200 font-semibold"}>
                {currentSubject}
              </span>
              <span className="text-[11px] text-stone-400">
                ({messages.length} {messages.length === 1 ? "message" : "messages"})
              </span>
            </div>
            <span className="text-[11px] text-stone-400 hidden sm:inline">
              Independent chats saved per subject
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
            {PRIMARY_SUBJECTS.map((sub) => {
              const count = (chatsBySubject[sub] || []).length;
              const isActive = currentSubject === sub;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setCurrentSubject(sub)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                    isActive
                      ? "bg-amber-500 text-stone-950 font-semibold shadow-sm ring-2 ring-amber-500/30"
                      : activeTheme.category === "light"
                      ? "bg-stone-200/80 text-stone-700 hover:bg-stone-300 border border-stone-300/70"
                      : "bg-stone-900/90 text-stone-300 hover:bg-stone-800 border border-stone-800/90"
                  }`}
                >
                  <span>{sub}</span>
                  {count > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? "bg-stone-950/20 text-stone-950"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Quick dropdown for all subjects */}
            <div className="flex-shrink-0">
              <select
                aria-label="Switch to other subjects"
                value={currentSubject}
                onChange={(e) => setCurrentSubject(e.target.value as Subject)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border focus:outline-none cursor-pointer ${
                  activeTheme.category === "light"
                    ? "bg-stone-100 text-stone-800 border-stone-300"
                    : "bg-stone-900 text-stone-200 border-stone-800"
                }`}
              >
                {ALL_SUBJECTS.map((sub) => {
                  const c = (chatsBySubject[sub] || []).length;
                  return (
                    <option key={sub} value={sub}>
                      {sub} {c > 0 ? `(${c})` : ""}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Messages or Welcome Starter Area */}
        {displayedMessages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-8 text-center max-w-2xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-950/20">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                What are you studying in {currentSubject}?
              </h2>
              <p className="text-sm text-stone-400 leading-relaxed max-w-lg mx-auto">
                Ask any question in {currentSubject} in any language (English, Roman Urdu, Urdu, Hindi). StudyMate AI
                solves problems step-by-step with formulas, dual calculator output, hints, and error diagnostics.
              </p>
            </div>

            {/* Quick Action Pills */}
            <div className="flex items-center justify-center gap-2 flex-wrap text-xs">
              <button
                onClick={() => handleOpenCalculator("calc")}
                className="px-3.5 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-semibold transition flex items-center gap-1.5 shadow-sm"
              >
                <CalcIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Calculator</span>
              </button>

              <button
                onClick={() => handleOpenCalculator("values")}
                className="px-3.5 py-1.5 rounded-full bg-stone-900 hover:bg-stone-800 border border-stone-800 text-amber-300 transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>All Subject Values &amp; Constants</span>
              </button>

              <button
                onClick={() => handleOpenCalculator("physics")}
                className="px-3.5 py-1.5 rounded-full bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 transition flex items-center gap-1.5"
              >
                <span>Physics &amp; Math Solvers</span>
              </button>

              <button
                onClick={() => handleOpenCalculator("converter")}
                className="px-3.5 py-1.5 rounded-full bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 transition flex items-center gap-1.5"
              >
                <span>Unit Converter</span>
              </button>

              <button
                onClick={() => setHintModeActive((prev) => !prev)}
                className={`px-3.5 py-1.5 rounded-full border transition flex items-center gap-1.5 ${
                  hintModeActive
                    ? "bg-yellow-500/20 border-yellow-500 text-yellow-300 font-semibold"
                    : "bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-800"
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
                <span>{hintModeActive ? "Hint First Enabled" : "Hint First Option"}</span>
              </button>

              <button
                onClick={() => setIsQuizOpen(true)}
                className="px-3.5 py-1.5 rounded-full bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>5-Question Quiz</span>
              </button>

              <button
                onClick={() => setIsFormulasOpen(true)}
                className="px-3.5 py-1.5 rounded-full bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 transition flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                <span>Formula Sheet</span>
              </button>
            </div>

            {/* Starter Practice Questions Bank */}
            <div className="w-full pt-4 text-left">
              <div className="flex items-center justify-between mb-3 text-xs text-stone-400 font-medium">
                <span>Starter Practice Questions ({currentSubject} • {currentLevel})</span>
                <span className="text-[11px] text-stone-500">Tap to load</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {starterQuestions.map((q) => (
                  <div
                    key={q.id}
                    onClick={() => {
                      setInputText(q.question);
                    }}
                    className={`p-3.5 rounded-xl ${activeTheme.cardClass} hover:opacity-95 cursor-pointer transition flex flex-col justify-between group shadow-sm`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
                        <span className="text-amber-400/90 font-medium">{q.category}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-400 transition" />
                      </div>
                      <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed">
                        {q.question}
                      </p>
                    </div>
                    <div className="mt-2 text-[10px] text-stone-500 italic">
                      Hint snippet: {q.hintSnippet}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 w-full space-y-4 pb-40 sm:pb-48">
            {/* Conversation toolbar */}
            <div className="flex items-center justify-between text-xs text-stone-400 px-1">
              <span>
                {showBookmarksOnly
                  ? `Showing ${displayedMessages.length} saved bookmarks in ${currentSubject}`
                  : `${messages.length} messages in ${currentSubject} thread`}
              </span>
              {messages.length > 0 && (
                <button
                  id="clear-chat-history-btn"
                  onClick={handleClearHistory}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition border ${
                    isConfirmingClear
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/40 font-semibold"
                      : "text-stone-400 hover:text-rose-400 border-transparent hover:border-stone-800"
                  }`}
                  title={isConfirmingClear ? `Click again to confirm clearing ${currentSubject} chat` : `Clear ${currentSubject} conversation`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isConfirmingClear ? `Confirm clear ${currentSubject}?` : `Clear ${currentSubject} History`}</span>
                </button>
              )}
            </div>

            {/* Render Chat Messages */}
            {displayedMessages.map((msg) => (
              <ChatMessageItem
                key={msg.id}
                message={msg}
                onBookmarkToggle={handleBookmarkToggle}
                onExplainDifferently={handleExplainDifferently}
                onCompareAnswer={(m) => setCompareTargetMsg(m)}
                onAskHint={handleAskHint}
                onOpenCalculatorWithResult={(res) => {
                  handleInsertCalcResult(res);
                  handleOpenCalculator("calc", res);
                }}
                bcp47Lang={bcp47Code}
                languageName={currentLanguage}
                onEditMessage={handleEditUserMessage}
                onLoadIntoInput={handleLoadIntoInput}
                userBubbleClassName={activeTheme.userBubbleClass}
                aiBubbleClassName={activeTheme.aiBubbleClass}
                themeCategory={activeTheme.category}
              />
            ))}

            {/* Thinking / Generating Indicator */}
            {isThinking && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-stone-900/90 border border-stone-800 max-w-md animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-stone-200">
                    StudyMate AI is thinking...
                  </div>
                  <div className="text-[11px] text-stone-400">
                    Formulating step-by-step breakdown & calculations
                  </div>
                </div>
              </div>
            )}

            {/* Friendly Error Box with Retry */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{errorMessage.text}</span>
                </div>
                {errorMessage.retryable && (
                  <button
                    onClick={handleRetry}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-800 hover:bg-red-700 text-white font-medium transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry</span>
                  </button>
                )}
              </div>
            )}

            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}

        {/* Input Bar & Controls with Backdrop Guard */}
        <div className="sticky bottom-3 z-30 pt-1">
          {/* Subtle gradient shield preventing message text from overlapping behind input */}
          <div
            className="pointer-events-none absolute -top-8 left-0 right-0 h-8 opacity-90 -z-10"
            style={{
              background:
                activeTheme.category === "light"
                  ? "linear-gradient(to top, rgba(250,250,249,0.95) 0%, rgba(250,250,249,0) 100%)"
                  : "linear-gradient(to top, rgba(12,10,9,0.95) 0%, rgba(12,10,9,0) 100%)",
            }}
          />

          {/* Active Mode / Hint / Attached photo previews */}
          {(attachedImage || hintModeActive) && (
            <div className="mb-2 p-2.5 rounded-xl bg-stone-900/90 border border-stone-800/90 flex items-center justify-between gap-2 backdrop-blur">
              <div className="flex items-center gap-2">
                {hintModeActive && (
                  <span className="px-2.5 py-1 rounded-lg bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 text-xs font-semibold flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Hint First Mode Active</span>
                  </span>
                )}
                {attachedImage && (
                  <div className="flex items-center gap-2">
                    <img
                      src={attachedImage}
                      alt="Thumbnail"
                      className="w-8 h-8 rounded-lg object-cover border border-stone-700"
                    />
                    <span className="text-xs text-stone-300">Handwriting photo attached</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                {hintModeActive && (
                  <button
                    onClick={() => setHintModeActive(false)}
                    className="text-xs text-stone-400 hover:text-stone-200 px-2 py-0.5"
                  >
                    Disable Hint
                  </button>
                )}
                {attachedImage && (
                  <button
                    onClick={() => setAttachedImage(null)}
                    className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Main Question Input Box */}
          <div className={`${activeTheme.inputContainerClass} focus-within:border-amber-500/70 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur transition-all`}>
            <textarea
              id="question-input"
              rows={2}
              placeholder={`Ask any question in ${currentSubject} (${currentLevel}) in any language...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendQuestion(inputText, hintModeActive ? "hint" : "standard");
                }
              }}
              disabled={isThinking}
              maxLength={MAX_CHARACTERS}
              className={`w-full bg-transparent ${
                activeTheme.category === "light"
                  ? "text-stone-900 placeholder-stone-400"
                  : "text-stone-100 placeholder-stone-500"
              } text-sm sm:text-base focus:outline-none min-h-[64px] max-h-44 overflow-y-auto px-4 py-3 sm:px-5 sm:py-3.5 leading-relaxed resize-none rounded-xl`}
            />

            {/* Bottom Actions Row */}
            <div className={`flex items-center justify-between pt-3 mt-1 border-t ${activeTheme.category === "light" ? "border-stone-200" : "border-stone-800/80"} px-2 text-xs`}>
              <div className="flex items-center gap-1.5 text-stone-400">
                {/* Photo upload input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  id="attach-image-btn"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition"
                  title="Upload photo of handwritten problem or formula"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                {/* Voice Input Button */}
                <button
                  id="voice-input-btn"
                  type="button"
                  onClick={toggleVoiceRecording}
                  className={`p-1.5 rounded-lg transition ${
                    isListening
                      ? "bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse"
                      : "hover:bg-stone-800 text-stone-400 hover:text-stone-200"
                  }`}
                  title={isListening ? "Listening... click to stop" : "Speak question with microphone"}
                >
                  {isListening ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Hint First Toggle */}
                <button
                  type="button"
                  onClick={() => setHintModeActive((prev) => !prev)}
                  className={`px-2 py-1 rounded-lg transition flex items-center gap-1 text-[11px] ${
                    hintModeActive
                      ? "bg-yellow-500/20 text-yellow-300 font-medium"
                      : "hover:bg-stone-800 text-stone-400 hover:text-stone-200"
                  }`}
                  title="Toggle hint before full answer"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Hint first</span>
                </button>

                {/* Character Counter with Warning */}
                <span
                  className={`text-[10px] font-mono ml-1 ${
                    inputText.length > 4500 ? "text-amber-400 font-bold" : "text-stone-500"
                  }`}
                >
                  {inputText.length}/{MAX_CHARACTERS}
                </span>
              </div>

              {/* Submit Question Button */}
              <button
                id="send-question-btn"
                type="button"
                onClick={() => sendQuestion(inputText, hintModeActive ? "hint" : "standard")}
                disabled={isThinking || (!inputText.trim() && !attachedImage)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-40 text-stone-950 font-semibold text-xs flex items-center gap-1.5 transition shadow-md shadow-amber-950/40"
              >
                <span>Ask AI</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Dual Calculator Modal */}
      <CalculatorModal
        isOpen={isCalcOpen}
        onClose={() => setIsCalcOpen(false)}
        onInsertResult={handleInsertCalcResult}
        initialTab={calcModalTab}
        initialValue={calcInitialVal}
      />

      {/* 5-Question Practice Quiz Modal */}
      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        currentSubject={currentSubject}
        currentLevel={currentLevel}
        currentLanguage={currentLanguage}
        onQuizCompleted={() => {
          setStats((prev) => ({
            ...prev,
            quizzesCompleted: prev.quizzesCompleted + 1,
          }));
          // Automatically credit active learning objectives in this subject
          setObjectives((prev) =>
            prev.map((obj) => {
              if (obj.subject === currentSubject && obj.status === "in_progress") {
                const newQuizCount = (obj.currentQuizzes || 0) + 1;
                const isComplete =
                  obj.currentQuestions >= obj.targetQuestions &&
                  newQuizCount >= (obj.targetQuizzes || 0) &&
                  obj.milestones.every((m) => m.completed);
                return {
                  ...obj,
                  currentQuizzes: newQuizCount,
                  status: isComplete ? "completed" : obj.status,
                  completedAt: isComplete ? Date.now() : obj.completedAt,
                };
              }
              return obj;
            })
          );
        }}
      />

      {/* Flashcards Revision Modal */}
      <FlashcardsModal
        isOpen={isFlashcardsOpen}
        onClose={() => setIsFlashcardsOpen(false)}
        currentSubject={currentSubject}
        currentLevel={currentLevel}
        currentLanguage={currentLanguage}
        onFlashcardsCompleted={(count) => {
          setStats((prev) => ({
            ...prev,
            flashcardsReviewed: prev.flashcardsReviewed + 1,
          }));
        }}
      />

      {/* Formula & Cheat Sheet Modal */}
      <FormulaSheetModal
        isOpen={isFormulasOpen}
        onClose={() => setIsFormulasOpen(false)}
        onSelectFormula={(prompt) => {
          setInputText(prompt);
        }}
      />

      {/* Exam Countdown Modal */}
      <ExamCountdownModal
        isOpen={isExamsOpen}
        onClose={() => setIsExamsOpen(false)}
        exams={exams}
        onAddExam={(exam) => setExams((prev) => [...prev, exam])}
        onDeleteExam={(id) => setExams((prev) => prev.filter((e) => e.id !== id))}
      />

      {/* Progress & Daily Streak Modal */}
      <ProgressModal
        isOpen={isProgressOpen}
        onClose={() => setIsProgressOpen(false)}
        stats={stats}
        objectives={objectives}
        onOpenObjectives={() => setIsObjectivesOpen(true)}
      />

      {/* Learning Objectives & Goals Modal */}
      <LearningObjectivesModal
        isOpen={isObjectivesOpen}
        onClose={() => setIsObjectivesOpen(false)}
        objectives={objectives}
        onAddObjective={handleAddObjective}
        onUpdateObjective={handleUpdateObjective}
        onDeleteObjective={handleDeleteObjective}
        onPracticeSubject={(subject, topic) => {
          setCurrentSubject(subject);
          if (topic) {
            setInputText(
              `I want to learn "${topic}". Please provide an overview, step-by-step breakdown, formulas, and real-life practice problem.`
            );
          }
        }}
        onTakeQuizForSubject={(subject) => {
          setCurrentSubject(subject);
          setIsQuizOpen(true);
        }}
        onResetDefaults={handleResetDefaultObjectives}
      />

      {/* Compare Answer Modal */}
      {compareTargetMsg && (
        <CompareAnswerModal
          isOpen={Boolean(compareTargetMsg)}
          onClose={() => setCompareTargetMsg(null)}
          questionText={compareTargetMsg.text}
          onSubmitComparison={(userAns) => {
            sendQuestion(compareTargetMsg.text, "compare", userAns);
            setCompareTargetMsg(null);
          }}
          isLoading={isThinking}
        />
      )}
    </div>
  );
}
