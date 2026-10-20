import React, { useState } from "react";
import { X, Calendar, Plus, Trash2, Clock, AlertTriangle } from "lucide-react";
import { ExamCountdown, Subject, ALL_SUBJECTS } from "../types";

interface ExamCountdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  exams: ExamCountdown[];
  onAddExam: (exam: ExamCountdown) => void;
  onDeleteExam: (id: string) => void;
}

export const ExamCountdownModal: React.FC<ExamCountdownModalProps> = ({
  isOpen,
  onClose,
  exams,
  onAddExam,
  onDeleteExam,
}) => {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState<Subject>("Math");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    const newExam: ExamCountdown = {
      id: Date.now().toString(),
      title: title.trim(),
      subject,
      date,
      notes: notes.trim() || undefined,
    };

    onAddExam(newExam);
    setTitle("");
    setDate("");
    setNotes("");
    setShowAddForm(false);
  };

  const calculateDaysRemaining = (examDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(examDateStr);
    target.setHours(0, 0, 0, 0);

    const diffMs = target.getTime() - today.getTime();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div
      id="exam-countdown-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        id="exam-countdown-dialog"
        className="w-full max-w-xl bg-stone-900 border border-stone-700 text-stone-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Exam Countdown & Schedule</h2>
              <p className="text-xs text-stone-400">Keep track of upcoming deadlines and study milestones</p>
            </div>
          </div>
          <button
            id="close-exam-countdown-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-400 font-medium uppercase tracking-wider">
              Your Scheduled Exams ({exams.length})
            </span>
            <button
              onClick={() => setShowAddForm((prev) => !prev)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium transition shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? "Cancel" : "Add Exam"}</span>
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleCreate} className="p-4 rounded-xl bg-stone-800/80 border border-stone-700 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Exam / Paper Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midterm Physics, Board Exam Paper I, Final Calculus..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value as Subject)}
                    className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                  >
                    {ALL_SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Exam Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Target Score or Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Target: 90%+, Review Chapters 4-8"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition"
              >
                Save Exam Date
              </button>
            </form>
          )}

          {exams.length === 0 ? (
            <div className="text-center py-10 text-stone-400 text-sm">
              <Calendar className="w-10 h-10 mx-auto text-stone-600 mb-2" />
              <p>No exams scheduled yet.</p>
              <p className="text-xs text-stone-500 mt-1">
                Add your upcoming finals, midterms, or entry tests to stay motivated!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {exams.map((exam) => {
                const days = calculateDaysRemaining(exam.date);
                const isUrgent = days <= 3 && days >= 0;
                const isPast = days < 0;

                return (
                  <div
                    key={exam.id}
                    className={`p-4 rounded-xl border flex items-center justify-between transition ${
                      isUrgent
                        ? "bg-rose-950/40 border-rose-600/60 text-rose-100"
                        : isPast
                        ? "bg-stone-800/40 border-stone-800 text-stone-500"
                        : "bg-stone-800/70 border-stone-700 text-stone-200"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-700/60 text-stone-300">
                          {exam.subject}
                        </span>
                        <h4 className="text-sm font-semibold text-stone-100">{exam.title}</h4>
                      </div>
                      <div className="text-xs text-stone-400 flex items-center gap-2">
                        <span>Date: {exam.date}</span>
                        {exam.notes && <span>• {exam.notes}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        {isPast ? (
                          <span className="text-xs text-stone-500">Completed</span>
                        ) : days === 0 ? (
                          <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> TODAY
                          </span>
                        ) : (
                          <div className="flex items-baseline gap-1">
                            <span className={`text-2xl font-bold font-mono ${isUrgent ? "text-rose-400" : "text-amber-400"}`}>
                              {days}
                            </span>
                            <span className="text-xs text-stone-400">days left</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => onDeleteExam(exam.id)}
                        className="p-1.5 rounded-lg hover:bg-stone-700 text-stone-400 hover:text-red-400 transition"
                        title="Remove exam"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
