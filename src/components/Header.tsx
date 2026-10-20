import React, { useState } from "react";
import {
  GraduationCap,
  Calculator as CalcIcon,
  Trophy,
  Layers,
  BookOpen,
  Calendar,
  Flame,
  Palette,
  Search,
  Bookmark,
  Languages,
  ChevronDown,
  Zap,
  ArrowLeftRight,
  Atom,
  Sparkles,
  Target,
} from "lucide-react";
import {
  AcademicLevel,
  ACADEMIC_LEVELS,
  Subject,
  ALL_SUBJECTS,
  SupportedLanguage,
  SUPPORTED_LANGUAGES,
  AppTheme,
} from "../types";
import { THEMES, getThemeDefinition } from "../data/themes";

interface HeaderProps {
  currentLevel: AcademicLevel;
  onLevelChange: (level: AcademicLevel) => void;
  currentSubject: Subject;
  onSubjectChange: (subject: Subject) => void;
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  streakCount: number;
  currentTheme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
  onOpenCalculator: () => void;
  onOpenValues?: () => void;
  onOpenQuiz: () => void;
  onOpenFlashcards: () => void;
  onOpenFormulas: () => void;
  onOpenExamCountdown: () => void;
  onOpenProgress: () => void;
  onOpenObjectives: () => void;
  activeObjectivesCount?: number;
  showBookmarksOnly: boolean;
  onToggleBookmarksOnly: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLevel,
  onLevelChange,
  currentSubject,
  onSubjectChange,
  currentLanguage,
  onLanguageChange,
  streakCount,
  currentTheme,
  onThemeChange,
  onOpenCalculator,
  onOpenValues,
  onOpenQuiz,
  onOpenFlashcards,
  onOpenFormulas,
  onOpenExamCountdown,
  onOpenProgress,
  onOpenObjectives,
  activeObjectivesCount = 0,
  showBookmarksOnly,
  onToggleBookmarksOnly,
  searchQuery,
  onSearchChange,
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);

  const activeTheme = getThemeDefinition(currentTheme);

  return (
    <header className={`sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors duration-300 ${activeTheme.headerClass}`}>
      {/* Top Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-950/40">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white font-sans">
                StudyMate <span className="text-amber-400">AI</span>
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                PRO TUTOR
              </span>
            </div>
            <p className="text-[11px] text-stone-400 hidden sm:block">
              Universal Knowledge Engine & Calculator
            </p>
          </div>
        </div>

        {/* Center / Action Shortcuts */}
        <div className="hidden lg:flex items-center gap-1.5">
          <button
            id="nav-calc-btn"
            onClick={onOpenCalculator}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs text-amber-300 hover:text-amber-200 transition font-semibold"
            title="Dual Calculator, Unit Converter (km, m, cm...), Subject Values & Roots, STEM Solvers"
          >
            <CalcIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>Calculator &amp; Tools</span>
          </button>

          <button
            id="nav-values-btn"
            onClick={onOpenValues || onOpenCalculator}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs text-amber-300 hover:text-amber-200 transition font-medium"
            title="All Subject Values, Scientific Constants, Periodic Table & Math Roots"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>All Values</span>
          </button>

          <button
            id="nav-quiz-btn"
            onClick={onOpenQuiz}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs text-stone-200 hover:text-white transition font-medium"
            title="Generate 5-question multiple choice practice quiz"
          >
            <Trophy className="w-3.5 h-3.5 text-purple-400" />
            <span>Practice Quiz</span>
          </button>

          <button
            id="nav-flashcards-btn"
            onClick={onOpenFlashcards}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs text-stone-200 hover:text-white transition font-medium"
            title="Generate revision flashcards"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Flashcards</span>
          </button>

          <button
            id="nav-formulas-btn"
            onClick={onOpenFormulas}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs text-stone-200 hover:text-white transition font-medium"
            title="Formulas and Cheat Sheet"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>Formulas</span>
          </button>

          <button
            id="nav-countdown-btn"
            onClick={onOpenExamCountdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs text-stone-200 hover:text-white transition font-medium"
            title="Exam Countdown & Deadlines"
          >
            <Calendar className="w-3.5 h-3.5 text-rose-400" />
            <span>Exams</span>
          </button>

          <button
            id="nav-objectives-btn"
            onClick={onOpenObjectives}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs text-stone-200 hover:text-white transition font-medium relative"
            title="Learning Objectives & Goals - Set subject targets and track progress over time"
          >
            <Target className="w-3.5 h-3.5 text-amber-400" />
            <span>Objectives</span>
            {activeObjectivesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {activeObjectivesCount}
              </span>
            )}
          </button>
        </div>

        {/* Right Tools: Streak, Search, Bookmarks, Theme */}
        <div className="flex items-center gap-2">
          {/* Daily Streak Counter */}
          <button
            id="streak-button"
            onClick={onOpenProgress}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold transition"
            title="View daily study streak & analytics"
          >
            <Flame className="w-4 h-4 fill-amber-500/30 text-amber-400 animate-pulse" />
            <span>{streakCount}d</span>
          </button>

          {/* Search past questions button */}
          <button
            id="toggle-search-btn"
            onClick={() => setShowSearchBar((prev) => !prev)}
            className={`p-2 rounded-xl border transition ${
              showSearchBar
                ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                : "bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800"
            }`}
            title="Search past questions"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Bookmarks toggle */}
          <button
            id="toggle-bookmarks-btn"
            onClick={onToggleBookmarksOnly}
            className={`p-2 rounded-xl border transition ${
              showBookmarksOnly
                ? "bg-amber-500 text-stone-950 border-amber-400"
                : "bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800"
            }`}
            title={showBookmarksOnly ? "Show all questions" : "Show bookmarked solutions only"}
          >
            <Bookmark className="w-4 h-4" />
          </button>

          {/* Theme Selector Dropdown */}
          <div className="relative">
            <button
              id="theme-menu-btn"
              onClick={() => setShowThemeMenu((prev) => !prev)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white transition flex items-center gap-2 text-xs"
              title="Change Color Theme"
            >
              <span
                className="w-3 h-3 rounded-full border border-white/20 shadow-sm flex-shrink-0"
                style={{ backgroundColor: activeTheme.accentColor }}
              />
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline font-medium text-stone-200">
                {activeTheme.name}
              </span>
              <ChevronDown className="w-3 h-3 text-stone-400 hidden sm:inline" />
            </button>

            {showThemeMenu && (
              <div
                className="absolute right-0 mt-2 w-72 max-h-[380px] overflow-y-auto rounded-2xl bg-stone-900 border border-stone-700 shadow-2xl p-2 z-50 text-xs space-y-1 animate-scale-up"
                onMouseLeave={() => setShowThemeMenu(false)}
              >
                <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-400 flex items-center justify-between border-b border-stone-800 mb-1">
                  <span>Color Themes ({THEMES.length})</span>
                  <span className="text-[10px] text-amber-400 font-mono">Select Theme</span>
                </div>

                <div className="space-y-1">
                  {THEMES.map((th) => {
                    const isSelected = currentTheme === th.id;
                    return (
                      <button
                        key={th.id}
                        id={`theme-opt-${th.id}`}
                        onClick={() => {
                          onThemeChange(th.id);
                          setShowThemeMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition text-left ${
                          isSelected
                            ? "bg-amber-500/20 text-white font-semibold border border-amber-500/40"
                            : "text-stone-300 hover:bg-stone-800 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-stone-600 shadow-sm flex-shrink-0"
                            style={{ backgroundColor: th.accentColor }}
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-medium leading-tight truncate">
                              {th.name}
                            </div>
                            <div className="text-[10px] text-stone-400 truncate max-w-[190px]">
                              {th.description}
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 ml-1 shadow-sm shadow-amber-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Bar: Level, Subject, Language Dropdowns + Mobile Quick Action Strip */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 py-2 border-t flex items-center justify-between gap-3 overflow-x-auto transition-colors duration-300 ${activeTheme.subbarClass}`}>
        <div className="flex items-center gap-2.5 flex-nowrap">
          {/* Level Selector */}
          <div className="flex items-center gap-1.5 text-xs text-stone-300 whitespace-nowrap">
            <span className="text-stone-400 font-medium hidden md:inline">Level:</span>
            <select
              id="select-academic-level"
              value={currentLevel}
              onChange={(e) => onLevelChange(e.target.value as AcademicLevel)}
              className="px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {ACADEMIC_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Selector */}
          <div className="flex items-center gap-1.5 text-xs text-stone-300 whitespace-nowrap">
            <span className="text-stone-400 font-medium hidden md:inline">Subject:</span>
            <select
              id="select-subject"
              value={currentSubject}
              onChange={(e) => onSubjectChange(e.target.value as Subject)}
              className="px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 max-w-[150px] sm:max-w-none truncate"
            >
              {ALL_SUBJECTS.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1.5 text-xs text-stone-300 whitespace-nowrap">
            <span className="text-stone-400 font-medium hidden md:inline">Language:</span>
            <div className="flex items-center gap-1 bg-stone-900 border border-stone-700 px-2 py-1.5 rounded-lg">
              <Languages className="w-3.5 h-3.5 text-amber-400" />
              <select
                id="select-language"
                value={currentLanguage}
                onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
                className="bg-transparent text-stone-200 text-xs font-medium focus:outline-none cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.name} value={l.name} className="bg-stone-900 text-stone-200">
                    {l.native} ({l.name})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Mobile quick icons (shown on smaller screens) */}
        <div className="flex lg:hidden items-center gap-1 flex-shrink-0">
          <button
            id="mobile-nav-calc-btn"
            onClick={onOpenCalculator}
            className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300"
            title="Calculator & STEM Tools"
          >
            <CalcIcon className="w-4 h-4" />
          </button>
          <button
            id="mobile-nav-values-btn"
            onClick={onOpenValues || onOpenCalculator}
            className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-amber-300 hover:text-white"
            title="All Subject Values & Constants"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button
            id="mobile-nav-quiz-btn"
            onClick={onOpenQuiz}
            className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-purple-400"
            title="Quiz"
          >
            <Trophy className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenFlashcards}
            className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-emerald-400"
            title="Flashcards"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenFormulas}
            className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-blue-400"
            title="Formulas"
          >
            <BookOpen className="w-4 h-4" />
          </button>
          <button
            id="mobile-nav-countdown-btn"
            onClick={onOpenExamCountdown}
            className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-rose-400"
            title="Exams"
          >
            <Calendar className="w-4 h-4" />
          </button>
          <button
            id="mobile-nav-objectives-btn"
            onClick={onOpenObjectives}
            className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-amber-400 relative"
            title="Learning Objectives & Goals"
          >
            <Target className="w-4 h-4" />
            {activeObjectivesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-stone-900" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable Search Input Bar */}
      {showSearchBar && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 border-t border-stone-800/60 bg-stone-900/60 flex items-center gap-2">
          <Search className="w-4 h-4 text-stone-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search past questions or solutions..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-transparent text-sm text-stone-100 placeholder-stone-500 focus:outline-none px-3 py-2"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="text-xs text-stone-400 hover:text-stone-200 px-2 py-0.5 rounded bg-stone-800"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </header>
  );
};
