import React, { useState, useMemo } from "react";
import {
  X,
  Target,
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  Flame,
  Award,
  BookOpen,
  Trophy,
  Trash2,
  Edit3,
  Search,
  Filter,
  Check,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import {
  Subject,
  ALL_SUBJECTS,
  LearningObjective,
  ObjectivePriority,
  ObjectiveStatus,
  ObjectiveMilestone,
} from "../types";

interface LearningObjectivesModalProps {
  isOpen: boolean;
  onClose: () => void;
  objectives: LearningObjective[];
  onAddObjective: (objective: Omit<LearningObjective, "id" | "createdAt">) => void;
  onUpdateObjective: (objective: LearningObjective) => void;
  onDeleteObjective: (id: string) => void;
  onPracticeSubject: (subject: Subject, topic?: string) => void;
  onTakeQuizForSubject: (subject: Subject, topic?: string) => void;
  onResetDefaults?: () => void;
}

export const LearningObjectivesModal: React.FC<LearningObjectivesModalProps> = ({
  isOpen,
  onClose,
  objectives,
  onAddObjective,
  onUpdateObjective,
  onDeleteObjective,
  onPracticeSubject,
  onTakeQuizForSubject,
  onResetDefaults,
}) => {
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("all"); // "all" | "in_progress" | "completed" | "high"
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<LearningObjective | null>(null);

  // Form State
  const [formSubject, setFormSubject] = useState<Subject>("Math");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formTargetQuestions, setFormTargetQuestions] = useState(10);
  const [formTargetQuizzes, setFormTargetQuizzes] = useState(1);
  const [formTargetDate, setFormTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  });
  const [formPriority, setFormPriority] = useState<ObjectivePriority>("high");
  const [formMilestones, setFormMilestones] = useState<string[]>([""]);
  const [formNotes, setFormNotes] = useState("");

  if (!isOpen) return null;

  // Open Form for creating new
  const handleOpenCreateForm = () => {
    setEditingObjective(null);
    setFormSubject("Math");
    setFormTitle("");
    setFormDescription("");
    setFormTargetQuestions(10);
    setFormTargetQuizzes(1);
    const d = new Date();
    d.setDate(d.getDate() + 14);
    setFormTargetDate(d.toISOString().split("T")[0]);
    setFormPriority("high");
    setFormMilestones([""]);
    setFormNotes("");
    setIsFormOpen(true);
  };

  // Open Form for editing existing
  const handleOpenEditForm = (obj: LearningObjective) => {
    setEditingObjective(obj);
    setFormSubject(obj.subject);
    setFormTitle(obj.title);
    setFormDescription(obj.description || "");
    setFormTargetQuestions(obj.targetQuestions);
    setFormTargetQuizzes(obj.targetQuizzes || 1);
    setFormTargetDate(obj.targetDate || "");
    setFormPriority(obj.priority);
    setFormMilestones(
      obj.milestones && obj.milestones.length > 0
        ? obj.milestones.map((m) => m.title)
        : [""]
    );
    setFormNotes(obj.notes || "");
    setIsFormOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const cleanedMilestones: ObjectiveMilestone[] = formMilestones
      .map((t) => t.trim())
      .filter(Boolean)
      .map((title, idx) => {
        // If editing, try to keep existing completed state if matching
        if (editingObjective && editingObjective.milestones[idx]) {
          return {
            id: editingObjective.milestones[idx].id,
            title,
            completed: editingObjective.milestones[idx].completed,
          };
        }
        return {
          id: "m-" + Date.now() + "-" + idx,
          title,
          completed: false,
        };
      });

    if (editingObjective) {
      onUpdateObjective({
        ...editingObjective,
        subject: formSubject,
        title: formTitle.trim(),
        description: formDescription.trim(),
        targetQuestions: Math.max(1, formTargetQuestions),
        targetQuizzes: Math.max(0, formTargetQuizzes),
        targetDate: formTargetDate,
        priority: formPriority,
        milestones: cleanedMilestones,
        notes: formNotes.trim(),
      });
    } else {
      onAddObjective({
        subject: formSubject,
        title: formTitle.trim(),
        description: formDescription.trim(),
        targetQuestions: Math.max(1, formTargetQuestions),
        currentQuestions: 0,
        targetQuizzes: Math.max(0, formTargetQuizzes),
        currentQuizzes: 0,
        targetDate: formTargetDate,
        status: "in_progress",
        priority: formPriority,
        milestones: cleanedMilestones,
        notes: formNotes.trim(),
      });
    }

    setIsFormOpen(false);
    setEditingObjective(null);
  };

  // Milestone check toggle
  const handleToggleMilestone = (obj: LearningObjective, milestoneId: string) => {
    const updatedMilestones = obj.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );

    // If all milestones and targets are completed, maybe auto mark complete
    const allMilestonesDone = updatedMilestones.every((m) => m.completed);
    const questionsDone = obj.currentQuestions >= obj.targetQuestions;
    const quizzesDone = (obj.currentQuizzes || 0) >= (obj.targetQuizzes || 0);

    const isNowComplete = allMilestonesDone && questionsDone && quizzesDone;

    onUpdateObjective({
      ...obj,
      milestones: updatedMilestones,
      status: isNowComplete ? "completed" : obj.status,
      completedAt: isNowComplete ? Date.now() : obj.completedAt,
    });
  };

  // Adjust question count
  const handleAdjustQuestions = (obj: LearningObjective, delta: number) => {
    const newCount = Math.max(0, obj.currentQuestions + delta);
    const isNowComplete =
      newCount >= obj.targetQuestions &&
      (obj.currentQuizzes || 0) >= (obj.targetQuizzes || 0) &&
      obj.milestones.every((m) => m.completed);

    onUpdateObjective({
      ...obj,
      currentQuestions: newCount,
      status: isNowComplete ? "completed" : obj.status === "completed" ? "in_progress" : obj.status,
      completedAt: isNowComplete ? Date.now() : undefined,
    });
  };

  // Adjust quiz count
  const handleAdjustQuizzes = (obj: LearningObjective, delta: number) => {
    const newCount = Math.max(0, (obj.currentQuizzes || 0) + delta);
    const isNowComplete =
      obj.currentQuestions >= obj.targetQuestions &&
      newCount >= (obj.targetQuizzes || 0) &&
      obj.milestones.every((m) => m.completed);

    onUpdateObjective({
      ...obj,
      currentQuizzes: newCount,
      status: isNowComplete ? "completed" : obj.status === "completed" ? "in_progress" : obj.status,
      completedAt: isNowComplete ? Date.now() : undefined,
    });
  };

  // Toggle status (in_progress vs completed)
  const handleToggleStatus = (obj: LearningObjective) => {
    const newStatus: ObjectiveStatus = obj.status === "completed" ? "in_progress" : "completed";
    onUpdateObjective({
      ...obj,
      status: newStatus,
      completedAt: newStatus === "completed" ? Date.now() : undefined,
    });
  };

  // Calculate overall completion percentage for an objective
  const getObjectiveProgress = (obj: LearningObjective): number => {
    let components = 0;
    let totalScore = 0;

    // Questions part
    if (obj.targetQuestions > 0) {
      components += 1;
      totalScore += Math.min(1, obj.currentQuestions / obj.targetQuestions);
    }

    // Quizzes part
    if (obj.targetQuizzes && obj.targetQuizzes > 0) {
      components += 1;
      totalScore += Math.min(1, (obj.currentQuizzes || 0) / obj.targetQuizzes);
    }

    // Milestones part
    if (obj.milestones && obj.milestones.length > 0) {
      components += 1;
      const completedCount = obj.milestones.filter((m) => m.completed).length;
      totalScore += completedCount / obj.milestones.length;
    }

    if (components === 0) return 0;
    return Math.round((totalScore / components) * 100);
  };

  // Filtered Objectives
  const filteredObjectives = useMemo(() => {
    return objectives.filter((obj) => {
      // Subject filter
      if (selectedSubjectFilter !== "All" && obj.subject !== selectedSubjectFilter) {
        return false;
      }
      // Status filter
      if (statusFilter === "in_progress" && obj.status !== "in_progress") {
        return false;
      }
      if (statusFilter === "completed" && obj.status !== "completed") {
        return false;
      }
      if (statusFilter === "high" && obj.priority !== "high") {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = obj.title.toLowerCase().includes(q);
        const matchesDesc = (obj.description || "").toLowerCase().includes(q);
        const matchesSubj = obj.subject.toLowerCase().includes(q);
        const matchesMilestone = obj.milestones.some((m) => m.title.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesSubj && !matchesMilestone) {
          return false;
        }
      }
      return true;
    });
  }, [objectives, selectedSubjectFilter, statusFilter, searchQuery]);

  // Overall Statistics
  const stats = useMemo(() => {
    const total = objectives.length;
    const completed = objectives.filter((o) => o.status === "completed").length;
    const inProgress = objectives.filter((o) => o.status === "in_progress").length;
    const totalProgressSum = objectives.reduce((sum, o) => sum + getObjectiveProgress(o), 0);
    const avgProgress = total > 0 ? Math.round(totalProgressSum / total) : 0;
    return { total, completed, inProgress, avgProgress };
  }, [objectives]);

  // Format deadline date nicely
  const formatDeadline = (dateStr?: string) => {
    if (!dateStr) return null;
    const target = new Date(dateStr + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `Overdue by ${Math.abs(diffDays)}d`, color: "text-rose-400 bg-rose-500/10 border-rose-500/30" };
    }
    if (diffDays === 0) {
      return { text: "Due today!", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" };
    }
    if (diffDays === 1) {
      return { text: "Due tomorrow", color: "text-amber-300 bg-amber-500/10 border-amber-500/30" };
    }
    return { text: `${diffDays} days left`, color: "text-stone-300 bg-stone-800 border-stone-700" };
  };

  return (
    <div
      id="objectives-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-fade-in"
    >
      <div
        id="objectives-dialog"
        className="w-full max-w-4xl bg-stone-900 border border-stone-700 text-stone-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-stone-950 shadow-md shadow-amber-950/40">
              <Target className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Learning Objectives &amp; Subject Goals
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {stats.inProgress} Active
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Set targeted learning milestones, solve problems, and track deep mastery over time
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="new-goal-top-btn"
              onClick={handleOpenCreateForm}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Set New Goal</span>
            </button>
            <button
              id="close-objectives-btn"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Overview Metrics Cards */}
        <div className="px-6 py-4 bg-stone-950/40 border-b border-stone-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-stone-800/60 border border-stone-700/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold font-mono text-white leading-tight">
                {stats.total}
              </div>
              <div className="text-[11px] text-stone-400">Total Goals</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-stone-800/60 border border-stone-700/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold font-mono text-white leading-tight">
                {stats.inProgress}
              </div>
              <div className="text-[11px] text-stone-400">In Progress</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-stone-800/60 border border-stone-700/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold font-mono text-white leading-tight">
                {stats.completed}
              </div>
              <div className="text-[11px] text-stone-400">Completed</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-stone-800/60 border border-stone-700/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Award className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold font-mono text-white leading-tight">
                  {stats.avgProgress}%
                </span>
                <span className="text-[10px] text-purple-300 font-mono">Mastery</span>
              </div>
              <div className="w-full bg-stone-700/60 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-gradient-to-r from-purple-500 to-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.avgProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="px-6 py-3 border-b border-stone-800 bg-stone-900 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-xl border border-stone-800">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                statusFilter === "all"
                  ? "bg-amber-500 text-stone-950 font-semibold"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              All ({objectives.length})
            </button>
            <button
              onClick={() => setStatusFilter("in_progress")}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                statusFilter === "in_progress"
                  ? "bg-amber-500 text-stone-950 font-semibold"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              Active ({stats.inProgress})
            </button>
            <button
              onClick={() => setStatusFilter("completed")}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                statusFilter === "completed"
                  ? "bg-amber-500 text-stone-950 font-semibold"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              Completed ({stats.completed})
            </button>
            <button
              onClick={() => setStatusFilter("high")}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                statusFilter === "high"
                  ? "bg-amber-500 text-stone-950 font-semibold"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              High Priority
            </button>
          </div>

          <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
            {/* Subject Selector */}
            <div className="relative">
              <select
                id="objective-subject-filter"
                value={selectedSubjectFilter}
                onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="All">All Subjects</option>
                {ALL_SUBJECTS.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search goals..."
                className="pl-8 pr-2.5 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 text-xs placeholder-stone-500 focus:outline-none focus:border-amber-500 w-36 sm:w-48"
              />
            </div>
          </div>
        </div>

        {/* Modal Body: Objectives List or Create/Edit Form */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {isFormOpen ? (
            /* CREATE / EDIT FORM */
            <form
              onSubmit={handleSaveForm}
              className="p-5 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-4 animate-scale-up"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">
                    {editingObjective ? "Edit Learning Objective" : "Set New Subject Goal"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="text-xs text-stone-400 hover:text-stone-200"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Subject Selector */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Subject <span className="text-rose-400">*</span>
                  </label>
                  <select
                    id="form-objective-subject"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value as Subject)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
                  >
                    {ALL_SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority Selector */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Priority Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["high", "medium", "low"] as ObjectivePriority[]).map((p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setFormPriority(p)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-medium capitalize border transition ${
                          formPriority === p
                            ? p === "high"
                              ? "bg-rose-500/20 border-rose-500 text-rose-300 font-bold"
                              : p === "medium"
                              ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold"
                              : "bg-blue-500/20 border-blue-500 text-blue-300 font-bold"
                            : "bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Goal / Objective Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  id="form-objective-title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Master Calculus Integration & Area Under Curves"
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Key Focus &amp; Summary (Optional)
                </label>
                <textarea
                  rows={2}
                  id="form-objective-desc"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. Focus on trigonometric substitution, integration by parts, and definite integrals."
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-200 text-xs focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* Target Practice Numbers & Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Questions count */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Target Questions
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    id="form-objective-target-q"
                    value={formTargetQuestions}
                    onChange={(e) => setFormTargetQuestions(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-200 text-xs focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <div className="flex gap-1.5 mt-1">
                    {[5, 10, 15, 20].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setFormTargetQuestions(num)}
                        className={`text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 hover:bg-stone-700 ${
                          formTargetQuestions === num ? "text-amber-400 font-bold bg-amber-500/20" : ""
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quizzes count */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Target Quizzes
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    id="form-objective-target-quiz"
                    value={formTargetQuizzes}
                    onChange={(e) => setFormTargetQuizzes(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-200 text-xs focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <div className="flex gap-1.5 mt-1">
                    {[1, 2, 3, 5].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setFormTargetQuizzes(num)}
                        className={`text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 hover:bg-stone-700 ${
                          formTargetQuizzes === num ? "text-amber-400 font-bold bg-amber-500/20" : ""
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Deadline */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Target Deadline
                  </label>
                  <input
                    type="date"
                    id="form-objective-target-date"
                    value={formTargetDate}
                    onChange={(e) => setFormTargetDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Milestones / Sub-goals */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-stone-300">
                    Step-by-Step Milestones
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormMilestones((prev) => [...prev, ""])}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3 h-3" /> Add Step
                  </button>
                </div>
                <div className="space-y-2">
                  {formMilestones.map((milestoneText, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs font-mono text-stone-500 w-5 text-right">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={milestoneText}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormMilestones((prev) => {
                            const updated = [...prev];
                            updated[idx] = val;
                            return updated;
                          });
                        }}
                        placeholder={`e.g. Master milestone step ${idx + 1}`}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
                      />
                      {formMilestones.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setFormMilestones((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="p-1.5 text-stone-500 hover:text-rose-400 rounded-lg hover:bg-stone-800 transition"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-objective-btn"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition shadow-md shadow-amber-950/40"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingObjective ? "Save Changes" : "Create Learning Goal"}</span>
                </button>
              </div>
            </form>
          ) : null}

          {/* LIST OF OBJECTIVES */}
          {filteredObjectives.length === 0 ? (
            <div className="p-10 rounded-2xl bg-stone-950/40 border border-stone-800 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-stone-800/80 border border-stone-700 flex items-center justify-center text-stone-400">
                <Target className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">No Learning Objectives Found</h4>
                <p className="text-xs text-stone-400 max-w-sm mx-auto mt-1">
                  {searchQuery || selectedSubjectFilter !== "All" || statusFilter !== "all"
                    ? "Try adjusting your subject filter or search query."
                    : "Set specific targets for each subject, track practice problems, and achieve mastery step-by-step!"}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleOpenCreateForm}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Set Your First Goal</span>
                </button>
                {onResetDefaults && objectives.length === 0 && (
                  <button
                    onClick={onResetDefaults}
                    className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition"
                  >
                    Load Sample Goals
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredObjectives.map((obj) => {
                const progress = getObjectiveProgress(obj);
                const deadline = formatDeadline(obj.targetDate);
                const isCompleted = obj.status === "completed" || progress >= 100;

                return (
                  <div
                    key={obj.id}
                    id={`objective-card-${obj.id}`}
                    className={`p-5 rounded-2xl border transition-all duration-200 space-y-4 ${
                      isCompleted
                        ? "bg-gradient-to-br from-stone-900/90 to-emerald-950/20 border-emerald-500/30"
                        : "bg-stone-900/80 border-stone-700/80 hover:border-stone-600"
                    }`}
                  >
                    {/* Top Row: Subject Badge, Title, Priority, Status, Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Status Checkbox toggle */}
                        <button
                          onClick={() => handleToggleStatus(obj)}
                          className={`mt-0.5 p-1 rounded-lg border transition ${
                            isCompleted
                              ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 hover:bg-emerald-500/30"
                              : "bg-stone-800 border-stone-700 text-stone-400 hover:text-stone-200"
                          }`}
                          title={isCompleted ? "Mark as in-progress" : "Mark as completed"}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            {/* Subject tag */}
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              {obj.subject}
                            </span>

                            {/* Priority tag */}
                            <span
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider border ${
                                obj.priority === "high"
                                  ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                                  : obj.priority === "medium"
                                  ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                  : "bg-blue-500/15 text-blue-300 border-blue-500/30"
                              }`}
                            >
                              {obj.priority} Priority
                            </span>

                            {/* Deadline tag */}
                            {deadline && (
                              <span
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border flex items-center gap-1 ${deadline.color}`}
                              >
                                <Calendar className="w-3 h-3" />
                                <span>{deadline.text}</span>
                              </span>
                            )}

                            {isCompleted && (
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-emerald-400" />
                                <span>Goal Achieved</span>
                              </span>
                            )}
                          </div>

                          <h3
                            className={`text-sm sm:text-base font-bold tracking-tight text-white ${
                              isCompleted ? "line-through text-stone-300" : ""
                            }`}
                          >
                            {obj.title}
                          </h3>

                          {obj.description && (
                            <p className="text-xs text-stone-400 mt-0.5 line-clamp-2">
                              {obj.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Quick Controls */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <button
                          onClick={() => handleOpenEditForm(obj)}
                          className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-750 border border-stone-700 text-stone-400 hover:text-stone-200 transition"
                          title="Edit Objective"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteObjective(obj.id)}
                          className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-rose-950/40 border border-stone-700 hover:border-rose-700/50 text-stone-400 hover:text-rose-400 transition"
                          title="Delete Objective"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar & Numerical Metrics */}
                    <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-4">
                          {/* Questions counter with quick increment */}
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-stone-300 font-medium">Questions:</span>
                            <span className="font-mono font-bold text-white">
                              {obj.currentQuestions} / {obj.targetQuestions}
                            </span>
                            <div className="flex items-center ml-1 gap-0.5">
                              <button
                                onClick={() => handleAdjustQuestions(obj, -1)}
                                disabled={obj.currentQuestions <= 0}
                                className="w-4 h-4 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-300 text-[10px] flex items-center justify-center font-bold"
                                title="Decrement question count"
                              >
                                -
                              </button>
                              <button
                                onClick={() => handleAdjustQuestions(obj, 1)}
                                className="w-4 h-4 rounded bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-stone-300 text-[10px] flex items-center justify-center font-bold transition"
                                title="Add 1 solved question"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Quizzes counter */}
                          {obj.targetQuizzes > 0 && (
                            <div className="flex items-center gap-1.5">
                              <Trophy className="w-3.5 h-3.5 text-purple-400" />
                              <span className="text-stone-300 font-medium">Quizzes:</span>
                              <span className="font-mono font-bold text-white">
                                {obj.currentQuizzes || 0} / {obj.targetQuizzes}
                              </span>
                              <div className="flex items-center ml-1 gap-0.5">
                                <button
                                  onClick={() => handleAdjustQuizzes(obj, -1)}
                                  disabled={(obj.currentQuizzes || 0) <= 0}
                                  className="w-4 h-4 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-300 text-[10px] flex items-center justify-center font-bold"
                                  title="Decrement quiz count"
                                >
                                  -
                                </button>
                                <button
                                  onClick={() => handleAdjustQuizzes(obj, 1)}
                                  className="w-4 h-4 rounded bg-stone-800 hover:bg-purple-500 hover:text-white text-stone-300 text-[10px] flex items-center justify-center font-bold transition"
                                  title="Add 1 completed quiz"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Completion Percentage */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-stone-400 font-medium">Progress:</span>
                          <span
                            className={`font-mono font-extrabold text-sm ${
                              progress >= 100 ? "text-emerald-400" : "text-amber-400"
                            }`}
                          >
                            {progress}%
                          </span>
                        </div>
                      </div>

                      {/* Visual progress bar */}
                      <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            progress >= 100
                              ? "bg-emerald-400 shadow-sm shadow-emerald-500/50"
                              : "bg-gradient-to-r from-amber-500 to-orange-400"
                          }`}
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>
                    </div>

                    {/* Step-by-step Milestones Checklist */}
                    {obj.milestones && obj.milestones.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider flex items-center justify-between">
                          <span>Milestones Checklist</span>
                          <span className="text-[10px] font-mono text-stone-500">
                            {obj.milestones.filter((m) => m.completed).length} / {obj.milestones.length} done
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {obj.milestones.map((m) => (
                            <div
                              key={m.id}
                              onClick={() => handleToggleMilestone(obj, m.id)}
                              className={`flex items-start gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition ${
                                m.completed
                                  ? "bg-emerald-950/20 border-emerald-500/30 text-stone-300"
                                  : "bg-stone-950/50 border-stone-800 hover:border-stone-700 text-stone-300 hover:text-white"
                              }`}
                            >
                              <div className="mt-0.5">
                                {m.completed ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <Circle className="w-4 h-4 text-stone-500 hover:text-stone-300" />
                                )}
                              </div>
                              <span className={`flex-1 ${m.completed ? "line-through text-stone-400" : ""}`}>
                                {m.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes (if any) */}
                    {obj.notes && (
                      <div className="p-2.5 rounded-xl bg-stone-950/40 border border-stone-800/80 text-[11px] text-stone-400 flex items-start gap-2">
                        <span className="text-amber-400 font-bold uppercase text-[10px]">Note:</span>
                        <p>{obj.notes}</p>
                      </div>
                    )}

                    {/* Action Footers: Practice this topic or Take Practice Quiz */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-800">
                      <div className="text-[11px] text-stone-400">
                        {obj.currentQuestions >= obj.targetQuestions ? (
                          <span className="text-emerald-400 font-medium flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Practice target reached!
                          </span>
                        ) : (
                          <span>
                            Need {obj.targetQuestions - obj.currentQuestions} more question
                            {obj.targetQuestions - obj.currentQuestions === 1 ? "" : "s"} to reach target
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            onClose();
                            onTakeQuizForSubject(obj.subject, obj.title);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-medium transition"
                          title="Generate Practice Quiz for this goal"
                        >
                          <Trophy className="w-3.5 h-3.5 text-purple-400" />
                          <span>Practice Quiz</span>
                        </button>

                        <button
                          onClick={() => {
                            onClose();
                            onPracticeSubject(obj.subject, obj.title);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition shadow-sm"
                          title="Ask StudyMate AI questions on this objective"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Ask StudyMate</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3 border-t border-stone-800 bg-stone-950/80 flex flex-wrap items-center justify-between text-xs text-stone-400 gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>
              <strong>Tip:</strong> Asking questions in StudyMate AI automatically credits active goals in that subject!
            </span>
          </div>
          {onResetDefaults && (
            <button
              onClick={onResetDefaults}
              className="text-[11px] text-stone-400 hover:text-stone-300 underline"
            >
              Reset to Recommended Goals
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
