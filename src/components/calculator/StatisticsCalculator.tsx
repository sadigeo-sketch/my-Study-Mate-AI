import React, { useState, useMemo } from "react";
import {
  BarChart3,
  Copy,
  Check,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Info,
} from "lucide-react";
import { copyToClipboard } from "../../utils/clipboard";

interface StatisticsCalculatorProps {
  onInsertResult?: (result: string) => void;
}

const PRESET_DATASETS = [
  { label: "Exam Scores", data: "78, 85, 92, 64, 88, 72, 95, 85, 90, 81" },
  { label: "Lab Measurements", data: "9.81, 9.79, 9.82, 9.80, 9.84, 9.78, 9.81" },
  { label: "Small Integers", data: "2, 4, 4, 4, 5, 5, 7, 9" },
  { label: "Heights (cm)", data: "165, 172, 168, 175, 180, 162, 170, 178, 182" },
];

export const StatisticsCalculator: React.FC<StatisticsCalculatorProps> = ({
  onInsertResult,
}) => {
  const [inputData, setInputData] = useState("78, 85, 92, 64, 88, 72, 95, 85, 90, 81");
  const [copied, setCopied] = useState(false);

  // Parse numbers from input string (handles commas, spaces, tabs, newlines)
  const numbers = useMemo(() => {
    return inputData
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map(Number)
      .filter((n) => !isNaN(n) && isFinite(n));
  }, [inputData]);

  // Statistical calculations
  const stats = useMemo(() => {
    const n = numbers.length;
    if (n === 0) return null;

    const sorted = [...numbers].sort((a, b) => a - b);
    const sum = numbers.reduce((acc, v) => acc + v, 0);
    const mean = sum / n;

    // Median
    let median = 0;
    const mid = Math.floor(n / 2);
    if (n % 2 === 0) {
      median = (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
      median = sorted[mid];
    }

    // Mode
    const freqMap: Record<number, number> = {};
    let maxFreq = 0;
    numbers.forEach((val) => {
      freqMap[val] = (freqMap[val] || 0) + 1;
      if (freqMap[val] > maxFreq) {
        maxFreq = freqMap[val];
      }
    });

    const modes: number[] = [];
    if (maxFreq > 1) {
      Object.entries(freqMap).forEach(([val, count]) => {
        if (count === maxFreq) {
          modes.push(Number(val));
        }
      });
    }

    // Variance & Standard Deviation
    const sumSqDiff = numbers.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);
    const popVariance = sumSqDiff / n;
    const popStdDev = Math.sqrt(popVariance);

    const sampleVariance = n > 1 ? sumSqDiff / (n - 1) : 0;
    const sampleStdDev = Math.sqrt(sampleVariance);

    // Min, Max, Range
    const min = sorted[0];
    const max = sorted[n - 1];
    const range = max - min;

    // Quartiles
    const getQuartile = (arr: number[], q: number) => {
      const pos = (arr.length - 1) * q;
      const base = Math.floor(pos);
      const rest = pos - base;
      if (arr[base + 1] !== undefined) {
        return arr[base] + rest * (arr[base + 1] - arr[base]);
      }
      return arr[base];
    };

    const q1 = getQuartile(sorted, 0.25);
    const q3 = getQuartile(sorted, 0.75);
    const iqr = q3 - q1;

    return {
      n,
      sum,
      mean,
      median,
      modes,
      min,
      max,
      range,
      q1,
      q3,
      iqr,
      sampleVariance,
      sampleStdDev,
      popVariance,
      popStdDev,
      sorted,
    };
  }, [numbers]);

  const roundVal = (v: number, digits: number = 4) => {
    return parseFloat(v.toFixed(digits)).toString();
  };

  const handleCopy = async () => {
    if (!stats) return;
    const summary = `Statistical Summary (N = ${stats.n}):
Mean (x̄): ${roundVal(stats.mean)}
Median: ${roundVal(stats.median)}
Mode: ${stats.modes.length > 0 ? stats.modes.join(", ") : "No repeated mode"}
Sample Std Dev (s): ${roundVal(stats.sampleStdDev)}
Population Std Dev (σ): ${roundVal(stats.popStdDev)}
Sample Variance (s²): ${roundVal(stats.sampleVariance)}
Min: ${stats.min} | Max: ${stats.max} | Range: ${stats.range}
Quartiles: Q1 = ${roundVal(stats.q1)}, Q3 = ${roundVal(stats.q3)}, IQR = ${roundVal(stats.iqr)}`;

    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInsert = () => {
    if (!stats || !onInsertResult) return;
    onInsertResult(
      `[STATISTICS RESULT: Mean = ${roundVal(stats.mean)} | Median = ${roundVal(stats.median)} | Std Dev (s) = ${roundVal(stats.sampleStdDev)} | N = ${stats.n}]`
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Dataset Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <span>Enter Dataset Values (Comma or Space separated)</span>
          </label>
          <span className="text-xs text-stone-400 font-mono">
            {numbers.length} {numbers.length === 1 ? "value" : "values"} parsed
          </span>
        </div>

        <textarea
          rows={3}
          value={inputData}
          onChange={(e) => setInputData(e.target.value)}
          placeholder="e.g. 15, 23, 18, 29, 32, 23, 40, 45, 52"
          className="w-full px-4 py-3 sm:px-4.5 sm:py-3.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 placeholder-stone-500 font-mono text-sm sm:text-base focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 leading-relaxed shadow-inner"
        />
      </div>

      {/* Preset Dataset Buttons */}
      <div>
        <span className="text-xs text-stone-400 font-medium block mb-1.5">Sample Datasets:</span>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_DATASETS.map((p) => (
            <button
              key={p.label}
              onClick={() => setInputData(p.data)}
              className="px-3 py-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-300 text-xs font-medium border border-stone-700/60 transition"
            >
              {p.label}
            </button>
          ))}
          <button
            onClick={() => setInputData("")}
            className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 text-xs transition border border-stone-800 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Clear
          </button>
        </div>
      </div>

      {/* Results Section */}
      {stats ? (
        <div className="space-y-4">
          {/* Primary High-Impact Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                Mean (Average) x̄
              </span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-purple-400 mt-1 truncate">
                {roundVal(stats.mean)}
              </span>
              <span className="text-[10px] text-stone-500 font-mono mt-1">
                Σx = {roundVal(stats.sum, 2)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                Median
              </span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-white mt-1 truncate">
                {roundVal(stats.median)}
              </span>
              <span className="text-[10px] text-stone-500 font-mono mt-1">
                Middle 50th percentile
              </span>
            </div>

            <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                Sample Std Dev (s)
              </span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-amber-400 mt-1 truncate">
                {roundVal(stats.sampleStdDev)}
              </span>
              <span className="text-[10px] text-stone-500 font-mono mt-1">
                Pop σ = {roundVal(stats.popStdDev)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                Mode
              </span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-cyan-400 mt-1 truncate">
                {stats.modes.length > 0 ? stats.modes.join(", ") : "None"}
              </span>
              <span className="text-[10px] text-stone-500 font-mono mt-1">
                {stats.modes.length > 0 ? "Most frequent value" : "No value repeats"}
              </span>
            </div>
          </div>

          {/* Secondary Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-stone-950 border border-stone-800 text-xs">
            <div className="space-y-1">
              <span className="text-stone-400 font-medium">Sample Size (N):</span>
              <div className="font-mono text-base font-semibold text-white">{stats.n}</div>
            </div>

            <div className="space-y-1">
              <span className="text-stone-400 font-medium">Sample Variance (s²):</span>
              <div className="font-mono text-base font-semibold text-white">
                {roundVal(stats.sampleVariance)}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-stone-400 font-medium">Population Variance (σ²):</span>
              <div className="font-mono text-base font-semibold text-white">
                {roundVal(stats.popVariance)}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-stone-400 font-medium">Minimum Value:</span>
              <div className="font-mono text-base font-semibold text-emerald-400">{stats.min}</div>
            </div>

            <div className="space-y-1">
              <span className="text-stone-400 font-medium">Maximum Value:</span>
              <div className="font-mono text-base font-semibold text-red-400">{stats.max}</div>
            </div>

            <div className="space-y-1">
              <span className="text-stone-400 font-medium">Range (Max - Min):</span>
              <div className="font-mono text-base font-semibold text-white">{stats.range}</div>
            </div>

            <div className="space-y-1">
              <span className="text-stone-400 font-medium">First Quartile (Q₁):</span>
              <div className="font-mono text-base font-semibold text-stone-300">
                {roundVal(stats.q1)}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-stone-400 font-medium">Third Quartile (Q₃):</span>
              <div className="font-mono text-base font-semibold text-stone-300">
                {roundVal(stats.q3)}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-stone-400 font-medium">Interquartile Range (IQR):</span>
              <div className="font-mono text-base font-semibold text-amber-300">
                {roundVal(stats.iqr)}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
            <span className="text-xs text-stone-500 font-mono">
              [CALCULATOR RESULT: x̄ = {roundVal(stats.mean)}, s = {roundVal(stats.sampleStdDev)}]
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium border border-stone-700 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Stats"}</span>
              </button>
              {onInsertResult && (
                <button
                  onClick={handleInsert}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-semibold transition"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Insert in Chat</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center text-stone-500 bg-stone-950/60 rounded-xl border border-stone-800 text-sm">
          Please enter at least 1 valid number in the box above to compute statistical metrics.
        </div>
      )}

      {/* Info callout */}
      <div className="p-3.5 rounded-xl bg-stone-900/60 border border-stone-800 text-xs text-stone-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Sample standard deviation (<span className="text-purple-300 font-mono">s</span>) uses Bessel&apos;s correction (<span className="font-mono">n - 1</span> denominator), which is required for academic tests and lab reports. Population standard deviation (<span className="text-purple-300 font-mono">σ</span>) uses denominator <span className="font-mono">n</span>.
        </p>
      </div>
    </div>
  );
};
