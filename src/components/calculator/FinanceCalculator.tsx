import React, { useState, useMemo } from "react";
import {
  DollarSign,
  Copy,
  Check,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Percent,
  Landmark,
  PiggyBank,
  Receipt,
  Info,
} from "lucide-react";
import { copyToClipboard } from "../../utils/clipboard";

interface FinanceCalculatorProps {
  onInsertResult?: (result: string) => void;
}

export const FinanceCalculator: React.FC<FinanceCalculatorProps> = ({
  onInsertResult,
}) => {
  const [financeTab, setFinanceTab] = useState<"compound" | "simple" | "percentage" | "loan">("compound");
  const [copied, setCopied] = useState(false);

  // --- COMPOUND INTEREST STATE ---
  const [ciPrincipal, setCiPrincipal] = useState("10000");
  const [ciRate, setCiRate] = useState("7.5");
  const [ciYears, setCiYears] = useState("5");
  const [ciFrequency, setCiFrequency] = useState<number>(12); // monthly

  // --- SIMPLE INTEREST STATE ---
  const [siPrincipal, setSiPrincipal] = useState("5000");
  const [siRate, setSiRate] = useState("6");
  const [siYears, setSiYears] = useState("3");

  // --- PERCENTAGE STATE ---
  const [pctMode, setPctMode] = useState<"whatIs" | "isWhatPct" | "pctChange" | "discount">("whatIs");
  const [pctValA, setPctValA] = useState("15");
  const [pctValB, setPctValB] = useState("250");

  // --- LOAN EMI STATE ---
  const [loanAmount, setLoanAmount] = useState("50000");
  const [loanRate, setLoanRate] = useState("8.5");
  const [loanYears, setLoanYears] = useState("5");

  // Compound Interest Calculation
  const ciResult = useMemo(() => {
    const P = parseFloat(ciPrincipal);
    const r = parseFloat(ciRate) / 100;
    const t = parseFloat(ciYears);
    const n = ciFrequency;

    if (isNaN(P) || isNaN(r) || isNaN(t) || P <= 0 || t <= 0) return null;

    const A = P * Math.pow(1 + r / n, n * t);
    const interestEarned = A - P;
    const effectiveRate = (Math.pow(1 + r / n, n) - 1) * 100;

    return {
      finalAmount: parseFloat(A.toFixed(2)),
      interestEarned: parseFloat(interestEarned.toFixed(2)),
      effectiveRate: parseFloat(effectiveRate.toFixed(3)),
    };
  }, [ciPrincipal, ciRate, ciYears, ciFrequency]);

  // Simple Interest Calculation
  const siResult = useMemo(() => {
    const P = parseFloat(siPrincipal);
    const r = parseFloat(siRate) / 100;
    const t = parseFloat(siYears);

    if (isNaN(P) || isNaN(r) || isNaN(t) || P <= 0 || t <= 0) return null;

    const interest = P * r * t;
    const totalAmount = P + interest;

    return {
      interest: parseFloat(interest.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
    };
  }, [siPrincipal, siRate, siYears]);

  // Percentage Calculations
  const pctResult = useMemo(() => {
    const a = parseFloat(pctValA);
    const b = parseFloat(pctValB);

    if (isNaN(a) || isNaN(b)) return null;

    if (pctMode === "whatIs") {
      // What is A% of B?
      const res = (a / 100) * b;
      return {
        answer: parseFloat(res.toFixed(4)),
        explanation: `${a}% of ${b} = (${a} / 100) × ${b} = ${parseFloat(res.toFixed(4))}`,
      };
    } else if (pctMode === "isWhatPct") {
      // A is what % of B?
      if (b === 0) return null;
      const res = (a / b) * 100;
      return {
        answer: parseFloat(res.toFixed(2)),
        explanation: `${a} is (${a} / ${b}) × 100 = ${parseFloat(res.toFixed(2))}% of ${b}`,
      };
    } else if (pctMode === "pctChange") {
      // % change from A to B
      if (a === 0) return null;
      const change = ((b - a) / a) * 100;
      const direction = change >= 0 ? "increase" : "decrease";
      return {
        answer: parseFloat(Math.abs(change).toFixed(2)),
        explanation: `Change from ${a} to ${b}: ${parseFloat(Math.abs(change).toFixed(2))}% ${direction}`,
      };
    } else {
      // Discount: A is original price, B is discount %
      const saved = (b / 100) * a;
      const finalPrice = a - saved;
      return {
        answer: parseFloat(finalPrice.toFixed(2)),
        explanation: `Original: $${a} | ${b}% Discount: -$${parseFloat(saved.toFixed(2))} | Final Price: $${parseFloat(finalPrice.toFixed(2))}`,
      };
    }
  }, [pctMode, pctValA, pctValB]);

  // Loan EMI Calculation
  const loanResult = useMemo(() => {
    const P = parseFloat(loanAmount);
    const annualRate = parseFloat(loanRate);
    const years = parseFloat(loanYears);

    if (isNaN(P) || isNaN(annualRate) || isNaN(years) || P <= 0 || years <= 0) return null;

    const monthlyRate = annualRate / 12 / 100;
    const totalMonths = years * 12;

    let emi = 0;
    if (monthlyRate === 0) {
      emi = P / totalMonths;
    } else {
      emi = (P * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    }

    const totalPayment = emi * totalMonths;
    const totalInterest = totalPayment - P;

    return {
      monthlyEmi: parseFloat(emi.toFixed(2)),
      totalInterest: parseFloat(totalInterest.toFixed(2)),
      totalPayment: parseFloat(totalPayment.toFixed(2)),
    };
  }, [loanAmount, loanRate, loanYears]);

  const handleCopyResult = async (text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Tab Selector */}
      <div className="flex bg-stone-900 p-1 rounded-xl border border-stone-800 text-xs font-semibold gap-1">
        <button
          onClick={() => setFinanceTab("compound")}
          className={`flex-1 py-2 px-2.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
            financeTab === "compound"
              ? "bg-amber-500 text-stone-950 font-bold shadow"
              : "text-stone-400 hover:text-white"
          }`}
        >
          <PiggyBank className="w-3.5 h-3.5" />
          <span>Compound Interest</span>
        </button>

        <button
          onClick={() => setFinanceTab("simple")}
          className={`flex-1 py-2 px-2.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
            financeTab === "simple"
              ? "bg-amber-500 text-stone-950 font-bold shadow"
              : "text-stone-400 hover:text-white"
          }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>Simple Interest</span>
        </button>

        <button
          onClick={() => setFinanceTab("percentage")}
          className={`flex-1 py-2 px-2.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
            financeTab === "percentage"
              ? "bg-amber-500 text-stone-950 font-bold shadow"
              : "text-stone-400 hover:text-white"
          }`}
        >
          <Percent className="w-3.5 h-3.5" />
          <span>Percentages & Discounts</span>
        </button>

        <button
          onClick={() => setFinanceTab("loan")}
          className={`flex-1 py-2 px-2.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
            financeTab === "loan"
              ? "bg-amber-500 text-stone-950 font-bold shadow"
              : "text-stone-400 hover:text-white"
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Loan EMI</span>
        </button>
      </div>

      {/* 1. COMPOUND INTEREST */}
      {financeTab === "compound" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">Initial Principal ($ P):</label>
              <input
                type="number"
                step="any"
                value={ciPrincipal}
                onChange={(e) => setCiPrincipal(e.target.value)}
                className="w-full px-4 py-3 sm:px-4.5 sm:py-3.5 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-base focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">Annual Interest Rate (% r):</label>
              <input
                type="number"
                step="any"
                value={ciRate}
                onChange={(e) => setCiRate(e.target.value)}
                className="w-full px-4 py-3 sm:px-4.5 sm:py-3.5 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-base focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">Time Horizon in Years (t):</label>
              <input
                type="number"
                step="any"
                value={ciYears}
                onChange={(e) => setCiYears(e.target.value)}
                className="w-full px-4 py-3 sm:px-4.5 sm:py-3.5 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-base focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">Compounding Frequency:</label>
              <select
                value={ciFrequency}
                onChange={(e) => setCiFrequency(Number(e.target.value))}
                className="w-full px-4 py-3 sm:px-4.5 sm:py-3.5 rounded-xl bg-stone-900 border border-stone-700 text-white text-sm focus:outline-none focus:border-amber-500"
              >
                <option value={1}>Annually (1x per year)</option>
                <option value={2}>Semi-annually (2x per year)</option>
                <option value={4}>Quarterly (4x per year)</option>
                <option value={12}>Monthly (12x per year)</option>
                <option value={365}>Daily (365x per year)</option>
              </select>
            </div>
          </div>

          {ciResult && (
            <div className="p-4 sm:p-5 rounded-2xl bg-stone-950 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                    Total Future Balance
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-white mt-0.5">
                    ${ciResult.finalAmount.toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    Total Interest Earned
                  </span>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 mt-0.5">
                    +${ciResult.interestEarned.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-stone-800 text-xs text-stone-400 flex-wrap gap-2">
                <span>
                  Effective Annual Rate (EAR): <strong className="text-stone-200">{ciResult.effectiveRate}%</strong>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleCopyResult(
                        `Compound Interest: Principal $${ciPrincipal} at ${ciRate}% for ${ciYears} yrs compounded ${ciFrequency}x/yr -> Future Balance: $${ciResult.finalAmount} (Interest: $${ciResult.interestEarned})`
                      )
                    }
                    className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium border border-stone-700 transition flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                  {onInsertResult && (
                    <button
                      onClick={() =>
                        onInsertResult(
                          `[COMPOUND INTEREST: Future Balance = $${ciResult.finalAmount} | Interest Earned = $${ciResult.interestEarned}]`
                        )
                      }
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Insert in Chat</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. SIMPLE INTEREST */}
      {financeTab === "simple" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">Principal Amount ($ P):</label>
              <input
                type="number"
                step="any"
                value={siPrincipal}
                onChange={(e) => setSiPrincipal(e.target.value)}
                className="w-full px-4 py-3 sm:px-4.5 sm:py-3.5 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-base focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">Annual Rate (% r):</label>
              <input
                type="number"
                step="any"
                value={siRate}
                onChange={(e) => setSiRate(e.target.value)}
                className="w-full px-4 py-3 sm:px-4.5 sm:py-3.5 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-base focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">Duration in Years (t):</label>
              <input
                type="number"
                step="any"
                value={siYears}
                onChange={(e) => setSiYears(e.target.value)}
                className="w-full px-4 py-3 sm:px-4.5 sm:py-3.5 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-base focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {siResult && (
            <div className="p-4 sm:p-5 rounded-2xl bg-stone-950 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                    Total Simple Interest (I)
                  </span>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">
                    ${siResult.interest.toLocaleString()}
                  </div>
                  <span className="text-xs text-stone-400 font-mono">
                    Formula: I = P × r × t = ${siPrincipal} × {siRate}% × {siYears} yrs
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                    Total Accrued Amount (A)
                  </span>
                  <div className="text-2xl font-bold font-mono text-white mt-0.5">
                    ${siResult.totalAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-stone-800">
                {onInsertResult && (
                  <button
                    onClick={() =>
                      onInsertResult(
                        `[SIMPLE INTEREST: Interest = $${siResult.interest} | Total Amount = $${siResult.totalAmount}]`
                      )
                    }
                    className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Insert in Chat</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. PERCENTAGES & DISCOUNTS */}
      {financeTab === "percentage" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setPctMode("whatIs")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                pctMode === "whatIs"
                  ? "bg-amber-500 text-stone-950 font-bold"
                  : "bg-stone-800 text-stone-300 hover:bg-stone-700"
              }`}
            >
              What is X% of Y?
            </button>
            <button
              onClick={() => setPctMode("isWhatPct")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                pctMode === "isWhatPct"
                  ? "bg-amber-500 text-stone-950 font-bold"
                  : "bg-stone-800 text-stone-300 hover:bg-stone-700"
              }`}
            >
              X is what % of Y?
            </button>
            <button
              onClick={() => setPctMode("pctChange")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                pctMode === "pctChange"
                  ? "bg-amber-500 text-stone-950 font-bold"
                  : "bg-stone-800 text-stone-300 hover:bg-stone-700"
              }`}
            >
              % Increase/Decrease
            </button>
            <button
              onClick={() => setPctMode("discount")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                pctMode === "discount"
                  ? "bg-amber-500 text-stone-950 font-bold"
                  : "bg-stone-800 text-stone-300 hover:bg-stone-700"
              }`}
            >
              Discount & Sale Price
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">
                {pctMode === "whatIs"
                  ? "Percentage (%)"
                  : pctMode === "isWhatPct"
                  ? "Value X"
                  : pctMode === "pctChange"
                  ? "Original Value (From)"
                  : "Original Price ($)"}
              </label>
              <input
                type="number"
                step="any"
                value={pctValA}
                onChange={(e) => setPctValA(e.target.value)}
                className="w-full px-4 py-3 sm:px-4.5 sm:py-3.5 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-base focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">
                {pctMode === "whatIs"
                  ? "Base Value (Of)"
                  : pctMode === "isWhatPct"
                  ? "Total Value (Of Y)"
                  : pctMode === "pctChange"
                  ? "New Value (To)"
                  : "Discount (%)"}
              </label>
              <input
                type="number"
                step="any"
                value={pctValB}
                onChange={(e) => setPctValB(e.target.value)}
                className="w-full px-4 py-3 sm:px-4.5 sm:py-3.5 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-base focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {pctResult && (
            <div className="p-4 sm:p-5 rounded-2xl bg-stone-950 border border-amber-500/30 flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Result
                </span>
                <div className="text-2xl font-bold font-mono text-white mt-0.5">
                  {pctResult.answer}
                  {pctMode === "isWhatPct" || pctMode === "pctChange" ? "%" : ""}
                </div>
                <span className="text-xs text-stone-400 font-mono">
                  {pctResult.explanation}
                </span>
              </div>

              {onInsertResult && (
                <button
                  onClick={() => onInsertResult(`[PERCENTAGE RESULT: ${pctResult.explanation}]`)}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Insert in Chat</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. LOAN EMI CALCULATOR */}
      {financeTab === "loan" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">Loan Amount ($):</label>
              <input
                type="number"
                step="any"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="w-full px-4 py-3 sm:px-4.5 sm:py-3.5 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-base focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">Interest Rate (% p.a.):</label>
              <input
                type="number"
                step="any"
                value={loanRate}
                onChange={(e) => setLoanRate(e.target.value)}
                className="w-full px-4 py-3 sm:px-4.5 sm:py-3.5 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-base focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">Tenure (Years):</label>
              <input
                type="number"
                step="any"
                value={loanYears}
                onChange={(e) => setLoanYears(e.target.value)}
                className="w-full px-4 py-3 sm:px-4.5 sm:py-3.5 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-base focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {loanResult && (
            <div className="p-4 sm:p-5 rounded-2xl bg-stone-950 border border-amber-500/30 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800">
                  <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                    Monthly EMI
                  </span>
                  <div className="text-xl font-bold font-mono text-white mt-1">
                    ${loanResult.monthlyEmi.toLocaleString()}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800">
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                    Total Interest
                  </span>
                  <div className="text-xl font-bold font-mono text-red-400 mt-1">
                    ${loanResult.totalInterest.toLocaleString()}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800">
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                    Total Payment
                  </span>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                    ${loanResult.totalPayment.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-stone-800">
                {onInsertResult && (
                  <button
                    onClick={() =>
                      onInsertResult(
                        `[LOAN EMI RESULT: Monthly EMI = $${loanResult.monthlyEmi} | Total Interest = $${loanResult.totalInterest} | Total Repayment = $${loanResult.totalPayment}]`
                      )
                    }
                    className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Insert in Chat</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Callout */}
      <div className="p-3.5 rounded-xl bg-stone-900/60 border border-stone-800 text-xs text-stone-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Standard financial formulas for academic economics, business studies, and personal finance. Formulas apply standard amortized schedules and continuous/discrete compounding.
        </p>
      </div>
    </div>
  );
};
