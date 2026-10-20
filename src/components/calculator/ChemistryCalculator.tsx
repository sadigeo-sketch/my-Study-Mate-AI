import React, { useState, useMemo } from "react";
import {
  FlaskConical,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  Info,
  Beaker,
  Scale,
} from "lucide-react";
import { copyToClipboard } from "../../utils/clipboard";

interface ChemistryCalculatorProps {
  onInsertResult?: (result: string) => void;
}

// Periodic Table Atomic Weights (g/mol)
const ATOMIC_MASSES: Record<string, { name: string; weight: number }> = {
  H: { name: "Hydrogen", weight: 1.008 },
  He: { name: "Helium", weight: 4.0026 },
  Li: { name: "Lithium", weight: 6.94 },
  Be: { name: "Beryllium", weight: 9.0122 },
  B: { name: "Boron", weight: 10.81 },
  C: { name: "Carbon", weight: 12.011 },
  N: { name: "Nitrogen", weight: 14.007 },
  O: { name: "Oxygen", weight: 15.999 },
  F: { name: "Fluorine", weight: 18.998 },
  Ne: { name: "Neon", weight: 20.18 },
  Na: { name: "Sodium", weight: 22.99 },
  Mg: { name: "Magnesium", weight: 24.305 },
  Al: { name: "Aluminum", weight: 26.982 },
  Si: { name: "Silicon", weight: 28.085 },
  P: { name: "Phosphorus", weight: 30.974 },
  S: { name: "Sulfur", weight: 32.06 },
  Cl: { name: "Chlorine", weight: 35.45 },
  Ar: { name: "Argon", weight: 39.948 },
  K: { name: "Potassium", weight: 39.098 },
  Ca: { name: "Calcium", weight: 40.078 },
  Sc: { name: "Scandium", weight: 44.956 },
  Ti: { name: "Titanium", weight: 47.867 },
  V: { name: "Vanadium", weight: 50.942 },
  Cr: { name: "Chromium", weight: 51.996 },
  Mn: { name: "Manganese", weight: 54.938 },
  Fe: { name: "Iron", weight: 55.845 },
  Co: { name: "Cobalt", weight: 58.933 },
  Ni: { name: "Nickel", weight: 58.693 },
  Cu: { name: "Copper", weight: 63.546 },
  Zn: { name: "Zinc", weight: 65.38 },
  Ga: { name: "Gallium", weight: 69.723 },
  Ge: { name: "Germanium", weight: 72.63 },
  As: { name: "Arsenic", weight: 74.922 },
  Se: { name: "Selenium", weight: 78.971 },
  Br: { name: "Bromine", weight: 79.904 },
  Kr: { name: "Krypton", weight: 83.798 },
  Rb: { name: "Rubidium", weight: 85.468 },
  Sr: { name: "Strontium", weight: 87.62 },
  Ag: { name: "Silver", weight: 107.87 },
  I: { name: "Iodine", weight: 126.9 },
  Ba: { name: "Barium", weight: 137.33 },
  Pt: { name: "Platinum", weight: 195.08 },
  Au: { name: "Gold", weight: 196.97 },
  Hg: { name: "Mercury", weight: 200.59 },
  Pb: { name: "Lead", weight: 207.2 },
  U: { name: "Uranium", weight: 238.03 },
};

/**
 * Parses a chemical formula with support for parentheses: e.g. Ca(OH)2, (NH4)2SO4, Fe2(SO4)3
 */
function parseChemicalFormula(formula: string): Record<string, number> | null {
  const counts: Record<string, number> = {};
  if (!formula || !formula.trim()) return null;

  const sanitized = formula.trim().replace(/\s+/g, "");

  // Match parentheses e.g. (OH)2 or [OH]2
  const parenRegex = /\(([^)]+)\)(\d*)|\[([^\]]+)\](\d*)/;
  let working = sanitized;

  // Expand parentheses recursively
  let maxLoop = 10;
  while (parenRegex.test(working) && maxLoop > 0) {
    maxLoop--;
    working = working.replace(parenRegex, (_, g1, count1, g2, count2) => {
      const group = g1 || g2;
      const multiplier = parseInt(count1 || count2 || "1", 10);
      const innerCounts = parseSimpleFormula(group);
      if (!innerCounts) return "";
      return Object.entries(innerCounts)
        .map(([elem, n]) => `${elem}${n * multiplier}`)
        .join("");
    });
  }

  const finalCounts = parseSimpleFormula(working);
  return finalCounts;
}

