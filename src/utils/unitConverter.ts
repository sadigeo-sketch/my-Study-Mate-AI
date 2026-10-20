export interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  factorToBase: number; // For linear conversion: baseValue = val * factorToBase
}

export type UnitCategory =
  | "length"
  | "mass"
  | "temperature"
  | "currency"
  | "speed"
  | "time"
  | "area"
  | "volume"
  | "pressure"
  | "energy"
  | "power"
  | "digital";

export interface CategoryDefinition {
  id: UnitCategory;
  name: string;
  baseUnit: string;
  units: UnitDefinition[];
}

export const UNIT_CATEGORIES: CategoryDefinition[] = [
  {
    id: "length",
    name: "Length & Distance",
    baseUnit: "m",
    units: [
      { id: "km", name: "Kilometer", symbol: "km", factorToBase: 1000 },
      { id: "m", name: "Meter", symbol: "m", factorToBase: 1 },
      { id: "cm", name: "Centimeter", symbol: "cm", factorToBase: 0.01 },
      { id: "mm", name: "Millimeter", symbol: "mm", factorToBase: 0.001 },
      { id: "um", name: "Micrometer", symbol: "µm", factorToBase: 1e-6 },
      { id: "nm", name: "Nanometer", symbol: "nm", factorToBase: 1e-9 },
      { id: "mi", name: "Mile", symbol: "mi", factorToBase: 1609.344 },
      { id: "yd", name: "Yard", symbol: "yd", factorToBase: 0.9144 },
      { id: "ft", name: "Foot", symbol: "ft", factorToBase: 0.3048 },
      { id: "in", name: "Inch", symbol: "in", factorToBase: 0.0254 },
      { id: "nmi", name: "Nautical Mile", symbol: "NM", factorToBase: 1852 },
    ],
  },
  {
    id: "mass",
    name: "Mass & Weight",
    baseUnit: "kg",
    units: [
      { id: "t", name: "Metric Ton", symbol: "t", factorToBase: 1000 },
      { id: "kg", name: "Kilogram", symbol: "kg", factorToBase: 1 },
      { id: "g", name: "Gram", symbol: "g", factorToBase: 0.001 },
      { id: "mg", name: "Milligram", symbol: "mg", factorToBase: 1e-6 },
      { id: "ug", name: "Microgram", symbol: "µg", factorToBase: 1e-9 },
      { id: "lb", name: "Pound (Avoirdupois)", symbol: "lb", factorToBase: 0.45359237 },
      { id: "oz", name: "Ounce", symbol: "oz", factorToBase: 0.028349523125 },
      { id: "st", name: "Stone", symbol: "st", factorToBase: 6.35029318 },
    ],
  },
  {
    id: "temperature",
    name: "Temperature",
    baseUnit: "C",
    units: [
      { id: "c", name: "Celsius", symbol: "°C", factorToBase: 1 },
      { id: "f", name: "Fahrenheit", symbol: "°F", factorToBase: 1 },
      { id: "k", name: "Kelvin", symbol: "K", factorToBase: 1 },
    ],
  },
  {
    id: "currency",
    name: "Currency (Benchmark Forex)",
    baseUnit: "USD",
    units: [
      { id: "usd", name: "US Dollar", symbol: "$", factorToBase: 1 },
      { id: "eur", name: "Euro", symbol: "€", factorToBase: 1.085 },
      { id: "gbp", name: "British Pound", symbol: "£", factorToBase: 1.285 },
      { id: "pkr", name: "Pakistani Rupee", symbol: "PKR", factorToBase: 0.0036 },
      { id: "inr", name: "Indian Rupee", symbol: "₹", factorToBase: 0.012 },
      { id: "aed", name: "UAE Dirham", symbol: "AED", factorToBase: 0.2723 },
      { id: "sar", name: "Saudi Riyal", symbol: "SAR", factorToBase: 0.2666 },
      { id: "cad", name: "Canadian Dollar", symbol: "C$", factorToBase: 0.735 },
      { id: "aud", name: "Australian Dollar", symbol: "A$", factorToBase: 0.655 },
      { id: "jpy", name: "Japanese Yen", symbol: "¥", factorToBase: 0.0067 },
      { id: "cny", name: "Chinese Yuan", symbol: "¥", factorToBase: 0.138 },
      { id: "chf", name: "Swiss Franc", symbol: "CHF", factorToBase: 1.125 },
    ],
  },
  {
    id: "speed",
    name: "Speed & Velocity",
    baseUnit: "m/s",
    units: [
      { id: "mps", name: "Meters per second", symbol: "m/s", factorToBase: 1 },
      { id: "kmh", name: "Kilometers per hour", symbol: "km/h", factorToBase: 1 / 3.6 },
      { id: "mph", name: "Miles per hour", symbol: "mph", factorToBase: 0.44704 },
      { id: "fps", name: "Feet per second", symbol: "ft/s", factorToBase: 0.3048 },
      { id: "knot", name: "Knot", symbol: "kt", factorToBase: 0.514444 },
      { id: "mach", name: "Mach (speed of sound in air)", symbol: "Mach", factorToBase: 343 },
    ],
  },
  {
    id: "time",
    name: "Time",
    baseUnit: "s",
    units: [
      { id: "ms", name: "Millisecond", symbol: "ms", factorToBase: 0.001 },
      { id: "s", name: "Second", symbol: "s", factorToBase: 1 },
      { id: "min", name: "Minute", symbol: "min", factorToBase: 60 },
      { id: "hr", name: "Hour", symbol: "hr", factorToBase: 3600 },
      { id: "day", name: "Day", symbol: "d", factorToBase: 86400 },
      { id: "week", name: "Week", symbol: "wk", factorToBase: 604800 },
      { id: "year", name: "Year (Julian)", symbol: "yr", factorToBase: 31557600 },
    ],
  },
  {
    id: "area",
    name: "Area",
    baseUnit: "m2",
    units: [
      { id: "km2", name: "Square Kilometer", symbol: "km²", factorToBase: 1e6 },
      { id: "m2", name: "Square Meter", symbol: "m²", factorToBase: 1 },
      { id: "cm2", name: "Square Centimeter", symbol: "cm²", factorToBase: 0.0001 },
      { id: "mm2", name: "Square Millimeter", symbol: "mm²", factorToBase: 1e-6 },
      { id: "ha", name: "Hectare", symbol: "ha", factorToBase: 10000 },
      { id: "acre", name: "Acre", symbol: "ac", factorToBase: 4046.8564224 },
      { id: "sqmi", name: "Square Mile", symbol: "sq mi", factorToBase: 2589988.110336 },
      { id: "sqft", name: "Square Foot", symbol: "sq ft", factorToBase: 0.09290304 },
      { id: "sqin", name: "Square Inch", symbol: "sq in", factorToBase: 0.00064516 },
    ],
  },
  {
    id: "volume",
    name: "Volume & Capacity",
    baseUnit: "L",
    units: [
      { id: "m3", name: "Cubic Meter", symbol: "m³", factorToBase: 1000 },
      { id: "L", name: "Liter", symbol: "L", factorToBase: 1 },
      { id: "mL", name: "Milliliter", symbol: "mL", factorToBase: 0.001 },
      { id: "gal", name: "US Gallon", symbol: "US gal", factorToBase: 3.785411784 },
      { id: "qt", name: "US Quart", symbol: "US qt", factorToBase: 0.946352946 },
      { id: "pt", name: "US Pint", symbol: "US pt", factorToBase: 0.473176473 },
      { id: "cup", name: "US Cup", symbol: "cup", factorToBase: 0.2365882365 },
      { id: "floz", name: "US Fluid Ounce", symbol: "fl oz", factorToBase: 0.0295735295625 },
    ],
  },
  {
    id: "pressure",
    name: "Pressure",
    baseUnit: "Pa",
    units: [
      { id: "pa", name: "Pascal", symbol: "Pa", factorToBase: 1 },
      { id: "kpa", name: "Kilopascal", symbol: "kPa", factorToBase: 1000 },
      { id: "bar", name: "Bar", symbol: "bar", factorToBase: 100000 },
      { id: "atm", name: "Atmosphere", symbol: "atm", factorToBase: 101325 },
      { id: "mmhg", name: "Millimeter of Mercury (Torr)", symbol: "mmHg", factorToBase: 133.322387415 },
      { id: "psi", name: "Pounds per Square Inch", symbol: "psi", factorToBase: 6894.757293 },
    ],
  },
  {
    id: "energy",
    name: "Energy & Work",
    baseUnit: "J",
    units: [
      { id: "j", name: "Joule", symbol: "J", factorToBase: 1 },
      { id: "kj", name: "Kilojoule", symbol: "kJ", factorToBase: 1000 },
      { id: "cal", name: "Gram Calorie", symbol: "cal", factorToBase: 4.184 },
      { id: "kcal", name: "Kilocalorie (Food cal)", symbol: "kcal", factorToBase: 4184 },
      { id: "wh", name: "Watt-hour", symbol: "Wh", factorToBase: 3600 },
      { id: "kwh", name: "Kilowatt-hour", symbol: "kWh", factorToBase: 3600000 },
      { id: "ev", name: "Electron-volt", symbol: "eV", factorToBase: 1.602176634e-19 },
      { id: "btu", name: "British Thermal Unit", symbol: "BTU", factorToBase: 1055.056 },
    ],
  },
  {
    id: "power",
    name: "Power",
    baseUnit: "W",
    units: [
      { id: "w", name: "Watt", symbol: "W", factorToBase: 1 },
      { id: "kw", name: "Kilowatt", symbol: "kW", factorToBase: 1000 },
      { id: "mw", name: "Megawatt", symbol: "MW", factorToBase: 1000000 },
      { id: "hp", name: "Mechanical Horsepower", symbol: "hp", factorToBase: 745.699872 },
    ],
  },
  {
    id: "digital",
    name: "Digital Data Storage",
    baseUnit: "B",
    units: [
      { id: "b", name: "Bit", symbol: "bit", factorToBase: 0.125 },
      { id: "B", name: "Byte", symbol: "B", factorToBase: 1 },
      { id: "KB", name: "Kilobyte (SI)", symbol: "KB", factorToBase: 1000 },
      { id: "KiB", name: "Kibibyte (Binary)", symbol: "KiB", factorToBase: 1024 },
      { id: "MB", name: "Megabyte (SI)", symbol: "MB", factorToBase: 1e6 },
      { id: "MiB", name: "Mebibyte (Binary)", symbol: "MiB", factorToBase: 1048576 },
      { id: "GB", name: "Gigabyte (SI)", symbol: "GB", factorToBase: 1e9 },
      { id: "GiB", name: "Gibibyte (Binary)", symbol: "GiB", factorToBase: 1073741824 },
      { id: "TB", name: "Terabyte (SI)", symbol: "TB", factorToBase: 1e12 },
    ],
  },
];

