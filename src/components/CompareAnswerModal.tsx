import React, { useState } from "react";
import { X, GitCompare, CheckCircle2, Send, HelpCircle } from "lucide-react";

interface CompareAnswerModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionText: string;
  onSubmitComparison: (userAnswer: string) => void;
  isLoading?: boolean;
}

export const CompareAnswerModal: React.FC<CompareAnswerModalProps> = ({
  isOpen,
  onClose,
  questionText,
  onSubmitComparison,
  isLoading = false,
}) => {
  const [userAnswer, setUserAnswer] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;
    onSubmitComparison(userAnswer.trim());
    onClose();
  };

  return (
    <div
      id="compare-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        id="compare-dialog"
        className="w-full max-w-lg bg-stone-900 border border-stone-700 text-stone-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Compare My Answer</h2>
              <p className="text-xs text-stone-400">
                AI will inspect your steps, verify correctness, & diagnose errors
              </p>
            </div>
          </div>
          <button
            id="close-compare-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-stone-800/70 border border-stone-700/60 text-xs text-stone-300">
            <span className="font-semibold text-cyan-400">Current Question:</span>
            <p className="mt-1 font-normal text-stone-200 line-clamp-3">
              {questionText || "Active Problem"}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center gap-1.5">
              <span>Your Proposed Answer / Working</span>
              <span className="text-[11px] text-stone-500 font-normal">
                (Equations, final number, or thought process)
              </span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="e.g. I got x = 3 because 2x + 6 = 12 implies 2x = 6..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-full px-4 py-3.5 sm:px-5 sm:py-4 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 placeholder-stone-500 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-cyan-500/50 leading-relaxed resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !userAnswer.trim()}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Evaluate My Answer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
