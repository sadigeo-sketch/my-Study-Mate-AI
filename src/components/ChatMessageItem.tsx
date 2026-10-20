import React, { useState } from "react";
import { MathMarkdown } from "./MathMarkdown";
import {
  Volume2,
  VolumeX,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  RotateCcw,
  GitCompare,
  Lightbulb,
  Calculator as CalcIcon,
  Sparkles,
  User,
  GraduationCap,
  Pencil,
  CornerDownLeft,
} from "lucide-react";
import { ChatMessage, SUPPORTED_LANGUAGES } from "../types";
import { TextToSpeechEngine } from "../utils/speech";
import { copyToClipboard } from "../utils/clipboard";

interface ChatMessageItemProps {
  message: ChatMessage;
  onBookmarkToggle: (id: string) => void;
  onExplainDifferently: (msg: ChatMessage) => void;
  onCompareAnswer: (msg: ChatMessage) => void;
  onAskHint: (msg: ChatMessage) => void;
  onOpenCalculatorWithResult?: (val: string) => void;
  bcp47Lang: string;
  languageName?: string;
  onEditMessage?: (messageId: string, newText: string, resubmit: boolean) => void;
  onLoadIntoInput?: (text: string) => void;
  userBubbleClassName?: string;
  aiBubbleClassName?: string;
  themeCategory?: "dark" | "light";
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onBookmarkToggle,
  onExplainDifferently,
  onCompareAnswer,
  onAskHint,
  onOpenCalculatorWithResult,
  bcp47Lang,
  languageName,
  onEditMessage,
  onLoadIntoInput,
  userBubbleClassName,
  aiBubbleClassName,
  themeCategory = "dark",
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedCalc, setCopiedCalc] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(message.text);

  const isUser = message.role === "user";
  const isLight = themeCategory === "light";

  // Detect if text contains Arabic/Urdu script (Right-to-Left)
  const isRtl =
    /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
      message.text || ""
    ) || languageName === "Urdu";

  const handleSpeakToggle = () => {
    if (isSpeaking) {
      TextToSpeechEngine.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const targetLangName = message.language || languageName || "English";
      const langConfig = SUPPORTED_LANGUAGES.find((l) => l.name === targetLangName);
      let targetBcp47 = langConfig ? langConfig.bcp47 : bcp47Lang || "en-US";

      // Detect if text contains Urdu/Arabic or Hindi script
      if (/[\u0600-\u06FF\u0750-\u077F]/.test(message.text || "")) {
        targetBcp47 = targetLangName === "Arabic" ? "ar-SA" : "ur-PK";
      } else if (/[\u0900-\u097F]/.test(message.text || "")) {
        targetBcp47 = "hi-IN";
      }

      TextToSpeechEngine.speak(message.text, targetBcp47, targetLangName, () => {
        setIsSpeaking(false);
      });
    }
  };

  const handleCopyText = async () => {
    const success = await copyToClipboard(message.text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyCalcResult = async (val: string) => {
    const success = await copyToClipboard(val);
    if (success) {
      setCopiedCalc(true);
      setTimeout(() => setCopiedCalc(false), 2000);
    }
  };

  const handleStartEdit = () => {
    setEditedText(message.text);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditedText(message.text);
    setIsEditing(false);
  };

  const handleSaveAndResubmit = () => {
    if (!editedText.trim()) return;
    if (onEditMessage) {
      onEditMessage(message.id, editedText.trim(), true);
    }
    setIsEditing(false);
  };

  const handleSaveOnly = () => {
    if (!editedText.trim()) return;
    if (onEditMessage) {
      onEditMessage(message.id, editedText.trim(), false);
    }
    setIsEditing(false);
  };

  // Strip the [CALCULATOR RESULT: ...] header from markdown view if shown separately
  const cleanMarkdownText = (message.text || "").replace(
    /\[CALCULATOR RESULT:[^\]]+\]\s*/i,
    ""
  );

  return (
    <div
      className={`w-full py-2 sm:py-3 transition-colors flex ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`transition-all ${
          isUser
            ? (userBubbleClassName ||
              "max-w-[92%] sm:max-w-[82%] ml-auto bg-stone-800/90 border border-stone-700/80 rounded-2xl text-stone-100 p-4 sm:p-5 shadow-sm")
            : "w-full py-2 sm:py-3 px-0 bg-transparent border-0 shadow-none rounded-none"
        }`}
      >
        {/* Message Meta Header */}
        <div
          className={`flex items-center justify-between gap-2 text-xs ${
            isUser
              ? "pb-2.5 mb-3 border-b border-stone-700/40"
              : "mb-3 pb-1 border-0"
          }`}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <div
              className={`p-1 rounded-md flex items-center justify-center ${
                isUser
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-purple-500/20 text-purple-400"
              }`}
            >
              {isUser ? (
                <User className="w-3.5 h-3.5" />
              ) : (
                <GraduationCap className="w-3.5 h-3.5" />
              )}
            </div>
            <span
              className={`font-semibold ${
                isLight && !isUser ? "text-stone-900" : "text-stone-200"
              }`}
            >
              {isUser ? "You" : "StudyMate AI"}
            </span>

            {isUser && message.isEdited && (
              <span className="text-[10px] text-amber-400/90 font-medium italic">
                (edited)
              </span>
            )}

            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border ${
                isLight
                  ? "bg-stone-200/90 text-stone-800 border-stone-300 shadow-2xs"
                  : "bg-stone-800 text-stone-200 border-stone-700"
              }`}
            >
              {message.subject}
            </span>

            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                isLight
                  ? "bg-stone-200/90 text-stone-800 border-stone-300 shadow-2xs"
                  : "bg-stone-800 text-stone-200 border-stone-700"
              }`}
            >
              {message.level}
            </span>

            {message.mode && message.mode !== "standard" && (
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${
                  isLight
                    ? "bg-cyan-100 text-cyan-900 border-cyan-300"
                    : "bg-cyan-950/80 text-cyan-200 border-cyan-700/70"
                }`}
              >
                {message.mode.replace("_", " ")}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-stone-400">
            <span className="text-[11px] text-stone-500">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>

            {/* User Edit Button in Header */}
            {isUser && (
              <button
                id={`edit-user-msg-btn-${message.id}`}
                onClick={handleStartEdit}
                className="p-1.5 rounded-lg transition hover:bg-stone-700/60 text-stone-400 hover:text-amber-300 flex items-center gap-1"
                title="Edit this question"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">Edit</span>
              </button>
            )}

            <button
              onClick={() => onBookmarkToggle(message.id)}
              className={`p-1.5 rounded-lg transition hover:bg-stone-800/80 ${
                message.bookmarked
                  ? "text-amber-400"
                  : "text-stone-500 hover:text-stone-300"
              }`}
              title={message.bookmarked ? "Remove bookmark" : "Bookmark this solution"}
            >
              {message.bookmarked ? (
                <BookmarkCheck className="w-4 h-4 fill-amber-400/20" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* User image thumbnail if attached */}
        {message.imagePreview && (
          <div className="mb-3.5">
            <div className="text-[11px] text-stone-400 mb-1 flex items-center gap-1">
              <span>Attached Handwriting / Photo:</span>
            </div>
            <img
              src={message.imagePreview}
              alt="Handwritten problem"
              className="max-h-48 rounded-xl border border-stone-700 object-contain bg-black/40"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* User Attempt comparison display if provided */}
        {message.userAttempt && (
          <div className="mb-3 p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200">
            <span className="font-semibold text-cyan-300">Your Answer to Compare: </span>
            <span className="italic">{message.userAttempt}</span>
          </div>
        )}

        {/* Dual Calculator Result Display Block */}
        {!isUser && message.calculatorResult && (
          <div
            className={`mb-3.5 py-2.5 px-3.5 rounded-xl border-l-4 border-l-amber-500 border-y-0 border-r-0 ${
              isLight
                ? "bg-amber-50 text-stone-900"
                : "bg-amber-500/10 text-white"
            } flex items-center justify-between gap-3 flex-wrap`}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <CalcIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-mono tracking-wider text-amber-400 font-semibold">
                  Dual Calculator Output
                </div>
                <div className="text-lg font-bold font-mono text-white">
                  {message.calculatorResult}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyCalcResult(message.calculatorResult!)}
                className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs flex items-center gap-1 border border-stone-700 transition"
              >
                {copiedCalc ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedCalc ? "Copied" : "Copy"}</span>
              </button>

              {onOpenCalculatorWithResult && (
                <button
                  onClick={() => onOpenCalculatorWithResult(message.calculatorResult!)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs flex items-center gap-1 border border-amber-500/40 transition font-medium"
                >
                  <CalcIcon className="w-3.5 h-3.5" />
                  <span>Open in Calc</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Message Content: Inline Editor for User OR Regular Markdown Body */}
        {isUser && isEditing ? (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs text-amber-400/90 font-medium">
              <span className="flex items-center gap-1.5">
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit your question</span>
              </span>
              <span className="text-[11px] text-stone-400">
                {editedText.length} characters
              </span>
            </div>

            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              rows={Math.min(7, Math.max(3, editedText.split("\n").length + 1))}
              className="w-full px-4 py-3.5 sm:px-5 sm:py-4 rounded-xl bg-stone-900/95 border border-amber-500/60 text-stone-100 placeholder-stone-500 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-y leading-relaxed"
              placeholder="Edit your question..."
              autoFocus
            />

            <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  id="save-resubmit-edit-btn"
                  onClick={handleSaveAndResubmit}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs flex items-center gap-1.5 transition shadow-sm active:scale-95"
                  title="Save changes and ask StudyMate AI for a fresh answer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Save & Resubmit</span>
                </button>

                <button
                  id="save-only-edit-btn"
                  onClick={handleSaveOnly}
                  className="px-3 py-1.5 rounded-lg bg-stone-700 hover:bg-stone-600 text-stone-200 text-xs font-medium flex items-center gap-1 transition"
                  title="Save edited text without generating a new AI answer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Only</span>
                </button>

                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 rounded-lg bg-stone-800/90 hover:bg-stone-700 text-stone-400 hover:text-stone-200 text-xs transition"
                >
                  Cancel
                </button>
              </div>

              {onLoadIntoInput && (
                <button
                  onClick={() => {
                    onLoadIntoInput(editedText);
                    setIsEditing(false);
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline transition"
                  title="Copy this edited text down to the main prompt box below"
                >
                  <CornerDownLeft className="w-3.5 h-3.5" />
                  <span>Load into Prompt Box</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div
            dir={isRtl ? "rtl" : "ltr"}
            className={`text-sm md:text-[15px] leading-relaxed break-words ${
              isRtl ? "text-right font-sans" : "text-left"
            }`}
          >
            {isUser ? (
              <div className="leading-relaxed text-stone-100">
                <MathMarkdown
                  content={message.text}
                  isLight={false}
                  isRtl={isRtl}
                  stripCalculatorHeader={false}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <MathMarkdown
                  content={cleanMarkdownText}
                  isLight={isLight}
                  isRtl={isRtl}
                  stripCalculatorHeader={false}
                />
              </div>
            )}
          </div>
        )}

        {/* User Message Action Toolbar (Edit, Load into Input, Copy) */}
        {isUser && !isEditing && (
          <div className="mt-3.5 pt-2.5 border-t border-stone-700/40 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2">
              <button
                id={`edit-btn-${message.id}`}
                onClick={handleStartEdit}
                className="px-2.5 py-1 rounded-lg bg-stone-700/40 hover:bg-stone-700 text-stone-300 hover:text-amber-300 flex items-center gap-1.5 transition text-xs border border-stone-700/60 hover:border-amber-500/40"
                title="Edit your question text"
              >
                <Pencil className="w-3.5 h-3.5 text-amber-400" />
                <span>Edit</span>
              </button>

              {onLoadIntoInput && (
                <button
                  onClick={() => onLoadIntoInput(message.text)}
                  className="px-2.5 py-1 rounded-lg bg-stone-700/40 hover:bg-stone-700 text-stone-300 hover:text-cyan-300 flex items-center gap-1.5 transition text-xs border border-stone-700/60 hover:border-cyan-500/40"
                  title="Copy this prompt to the main input box below"
                >
                  <CornerDownLeft className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Load to Input</span>
                </button>
              )}
            </div>

            <button
              onClick={handleCopyText}
              className="p-1.5 rounded-lg hover:bg-stone-700/60 text-stone-400 hover:text-stone-200 transition"
              title="Copy question text"
            >
              {copied ? (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                  <Check className="w-3.5 h-3.5" /> Copied
                </span>
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}

        {/* Assistant Action Toolbar */}
        {!isUser && (
          <div className="mt-3.5 pt-1 border-0 flex items-center justify-between flex-wrap gap-2 text-xs">
            {/* Left action tools */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                id={`listen-btn-${message.id}`}
                onClick={handleSpeakToggle}
                className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition font-medium ${
                  isSpeaking
                    ? "bg-amber-500/25 border-amber-500/60 text-amber-300 shadow-sm animate-pulse"
                    : "bg-stone-800/90 border-stone-700 text-stone-300 hover:bg-stone-700 hover:text-white"
                }`}
                title={isSpeaking ? "Stop speech audio" : `Listen to solution in ${languageName || "natural voice"}`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                    <span>Stop Voice</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Listen</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onExplainDifferently(message)}
                className="px-2.5 py-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 border border-stone-700 text-stone-300 flex items-center gap-1.5 transition"
                title="Explain with simpler analogies and everyday examples"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Explain Differently</span>
              </button>

              <button
                onClick={() => onCompareAnswer(message)}
                className="px-2.5 py-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 border border-stone-700 text-stone-300 flex items-center gap-1.5 transition"
                title="Type your own solution to check if you did it right"
              >
                <GitCompare className="w-3.5 h-3.5 text-cyan-400" />
                <span>Compare My Answer</span>
              </button>

              <button
                onClick={() => onAskHint(message)}
                className="px-2.5 py-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 border border-stone-700 text-stone-300 flex items-center gap-1.5 transition"
                title="Get a gentle hint first"
              >
                <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
                <span>Get Hint</span>
              </button>
            </div>

            {/* Right tool: Copy */}
            <button
              onClick={handleCopyText}
              className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition"
              title="Copy solution text"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

