import React, { useState, useEffect } from "react";
import {
  Copy,
  Check,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
  BookOpen,
  Atom,
} from "lucide-react";
import { copyToClipboard } from "../../utils/clipboard";

export interface UniversalConstant {
  symbol: string;
  name: string;
  valStr: string;
  numericVal: number;
  unit: string;
  category: "Math" | "Physics" | "Quantum" | "Chemistry";
  description: string;
}

export const UNIVERSAL_CONSTANTS: UniversalConstant[] = [
  // Math
  {
    symbol: "π",
    name: "Pi (Archimedes Constant)",
    valStr: "3.141592653589793",
    numericVal: Math.PI,
    unit: "dimensionless",
    category: "Math",
    description: "Ratio of circle circumference to diameter (3.14159...)",
  },
  {
    symbol: "e",
    name: "Euler's Number",
    valStr: "2.718281828459045",
    numericVal: Math.E,
    unit: "dimensionless",
    category: "Math",
    description: "Base of natural logarithm and exponential growth",
  },
  {
    symbol: "φ",
    name: "Golden Ratio (Phi)",
    valStr: "1.618033988749895",
    numericVal: 1.618033988749895,
    unit: "dimensionless",
    category: "Math",
    description: "(1 + √5)/2 divine proportion in geometry and nature",
  },
  {
    symbol: "√2",
    name: "Pythagoras Constant",
    valStr: "1.414213562373095",
    numericVal: Math.SQRT2,
    unit: "dimensionless",
    category: "Math",
    description: "Diagonal of a unit square (1.4142...)",
  },
  {
    symbol: "√3",
    name: "Theodorus Constant",
    valStr: "1.732050807568877",
    numericVal: Math.sqrt(3),
    unit: "dimensionless",
    category: "Math",
    description: "Diagonal of a unit cube (1.7320...)",
  },

  // Physics
  {
    symbol: "c",
    name: "Speed of Light in Vacuum",
    valStr: "299792458",
    numericVal: 299792458,
    unit: "m/s",
    category: "Physics",
    description: "Exact cosmic speed limit in vacuum (2.998 × 10⁸ m/s)",
  },
  {
    symbol: "G",
    name: "Newtonian Gravitational Constant",
    valStr: "6.67430e-11",
    numericVal: 6.67430e-11,
    unit: "N·m²/kg²",
    category: "Physics",
    description: "Universal constant of gravitation (CODATA 2018)",
  },
  {
    symbol: "g",
    name: "Standard Acceleration of Gravity",
    valStr: "9.80665",
    numericVal: 9.80665,
    unit: "m/s²",
    category: "Physics",
    description: "Nominal gravitational acceleration at Earth sea level",
  },

  // Quantum
  {
    symbol: "h",
    name: "Planck Constant",
    valStr: "6.62607015e-34",
    numericVal: 6.62607015e-34,
    unit: "J·s",
    category: "Quantum",
    description: "Fundamental quantum of electromagnetic action",
  },
  {
    symbol: "ħ",
    name: "Reduced Planck Constant (Dirac ħ)",
    valStr: "1.054571817e-34",
    numericVal: 1.054571817e-34,
    unit: "J·s",
    category: "Quantum",
    description: "h / 2π used in quantum mechanics and wave mechanics",
  },
  {
    symbol: "e⁻",
    name: "Elementary Electric Charge",
    valStr: "1.602176634e-19",
    numericVal: 1.602176634e-19,
    unit: "C",
    category: "Quantum",
    description: "Electric charge carried by a single proton or electron",
  },
  {
    symbol: "m_e",
    name: "Electron Rest Mass",
    valStr: "9.1093837015e-31",
    numericVal: 9.1093837015e-31,
    unit: "kg",
    category: "Quantum",
    description: "Invariant mass of an electron at rest (0.511 MeV/c²)",
  },
  {
    symbol: "m_p",
    name: "Proton Rest Mass",
    valStr: "1.67262192369e-27",
    numericVal: 1.67262192369e-27,
    unit: "kg",
    category: "Quantum",
    description: "Invariant rest mass of a free proton (1.007276 u)",
  },
  {
    symbol: "ε₀",
    name: "Vacuum Electric Permittivity",
    valStr: "8.8541878128e-12",
    numericVal: 8.8541878128e-12,
    unit: "F/m",
    category: "Quantum",
    description: "Permittivity of free space / electric constant",
  },
  {
    symbol: "μ₀",
    name: "Vacuum Magnetic Permeability",
    valStr: "1.25663706212e-6",
    numericVal: 1.25663706212e-6,
    unit: "N/A²",
    category: "Quantum",
    description: "Permeability of free space / magnetic constant",
  },

  // Chemistry & Thermo
  {
    symbol: "N_A",
    name: "Avogadro Constant",
    valStr: "6.02214076e23",
    numericVal: 6.02214076e23,
    unit: "mol⁻¹",
    category: "Chemistry",
    description: "Number of constituent particles in one mole of substance",
  },
  {
    symbol: "k_B",
    name: "Boltzmann Constant",
    valStr: "1.380649e-23",
    numericVal: 1.380649e-23,
    unit: "J/K",
    category: "Chemistry",
    description: "Relates average kinetic energy of gas molecules to temp",
  },
  {
    symbol: "R",
    name: "Universal Gas Constant",
    valStr: "8.314462618",
    numericVal: 8.314462618,
    unit: "J/(mol·K)",
    category: "Chemistry",
    description: "Molar gas constant = N_A × k_B (ideal gas law PV=nRT)",
  },
  {
    symbol: "F",
    name: "Faraday Constant",
    valStr: "96485.33212",
    numericVal: 96485.33212,
    unit: "C/mol",
    category: "Chemistry",
    description: "Electric charge per mole of electrons (N_A × e)",
  },
  {
    symbol: "σ",
    name: "Stefan-Boltzmann Constant",
    valStr: "5.670374419e-8",
    numericVal: 5.670374419e-8,
    unit: "W/(m²·K⁴)",
    category: "Chemistry",
    description: "Constant of proportionality in blackbody radiation law",
  },
];