/**
 * Convert value between units in the same category
 */
export function convertUnit(
  value: number,
  fromUnitId: string,
  toUnitId: string,
  categoryId: UnitCategory
): { result: number; formatted: string; formulaExplanation: string } {
  if (isNaN(value)) {
    return { result: 0, formatted: "0", formulaExplanation: "Invalid input" };
  }

  if (categoryId === "temperature") {
    return convertTemperature(value, fromUnitId, toUnitId);
  }

  const cat = UNIT_CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) {
    return { result: value, formatted: String(value), formulaExplanation: "Unknown category" };
  }

  const fromUnit = cat.units.find((u) => u.id === fromUnitId);
  const toUnit = cat.units.find((u) => u.id === toUnitId);

  if (!fromUnit || !toUnit) {
    return { result: value, formatted: String(value), formulaExplanation: "Unknown unit" };
  }

  // Linear conversion via base unit
  const valueInBase = value * fromUnit.factorToBase;
  const converted = valueInBase / toUnit.factorToBase;

  // Format smartly
  let formatted: string;
  if (converted === 0) {
    formatted = "0";
  } else if (Math.abs(converted) >= 1e6 || Math.abs(converted) < 1e-4) {
    formatted = converted.toExponential(6);
  } else {
    // Up to 8 decimal places without trailing zeroes
    formatted = parseFloat(converted.toFixed(8)).toString();
  }

  const ratio = fromUnit.factorToBase / toUnit.factorToBase;
  const ratioStr =
    ratio >= 1e6 || ratio < 1e-4 ? ratio.toExponential(4) : parseFloat(ratio.toFixed(6)).toString();

  const formulaExplanation = `1 ${fromUnit.symbol} = ${ratioStr} ${toUnit.symbol}`;

  return { result: converted, formatted, formulaExplanation };
}

