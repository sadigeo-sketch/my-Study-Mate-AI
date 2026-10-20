import React from "react";
import { X, Flame, BarChart3, Award, BookOpen, Layers, CheckCircle, Target, ArrowRight } from "lucide-react";
import { UserStats, LearningObjective } from "../types";

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
  objectives?: LearningObjective[];
  onOpenObjectives?: () => void;
}

export const ProgressModal: React.FC<ProgressModalProps> = ({
  isOpen,
  onClose,
  stats,
  objectives = [],
  onOpenObjectives,
}) => {
  if (!isOpen) return null;

  const topSubjects = Object.entries(stats.subjectCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const topLevels = Object.entries(stats.levelCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const maxSubjectCount = topSubjects.length > 0 ? Math.max(...topSubjects.map((s) => s[1])) : 1;
  const completedObjectivesCount = objectives.filter((o) => o.status === "completed").length;
  const activeObjectivesCount = objectives.filter((o) => o.status === "in_progress").length;

  return (
    <div
      id="progress-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        id="progress-dialog"
        className="w-full max-w-xl bg-stone-900 border border-stone-700 text-stone-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Your Study Analytics & Streak</h2>
              <p className="text-xs text-stone-400">Track subject dedication and learning habits</p>
            </div>
          </div>
          <button
            id="close-progress-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Top Streak Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/50 to-orange-950/40 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Flame className="w-7 h-7 animate-pulse text-orange-400" />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white font-mono">
                    {stats.streakCount}
                  </span>
                  <span className="text-sm font-semibold text-amber-300">
                    Day{stats.streakCount === 1 ? "" : "s"} Streak
                  </span>
                </div>
                <p className="text-xs text-stone-300">
                  Consistency is the key to deep mastery. Keep studying daily!
                </p>
              </div>
            </div>
          </div>

          {/* Learning Objectives Snapshot Banner */}
          {onOpenObjectives && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-stone-950/80 to-amber-950/20 border border-amber-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Learning Objectives
                  </h4>
                  <p className="text-xs text-stone-400">
                    {activeObjectivesCount} in progress · {completedObjectivesCount} completed
                  </p>
                </div>
              </div>
              <button
                id="view-all-objectives-from-progress"
                onClick={() => {
                  onClose();
                  onOpenObjectives();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition shadow-sm"
              >
                <span>View Goals</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-stone-800/70 border border-stone-700/60 text-center">
              <BookOpen className="w-5 h-5 mx-auto text-blue-400 mb-1" />
              <div className="text-xl font-bold font-mono text-stone-100">
                {stats.totalQuestionsAsked}
              </div>
              <div className="text-[11px] text-stone-400">Questions Solved</div>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-800/70 border border-stone-700/60 text-center">
              <Award className="w-5 h-5 mx-auto text-purple-400 mb-1" />
              <div className="text-xl font-bold font-mono text-stone-100">
                {stats.quizzesCompleted}
              </div>
              <div className="text-[11px] text-stone-400">Quizzes Taken</div>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-800/70 border border-stone-700/60 text-center">
              <Layers className="w-5 h-5 mx-auto text-emerald-400 mb-1" />
              <div className="text-xl font-bold font-mono text-stone-100">
                {stats.flashcardsReviewed}
              </div>
              <div className="text-[11px] text-stone-400">Cards Mastered</div>
            </div>
          </div>

          {/* Most Practiced Subjects */}
          <div className="p-4 rounded-xl bg-stone-800/50 border border-stone-700/60 space-y-3">
            <h4 className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
              Top Practiced Subjects
            </h4>
            {topSubjects.length === 0 ? (
              <p className="text-xs text-stone-500 py-3 text-center">
                Ask your first question to populate subject insights!
              </p>
            ) : (
              <div className="space-y-2.5">
                {topSubjects.map(([subjectName, count]) => {
                  const percentage = Math.round((count / maxSubjectCount) * 100);
                  return (
                    <div key={subjectName} className="space-y-1">
                      <div className="flex justify-between text-xs text-stone-300">
                        <span className="font-medium">{subjectName}</span>
                        <span className="text-stone-400 font-mono">{count} Qs</span>
                      </div>
                      <div className="w-full bg-stone-700/60 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Academic Levels Used */}
          {topLevels.length > 0 && (
            <div className="p-4 rounded-xl bg-stone-800/50 border border-stone-700/60 space-y-2.5">
              <h4 className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
                Academic Levels Explored
              </h4>
              <div className="flex flex-wrap gap-2">
                {topLevels.map(([levelName, count]) => (
                  <span
                    key={levelName}
                    className="px-2.5 py-1 rounded-lg text-xs bg-stone-700/80 text-stone-200 border border-stone-600 flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>{levelName}</span>
                    <span className="text-stone-400 font-mono">({count})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