interface ScientificCalculatorProps {
  initialValue?: string;
  onInsertResult?: (val: string) => void;
  onOpenValuesTab?: () => void;
}

export const ScientificCalculator: React.FC<ScientificCalculatorProps> = ({
  initialValue = "",
  onInsertResult,
  onOpenValuesTab,
}) => {
  const [expression, setExpression] = useState(initialValue || "");
  const [result, setResult] = useState("0");
  const [history, setHistory] = useState<string[]>([]);
  const [angleMode, setAngleMode] = useState<"deg" | "rad">("deg");
  const [is2nd, setIs2nd] = useState(false);
  const [isHyp, setIsHyp] = useState(false);
  const [calcCopied, setCalcCopied] = useState(false);
  const [showConstantsDrawer, setShowConstantsDrawer] = useState(false);
  const [constantCategory, setConstantCategory] = useState<"All" | "Math" | "Physics" | "Quantum" | "Chemistry">("All");

  useEffect(() => {
    if (initialValue) {
      setExpression(initialValue);
    }
  }, [initialValue]);

  // Factorial helper
  const factorial = (n: number): number => {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    if (n > 170) return Infinity;
    let res = 1;
    for (let i = 2; i <= Math.floor(n); i++) res *= i;
    return res;
  };

  // Permutations nPr
  const nPr = (n: number, r: number): number => {
    if (r < 0 || n < 0 || r > n) return 0;
    return factorial(n) / factorial(n - r);
  };

  // Combinations nCr
  const nCr = (n: number, r: number): number => {
    if (r < 0 || n < 0 || r > n) return 0;
    return factorial(n) / (factorial(r) * factorial(n - r));
  };

  const calculateCalcResult = () => {
    if (!expression.trim()) return;

    try {
      let expr = expression;

      // Normalize arithmetic symbols
      expr = expr.replace(/×/g, "*").replace(/÷/g, "/");

      // Replace universal constants with parenthesized values
      expr = expr
        .replace(/π/g, `(${Math.PI})`)
        .replace(/\be(?![a-zA-Z0-9_])/g, `(${Math.E})`)
        .replace(/φ/g, "(1.618033988749895)")
        .replace(/c(?![a-zA-Z0-9_])/g, "(299792458)")
        .replace(/N_A/g, "(6.02214076e23)")
        .replace(/k_B/g, "(1.380649e-23)")
        .replace(/ħ/g, "(1.054571817e-34)")
        .replace(/\bh(?![a-zA-Z0-9_])/g, "(6.62607015e-34)")
        .replace(/\bG(?![a-zA-Z0-9_])/g, "(6.67430e-11)")
        .replace(/\bR(?![a-zA-Z0-9_])/g, "(8.314462618)")
        .replace(/e⁻/g, "(1.602176634e-19)")
        .replace(/m_e/g, "(9.1093837015e-31)")
        .replace(/m_p/g, "(1.67262192369e-27)")
        .replace(/ε₀/g, "(8.8541878128e-12)")
        .replace(/μ₀/g, "(1.25663706212e-6)")
        .replace(/σ(?![a-zA-Z0-9_])/g, "(5.670374419e-8)")
        .replace(/\bF(?![a-zA-Z0-9_])/g, "(96485.33212)");

      // Permutations: nPr(n, r) or n P r
      expr = expr.replace(/(\d+(\.\d+)?)\s*P\s*(\d+(\.\d+)?)/gi, (_, n, __, r) => {
        return String(nPr(parseFloat(n), parseFloat(r)));
      });
      expr = expr.replace(/nPr\(\s*([^,]+)\s*,\s*([^)]+)\s*\)/gi, (_, n, r) => {
        return `nPr(${n}, ${r})`;
      });

      // Combinations: nCr(n, r) or n C r
      expr = expr.replace(/(\d+(\.\d+)?)\s*C\s*(\d+(\.\d+)?)/gi, (_, n, __, r) => {
        return String(nCr(parseFloat(n), parseFloat(r)));
      });

      // Factorial: x!
      expr = expr.replace(/(\d+)!/g, (_, n) => {
        return String(factorial(parseInt(n, 10)));
      });

      // Square root, cube root, nth root
      expr = expr
        .replace(/√\(/g, "Math.sqrt(")
        .replace(/∛\(/g, "Math.cbrt(")
        .replace(/nRoot\(\s*([^,]+)\s*,\s*([^)]+)\s*\)/gi, "Math.pow($1, 1/($2))");

      // Powers: ^ -> **
      expr = expr.replace(/\^/g, "**");

      // Logarithms
      expr = expr
        .replace(/log10\(/gi, "Math.log10(")
        .replace(/log\(/gi, "Math.log10(")
        .replace(/ln\(/gi, "Math.log(")
        .replace(/log2\(/gi, "Math.log2(");

      // Absolute value
      expr = expr.replace(/abs\(/gi, "Math.abs(");

      // Inverse & Hyperbolic Trig
      if (angleMode === "deg") {
        // DEGREE MODE
        // Inverses return degrees
        expr = expr
          .replace(/asin\(([^)]+)\)/gi, "((Math.asin($1) * 180) / Math.PI)")
          .replace(/acos\(([^)]+)\)/gi, "((Math.acos($1) * 180) / Math.PI)")
          .replace(/atan\(([^)]+)\)/gi, "((Math.atan($1) * 180) / Math.PI)")
          // Direct trig takes degrees
          .replace(/sin\(([^)]+)\)/gi, "(Math.sin(($1) * Math.PI / 180))")
          .replace(/cos\(([^)]+)\)/gi, "(Math.cos(($1) * Math.PI / 180))")
          .replace(/tan\(([^)]+)\)/gi, "(Math.tan(($1) * Math.PI / 180))");
      } else {
        // RADIAN MODE
        expr = expr
          .replace(/asin\(/gi, "Math.asin(")
          .replace(/acos\(/gi, "Math.acos(")
          .replace(/atan\(/gi, "Math.atan(")
          .replace(/sin\(/gi, "Math.sin(")
          .replace(/cos\(/gi, "Math.cos(")
          .replace(/tan\(/gi, "Math.tan(");
      }

      // Hyperbolic functions (independent of deg/rad)
      expr = expr
        .replace(/asinh\(/gi, "Math.asinh(")
        .replace(/acosh\(/gi, "Math.acosh(")
        .replace(/atanh\(/gi, "Math.atanh(")
        .replace(/sinh\(/gi, "Math.sinh(")
        .replace(/cosh\(/gi, "Math.cosh(")
        .replace(/tanh\(/gi, "Math.tanh(");

      // Evaluate safely
      const evalFn = new Function(
        "factorial",
        "nPr",
        "nCr",
        `"use strict"; return (${expr});`
      );

      const evaluated = evalFn(factorial, nPr, nCr);

      if (typeof evaluated === "number" && !isNaN(evaluated) && isFinite(evaluated)) {
        // Format with clean precision
        const formatted = Number.isInteger(evaluated)
          ? evaluated.toString()
          : parseFloat(evaluated.toPrecision(12)).toString();

        setResult(formatted);
        setHistory((prev) => [`${expression} = ${formatted}`, ...prev.slice(0, 11)]);
      } else {
        setResult("Math Error");
      }
    } catch {
      setResult("Syntax Error");
    }
  };

  const handleButtonClick = (val: string) => {
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

    if (val === "1/x") {
      setExpression((prev) => (prev ? `1/(${prev})` : "1/("));
      return;
    }

    if (val === "x²") {
      setExpression((prev) => (prev ? `(${prev})^2` : "^2"));
      return;
    }

    if (val === "x³") {
      setExpression((prev) => (prev ? `(${prev})^3` : "^3"));
      return;
    }

    if (val === "10^x") {
      setExpression((prev) => prev + "10^");
      return;
    }

    if (val === "e^x") {
      setExpression((prev) => prev + "e^");
      return;
    }

    if (val === "2^x") {
      setExpression((prev) => prev + "2^");
      return;
    }

    setExpression((prev) => prev + val);
  };

  const handleInsertConstant = (c: UniversalConstant, useSymbol = true) => {
    const toInsert = useSymbol ? c.symbol : c.valStr;
    setExpression((prev) => prev + toInsert);
  };

  const copyResult = async () => {
    const ok = await copyToClipboard(result);
    if (ok) {
      setCalcCopied(true);
      setTimeout(() => setCalcCopied(false), 2000);
    }
  };

  const filteredConstants = UNIVERSAL_CONSTANTS.filter(
    (c) => constantCategory === "All" || c.category === constantCategory
  );

  return (
    <div className="flex flex-col gap-3 p-3 sm:p-5">
      {/* Top Status & Controls Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          {/* Angle Mode DEG/RAD */}
          <button
            id="calc-angle-toggle"
            type="button"
            onClick={() => setAngleMode((prev) => (prev === "deg" ? "rad" : "deg"))}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition border ${
              angleMode === "deg"
                ? "bg-amber-500 text-stone-950 border-amber-400 shadow-sm"
                : "bg-sky-500 text-stone-950 border-sky-400 shadow-sm"
            }`}
            title="Toggle between Degree and Radian angle measurement"
          >
            {angleMode.toUpperCase()}
          </button>

          {/* 2nd Function Shift Key */}
          <button
            id="calc-2nd-toggle"
            type="button"
            onClick={() => setIs2nd((prev) => !prev)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
              is2nd
                ? "bg-amber-500 text-stone-950 border-amber-400 shadow-sm"
                : "bg-stone-800 text-stone-300 hover:text-white border-stone-700"
            }`}
            title="Toggle secondary inverse functions (sin⁻¹, cos⁻¹, tan⁻¹, eˣ, 10ˣ, x², ∛, nCr)"
          >
            2nd {is2nd ? "ON" : ""}
          </button>

          {/* HYP Mode Toggle */}
          <button
            id="calc-hyp-toggle"
            type="button"
            onClick={() => setIsHyp((prev) => !prev)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
              isHyp
                ? "bg-purple-500 text-white border-purple-400 shadow-sm"
                : "bg-stone-800 text-stone-300 hover:text-white border-stone-700"
            }`}
            title="Toggle Hyperbolic functions (sinh, cosh, tanh, asinh, acosh, atanh)"
          >
            HYP {isHyp ? "ON" : ""}
          </button>
        </div>

        {/* Universal Constants Drawer Toggle */}
        <button
          type="button"
          onClick={() => setShowConstantsDrawer((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition border ${
            showConstantsDrawer
              ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
              : "bg-stone-800/90 text-stone-300 hover:text-amber-300 border-stone-700"
          }`}
          title="Browse all universal physics, chemistry, and math constants"
        >
          <Atom className="w-3.5 h-3.5 text-amber-400" />
          <span>Universal Constants &amp; Values</span>
          {showConstantsDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Universal Constants Drawer */}
      {showConstantsDrawer && (
        <div className="bg-stone-950/90 border border-stone-800 rounded-xl p-3.5 flex flex-col gap-2.5 animate-fadeIn shadow-inner">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-amber-400">Universal Constants Shelf:</span>
              <span className="text-[11px] text-stone-400">Click to insert into calculation</span>
            </div>
            <div className="flex items-center gap-1 text-[11px]">
              {(["All", "Math", "Physics", "Quantum", "Chemistry"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setConstantCategory(cat)}
                  className={`px-2 py-0.5 rounded-md transition ${
                    constantCategory === cat
                      ? "bg-amber-500 text-stone-950 font-bold"
                      : "bg-stone-800 text-stone-300 hover:bg-stone-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
            {filteredConstants.map((c) => (
              <div
                key={c.symbol}
                className="bg-stone-900 border border-stone-800 hover:border-amber-500/50 p-2 rounded-lg flex flex-col justify-between transition group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-300 text-sm group-hover:text-amber-200">
                    {c.symbol}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono truncate max-w-[100px]" title={c.unit}>
                    {c.unit || "unitless"}
                  </span>
                </div>
                <p className="text-[11px] text-stone-300 font-medium truncate mt-0.5" title={c.name}>
                  {c.name}
                </p>
                <div className="flex items-center justify-between gap-1 mt-1.5 pt-1.5 border-t border-stone-800/80">
                  <button
                    type="button"
                    onClick={() => handleInsertConstant(c, true)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 font-mono font-semibold"
                    title={`Insert symbol "${c.symbol}"`}
                  >
                    + Symbol
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertConstant(c, false)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 font-mono truncate max-w-[90px]"
                    title={`Insert numeric value: ${c.valStr}`}
                  >
                    {c.valStr}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Display Screen */}
      <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 text-right flex flex-col justify-end min-h-[120px] shadow-inner">
        {/* Expression line */}
        <div className="text-xs sm:text-sm font-mono text-stone-400 h-6 overflow-x-auto whitespace-nowrap mb-1">
          {expression || "0"}
        </div>
        {/* Big Result Line */}
        <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white overflow-x-auto whitespace-nowrap">
          {result}
        </div>

        {/* Result Action Bar */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-800/80 flex-wrap gap-2">
          <span className="text-[11px] text-amber-400/90 font-mono font-semibold">
            [CALCULATOR RESULT: {result}]
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={copyResult}
              className="flex items-center gap-1 text-xs text-stone-300 hover:text-white px-2.5 py-1 rounded-lg bg-stone-800/90 hover:bg-stone-800 transition"
              title="Copy result to clipboard"
            >
              {calcCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{calcCopied ? "Copied" : "Copy"}</span>
            </button>

            {onInsertResult && (
              <button
                type="button"
                onClick={() => onInsertResult(`[CALCULATOR RESULT: ${result}]`)}
                className="flex items-center gap-1 text-xs text-stone-950 font-bold px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 transition shadow-sm"
                title="Insert formatted calculation result into the active chat message"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Insert in Chat</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Constants Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-0.5 scrollbar-thin">
        <span className="text-[11px] text-stone-400 font-semibold whitespace-nowrap">Quick:</span>
        {[
          { label: "π", val: "π", tip: "Pi (3.14159...)" },
          { label: "e", val: "e", tip: "Euler's number (2.71828...)" },
          { label: "c", val: "c", tip: "Speed of Light (299,792,458 m/s)" },
          { label: "h", val: "h", tip: "Planck Constant (6.626 × 10⁻³⁴ J·s)" },
          { label: "ħ", val: "ħ", tip: "Reduced Planck (1.055 × 10⁻³⁴ J·s)" },
          { label: "G", val: "G", tip: "Gravitational Constant (6.674 × 10⁻¹¹)" },
          { label: "N_A", val: "N_A", tip: "Avogadro Constant (6.022 × 10²³)" },
          { label: "k_B", val: "k_B", tip: "Boltzmann Constant (1.381 × 10⁻²³)" },
          { label: "R", val: "R", tip: "Gas Constant (8.314 J/mol·K)" },
          { label: "e⁻", val: "e⁻", tip: "Elementary Charge (1.602 × 10⁻¹⁹ C)" },
          { label: "m_e", val: "m_e", tip: "Electron Mass (9.109 × 10⁻³¹ kg)" },
          { label: "g", val: "9.80665", tip: "Standard Earth Gravity (9.807 m/s²)" },
          { label: "√2", val: "√(2)", tip: "Square root of 2" },
          { label: "√3", val: "√(3)", tip: "Square root of 3" },
        ].map((qc) => (
          <button
            key={qc.label}
            type="button"
            onClick={() => handleButtonClick(qc.val)}
            className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-amber-500/20 text-stone-300 hover:text-amber-300 font-mono border border-stone-800 transition whitespace-nowrap text-xs"
            title={qc.tip}
          >
            {qc.label}
          </button>
        ))}
      </div>

      {/* Comprehensive Scientific Keypad Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
        {/* ROW 1: Advanced Functions & Combinatorics */}
        <button
          type="button"
          onClick={() => (is2nd ? handleButtonClick("nCr(") : handleButtonClick("nPr("))}
          className="calc-btn-sci text-amber-300 font-mono"
          title={is2nd ? "Combinations nCr(n, r)" : "Permutations nPr(n, r)"}
        >
          {is2nd ? "nCr" : "nPr"}
        </button>

        <button
          type="button"
          onClick={() => handleButtonClick("!")}
          className="calc-btn-sci text-amber-300 font-mono"
          title="Factorial n! (e.g. 5!)"
        >
          n!
        </button>

        <button
          type="button"
          onClick={() => handleButtonClick("(")}
          className="calc-btn-sci font-mono"
          title="Left Parenthesis"
        >
          (
        </button>

        <button
          type="button"
          onClick={() => handleButtonClick(")")}
          className="calc-btn-sci font-mono"
          title="Right Parenthesis"
        >
          )
        </button>

        <button
          type="button"
          onClick={() => handleButtonClick("C")}
          className="calc-btn-action text-red-400 bg-red-950/30 hover:bg-red-900/40 border border-red-900/50 font-bold"
          title="Clear all"
        >
          C
        </button>

        <button
          type="button"
          onClick={() => handleButtonClick("DEL")}
          className="calc-btn-action text-amber-400 bg-amber-950/30 hover:bg-amber-900/40 border border-amber-900/50 font-bold"
          title="Backspace / Delete"
        >
          DEL
        </button>

        {/* ROW 2: Trigonometry Functions */}
        <button
          type="button"
          onClick={() => {
            if (isHyp) {
              handleButtonClick(is2nd ? "asinh(" : "sinh(");
            } else {
              handleButtonClick(is2nd ? "asin(" : "sin(");
            }
          }}
          className="calc-btn-sci font-mono text-cyan-300"
          title={isHyp ? (is2nd ? "Inverse Hyperbolic Sine (asinh)" : "Hyperbolic Sine (sinh)") : (is2nd ? "Arcsine (sin⁻¹)" : "Sine (sin)")}
        >
          {isHyp ? (is2nd ? "sinh⁻¹" : "sinh") : (is2nd ? "sin⁻¹" : "sin")}
        </button>

        <button
          type="button"
          onClick={() => {
            if (isHyp) {
              handleButtonClick(is2nd ? "acosh(" : "cosh(");
            } else {
              handleButtonClick(is2nd ? "acos(" : "cos(");
            }
          }}
          className="calc-btn-sci font-mono text-cyan-300"
          title={isHyp ? (is2nd ? "Inverse Hyperbolic Cosine (acosh)" : "Hyperbolic Cosine (cosh)") : (is2nd ? "Arccosine (cos⁻¹)" : "Cosine (cos)")}
        >
          {isHyp ? (is2nd ? "cosh⁻¹" : "cosh") : (is2nd ? "cos⁻¹" : "cos")}
        </button>

        <button
          type="button"
          onClick={() => {
            if (isHyp) {
              handleButtonClick(is2nd ? "atanh(" : "tanh(");
            } else {
              handleButtonClick(is2nd ? "atan(" : "tan(");
            }
          }}
          className="calc-btn-sci font-mono text-cyan-300"
          title={isHyp ? (is2nd ? "Inverse Hyperbolic Tangent (atanh)" : "Hyperbolic Tangent (tanh)") : (is2nd ? "Arctangent (tan⁻¹)" : "Tangent (tan)")}
        >
          {isHyp ? (is2nd ? "tanh⁻¹" : "tanh") : (is2nd ? "tan⁻¹" : "tan")}
        </button>

        <button
          type="button"
          onClick={() => handleButtonClick("%")}
          className="calc-btn-op font-mono"
          title="Percentage (% = /100)"
        >
          %
        </button>

        <button
          type="button"
          onClick={() => handleButtonClick("÷")}
          className="calc-btn-op text-amber-300 font-mono text-lg font-bold"
          title="Division (÷)"
        >
          ÷
        </button>

        <button
          type="button"
          onClick={() => handleButtonClick("×")}
          className="calc-btn-op text-amber-300 font-mono text-lg font-bold hidden sm:block"
          title="Multiplication (×)"
        >
          ×
        </button>

        {/* ROW 3: Exponents, Logarithms & Roots */}
        <button
          type="button"
          onClick={() => (is2nd ? handleButtonClick("e^x") : handleButtonClick("ln("))}
          className="calc-btn-sci font-mono text-emerald-300"
          title={is2nd ? "Euler Exponential (eˣ)" : "Natural Logarithm (ln)"}
        >
          {is2nd ? "eˣ" : "ln"}
        </button>

        <button
          type="button"
          onClick={() => (is2nd ? handleButtonClick("10^x") : handleButtonClick("log("))}
          className="calc-btn-sci font-mono text-emerald-300"
          title={is2nd ? "Base 10 Power (10ˣ)" : "Common Logarithm (log₁₀)"}
        >
          {is2nd ? "10ˣ" : "log"}
        </button>

        <button
          type="button"
          onClick={() => (is2nd ? handleButtonClick("x²") : handleButtonClick("√("))}
          className="calc-btn-sci font-mono"
          title={is2nd ? "Square (x²)" : "Square Root (√)"}
        >
          {is2nd ? "x²" : "√"}
        </button>

        <button
          type="button"
          onClick={() => (is2nd ? handleButtonClick("x³") : handleButtonClick("∛("))}
          className="calc-btn-sci font-mono"
          title={is2nd ? "Cube (x³)" : "Cube Root (∛)"}
        >
          {is2nd ? "x³" : "∛"}
        </button>

        <button
          type="button"
          onClick={() => (is2nd ? handleButtonClick("nRoot(") : handleButtonClick("^"))}
          className="calc-btn-sci font-mono"
          title={is2nd ? "nth Root (ʸ√x)" : "Power (xʸ)"}
        >
          {is2nd ? "ʸ√x" : "xʸ"}
        </button>

        <button
          type="button"
          onClick={() => handleButtonClick("×")}
          className="calc-btn-op text-amber-300 font-mono text-lg font-bold sm:hidden"
          title="Multiplication (×)"
        >
          ×
        </button>

        <button
          type="button"
          onClick={() => handleButtonClick("-")}
          className="calc-btn-op text-amber-300 font-mono text-lg font-bold hidden sm:block"
          title="Subtraction (-)"
        >
          -
        </button>

        {/* ROW 4: Numbers 7, 8, 9 & Algebra */}
        <button
          type="button"
          onClick={() => handleButtonClick("1/x")}
          className="calc-btn-sci font-mono"
          title="Reciprocal (1/x)"
        >
          1/x
        </button>

        <button
          type="button"
          onClick={() => handleButtonClick("abs(")}
          className="calc-btn-sci font-mono"
          title="Absolute Value |x|"
        >
          |x|
        </button>

        <button
          type="button"
          onClick={() => handleButtonClick("7")}
          className="calc-btn-num font-mono text-base font-bold"
        >
          7
        </button>

        <button
          type="button"
          onClick={() => handleButtonClick("8")}
          className="calc-btn-num font-mono text-base font-bold"
        >
          8
        </button>

        <button
          type="button"
          onClick={() => handleButtonClick("9")}
          className="calc-btn-num font-mono text-base font-bold"
        >
          9
        </button>

        <button
          type="button"
          onClick={() => handleButtonClick("-")}
          className="calc-btn-op text-amber-300 font-mono text-lg font-bold sm:hidden"
          title="Subtraction (-)"
        >
          -
        </button>

        <button
          type="button"
          onClick={() => handleButtonClick("+")}
          className="calc-btn-op text-amber-300 font-mono text-lg font-bold hidden sm:block"
          title="Addition (+)"
        >
          +
        </button>

        {/* ROW 5: Numbers 4, 5, 6 */}
        <button
          type="button"
          onClick={() => handleButtonClick("π")}
          className="calc-btn-sci font-mono text-amber-300"
          title="Pi Constant (3.14159...)"
        >
          π
        </button>

        <button
          type="button"
          onClick={() => handleButtonClick("e")}
          className="calc-btn-sci font-mono text-amber-300"
          title="Euler's Constant (2.71828...)"
        >
          e
        </button>

        <button
          type="button"
          onClick={() => handleButtonClick("4")}
          className="calc-btn-num font-mono text-base font-bold"
        >
          4
        </button>

        <button
          type="button"
          onClick={() => handleButtonClick("5")}
          className="calc-btn-num font-mono text-base font-bold"
        >
          5
        </button>

        <button
          type="button"
          onClick={() => handleButtonClick("6")}
          className="calc-btn-num font-mono text-base font-bold"
        >
          6
        </button>

        <button
          type="button"
          onClick={() => handleButtonClick("+")}
          className="calc-btn-op text-amber-300 font-mono text-lg font-bold sm:hidden"
          title="Addition (+)"
        >
          +
        </button>

        <button
          type="button"
          onClick={calculateCalcResult}
          className="calc-btn-eq bg-amber-500 hover:bg-amber-400 text-stone-950 font-mono text-xl font-bold shadow-md hidden sm:block row-span-2 flex items-center justify-center"
          title="Calculate result (=)"
        >
          =
        </button>

        {/* ROW 6: Numbers 1, 2, 3, 0, ., ±, = */}
        <button
          type="button"
          onClick={() => handleButtonClick("c")}
          className="calc-btn-sci font-mono text-amber-300"
          title="Speed of Light c (299,792,458 m/s)"
        >
          c
        </button>

        <button
          type="button"
          onClick={() => handleButtonClick("h")}
          className="calc-btn-sci font-mono text-amber-300"
          title="Planck Constant h (6.626 × 10⁻³⁴ J·s)"
        >
          h
        </button>

        <button
          type="button"
          onClick={() => handleButtonClick("1")}
          className="calc-btn-num font-mono text-base font-bold"
        >
          1
        </button>

        <button
          type="button"
          onClick={() => handleButtonClick("2")}
          className="calc-btn-num font-mono text-base font-bold"
        >
          2
        </button>

        <button
          type="button"
          onClick={() => handleButtonClick("3")}
          className="calc-btn-num font-mono text-base font-bold"
        >
          3
        </button>

        {/* Extra keys for mobile / bottom grid */}
        <button
          type="button"
          onClick={() => handleButtonClick("+/-")}
          className="calc-btn-num font-mono"
          title="Negate (±)"
        >
          ±
        </button>

        <button
          type="button"
          onClick={() => handleButtonClick("0")}
          className="calc-btn-num font-mono text-base font-bold"
        >
          0
        </button>

        <button
          type="button"
          onClick={() => handleButtonClick(".")}
          className="calc-btn-num font-mono text-base font-bold"
        >
          .
        </button>

        <button
          type="button"
          onClick={() => handleButtonClick("N_A")}
          className="calc-btn-sci font-mono text-amber-300"
          title="Avogadro Constant (6.022 × 10²³)"
        >
          N_A
        </button>

        <button
          type="button"
          onClick={() => handleButtonClick("G")}
          className="calc-btn-sci font-mono text-amber-300"
          title="Gravitational Constant G (6.674 × 10⁻¹¹)"
        >
          G
        </button>

        <button
          type="button"
          onClick={calculateCalcResult}
          className="calc-btn-eq bg-amber-500 hover:bg-amber-400 text-stone-950 font-mono text-xl font-bold shadow-md sm:hidden col-span-2 flex items-center justify-center py-2.5"
          title="Calculate result (=)"
        >
          =
        </button>
      </div>

      {/* History Log */}
      {history.length > 0 && (
        <div className="bg-stone-950/80 rounded-xl p-3 border border-stone-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-400">Recent Calculations</span>
            <button
              type="button"
              onClick={() => setHistory([])}
              className="text-[11px] text-stone-500 hover:text-stone-300 transition"
            >
              Clear Log
            </button>
          </div>
          <div className="flex flex-col gap-1 max-h-32 overflow-y-auto font-mono text-xs text-stone-300">
            {history.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  const parts = item.split(" = ");
                  if (parts[1]) setResult(parts[1]);
                  if (parts[0]) setExpression(parts[0]);
                }}
                className="hover:bg-stone-900 px-2 py-1 rounded cursor-pointer transition flex items-center justify-between group"
                title="Click to reload expression"
              >
                <span className="truncate">{item}</span>
                <RotateCcw className="w-3 h-3 text-stone-500 opacity-0 group-hover:opacity-100 transition flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
