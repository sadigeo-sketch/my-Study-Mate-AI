import React, { useState } from "react";
import { X, Sparkles, CheckCircle2, AlertCircle, ArrowRight, RotateCcw, Trophy } from "lucide-react";
import confetti from "canvas-confetti";
import { Subject, AcademicLevel, SupportedLanguage, QuizQuestion, ALL_SUBJECTS } from "../types";
import { MathMarkdown } from "./MathMarkdown";

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSubject: Subject;
  currentLevel: AcademicLevel;
  currentLanguage: SupportedLanguage;
  onQuizCompleted?: (score: number, total: number) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  currentSubject,
  currentLevel,
  currentLanguage,
  onQuizCompleted,
}) => {
  const [subject, setSubject] = useState<Subject>(currentSubject);
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const generateQuiz = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setCurrentIndex(0);

    try {
      const res = await fetch("/api/quiz", {
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
        throw new Error(errData.error || "Unable to generate quiz at this moment. Please try again.");
      }

      const data = await res.json();
      if (Array.isArray(data.quiz) && data.quiz.length > 0) {
        setQuestions(data.quiz);
      } else {
        throw new Error("Invalid quiz format returned by server.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong while generating quiz.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIndex,
    }));
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  const handleSubmitQuiz = () => {
    setIsSubmitted(true);
    const score = calculateScore();
    if (score >= 4) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Confetti fallback
      }
    }
    if (onQuizCompleted) {
      onQuizCompleted(score, questions.length);
    }
  };

  const currentQ = questions[currentIndex];
  const score = isSubmitted ? calculateScore() : 0;

  return (
    <div
      id="quiz-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        id="quiz-dialog"
        className="w-full max-w-2xl bg-stone-900 border border-stone-700 text-stone-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Interactive Practice Quiz</h2>
              <p className="text-xs text-stone-400">5-question knowledge challenge tailored to your level</p>
            </div>
          </div>
          <button
            id="close-quiz-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration / Quiz Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {questions.length === 0 ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/40 text-sm text-purple-200">
                Choose a subject and optional topic to generate a fresh, dynamic 5-question multiple choice quiz calibrated for{" "}
                <span className="font-semibold text-purple-100">{currentLevel}</span>.
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                  Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as Subject)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
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
                  Specific Topic / Focus Area (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Organic Reactions, Thermodynamics, World War II..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                id="start-quiz-generation-btn"
                onClick={generateQuiz}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 disabled:opacity-50 text-white font-medium flex items-center justify-center gap-2 transition shadow-lg shadow-purple-950/50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Generating Quiz with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate 5-Question Quiz</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Progress Bar & Header */}
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span>
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="font-mono text-purple-400">
                  {subject} • {currentLevel}
                </span>
              </div>

              <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>

              {/* Active Question */}
              <div className="p-4 rounded-xl bg-stone-800/60 border border-stone-700/60">
                <div className="text-base font-medium text-stone-100 leading-relaxed mb-4">
                  <MathMarkdown content={currentQ.question} />
                </div>

                <div className="space-y-2.5">
                  {currentQ.options.map((option, optIdx) => {
                    const isSelected = selectedAnswers[currentIndex] === optIdx;
                    const isCorrect = isSubmitted && optIdx === currentQ.correctIndex;
                    const isWrong = isSubmitted && isSelected && optIdx !== currentQ.correctIndex;

                    let btnStyle = "bg-stone-800/80 border-stone-700 text-stone-200 hover:bg-stone-700";
                    if (isSelected && !isSubmitted) {
                      btnStyle = "bg-purple-600/30 border-purple-500 text-purple-100";
                    } else if (isCorrect) {
                      btnStyle = "bg-emerald-950/50 border-emerald-500 text-emerald-200";
                    } else if (isWrong) {
                      btnStyle = "bg-red-950/50 border-red-500 text-red-200";
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(optIdx)}
                        className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between text-sm ${btnStyle}`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span className="w-6 h-6 flex-shrink-0 rounded-lg bg-stone-700/50 text-stone-400 text-xs flex items-center justify-center font-mono">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <div className="flex-1">
                            <MathMarkdown content={option} />
                          </div>
                        </div>
                        {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>

                {isSubmitted && (
                  <div className="mt-4 p-3 rounded-lg bg-stone-900 border border-stone-800 text-xs text-stone-300 space-y-1">
                    <span className="font-semibold text-purple-400">Explanation: </span>
                    <MathMarkdown content={currentQ.explanation} />
                  </div>
                )}
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-300 text-xs transition"
                >
                  Previous
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex((prev) => prev + 1)}
                    className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition flex items-center gap-1.5"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  !isSubmitted && (
                    <button
                      onClick={handleSubmitQuiz}
                      className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow"
                    >
                      Submit Answers
                    </button>
                  )
                )}
              </div>

              {/* Final Summary Card when Submitted */}
              {isSubmitted && (
                <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-700/50 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-purple-200">
                      Score: {score} / {questions.length} ({Math.round((score / questions.length) * 100)}%)
                    </h4>
                    <p className="text-xs text-purple-300/80">
                      {score === 5
                        ? "Mastery achieved! Flawless knowledge."
                        : score >= 3
                        ? "Good job! Review the explanations to solidify concepts."
                        : "Keep practicing! Reviewing these mistakes will help you grow."}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setQuestions([]);
                      setSelectedAnswers({});
                      setIsSubmitted(false);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-purple-800 hover:bg-purple-700 text-purple-100 text-xs flex items-center gap-1.5 transition font-medium"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>New Quiz</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