function parseSimpleFormula(str: string): Record<string, number> | null {
  const counts: Record<string, number> = {};
  const elementRegex = /([A-Z][a-z]?)(\d*)/g;
  let match;
  let totalLength = 0;

  while ((match = elementRegex.exec(str)) !== null) {
    const symbol = match[1];
    const qty = match[2] ? parseInt(match[2], 10) : 1;
    counts[symbol] = (counts[symbol] || 0) + qty;
    totalLength += match[0].length;
  }

  if (totalLength === 0 || totalLength !== str.length) {
    return null;
  }

  return counts;
}

const COMMON_REACTIONS = [
  {
    name: "Combustion of Methane",
    unbalanced: "CH4 + O2 → CO2 + H2O",
    balanced: "CH4 + 2O2 → CO2 + 2H2O",
    type: "Combustion / Exothermic",
    notes: "Requires 2 moles of O2 per mole of methane; produces carbon dioxide and water vapor.",
  },
  {
    name: "Neutralization (Acid-Base)",
    unbalanced: "HCl + NaOH → NaCl + H2O",
    balanced: "HCl + NaOH → NaCl + H2O",
    type: "Neutralization (1:1 stoichiometric ratio)",
    notes: "Strong acid reacts with strong base to yield neutral salt and liquid water.",
  },
  {
    name: "Haber Ammonia Synthesis",
    unbalanced: "N2 + H2 → NH3",
    balanced: "N2 + 3H2 → 2NH3",
    type: "Synthesis / Industrial Haber-Bosch Process",
    notes: "Iron catalyst under high pressure (~200 atm) and temperature (~450°C).",
  },
  {
    name: "Photosynthesis",
    unbalanced: "CO2 + H2O → C6H12O6 + O2",
    balanced: "6CO2 + 6H2O → C6H12O6 + 6O2",
    type: "Endothermic / Biochemical Synthesis",
    notes: "Driven by chlorophyll absorption of solar photons in plant chloroplasts.",
  },
  {
    name: "Single Replacement (Zinc in Acid)",
    unbalanced: "Zn + HCl → ZnCl2 + H2",
    balanced: "Zn + 2HCl → ZnCl2 + H2↑",
    type: "Redox / Single Replacement",
    notes: "Zinc is oxidized from 0 to +2; Hydrogen ions are reduced to effervescent H2 gas.",
  },
  {
    name: "Precipitation of Silver Chloride",
    unbalanced: "AgNO3 + NaCl → AgCl + NaNO3",
    balanced: "AgNO3 + NaCl → AgCl↓ + NaNO3",
    type: "Precipitation / Double Displacement",
    notes: "Insoluble white AgCl precipitate forms instantly in aqueous solution.",
  },
  {
    name: "Decomposition of Hydrogen Peroxide",
    unbalanced: "H2O2 → H2O + O2",
    balanced: "2H2O2 → 2H2O + O2↑",
    type: "Catalytic Decomposition",
    notes: "Catalyzed rapidly by manganese dioxide (MnO2) or biological catalase.",
  },
];

const PRESET_FORMULAS = [
  "H2O",
  "NaCl",
  "C6H12O6",
  "Ca(OH)2",
  "H2SO4",
  "KMnO4",
  "CH3COOH",
  "Fe2(SO4)3",
  "NH4NO3",
  "CuSO4",
];

