import React, { useState, useMemo } from "react";
import { X, Search, BookOpen, Copy, Check, ArrowRight } from "lucide-react";
import { FORMULA_COLLECTION } from "../data/formulas";
import { Subject, ALL_SUBJECTS } from "../types";
import { copyToClipboard } from "../utils/clipboard";
import { MathMarkdown } from "./MathMarkdown";

interface FormulaSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFormula?: (formulaText: string) => void;
}

export const FormulaSheetModal: React.FC<FormulaSheetModalProps> = ({
  isOpen,
  onClose,
  onSelectFormula,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredFormulas = useMemo(() => {
    return FORMULA_COLLECTION.filter((f) => {
      const matchesSubject = selectedSubject === "All" || f.subject === selectedSubject;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        f.name.toLowerCase().includes(q) ||
        f.formula.toLowerCase().includes(q) ||
        f.topic.toLowerCase().includes(q) ||
        f.explanation.toLowerCase().includes(q);
      return matchesSubject && matchesSearch;
    });
  }, [selectedSubject, searchQuery]);

  if (!isOpen) return null;

  const handleCopy = async (id: string, formula: string) => {
    const success = await copyToClipboard(formula);
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleAskAbout = (f: any) => {
    if (onSelectFormula) {
      onSelectFormula(`Please explain this formula in detail: ${f.name} [${f.formula}]. What is the derivation, intuition, and a solved example?`);
      onClose();
    }
  };

  return (
    <div
      id="formula-sheet-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        id="formula-sheet-dialog"
        className="w-full max-w-3xl bg-stone-900 border border-stone-700 text-stone-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Formula & Concept Cheat Sheet</h2>
              <p className="text-xs text-stone-400">Quick-reference essential formulas across STEM & sciences</p>
            </div>
          </div>
          <button
            id="close-formula-sheet-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-5 border-b border-stone-800 bg-stone-900/80 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by formula name, concept, or variable..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedSubject("All")}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                selectedSubject === "All"
                  ? "bg-blue-600 text-white"
                  : "bg-stone-800 text-stone-300 hover:bg-stone-700"
              }`}
            >
              All Subjects
            </button>
            {["Math", "Physics", "Chemistry", "Statistics", "Economics", "Computer Science"].map((subj) => (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                  selectedSubject === subj
                    ? "bg-blue-600 text-white"
                    : "bg-stone-800 text-stone-300 hover:bg-stone-700"
                }`}
              >
                {subj}
              </button>
            ))}
          </div>
        </div>

        {/* Formulas Grid */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3.5">
          {filteredFormulas.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-sm">
              No formulas matched your search criteria.
            </div>
          ) : (
            filteredFormulas.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-stone-800/60 border border-stone-700/60 hover:border-stone-600 transition space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-950/60 text-blue-300 border border-blue-800/40">
                      {item.subject}
                    </span>
                    <span className="text-xs text-stone-400">{item.topic}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(item.id, item.formula)}
                      className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs flex items-center gap-1 transition"
                      title="Copy formula"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedId === item.id ? "Copied" : "Copy"}</span>
                    </button>
                    {onSelectFormula && (
                      <button
                        onClick={() => handleAskAbout(item)}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs flex items-center gap-1 transition font-medium"
                      >
                        <span>Ask AI</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-stone-100">{item.name}</h4>
                  <div className="my-2 p-2.5 rounded-lg bg-stone-950 border border-stone-800 text-amber-300 overflow-x-auto">
                    <MathMarkdown content={`$$${item.formula}$$`} />
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed">{item.explanation}</p>
                  {item.variables && (
                    <p className="text-[11px] text-stone-400 mt-1 italic">
                      Variables: {item.variables}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
