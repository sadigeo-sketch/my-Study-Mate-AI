import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Info,
} from "lucide-react";
import { copyToClipboard } from "../../utils/clipboard";

interface GraphingCalculatorProps {
  onInsertResult?: (result: string) => void;
}

const PRESET_FUNCTIONS = [
  { label: "sin(x)", expr: "sin(x)", desc: "Sine wave (trigonometric)" },
  { label: "cos(x)", expr: "cos(x)", desc: "Cosine wave" },
  { label: "x² - 4", expr: "x^2 - 4", desc: "Parabola with roots at ±2" },
  { label: "x³ - 3x", expr: "x^3 - 3*x", desc: "Cubic polynomial" },
  { label: "2x + 1", expr: "2*x + 1", desc: "Linear function (slope 2)" },
  { label: "ln(x)", expr: "ln(x)", desc: "Natural logarithm (x > 0)" },
  { label: "e^x", expr: "exp(x)", desc: "Exponential growth" },
  { label: "1/x", expr: "1/x", desc: "Hyperbola (asymptote at x=0)" },
  { label: "|x|", expr: "abs(x)", desc: "Absolute value" },
];

/**
 * Safely parses and evaluates a math function of x
 */
function evaluateMathExpr(expr: string, x: number): number | null {
  try {
    // Sanitize and replace math functions
    let sanitized = expr
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/sin\(/g, "Math.sin(")
      .replace(/cos\(/g, "Math.cos(")
      .replace(/tan\(/g, "Math.tan(")
      .replace(/asin\(/g, "Math.asin(")
      .replace(/acos\(/g, "Math.acos(")
      .replace(/atan\(/g, "Math.atan(")
      .replace(/ln\(/g, "Math.log(")
      .replace(/log\(/g, "Math.log10(")
      .replace(/exp\(/g, "Math.exp(")
      .replace(/abs\(/g, "Math.abs(")
      .replace(/sqrt\(/g, "Math.sqrt(")
      .replace(/pi/g, "Math.PI")
      .replace(/e\b/g, "Math.E")
      .replace(/\^/g, "**");

    // Handle implicit multiplication like 2x, 3*x, etc.
    sanitized = sanitized.replace(/(\d)x/g, "$1*x");
    sanitized = sanitized.replace(/\)x/g, ")*x");
    sanitized = sanitized.replace(/x\(/g, "x*(");

    // Only allow safe math tokens
    if (!/^[0-9x\+\-\*\/\.\(\)\s,Math\.PInEsincoztaexpbrqg]+$/.test(sanitized)) {
      return null;
    }

    // Evaluate
    // eslint-disable-next-line no-new-func
    const fn = new Function("x", `"use strict"; return (${sanitized});`);
    const val = fn(x);
    if (typeof val === "number" && !isNaN(val) && isFinite(val)) {
      return val;
    }
    return null;
  } catch {
    return null;
  }
}

export const GraphingCalculator: React.FC<GraphingCalculatorProps> = ({
  onInsertResult,
}) => {
  const [exprInput, setExprInput] = useState("sin(x)");
  const [activeExpr, setActiveExpr] = useState("sin(x)");
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [yMin, setYMin] = useState(-5);
  const [yMax, setYMax] = useState(5);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handlePlot = () => {
    if (exprInput.trim()) {
      setActiveExpr(exprInput.trim());
    }
  };

  const handleZoom = (factor: number) => {
    const xCenter = (xMin + xMax) / 2;
    const yCenter = (yMin + yMax) / 2;
    const xSpan = ((xMax - xMin) * factor) / 2;
    const ySpan = ((yMax - yMin) * factor) / 2;
    setXMin(Math.round((xCenter - xSpan) * 10) / 10);
    setXMax(Math.round((xCenter + xSpan) * 10) / 10);
    setYMin(Math.round((yCenter - ySpan) * 10) / 10);
    setYMax(Math.round((yCenter + ySpan) * 10) / 10);
  };

  const handleResetView = () => {
    setXMin(-10);
    setXMax(10);
    setYMin(-5);
    setYMax(5);
  };

  // Find approximate roots (x where f(x) ~ 0)
  const roots: number[] = [];
  try {
    const step = (xMax - xMin) / 200;
    let prevY: number | null = evaluateMathExpr(activeExpr, xMin);
    for (let x = xMin + step; x <= xMax; x += step) {
      const y = evaluateMathExpr(activeExpr, x);
      if (y !== null && prevY !== null) {
        if (Math.abs(y) < 0.001) {
          roots.push(Math.round(x * 100) / 100);
        } else if ((prevY > 0 && y < 0) || (prevY < 0 && y > 0)) {
          // Linear interpolation for root
          const rootX = x - (y * step) / (y - prevY);
          roots.push(Math.round(rootX * 100) / 100);
        }
      }
      prevY = y;
    }
  } catch {
    // ignore
  }

  // Draw graph on canvas
  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = "#0c0a09"; // deep stone-950
    ctx.fillRect(0, 0, width, height);

    // Coordinate conversion
    const toCanvasX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
    const toCanvasY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;

    // Draw grid
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#1c1917"; // stone-900

    // Vertical grid lines
    const xStep = Math.max(1, Math.round((xMax - xMin) / 10));
    const firstX = Math.ceil(xMin / xStep) * xStep;
    for (let x = firstX; x <= xMax; x += xStep) {
      const cx = toCanvasX(x);
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();

      // Tick label
      ctx.fillStyle = "#78716c";
      ctx.font = "10px monospace";
      ctx.fillText(x.toString(), cx + 2, toCanvasY(0) + 12);
    }

    // Horizontal grid lines
    const yStep = Math.max(1, Math.round((yMax - yMin) / 6));
    const firstY = Math.ceil(yMin / yStep) * yStep;
    for (let y = firstY; y <= yMax; y += yStep) {
      const cy = toCanvasY(y);
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.stroke();

      // Tick label
      if (y !== 0) {
        ctx.fillStyle = "#78716c";
        ctx.font = "10px monospace";
        ctx.fillText(y.toString(), toCanvasX(0) + 4, cy - 2);
      }
    }

    // Draw main axes (X and Y)
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#44403c"; // stone-700

    // X Axis (y = 0)
    const cy0 = toCanvasY(0);
    ctx.beginPath();
    ctx.moveTo(0, cy0);
    ctx.lineTo(width, cy0);
    ctx.stroke();

    // Y Axis (x = 0)
    const cx0 = toCanvasX(0);
    ctx.beginPath();
    ctx.moveTo(cx0, 0);
    ctx.lineTo(cx0, height);
    ctx.stroke();

    // Plot function f(x)
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#38bdf8"; // vibrant sky-400
    ctx.beginPath();

    let isDrawing = false;
    const pixelStep = 2; // draw every 2 pixels for smoothness

    for (let px = 0; px <= width; px += pixelStep) {
      const x = xMin + (px / width) * (xMax - xMin);
      const y = evaluateMathExpr(activeExpr, x);

      if (y === null || isNaN(y) || !isFinite(y)) {
        isDrawing = false;
        continue;
      }

      const cy = toCanvasY(y);

      // Clamp or skip if way off canvas
      if (cy < -height || cy > height * 2) {
        isDrawing = false;
        continue;
      }

      if (!isDrawing) {
        ctx.moveTo(px, cy);
        isDrawing = true;
      } else {
        ctx.lineTo(px, cy);
      }
    }
    ctx.stroke();

    // Mark roots with dots
    roots.forEach((root) => {
      if (root >= xMin && root <= xMax) {
        const rx = toCanvasX(root);
        const ry = toCanvasY(0);
        ctx.fillStyle = "#f59e0b"; // amber-500
        ctx.beginPath();
        ctx.arc(rx, ry, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Mark cursor tracking position if active
    if (cursorPos) {
      const cursorCanvasX = toCanvasX(cursorPos.x);
      const cursorCanvasY = toCanvasY(cursorPos.y);

      // Crosshairs
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#f59e0b44";
      ctx.setLineDash([4, 4]);

      ctx.beginPath();
      ctx.moveTo(cursorCanvasX, 0);
      ctx.lineTo(cursorCanvasX, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, cursorCanvasY);
      ctx.lineTo(width, cursorCanvasY);
      ctx.stroke();

      ctx.setLineDash([]);

      // Point circle
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(cursorCanvasX, cursorCanvasY, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [activeExpr, xMin, xMax, yMin, yMax, cursorPos, roots]);

  useEffect(() => {
    drawGraph();
  }, [drawGraph]);

  // Handle canvas mouse tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const x = xMin + (px / canvas.width) * (xMax - xMin);
    const y = evaluateMathExpr(activeExpr, x);

    if (y !== null) {
      setCursorPos({
        x: Math.round(x * 100) / 100,
        y: Math.round(y * 100) / 100,
      });
    } else {
      setCursorPos(null);
    }
  };

  const handleMouseLeave = () => {
    setCursorPos(null);
  };

  const handleCopySummary = async () => {
    const text = `Graph Analysis for f(x) = ${activeExpr}:
Domain plotted: [${xMin}, ${xMax}]
Y-range: [${yMin}, ${yMax}]
Detected roots: ${roots.length > 0 ? roots.join(", ") : "None in view"}
Y-intercept: f(0) = ${evaluateMathExpr(activeExpr, 0) ?? "undefined"}`;

    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInsert = () => {
    if (onInsertResult) {
      const rootStr = roots.length > 0 ? roots.join(", ") : "None in view";
      onInsertResult(`[GRAPH RESULT: f(x) = ${activeExpr} | Range: [${xMin}, ${xMax}] | Roots: ${rootStr}]`);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Top Function Input Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-cyan-400 font-bold text-sm">
            f(x) =
          </span>
          <input
            type="text"
            value={exprInput}
            onChange={(e) => setExprInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePlot()}
            className="w-full pl-16 pr-4 py-3 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-sm sm:text-base focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition shadow-inner"
            placeholder="e.g. sin(x), x^2 - 4, 2*x + 1"
          />
        </div>
        <button
          onClick={handlePlot}
          className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 transition shadow-md shadow-cyan-950/40 whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4" />
          <span>Plot Graph</span>
        </button>
      </div>

      {/* Preset Pills */}
      <div>
        <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <span>Quick Presets:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_FUNCTIONS.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                setExprInput(p.expr);
                setActiveExpr(p.expr);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                activeExpr === p.expr
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50"
                  : "bg-stone-800/80 text-stone-300 hover:bg-stone-700 border border-stone-700/60"
              }`}
              title={p.desc}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas Display Card */}
      <div
        ref={containerRef}
        className="rounded-2xl bg-stone-950 border border-stone-800 p-3 relative overflow-hidden shadow-xl"
      >
        <div className="flex items-center justify-between pb-2 border-b border-stone-800/80 text-xs text-stone-400 px-1 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-cyan-400 font-bold">
              y = {activeExpr}
            </span>
            {cursorPos && (
              <span className="px-2 py-0.5 rounded bg-stone-800 text-amber-300 font-mono text-[11px] border border-stone-700">
                x: {cursorPos.x}, y: {cursorPos.y}
              </span>
            )}
          </div>

          {/* Zoom and Reset Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleZoom(0.75)}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleZoom(1.33)}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetView}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* HTML5 Canvas */}
        <div className="relative w-full aspect-[16/9] max-h-[360px] flex items-center justify-center my-2">
          <canvas
            ref={canvasRef}
            width={640}
            height={360}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="w-full h-full rounded-xl border border-stone-800/60 cursor-crosshair bg-stone-950 object-contain"
          />
        </div>

        {/* Graph Details Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-800/80 text-xs text-stone-400 px-1 flex-wrap gap-2">
          <div className="flex items-center gap-3 text-[11px]">
            <span>
              <strong className="text-stone-300">X Range:</strong> [{xMin}, {xMax}]
            </span>
            <span>
              <strong className="text-stone-300">Y-Intercept:</strong>{" "}
              {evaluateMathExpr(activeExpr, 0) !== null
                ? (Math.round((evaluateMathExpr(activeExpr, 0) || 0) * 100) / 100).toString()
                : "None"}
            </span>
            {roots.length > 0 && (
              <span className="text-amber-400">
                <strong>Roots:</strong> x ≈ {roots.slice(0, 4).join(", ")}
                {roots.length > 4 ? "..." : ""}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs transition border border-stone-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
            {onInsertResult && (
              <button
                onClick={handleInsert}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Insert in Chat</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-stone-900/60 border border-stone-800 text-xs text-stone-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Hover over the curve to inspect precise <span className="text-amber-300 font-mono">(x, y)</span> coordinate pairs in real time.
          Amber dots represent detected roots (<span className="font-mono text-amber-300">f(x) = 0</span>). Supported functions:{" "}
          <code className="text-cyan-300">sin, cos, tan, ln, log, exp, sqrt, abs</code>, and powers like <code className="text-cyan-300">x^2</code>.
        </p>
      </div>
    </div>
  );
};