export const ChemistryCalculator: React.FC<ChemistryCalculatorProps> = ({
  onInsertResult,
}) => {
  const [chemSubTab, setChemSubTab] = useState<"molar" | "balancer" | "molarity">("molar");

  // Molar Mass state
  const [formulaInput, setFormulaInput] = useState("C6H12O6");
  const [molarCopied, setMolarCopied] = useState(false);

  // Molarity state
  const [moles, setMoles] = useState("0.5");
  const [volumeL, setVolumeL] = useState("1.0");

  // Molar mass calculation
  const parsedData = useMemo(() => {
    const counts = parseChemicalFormula(formulaInput);
    if (!counts) return null;

    let totalMass = 0;
    const elements: {
      symbol: string;
      name: string;
      count: number;
      weight: number;
      massContribution: number;
      percentage: number;
    }[] = [];

    // Calculate total
    for (const [symbol, count] of Object.entries(counts)) {
      const elemInfo = ATOMIC_MASSES[symbol];
      const weight = elemInfo ? elemInfo.weight : 0;
      const mass = weight * count;
      totalMass += mass;
      elements.push({
        symbol,
        name: elemInfo ? elemInfo.name : "Unknown",
        count,
        weight,
        massContribution: mass,
        percentage: 0,
      });
    }

    if (totalMass === 0) return null;

    // Calculate mass percentages
    elements.forEach((e) => {
      e.percentage = (e.massContribution / totalMass) * 100;
    });

    return {
      formula: formulaInput.trim(),
      totalMass,
      elements,
    };
  }, [formulaInput]);

  // Molarity calculation
  const molarityResult = useMemo(() => {
    const m = parseFloat(moles);
    const v = parseFloat(volumeL);
    if (isNaN(m) || isNaN(v) || v <= 0) return null;
    const conc = m / v;
    return {
      conc: parseFloat(conc.toFixed(4)),
      formula: `M = moles / Volume = ${m} mol / ${v} L = ${parseFloat(conc.toFixed(4))} M (mol/L)`,
    };
  }, [moles, volumeL]);

  const handleCopyMolar = async () => {
    if (!parsedData) return;
    const text = `Molar Mass for ${parsedData.formula}: ${parsedData.totalMass.toFixed(3)} g/mol
Composition:
${parsedData.elements.map((e) => `- ${e.symbol} (${e.name}): ${e.count} atom(s) × ${e.weight} = ${e.massContribution.toFixed(3)} g/mol (${e.percentage.toFixed(2)}%)`).join("\n")}`;

    const ok = await copyToClipboard(text);
    if (ok) {
      setMolarCopied(true);
      setTimeout(() => setMolarCopied(false), 2000);
    }
  };

  const handleInsertMolar = () => {
    if (!parsedData || !onInsertResult) return;
    onInsertResult(
      `[MOLAR MASS RESULT: ${parsedData.formula} = ${parsedData.totalMass.toFixed(3)} g/mol]`
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Sub-tab Navigation */}
      <div className="flex bg-stone-900 p-1 rounded-xl border border-stone-800 text-xs font-semibold gap-1">
        <button
          onClick={() => setChemSubTab("molar")}
          className={`flex-1 py-2 px-3 rounded-lg transition flex items-center justify-center gap-1.5 ${
            chemSubTab === "molar"
              ? "bg-emerald-500 text-stone-950 font-bold shadow"
              : "text-stone-400 hover:text-white"
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Molar Mass Calculator</span>
        </button>

        <button
          onClick={() => setChemSubTab("balancer")}
          className={`flex-1 py-2 px-3 rounded-lg transition flex items-center justify-center gap-1.5 ${
            chemSubTab === "balancer"
              ? "bg-emerald-500 text-stone-950 font-bold shadow"
              : "text-stone-400 hover:text-white"
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Equation Balancer Helper</span>
        </button>

        <button
          onClick={() => setChemSubTab("molarity")}
          className={`flex-1 py-2 px-3 rounded-lg transition flex items-center justify-center gap-1.5 ${
            chemSubTab === "molarity"
              ? "bg-emerald-500 text-stone-950 font-bold shadow"
              : "text-stone-400 hover:text-white"
          }`}
        >
          <Beaker className="w-3.5 h-3.5" />
          <span>Solution Molarity</span>
        </button>
      </div>

      {/* SUBTAB 1: MOLAR MASS */}
      {chemSubTab === "molar" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>Chemical Formula</span>
              <span className="text-[11px] text-stone-500 font-normal lowercase">
                (supports parentheses e.g. Ca(OH)2, Fe2(SO4)3)
              </span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formulaInput}
                onChange={(e) => setFormulaInput(e.target.value)}
                placeholder="e.g. H2O, C6H12O6, KMnO4, Ca(OH)2"
                className="flex-1 px-4 py-3 sm:px-4.5 sm:py-3.5 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-base focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-inner"
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <span className="text-xs text-stone-400 font-medium block mb-1.5">Common Compounds:</span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_FORMULAS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFormulaInput(f)}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs transition border ${
                    formulaInput === f
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                      : "bg-stone-800/80 text-stone-300 hover:bg-stone-700 border-stone-700/60"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Output Display */}
          {parsedData ? (
            <div className="space-y-4">
              {/* Total Molar Mass Banner */}
              <div className="p-4 rounded-xl bg-stone-950 border border-emerald-500/30 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                    Total Molar Mass
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-white mt-0.5">
                    {parsedData.totalMass.toFixed(3)}{" "}
                    <span className="text-sm font-normal text-stone-400">g/mol</span>
                  </div>
                  <span className="text-xs text-stone-500 font-mono">
                    Compound: {parsedData.formula}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyMolar}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs transition border border-stone-700"
                  >
                    {molarCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{molarCopied ? "Copied" : "Copy Breakdown"}</span>
                  </button>
                  {onInsertResult && (
                    <button
                      onClick={handleInsertMolar}
                      className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Insert in Chat</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Elemental Breakdown Table */}
              <div className="rounded-xl border border-stone-800 overflow-hidden bg-stone-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-900/80 text-stone-400 border-b border-stone-800">
                    <tr>
                      <th className="p-3">Element</th>
                      <th className="p-3">Atomic Wt.</th>
                      <th className="p-3 text-center">Atoms</th>
                      <th className="p-3">Mass Share</th>
                      <th className="p-3 text-right">% by Mass</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60 font-mono text-stone-200">
                    {parsedData.elements.map((e) => (
                      <tr key={e.symbol} className="hover:bg-stone-900/40 transition">
                        <td className="p-3 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-stone-800 flex items-center justify-center font-bold text-emerald-400 text-xs">
                            {e.symbol}
                          </span>
                          <span className="font-sans font-medium text-stone-300">
                            {e.name}
                          </span>
                        </td>
                        <td className="p-3 text-stone-400">{e.weight.toFixed(3)} u</td>
                        <td className="p-3 text-center font-bold text-white">{e.count}</td>
                        <td className="p-3 text-stone-300">
                          {e.massContribution.toFixed(3)} g/mol
                        </td>
                        <td className="p-3 text-right font-bold text-emerald-400">
                          {e.percentage.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-stone-500 bg-stone-950/60 rounded-xl border border-stone-800 text-sm">
              Invalid or unparsed chemical formula. Make sure element symbols use standard uppercase/lowercase (e.g. <span className="text-stone-300 font-mono">NaCl</span>, not <span className="font-mono">nacl</span>).
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: EQUATION BALANCER HELPER */}
      {chemSubTab === "balancer" && (
        <div className="space-y-4">
          <div className="text-xs text-stone-400 leading-relaxed">
            Essential balanced chemical equations with stoichiometric ratios, reaction categories, and reaction mechanisms for academic exams.
          </div>

          <div className="space-y-3">
            {COMMON_REACTIONS.map((r) => (
              <div
                key={r.name}
                className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2 hover:border-emerald-500/40 transition"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-semibold text-stone-200">
                    {r.name}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 text-[10px] font-semibold border border-emerald-800/60">
                    {r.type}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-stone-900 border border-stone-800 font-mono text-sm text-emerald-300 font-bold">
                  {r.balanced}
                </div>

                <p className="text-xs text-stone-400 leading-relaxed">
                  {r.notes}
                </p>

                <div className="flex justify-end pt-1">
                  {onInsertResult && (
                    <button
                      onClick={() => onInsertResult(`[BALANCED EQUATION: ${r.balanced} (${r.name})]`)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition"
                    >
                      <ArrowRight className="w-3 h-3" />
                      <span>Insert in Chat</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: MOLARITY & CONCENTRATION */}
      {chemSubTab === "molarity" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">Moles of Solute (n):</label>
              <input
                type="number"
                step="any"
                value={moles}
                onChange={(e) => setMoles(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-base focus:outline-none focus:border-emerald-500"
                placeholder="moles"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">Solution Volume in Liters (V):</label>
              <input
                type="number"
                step="any"
                value={volumeL}
                onChange={(e) => setVolumeL(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-base focus:outline-none focus:border-emerald-500"
                placeholder="volume in L"
              />
            </div>
          </div>

          {molarityResult && (
            <div className="p-4 rounded-xl bg-stone-950 border border-emerald-500/30 flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                  Molarity (Concentration)
                </span>
                <div className="text-2xl font-bold font-mono text-white mt-0.5">
                  {molarityResult.conc} <span className="text-sm font-normal text-stone-400">M (mol/L)</span>
                </div>
                <span className="text-xs text-stone-500 font-mono">
                  {molarityResult.formula}
                </span>
              </div>

              {onInsertResult && (
                <button
                  onClick={() => onInsertResult(`[MOLARITY RESULT: ${molarityResult.conc} M (${moles} mol in ${volumeL} L)]`)}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Insert in Chat</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Info Callout */}
      <div className="p-3.5 rounded-xl bg-stone-900/60 border border-stone-800 text-xs text-stone-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Atomic masses reference IUPAC standard atomic weights. Molar mass calculations include all stoichiometric parenthetical sub-groups automatically.
        </p>
      </div>
    </div>
  );
};
