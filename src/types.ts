export type AcademicLevel =
  | "Primary School"
  | "Middle School"
  | "High School (Matric/O-Level)"
  | "Intermediate (F.Sc/A-Level)"
  | "Undergraduate (College/University)"
  | "Postgraduate (Masters/Research level)";

export const ACADEMIC_LEVELS: AcademicLevel[] = [
  "Primary School",
  "Middle School",
  "High School (Matric/O-Level)",
  "Intermediate (F.Sc/A-Level)",
  "Undergraduate (College/University)",
  "Postgraduate (Masters/Research level)",
];

export type Subject =
  | "Math"
  | "Physics"
  | "Chemistry"
  | "Biology"
  | "Computer Science"
  | "English"
  | "General Knowledge"
  | "Islamic Studies"
  | "History"
  | "Geography"
  | "Economics"
  | "Business Studies"
  | "Accounting"
  | "Psychology"
  | "Sociology"
  | "Political Science"
  | "Environmental Science"
  | "Statistics"
  | "Astronomy"
  | "Philosophy"
  | "Art & Design"
  | "Music Theory"
  | "Law"
  | "Medicine/Health Science";

export const ALL_SUBJECTS: Subject[] = [
  "Math",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "English",
  "General Knowledge",
  "Islamic Studies",
  "History",
  "Geography",
  "Economics",
  "Business Studies",
  "Accounting",
  "Psychology",
  "Sociology",
  "Political Science",
  "Environmental Science",
  "Statistics",
  "Astronomy",
  "Philosophy",
  "Art & Design",
  "Music Theory",
  "Law",
  "Medicine/Health Science",
];

export type SupportedLanguage =
  | "English"
  | "Urdu"
  | "Roman Urdu"
  | "Spanish"
  | "French"
  | "Chinese (Mandarin)"
  | "Turkish"
  | "Hindi"
  | "Bengali"
  | "Pashto"
  | "Persian/Farsi"
  | "Indonesian"
  | "Russian"
  | "Portuguese"
  | "German"
  | "Arabic";

export const SUPPORTED_LANGUAGES: { name: SupportedLanguage; native: string; bcp47: string }[] = [
  { name: "English", native: "English", bcp47: "en-US" },
  { name: "Urdu", native: "اردو", bcp47: "ur-PK" },
  { name: "Roman Urdu", native: "Roman Urdu", bcp47: "ur-PK" },
  { name: "Hindi", native: "हिन्दी", bcp47: "hi-IN" },
  { name: "Arabic", native: "العربية", bcp47: "ar-SA" },
  { name: "Pashto", native: "پښتو", bcp47: "ps-AF" },
  { name: "Persian/Farsi", native: "فارسی", bcp47: "fa-IR" },
  { name: "Spanish", native: "Español", bcp47: "es-ES" },
  { name: "French", native: "Français", bcp47: "fr-FR" },
  { name: "Chinese (Mandarin)", native: "中文 (普通话)", bcp47: "zh-CN" },
  { name: "Turkish", native: "Türkçe", bcp47: "tr-TR" },
  { name: "Bengali", native: "বাংলা", bcp47: "bn-BD" },
  { name: "Indonesian", native: "Bahasa Indonesia", bcp47: "id-ID" },
  { name: "Russian", native: "Русский", bcp47: "ru-RU" },
  { name: "Portuguese", native: "Português", bcp47: "pt-BR" },
  { name: "German", native: "Deutsch", bcp47: "de-DE" },
];

export type AppTheme =
  | "dark"
  | "light"
  | "emerald"
  | "indigo"
  | "sepia"
  | "ocean"
  | "amethyst"
  | "rose"
  | "sunset"
  | "slate";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: number;
  subject: Subject;
  level: AcademicLevel;
  language: SupportedLanguage;
  mode?: "standard" | "hint" | "compare" | "explain_differently";
  calculatorResult?: string | null;
  userAttempt?: string;
  imagePreview?: string;
  bookmarked?: boolean;
  isEdited?: boolean;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  userSelectedIndex?: number;
}

export interface Flashcard {
  id: number;
  front: string;
  back: string;
  category: string;
}

export interface ExamCountdown {
  id: string;
  title: string;
  subject: Subject;
  date: string; // YYYY-MM-DD
  notes?: string;
}

export interface UserStats {
  streakCount: number;
  lastActiveDate: string; // YYYY-MM-DD
  totalQuestionsAsked: number;
  quizzesCompleted: number;
  flashcardsReviewed: number;
  subjectCounts: Record<string, number>;
  levelCounts: Record<string, number>;
}

export interface FormulaItem {
  id: string;
  subject: Subject;
  topic: string;
  name: string;
  formula: string;
  explanation: string;
  variables?: string;
}

export interface SampleQuestion {
  id: string;
  subject: Subject;
  level: AcademicLevel;
  question: string;
  hintSnippet: string;
  category: string;
}

export type ObjectivePriority = "high" | "medium" | "low";
export type ObjectiveStatus = "in_progress" | "completed" | "paused";

export interface ObjectiveMilestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface LearningObjective {
  id: string;
  subject: Subject;
  title: string;
  description?: string;
  targetQuestions: number;
  currentQuestions: number;
  targetQuizzes: number;
  currentQuizzes: number;
  targetDate?: string; // YYYY-MM-DD
  status: ObjectiveStatus;
  priority: ObjectivePriority;
  milestones: ObjectiveMilestone[];
  createdAt: number;
  completedAt?: number;
  notes?: string;
}
