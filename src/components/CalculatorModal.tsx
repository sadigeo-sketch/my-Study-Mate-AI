import React, { useState, useEffect } from "react";
import {
  X,
  Copy,
  Check,
  ArrowRight,
  RotateCcw,
  Calculator as CalcIcon,
  ArrowLeftRight,
  Atom,
  Gauge,
  Binary,
  Search,
  Sparkles,
  Zap,
  LineChart,
  BarChart3,
  FlaskConical,
  DollarSign,
} from "lucide-react";
import { copyToClipboard } from "../utils/clipboard";
import { SUBJECT_VALUES, SubjectValueItem } from "../data/subjectValues";
import {
  UNIT_CATEGORIES,
  UnitCategory,
  convertUnit,
} from "../utils/unitConverter";
import { GraphingCalculator } from "./calculator/GraphingCalculator";
import { StatisticsCalculator } from "./calculator/StatisticsCalculator";
import { ChemistryCalculator } from "./calculator/ChemistryCalculator";
import { FinanceCalculator } from "./calculator/FinanceCalculator";
import { ScientificCalculator } from "./calculator/ScientificCalculator";

export type CalculatorTab =
  | "scientific"
  | "graphing"
  | "converter"
  | "statistics"
  | "chemistry"
  | "physics"
  | "finance"
  | "math"
  | "values"
  | "calc";

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertResult?: (result: string) => void;
  initialTab?: CalculatorTab;
  initialValue?: string;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({
  isOpen,
  onClose,
  onInsertResult,
  initialTab = "scientific",
  initialValue = "",
}) => {
  const [activeTab, setActiveTab] = useState<CalculatorTab>(
    initialTab === "calc" ? "scientific" : initialTab
  );

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab === "calc" ? "scientific" : initialTab);
    }
  }, [initialTab]);

  // --- DUAL CALCULATOR STATE ---
  const [calcMode, setCalcMode] = useState<"standard" | "scientific">("scientific");
  const [angleMode, setAngleMode] = useState<"deg" | "rad">("deg");
  const [expression, setExpression] = useState(initialValue || "");
  const [result, setResult] = useState("0");
  const [history, setHistory] = useState<string[]>([]);
  const [calcCopied, setCalcCopied] = useState(false);

  // --- UNIT CONVERTER STATE ---
  const [unitCategory, setUnitCategory] = useState<UnitCategory>("length");
  const [fromValue, setFromValue] = useState<string>("1");
  const [fromUnitId, setFromUnitId] = useState<string>("km");
  const [toUnitId, setToUnitId] = useState<string>("m");
  const [converterCopied, setConverterCopied] = useState(false);

  // --- SUBJECT VALUES STATE ---
  const [valuesSubjectFilter, setValuesSubjectFilter] = useState<string>("All");
  const [valuesSearchQuery, setValuesSearchQuery] = useState<string>("");
  const [copiedValueId, setCopiedValueId] = useState<string | null>(null);

  // --- PHYSICS SOLVERS STATE ---
  const [physicsTool, setPhysicsTool] = useState<"kinematics" | "newton" | "ohm" | "energy" | "wave">("kinematics");
  const [kinU, setKinU] = useState<string>("0");
  const [kinA, setKinA] = useState<string>("9.81");
  const [kinT, setKinT] = useState<string>("5");
  const [newtonM, setNewtonM] = useState<string>("10");
  const [newtonA, setNewtonA] = useState<string>("2.5");
  const [ohmMode, setOhmMode] = useState<"solveI" | "solveV" | "solveR">("solveI");
  const [ohmV, setOhmV] = useState<string>("12");
  const [ohmR, setOhmR] = useState<string>("4");
  const [ohmI, setOhmI] = useState<string>("3");
  const [energyM, setEnergyM] = useState<string>("5");
  const [energyV, setEnergyV] = useState<string>("10");
  const [energyH, setEnergyH] = useState<string>("20");
  const [waveF, setWaveF] = useState<string>("440");
  const [waveLambda, setWaveLambda] = useState<string>("0.78");

  // --- MATH SOLVERS STATE ---
  const [mathTool, setMathTool] = useState<"quadratic" | "pythagoras" | "percentage" | "circle">("quadratic");
  const [quadA, setQuadA] = useState<string>("1");
  const [quadB, setQuadB] = useState<string>("-5");
  const [quadC, setQuadC] = useState<string>("6");
  const [pythMode, setPythMode] = useState<"findHypotenuse" | "findLeg">("findHypotenuse");
  const [pythA, setPythA] = useState<string>("3");
  const [pythB, setPythB] = useState<string>("4");
  const [pythC, setPythC] = useState<string>("5");
  const [pctX, setPctX] = useState<string>("15");
  const [pctY, setPctY] = useState<string>("200");
  const [circleR, setCircleR] = useState<string>("5");

  useEffect(() => {
    if (isOpen) {
      if (initialTab) {
        setActiveTab(initialTab);
      }
      if (initialValue) {
        setExpression(initialValue);
      }
    }
  }, [isOpen, initialTab, initialValue]);

  if (!isOpen) return null;

  // --- CALCULATOR ENGINE ---
  const handleCalcButtonClick = (val: string) => {
    if (val === "C") {
      setExpression("");
      setResult("0");
      return;
    }

    if (val === "DEL") {
      setExpression((prev) => prev.slice(0, -1));
      return;
    }

    if (val === "=") {
      calculateCalcResult();
      return;
    }

    if (val === "+/-") {
      if (expression.startsWith("-")) {
        setExpression(expression.substring(1));
      } else {
        setExpression("-" + expression);
      }
      return;
    }

    setExpression((prev) => prev + val);
  };

  const calculateCalcResult = () => {
    if (!expression.trim()) return;

    try {
      let parsed = expression
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/π/g, "Math.PI")
        .replace(/e(?![a-zA-Z])/g, "Math.E")
        .replace(/√\(/g, "Math.sqrt(")
        .replace(/log\(/g, "Math.log10(")
        .replace(/ln\(/g, "Math.log(")
        .replace(/\^/g, "**");

      if (angleMode === "deg") {
        parsed = parsed
          .replace(/sin\(([^)]+)\)/g, "Math.sin(($1) * Math.PI / 180)")
          .replace(/cos\(([^)]+)\)/g, "Math.cos(($1) * Math.PI / 180)")
          .replace(/tan\(([^)]+)\)/g, "Math.tan(($1) * Math.PI / 180)");
      } else {
        parsed = parsed
          .replace(/sin\(/g, "Math.sin(")
          .replace(/cos\(/g, "Math.cos(")
          .replace(/tan\(/g, "Math.tan(");
      }

      parsed = parsed.replace(/(\d+)!/g, (_, n) => {
        let f = 1;
        const num = parseInt(n, 10);
        for (let i = 2; i <= num; i++) f *= i;
        return String(f);
      });

      const evaluated = new Function(`"use strict"; return (${parsed})`)();

      if (typeof evaluated === "number" && !isNaN(evaluated) && isFinite(evaluated)) {
        const formatted = Number.isInteger(evaluated)
          ? evaluated.toString()
          : parseFloat(evaluated.toFixed(8)).toString();

        setResult(formatted);
        setHistory((prev) => [`${expression} = ${formatted}`, ...prev.slice(0, 9)]);
      } else {
        setResult("Error");
      }
    } catch {
      setResult("Error");
    }
  };

  const copyResultToClipboard = async () => {
    const success = await copyToClipboard(result);
    if (success) {
      setCalcCopied(true);
      setTimeout(() => setCalcCopied(false), 2000);
    }
  };

  const handleUseInCalculator = (val: string | number) => {
    const str = String(val);
    setExpression((prev) => (prev ? prev + " * " + str : str));
    setActiveTab("calc");
  };

  const handleInsertInChat = (text: string) => {
    if (onInsertResult) {
      onInsertResult(text);
      onClose();
    }
  };

  // --- UNIT CONVERTER ENGINE ---
  const activeCategoryDef = UNIT_CATEGORIES.find((c) => c.id === unitCategory) || UNIT_CATEGORIES[0];
  const numericFromVal = parseFloat(fromValue) || 0;
  const conversionResult = convertUnit(numericFromVal, fromUnitId, toUnitId, unitCategory);

  const handleSwapUnits = () => {
    const temp = fromUnitId;
    setFromUnitId(toUnitId);
    setToUnitId(temp);
  };

  const handleSelectCategory = (cat: UnitCategory) => {
    setUnitCategory(cat);
    const def = UNIT_CATEGORIES.find((c) => c.id === cat);
    if (def && def.units.length >= 2) {
      setFromUnitId(def.units[0].id);
      setToUnitId(def.units[1].id);
    }
  };

  // --- FILTERED SUBJECT VALUES ---
  const filteredValues = SUBJECT_VALUES.filter((item) => {
    const matchesSubject = valuesSubjectFilter === "All" || item.subject === valuesSubjectFilter;
    const query = valuesSearchQuery.toLowerCase().trim();
    if (!query) return matchesSubject;
    const matchesQuery =
      item.name.toLowerCase().includes(query) ||
      item.symbol.toLowerCase().includes(query) ||
      item.value.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query);
    return matchesSubject && matchesQuery;
  });

  const subjectsList = ["All", "Math", "Physics", "Chemistry", "Astronomy", "Biology", "Computer Science"];

  const handleCopy = async (text: string, id?: string) => {
    const success = await copyToClipboard(text);
    if (success && id) {
      setCopiedValueId(id);
      setTimeout(() => setCopiedValueId(null), 2000);
    }
  };

  // Quick constant inserters in calculator
  const QUICK_CONSTANTS = [
    { label: "π", val: "π" },
    { label: "e", val: "e" },
    { label: "√2", val: "√(2)" },
    { label: "√3", val: "√(3)" },
    { label: "√5", val: "√(5)" },
    { label: "φ", val: "1.6180339887" },
    { label: "2π", val: "(2*π)" },
  ];

  return (
    <div
      id="calculator-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in"
    >
      <div
        id="calculator-dialog"
        className="w-full max-w-4xl bg-stone-900 border border-stone-700 text-stone-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-stone-800 bg-stone-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <CalcIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">Calculator &amp; Universal STEM Suite</h2>
              <p className="text-xs text-stone-400">
                Scientific, Graphing, Unit Converter, Statistics, Chemistry, Physics &amp; Finance
              </p>
            </div>
          </div>
          <button
            id="close-calculator-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comprehensive Multi-Subject Tab Navigation Strip */}
        <div className="flex items-center gap-1.5 px-3 sm:px-6 py-2 bg-stone-950/70 border-b border-stone-800 overflow-x-auto text-xs font-medium scrollbar-thin">
          <button
            id="tab-scientific"
            onClick={() => setActiveTab("scientific")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === "scientific" || activeTab === "calc"
                ? "bg-amber-500 text-stone-950 font-bold shadow"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/60"
            }`}
          >
            <CalcIcon className="w-3.5 h-3.5" />
            <span>Scientific</span>
          </button>

          <button
            id="tab-graphing"
            onClick={() => setActiveTab("graphing")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === "graphing"
                ? "bg-blue-500 text-white font-bold shadow"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/60"
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Graphing</span>
          </button>

          <button
            id="tab-converter"
            onClick={() => setActiveTab("converter")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === "converter"
                ? "bg-cyan-500 text-stone-950 font-bold shadow"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/60"
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Unit Converter</span>
          </button>

          <button
            id="tab-statistics"
            onClick={() => setActiveTab("statistics")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === "statistics"
                ? "bg-indigo-500 text-white font-bold shadow"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/60"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Statistics</span>
          </button>

          <button
            id="tab-chemistry"
            onClick={() => setActiveTab("chemistry")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === "chemistry"
                ? "bg-emerald-500 text-stone-950 font-bold shadow"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/60"
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Chemistry</span>
          </button>

          <button
            id="tab-physics"
            onClick={() => setActiveTab("physics")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === "physics"
                ? "bg-amber-500 text-stone-950 font-bold shadow"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/60"
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Physics Solvers</span>
          </button>

          <button
            id="tab-finance"
            onClick={() => setActiveTab("finance")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === "finance"
                ? "bg-teal-500 text-stone-950 font-bold shadow"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/60"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Finance &amp; %</span>
          </button>

          <button
            id="tab-math"
            onClick={() => setActiveTab("math")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === "math"
                ? "bg-purple-500 text-stone-950 font-bold shadow"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/60"
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            <span>Math &amp; Geometry</span>
          </button>

          <button
            id="tab-values"
            onClick={() => setActiveTab("values")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === "values"
                ? "bg-rose-500 text-white font-bold shadow"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/60"
            }`}
          >
            <Atom className="w-3.5 h-3.5" />
            <span>Constants &amp; Roots</span>
          </button>
        </div>

        {/* Tab Body Container */}
        <div className="flex-1 overflow-y-auto">
          {/* ======================================================== */}
          {/* TAB 1: SCIENTIFIC / DUAL CALCULATOR */}
          {/* ======================================================== */}
          {(activeTab === "scientific" || activeTab === "calc") && (
            <ScientificCalculator
              initialValue={expression}
              onInsertResult={handleInsertInChat}
              onOpenValuesTab={() => setActiveTab("values")}
            />
          )}

          {/* ======================================================== */}
          {/* TAB 2: UNIVERSAL UNIT CONVERTER */}
          {/* ======================================================== */}
          {activeTab === "converter" && (
            <div className="p-4 sm:p-6 space-y-5">
              {/* Category Pills */}
              <div>
                <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                  1. Select Category
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {UNIT_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        unitCategory === cat.id
                          ? "bg-cyan-500 text-stone-950 font-bold shadow-md shadow-cyan-950/40"
                          : "bg-stone-800/80 text-stone-300 hover:bg-stone-800 hover:text-white"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conversion Input & Output Grid */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-3 p-4 rounded-xl bg-stone-950 border border-stone-800">
                {/* FROM input */}
                <div className="space-y-2">
                  <span className="text-xs text-stone-400 font-medium">From:</span>
                  <input
                    type="number"
                    value={fromValue}
                    onChange={(e) => setFromValue(e.target.value)}
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-base sm:text-lg focus:outline-none focus:border-cyan-500"
                    placeholder="Enter value"
                  />
                  <select
                    value={fromUnitId}
                    onChange={(e) => setFromUnitId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-200 text-xs font-medium focus:outline-none cursor-pointer"
                  >
                    {activeCategoryDef.units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Swap button */}
                <div className="flex justify-center py-1">
                  <button
                    onClick={handleSwapUnits}
                    className="p-2.5 rounded-xl bg-stone-800 hover:bg-cyan-500/20 text-cyan-400 border border-stone-700 hover:border-cyan-500/40 transition"
                    title="Swap From and To units"
                  >
                    <ArrowLeftRight className="w-5 h-5" />
                  </button>
                </div>

                {/* TO output */}
                <div className="space-y-2">
                  <span className="text-xs text-stone-400 font-medium">To:</span>
                  <div className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-stone-900 border border-cyan-500/40 text-cyan-300 font-mono text-base sm:text-lg overflow-x-auto whitespace-nowrap min-h-[50px] flex items-center">
                    {conversionResult.formatted}
                  </div>
                  <select
                    value={toUnitId}
                    onChange={(e) => setToUnitId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-200 text-xs font-medium focus:outline-none cursor-pointer"
                  >
                    {activeCategoryDef.units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Conversion Formula Breakdown & Action Buttons */}
              <div className="p-4 rounded-xl bg-stone-900/80 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="text-stone-400 font-mono">
                    <span className="text-stone-300 font-semibold">{fromValue} {fromUnitId}</span> ={" "}
                    <span className="text-cyan-300 font-bold">{conversionResult.formatted} {toUnitId}</span>
                  </div>
                  <div className="text-[11px] text-stone-500">
                    Formula: {conversionResult.formulaExplanation}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      copyToClipboard(conversionResult.formatted);
                      setConverterCopied(true);
                      setTimeout(() => setConverterCopied(false), 2000);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 flex items-center gap-1.5 transition"
                  >
                    {converterCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{converterCopied ? "Copied" : "Copy"}</span>
                  </button>

                  <button
                    onClick={() => handleUseInCalculator(conversionResult.result)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 transition font-semibold"
                  >
                    <CalcIcon className="w-3.5 h-3.5" />
                    <span>Use in Calc</span>
                  </button>

                  <button
                    onClick={() =>
                      handleInsertInChat(
                        `Conversion: ${fromValue} ${fromUnitId} = ${conversionResult.formatted} ${toUnitId} (${conversionResult.formulaExplanation})`
                      )
                    }
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 transition font-semibold"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Insert in Chat</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: ALL SUBJECT VALUES & CONSTANTS (PI, ROOTS, SCIENCE) */}
          {/* ======================================================== */}
          {activeTab === "values" && (
            <div className="p-4 sm:p-6 space-y-4">
              {/* Search & Subject Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                  <input
                    type="text"
                    value={valuesSearchQuery}
                    onChange={(e) => setValuesSearchQuery(e.target.value)}
                    placeholder="Search constants (e.g. pi, root 2, e, gravity, c, avogadro, electron)..."
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 placeholder-stone-500"
                  />
                  {valuesSearchQuery && (
                    <button
                      onClick={() => setValuesSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                  {subjectsList.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setValuesSubjectFilter(sub)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                        valuesSubjectFilter === sub
                          ? "bg-emerald-500 text-stone-950 font-bold shadow"
                          : "bg-stone-800 text-stone-400 hover:text-stone-200"
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items List */}
              <div className="text-xs text-stone-400 flex items-center justify-between">
                <span>Showing {filteredValues.length} scientific constants &amp; values</span>
                <span className="text-[11px] text-stone-500">Click &apos;Use in Calc&apos; to paste into calculator</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto pr-1">
                {filteredValues.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-stone-950 border border-stone-800/80 hover:border-emerald-500/40 transition flex flex-col justify-between group shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-800 text-stone-300">
                          {item.subject} • {item.category}
                        </span>
                        <span className="font-mono font-bold text-emerald-400 text-sm">
                          {item.symbol}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-stone-200 mb-1">
                        {item.name}
                      </h4>
                      <div className="p-2 rounded-lg bg-stone-900 border border-stone-800 font-mono text-xs text-white break-all mb-2">
                        {item.value}
                      </div>
                      <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 mt-3 pt-2.5 border-t border-stone-800/60">
                      <button
                        onClick={() => handleCopy(item.value, item.id)}
                        className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] flex items-center gap-1 transition"
                      >
                        {copiedValueId === item.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedValueId === item.id ? "Copied" : "Copy"}</span>
                      </button>

                      <button
                        onClick={() => handleUseInCalculator(item.numericValue)}
                        className="px-2 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-[11px] flex items-center gap-1 font-semibold transition"
                        title="Paste into Calculator expression"
                      >
                        <CalcIcon className="w-3 h-3" />
                        <span>Use in Calc</span>
                      </button>

                      <button
                        onClick={() =>
                          handleInsertInChat(
                            `${item.name} (${item.symbol}) = ${item.value} [${item.subject}]`
                          )
                        }
                        className="px-2 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-[11px] flex items-center gap-1 font-semibold transition"
                      >
                        <ArrowRight className="w-3 h-3" />
                        <span>Chat</span>
                      </button>
                    </div>
                  </div>
                ))}

                {filteredValues.length === 0 && (
                  <div className="col-span-full py-12 text-center text-stone-500 text-xs">
                    No values found matching &ldquo;{valuesSearchQuery}&rdquo;. Try searching for &ldquo;pi&rdquo;, &ldquo;root&rdquo;, &ldquo;gravity&rdquo;, or &ldquo;electron&rdquo;.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: PHYSICS SOLVERS */}
          {/* ======================================================== */}
          {activeTab === "physics" && (
            <div className="p-4 sm:p-6 space-y-5">
              {/* Physics Tool Tabs */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "kinematics", label: "Kinematics (v = u + at)" },
                  { id: "newton", label: "Newton's Law (F = ma)" },
                  { id: "ohm", label: "Ohm's Law & Power" },
                  { id: "energy", label: "Kinetic & Potential Energy" },
                  { id: "wave", label: "Waves & Photons (E = hf)" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setPhysicsTool(t.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      physicsTool === t.id
                        ? "bg-amber-500 text-stone-950 font-bold shadow"
                        : "bg-stone-800 text-stone-300 hover:bg-stone-700"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Kinematics Solver */}
              {physicsTool === "kinematics" && (() => {
                const u = parseFloat(kinU) || 0;
                const a = parseFloat(kinA) || 0;
                const t = parseFloat(kinT) || 0;
                const v = u + a * t;
                const s = u * t + 0.5 * a * t * t;
                const v2 = u * u + 2 * a * s;

                return (
                  <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-4">
                    <h3 className="text-sm font-bold text-amber-400">Kinematics Motion Equations</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-stone-400">Initial Velocity (u in m/s)</label>
                        <input
                          type="number"
                          value={kinU}
                          onChange={(e) => setKinU(e.target.value)}
                          className="w-full mt-1.5 px-4 py-2.5 sm:py-3 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-stone-400">Acceleration (a in m/s²)</label>
                        <input
                          type="number"
                          value={kinA}
                          onChange={(e) => setKinA(e.target.value)}
                          className="w-full mt-1.5 px-4 py-2.5 sm:py-3 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-stone-400">Time (t in seconds)</label>
                        <input
                          type="number"
                          value={kinT}
                          onChange={(e) => setKinT(e.target.value)}
                          className="w-full mt-1.5 px-4 py-2.5 sm:py-3 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-stone-900 border border-amber-500/30 text-xs font-mono space-y-1">
                      <div>• Final Velocity (v = u + at): <span className="text-amber-400 font-bold">{v.toFixed(3)} m/s</span></div>
                      <div>• Displacement (s = ut + ½at²): <span className="text-cyan-400 font-bold">{s.toFixed(3)} m</span></div>
                      <div>• v² = u² + 2as: <span className="text-emerald-400 font-bold">{v2.toFixed(3)} (m/s)²</span></div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => handleUseInCalculator(v.toFixed(3))}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <CalcIcon className="w-3.5 h-3.5" />
                        <span>Use v in Calc</span>
                      </button>
                      <button
                        onClick={() =>
                          handleInsertInChat(
                            `Kinematics: u=${u} m/s, a=${a} m/s², t=${t} s => Final v=${v.toFixed(3)} m/s, Displacement s=${s.toFixed(3)} m`
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-400"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>Insert in Chat</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Newton's 2nd Law */}
              {physicsTool === "newton" && (() => {
                const m = parseFloat(newtonM) || 0;
                const a = parseFloat(newtonA) || 0;
                const f = m * a;
                return (
                  <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-4">
                    <h3 className="text-sm font-bold text-amber-400">Newton&apos;s Second Law (F = ma)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-stone-400">Mass (m in kg)</label>
                        <input
                          type="number"
                          value={newtonM}
                          onChange={(e) => setNewtonM(e.target.value)}
                          className="w-full mt-1.5 px-4 py-2.5 sm:py-3 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-stone-400">Acceleration (a in m/s²)</label>
                        <input
                          type="number"
                          value={newtonA}
                          onChange={(e) => setNewtonA(e.target.value)}
                          className="w-full mt-1.5 px-4 py-2.5 sm:py-3 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-stone-900 border border-amber-500/30 text-xs font-mono space-y-1">
                      <div>Resulting Net Force F = m × a = {m} kg × {a} m/s²</div>
                      <div className="text-base text-amber-400 font-bold">F = {f.toFixed(3)} N (Newtons)</div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => handleUseInCalculator(f.toFixed(3))}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <CalcIcon className="w-3.5 h-3.5" />
                        <span>Use F in Calc</span>
                      </button>
                      <button
                        onClick={() => handleInsertInChat(`Newton's Law: m=${m} kg, a=${a} m/s² => Force F = ${f.toFixed(3)} N`)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-400"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>Insert in Chat</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Ohm's Law & Power */}
              {physicsTool === "ohm" && (() => {
                const v = parseFloat(ohmV) || 0;
                const r = parseFloat(ohmR) || 1;
                const i = v / r;
                const p = v * i;
                return (
                  <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-4">
                    <h3 className="text-sm font-bold text-amber-400">Ohm&apos;s Law (V = IR) &amp; Electrical Power (P = VI)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-stone-400">Voltage (V in Volts)</label>
                        <input
                          type="number"
                          value={ohmV}
                          onChange={(e) => setOhmV(e.target.value)}
                          className="w-full mt-1.5 px-4 py-2.5 sm:py-3 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-stone-400">Resistance (R in Ohms Ω)</label>
                        <input
                          type="number"
                          value={ohmR}
                          onChange={(e) => setOhmR(e.target.value)}
                          className="w-full mt-1.5 px-4 py-2.5 sm:py-3 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-stone-900 border border-amber-500/30 text-xs font-mono space-y-1">
                      <div>• Current (I = V / R): <span className="text-cyan-400 font-bold">{i.toFixed(3)} A (Amperes)</span></div>
                      <div>• Power Dissipated (P = V × I = I²R): <span className="text-emerald-400 font-bold">{p.toFixed(3)} W (Watts)</span></div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => handleUseInCalculator(i.toFixed(3))}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <CalcIcon className="w-3.5 h-3.5" />
                        <span>Use I in Calc</span>
                      </button>
                      <button
                        onClick={() => handleInsertInChat(`Ohm's Law: V=${v} V, R=${r} Ω => Current I=${i.toFixed(3)} A, Power P=${p.toFixed(3)} W`)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-400"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>Insert in Chat</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Energy Solver */}
              {physicsTool === "energy" && (() => {
                const m = parseFloat(energyM) || 0;
                const v = parseFloat(energyV) || 0;
                const h = parseFloat(energyH) || 0;
                const ke = 0.5 * m * v * v;
                const pe = m * 9.80665 * h;
                const totalE = ke + pe;
                return (
                  <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-4">
                    <h3 className="text-sm font-bold text-amber-400">Kinetic &amp; Gravitational Potential Energy</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-stone-400">Mass (m in kg)</label>
                        <input
                          type="number"
                          value={energyM}
                          onChange={(e) => setEnergyM(e.target.value)}
                          className="w-full mt-1.5 px-4 py-2.5 sm:py-3 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-stone-400">Velocity (v in m/s)</label>
                        <input
                          type="number"
                          value={energyV}
                          onChange={(e) => setEnergyV(e.target.value)}
                          className="w-full mt-1.5 px-4 py-2.5 sm:py-3 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-stone-400">Height (h in meters)</label>
                        <input
                          type="number"
                          value={energyH}
                          onChange={(e) => setEnergyH(e.target.value)}
                          className="w-full mt-1.5 px-4 py-2.5 sm:py-3 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-stone-900 border border-amber-500/30 text-xs font-mono space-y-1">
                      <div>• Kinetic Energy (KE = ½mv²): <span className="text-cyan-400 font-bold">{ke.toFixed(2)} Joules</span></div>
                      <div>• Potential Energy (PE = mgh): <span className="text-emerald-400 font-bold">{pe.toFixed(2)} Joules</span></div>
                      <div>• Total Mechanical Energy: <span className="text-amber-400 font-bold">{totalE.toFixed(2)} Joules</span></div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => handleUseInCalculator(totalE.toFixed(2))}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <CalcIcon className="w-3.5 h-3.5" />
                        <span>Use E in Calc</span>
                      </button>
                      <button
                        onClick={() => handleInsertInChat(`Energy: m=${m} kg, v=${v} m/s, h=${h} m => KE=${ke.toFixed(2)} J, PE=${pe.toFixed(2)} J, Total=${totalE.toFixed(2)} J`)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-400"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>Insert in Chat</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Waves & Photons */}
              {physicsTool === "wave" && (() => {
                const f = parseFloat(waveF) || 0;
                const lambda = parseFloat(waveLambda) || 0;
                const v = f * lambda;
                const h = 6.62607015e-34;
                const ePhoton = h * f;
                const eEv = ePhoton / 1.602176634e-19;
                return (
                  <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-4">
                    <h3 className="text-sm font-bold text-amber-400">Wave Mechanics &amp; Photon Energy (E = hf)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-stone-400">Frequency (f in Hz)</label>
                        <input
                          type="number"
                          value={waveF}
                          onChange={(e) => setWaveF(e.target.value)}
                          className="w-full mt-1.5 px-4 py-2.5 sm:py-3 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-stone-400">Wavelength (λ in meters)</label>
                        <input
                          type="number"
                          value={waveLambda}
                          onChange={(e) => setWaveLambda(e.target.value)}
                          className="w-full mt-1.5 px-4 py-2.5 sm:py-3 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-stone-900 border border-amber-500/30 text-xs font-mono space-y-1">
                      <div>• Wave Speed (v = fλ): <span className="text-cyan-400 font-bold">{v.toFixed(2)} m/s</span></div>
                      <div>• Photon Energy (E = hf): <span className="text-amber-400 font-bold">{ePhoton.toExponential(4)} Joules</span></div>
                      <div>• Photon Energy in eV: <span className="text-emerald-400 font-bold">{eEv.toFixed(4)} eV</span></div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => handleUseInCalculator(v.toFixed(2))}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <CalcIcon className="w-3.5 h-3.5" />
                        <span>Use v in Calc</span>
                      </button>
                      <button
                        onClick={() => handleInsertInChat(`Wave: f=${f} Hz, λ=${lambda} m => Speed v=${v.toFixed(2)} m/s, Photon E=${ePhoton.toExponential(3)} J (${eEv.toFixed(3)} eV)`)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-400"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>Insert in Chat</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: MATH SOLVERS */}
          {/* ======================================================== */}
          {activeTab === "math" && (
            <div className="p-4 sm:p-6 space-y-5">
              {/* Math Tool Tabs */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "quadratic", label: "Quadratic Equation (ax² + bx + c = 0)" },
                  { id: "pythagoras", label: "Pythagorean Theorem (a² + b² = c²)" },
                  { id: "percentage", label: "Percentage & Discount" },
                  { id: "circle", label: "2D/3D Geometry (Circle & Sphere)" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setMathTool(t.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      mathTool === t.id
                        ? "bg-purple-500 text-stone-950 font-bold shadow"
                        : "bg-stone-800 text-stone-300 hover:bg-stone-700"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Quadratic Solver */}
              {mathTool === "quadratic" && (() => {
                const a = parseFloat(quadA) || 1;
                const b = parseFloat(quadB) || 0;
                const c = parseFloat(quadC) || 0;
                const discriminant = b * b - 4 * a * c;
                let rootStr = "";
                let rootNum1 = 0;

                if (discriminant > 0) {
                  const r1 = (-b + Math.sqrt(discriminant)) / (2 * a);
                  const r2 = (-b - Math.sqrt(discriminant)) / (2 * a);
                  rootNum1 = r1;
                  rootStr = `Two Real Roots: x₁ = ${r1.toFixed(4)}, x₂ = ${r2.toFixed(4)}`;
                } else if (discriminant === 0) {
                  const r = -b / (2 * a);
                  rootNum1 = r;
                  rootStr = `One Real Double Root: x = ${r.toFixed(4)}`;
                } else {
                  const realPart = (-b / (2 * a)).toFixed(4);
                  const imagPart = (Math.sqrt(-discriminant) / (2 * a)).toFixed(4);
                  rootStr = `Complex Conjugate Roots: x = ${realPart} ± ${imagPart}i`;
                }

                const vx = -b / (2 * a);
                const vy = c - (b * b) / (4 * a);

                return (
                  <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-4">
                    <h3 className="text-sm font-bold text-purple-400">Quadratic Equation Formula Solver</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-stone-400">a (coefficient of x²)</label>
                        <input
                          type="number"
                          value={quadA}
                          onChange={(e) => setQuadA(e.target.value)}
                          className="w-full mt-1.5 px-4 py-2.5 sm:py-3 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-stone-400">b (coefficient of x)</label>
                        <input
                          type="number"
                          value={quadB}
                          onChange={(e) => setQuadB(e.target.value)}
                          className="w-full mt-1.5 px-4 py-2.5 sm:py-3 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-stone-400">c (constant term)</label>
                        <input
                          type="number"
                          value={quadC}
                          onChange={(e) => setQuadC(e.target.value)}
                          className="w-full mt-1.5 px-4 py-2.5 sm:py-3 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-stone-900 border border-purple-500/30 text-xs font-mono space-y-1.5">
                      <div>Equation: <span className="text-white font-bold">{a}x² + ({b})x + ({c}) = 0</span></div>
                      <div>Discriminant Δ = b² - 4ac = <span className="text-cyan-400 font-bold">{discriminant.toFixed(4)}</span></div>
                      <div className="text-sm text-purple-300 font-bold pt-1">{rootStr}</div>
                      <div className="text-stone-400 text-[11px]">Parabola Vertex: ({vx.toFixed(3)}, {vy.toFixed(3)})</div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => handleUseInCalculator(rootNum1 ? rootNum1.toFixed(4) : discriminant)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <CalcIcon className="w-3.5 h-3.5" />
                        <span>Use Root in Calc</span>
                      </button>
                      <button
                        onClick={() => handleInsertInChat(`Quadratic ${a}x² + (${b})x + (${c}) = 0 => Discriminant Δ=${discriminant.toFixed(2)}, ${rootStr}`)}
                        className="px-3 py-1.5 rounded-lg bg-purple-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 hover:bg-purple-400"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>Insert in Chat</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Pythagoras Solver */}
              {mathTool === "pythagoras" && (() => {
                const a = parseFloat(pythA) || 3;
                const b = parseFloat(pythB) || 4;
                const c = Math.sqrt(a * a + b * b);

                return (
                  <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-4">
                    <h3 className="text-sm font-bold text-purple-400">Pythagorean Theorem (a² + b² = c²)</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-stone-400">Leg a</label>
                        <input
                          type="number"
                          value={pythA}
                          onChange={(e) => setPythA(e.target.value)}
                          className="w-full mt-1.5 px-4 py-2.5 sm:py-3 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-stone-400">Leg b</label>
                        <input
                          type="number"
                          value={pythB}
                          onChange={(e) => setPythB(e.target.value)}
                          className="w-full mt-1.5 px-4 py-2.5 sm:py-3 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-stone-900 border border-purple-500/30 text-xs font-mono space-y-1">
                      <div>Calculation: c = √(a² + b²) = √({a}² + {b}²) = √({a*a + b*b})</div>
                      <div className="text-base text-purple-300 font-bold">Hypotenuse c = {c.toFixed(4)}</div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => handleUseInCalculator(c.toFixed(4))}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <CalcIcon className="w-3.5 h-3.5" />
                        <span>Use c in Calc</span>
                      </button>
                      <button
                        onClick={() => handleInsertInChat(`Pythagoras: a=${a}, b=${b} => Hypotenuse c = ${c.toFixed(4)}`)}
                        className="px-3 py-1.5 rounded-lg bg-purple-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 hover:bg-purple-400"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>Insert in Chat</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Percentage Solver */}
              {mathTool === "percentage" && (() => {
                const x = parseFloat(pctX) || 0;
                const y = parseFloat(pctY) || 1;
                const xPctOfY = (x / 100) * y;
                const xWhatPctOfY = (x / y) * 100;
                const afterIncrease = y * (1 + x / 100);
                const afterDiscount = y * (1 - x / 100);

                return (
                  <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-4">
                    <h3 className="text-sm font-bold text-purple-400">Percentage, Discount &amp; Markup Calculator</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-stone-400">Percentage (X %)</label>
                        <input
                          type="number"
                          value={pctX}
                          onChange={(e) => setPctX(e.target.value)}
                          className="w-full mt-1.5 px-4 py-2.5 sm:py-3 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-stone-400">Base Value (Y)</label>
                        <input
                          type="number"
                          value={pctY}
                          onChange={(e) => setPctY(e.target.value)}
                          className="w-full mt-1.5 px-4 py-2.5 sm:py-3 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-stone-900 border border-purple-500/30 text-xs font-mono space-y-1">
                      <div>• {x}% of {y} = <span className="text-emerald-400 font-bold">{xPctOfY.toFixed(2)}</span></div>
                      <div>• {x} is <span className="text-cyan-400 font-bold">{xWhatPctOfY.toFixed(2)}%</span> of {y}</div>
                      <div>• After {x}% Discount: <span className="text-amber-400 font-bold">{afterDiscount.toFixed(2)}</span></div>
                      <div>• After {x}% Markup / Tax: <span className="text-purple-300 font-bold">{afterIncrease.toFixed(2)}</span></div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => handleUseInCalculator(xPctOfY.toFixed(2))}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <CalcIcon className="w-3.5 h-3.5" />
                        <span>Use Value in Calc</span>
                      </button>
                      <button
                        onClick={() => handleInsertInChat(`Percentage: ${x}% of ${y} = ${xPctOfY.toFixed(2)}, After ${x}% discount = ${afterDiscount.toFixed(2)}`)}
                        className="px-3 py-1.5 rounded-lg bg-purple-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 hover:bg-purple-400"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>Insert in Chat</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Geometry Solver */}
              {mathTool === "circle" && (() => {
                const r = parseFloat(circleR) || 1;
                const circleArea = Math.PI * r * r;
                const circleCircum = 2 * Math.PI * r;
                const sphereVol = (4 / 3) * Math.PI * r * r * r;
                const sphereSurface = 4 * Math.PI * r * r;

                return (
                  <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-4">
                    <h3 className="text-sm font-bold text-purple-400">2D &amp; 3D Geometry: Circle &amp; Sphere</h3>
                    <div>
                      <label className="text-xs text-stone-400">Radius (r)</label>
                      <input
                        type="number"
                        value={circleR}
                        onChange={(e) => setCircleR(e.target.value)}
                        className="w-full mt-1.5 px-4 py-2.5 sm:py-3 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div className="p-3 rounded-lg bg-stone-900 border border-purple-500/30 text-xs font-mono space-y-1">
                      <div>• Circle Area (A = πr²): <span className="text-cyan-400 font-bold">{circleArea.toFixed(4)}</span></div>
                      <div>• Circle Circumference (C = 2πr): <span className="text-emerald-400 font-bold">{circleCircum.toFixed(4)}</span></div>
                      <div>• Sphere Volume (V = 4/3 πr³): <span className="text-amber-400 font-bold">{sphereVol.toFixed(4)}</span></div>
                      <div>• Sphere Surface Area (A = 4πr²): <span className="text-purple-300 font-bold">{sphereSurface.toFixed(4)}</span></div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => handleUseInCalculator(circleArea.toFixed(4))}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <CalcIcon className="w-3.5 h-3.5" />
                        <span>Use Area in Calc</span>
                      </button>
                      <button
                        onClick={() => handleInsertInChat(`Geometry (r=${r}): Circle Area = ${circleArea.toFixed(4)}, Sphere Vol = ${sphereVol.toFixed(4)}`)}
                        className="px-3 py-1.5 rounded-lg bg-purple-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 hover:bg-purple-400"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>Insert in Chat</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: GRAPHING CALCULATOR */}
          {/* ======================================================== */}
          {activeTab === "graphing" && (
            <div className="p-4 sm:p-6">
              <GraphingCalculator onInsertResult={handleInsertInChat} />
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 6: STATISTICS CALCULATOR */}
          {/* ======================================================== */}
          {activeTab === "statistics" && (
            <div className="p-4 sm:p-6">
              <StatisticsCalculator onInsertResult={handleInsertInChat} />
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 7: CHEMISTRY TOOL (MOLAR MASS & BALANCER) */}
          {/* ======================================================== */}
          {activeTab === "chemistry" && (
            <div className="p-4 sm:p-6">
              <ChemistryCalculator onInsertResult={handleInsertInChat} />
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 8: FINANCIAL CALCULATOR (INTEREST, PERCENTAGES, LOAN) */}
          {/* ======================================================== */}
          {activeTab === "finance" && (
            <div className="p-4 sm:p-6">
              <FinanceCalculator onInsertResult={handleInsertInChat} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