function convertTemperature(
  value: number,
  fromId: string,
  toId: string
): { result: number; formatted: string; formulaExplanation: string } {
  let celsius = value;

  // Convert to Celsius
  if (fromId === "c") {
    celsius = value;
  } else if (fromId === "f") {
    celsius = ((value - 32) * 5) / 9;
  } else if (fromId === "k") {
    celsius = value - 273.15;
  }

  // Convert from Celsius to Target
  let finalVal = celsius;
  let formula = "";

  if (toId === "c") {
    finalVal = celsius;
    if (fromId === "f") formula = `(°F - 32) × 5/9`;
    else if (fromId === "k") formula = `K - 273.15`;
    else formula = `Same unit`;
  } else if (toId === "f") {
    finalVal = (celsius * 9) / 5 + 32;
    if (fromId === "c") formula = `(°C × 9/5) + 32`;
    else if (fromId === "k") formula = `(K - 273.15) × 9/5 + 32`;
    else formula = `Same unit`;
  } else if (toId === "k") {
    finalVal = celsius + 273.15;
    if (fromId === "c") formula = `°C + 273.15`;
    else if (fromId === "f") formula = `(°F - 32) × 5/9 + 273.15`;
    else formula = `Same unit`;
  }

  const formatted = parseFloat(finalVal.toFixed(4)).toString();
  return { result: finalVal, formatted, formulaExplanation: formula };
}
