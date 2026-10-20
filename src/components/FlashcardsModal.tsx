import React, { useState } from "react";
import { X, Sparkles, Layers, RotateCw, ChevronLeft, ChevronRight, CheckCircle2, Bookmark } from "lucide-react";
import { Subject, AcademicLevel, SupportedLanguage, Flashcard, ALL_SUBJECTS } from "../types";
import { MathMarkdown } from "./MathMarkdown";

interface FlashcardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSubject: Subject;
  currentLevel: AcademicLevel;
  currentLanguage: SupportedLanguage;
  onFlashcardsCompleted?: (count: number) => void;
}

export const FlashcardsModal: React.FC<FlashcardsModalProps> = ({
  isOpen,
  onClose,
  currentSubject,
  currentLevel,
  currentLanguage,
  onFlashcardsCompleted,
}) => {
  const [subject, setSubject] = useState<Subject>(currentSubject);
  const [topic, setTopic] = useState("");
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [masteredIds, setMasteredIds] = useState<Set<number>>(new Set());

  if (!isOpen) return null;

  const generateFlashcards = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setIsFlipped(false);
    setCurrentIndex(0);
    setMasteredIds(new Set());

    try {
      const res = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          level: currentLevel,
          topic: topic.trim() || undefined,
          language: currentLanguage,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Could not generate revision flashcards. Please try again.");
      }

      const data = await res.json();
      if (Array.isArray(data.flashcards) && data.flashcards.length > 0) {
        setCards(data.flashcards);
      } else {
        throw new Error("No flashcards returned from AI generator.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to generate flashcards.");
    } finally {
      setIsLoading(false);
    }
  };

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const toggleMastered = (id: number) => {
    setMasteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

    if (onFlashcardsCompleted) {
      onFlashcardsCompleted(masteredIds.size + 1);
    }
  };

  return (
    <div
      id="flashcards-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        id="flashcards-dialog"
        className="w-full max-w-xl bg-stone-900 border border-stone-700 text-stone-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Active Recall Flashcards</h2>
              <p className="text-xs text-stone-400">Spaced repetition revision cards for any topic</p>
            </div>
          </div>
          <button
            id="close-flashcards-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {cards.length === 0 ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-sm text-emerald-200">
                Generate high-yield revision flashcards for{" "}
                <span className="font-semibold text-emerald-100">{currentLevel}</span>. Tap cards to flip and test your memory!
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                  Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as Subject)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                >
                  {ALL_SUBJECTS.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                  Topic / Sub-topic
                </label>
                <input
                  type="text"
                  placeholder="e.g. Newton's Laws, Trigonometric Identities, Krebs Cycle..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-red-200 text-xs">
                  {errorMessage}
                </div>
              )}

              <button
                id="generate-flashcards-btn"
                onClick={generateFlashcards}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-medium flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950/50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Generating Flashcards with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Flashcard Deck</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Progress and status */}
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span>
                  Card {currentIndex + 1} of {cards.length}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-medium">
                    Mastered: {masteredIds.size} / {cards.length}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                />
              </div>

              {/* Interactive Flashcard with Flip */}
              <div
                onClick={() => setIsFlipped((prev) => !prev)}
                className={`min-h-[220px] p-6 rounded-2xl border cursor-pointer select-none transition-all duration-300 flex flex-col justify-between shadow-lg relative ${
                  isFlipped
                    ? "bg-emerald-950/40 border-emerald-600/60 text-emerald-100"
                    : "bg-stone-800/90 border-stone-700 hover:border-stone-600 text-stone-100"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`px-2 py-0.5 rounded-full font-mono text-[10px] ${
                      isFlipped ? "bg-emerald-900/60 text-emerald-300" : "bg-stone-700 text-stone-300"
                    }`}
                  >
                    {isFlipped ? "ANSWER / EXPLANATION" : "QUESTION / PROMPT"}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-stone-400">
                    <RotateCw className="w-3 h-3" />
                    <span>Click card to flip</span>
                  </div>
                </div>

                <div className="py-6 text-center flex flex-col items-center justify-center min-h-[140px]">
                  <div className="text-lg md:text-xl font-medium leading-relaxed max-w-lg">
                    <MathMarkdown content={isFlipped ? currentCard.back : currentCard.front} />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-700/50">
                  <span className="text-xs text-stone-400">{currentCard.category || subject}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMastered(currentCard.id);
                    }}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition ${
                      masteredIds.has(currentCard.id)
                        ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/50"
                        : "bg-stone-700/60 text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{masteredIds.has(currentCard.id) ? "Mastered" : "Mark as Mastered"}</span>
                  </button>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-300 text-xs transition flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={() => {
                    setCards([]);
                    setIsFlipped(false);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs text-stone-400 hover:text-stone-200 transition"
                >
                  Change Topic
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentIndex === cards.length - 1}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-medium transition flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
