// Safe LocalStorage utility preventing crashes in sandboxed iframes and quota limits

export function safeGetItem(key: string, defaultValue: string = ""): string {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const val = window.localStorage.getItem(key);
      return val !== null ? val : defaultValue;
    }
  } catch (err) {
    console.warn(`safeGetItem failed for key "${key}":`, err);
  }
  return defaultValue;
}

export function safeSetItem(key: string, value: string): boolean {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
      return true;
    }
  } catch (err) {
    console.warn(`safeSetItem failed for key "${key}":`, err);
    // If quota exceeded, attempt to prune old chat messages
    try {
      if (key === "studymate_chat_history") {
        window.localStorage.removeItem("studymate_chat_history");
      }
    } catch {}
  }
  return false;
}

export function safeGetJSON<T>(key: string, fallback: T): T {
  try {
    const raw = safeGetItem(key, "");
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`safeGetJSON parsing error for key "${key}":`, err);
    return fallback;
  }
}

export function safeSetJSON<T>(key: string, value: T): boolean {
  try {
    return safeSetItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`safeSetJSON serialization error for key "${key}":`, err);
    return false;
  }
}
