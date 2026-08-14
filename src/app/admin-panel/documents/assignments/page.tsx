"use client";

import React, { useState } from "react";
import {
  FileCheck,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Download,
  AlertCircle,
  Send,
  User,
  Check,
  X,
  Paperclip,
  UserCheck,
  GraduationCap,
  Award,
  BookOpen,
  Filter,
} from "lucide-react";

// Types
interface Instructor {
  id: string;
  name: string;
  department: string;
  avatar?: string;
}

interface AssignmentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  course: string;
  assignmentTitle: string;
  fileName: string;
  fileType: "pdf" | "image";
  fileUrl: string;
  submittedAt: string;
  assignedInstructorId?: string;
  status: "unassigned" | "assigned" | "graded" | "rejected";
  grade?: string; // e.g., "A", "85/100"
  feedback?: string;
}

// Sample Instructors List
const INSTRUCTORS: Instructor[] = [
  { id: "INS-01", name: "Dr. Amara Fernando", department: "Computer Science" },
  {
    id: "INS-02",
    name: "Prof. Kasun Silva",
    department: "Software Engineering",
  },
  {
    id: "INS-03",
    name: "Ms. Dilini Perera",
    department: "Information Technology",
  },
];

const INITIAL_ASSIGNMENTS: AssignmentSubmission[] = [
  {
    id: "SUB-101",
    studentId: "STU-2026-041",
    studentName: "Sahan Jayasinghe",
    course: "CS301 - Web Architecture",
    assignmentTitle: "Final Project Documentation",
    fileName: "Sahan_WebArch_Final.pdf",
    fileType: "pdf",
    fileUrl: "#",
    submittedAt: "2026-08-14 08:30 AM",
    status: "unassigned",
  },
  {
    id: "SUB-102",
    studentId: "STU-2026-042",
    studentName: "Kavindi Perera",
    course: "SE204 - UI/UX Design",
    assignmentTitle: "Figma Prototype Wireframes",
    fileName: "Kavindi_UI_Wireframes.jpg",
    fileType: "image",
    fileUrl:
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800",
    submittedAt: "2026-08-14 10:15 AM",
    assignedInstructorId: "INS-03",
    status: "assigned",
  },
  {
    id: "SUB-103",
    studentId: "STU-2026-043",
    studentName: "Tariq Ahamad",
    course: "CY502 - Penetration Testing",
    assignmentTitle: "Lab 3 Security Audit",
    fileName: "Tariq_Lab3_Audit.pdf",
    fileType: "pdf",
    fileUrl: "#",
    submittedAt: "2026-08-13 03:20 PM",
    assignedInstructorId: "INS-01",
    status: "graded",
    grade: "92 / 100 (A)",
    feedback: "Excellent depth in threat modeling and vulnerability scanning.",
  },
];

export default function AssignmentMarkingUI() {
  const [assignments, setAssignments] =
    useState<AssignmentSubmission[]>(INITIAL_ASSIGNMENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "unassigned" | "assigned" | "graded"
  >("all");

  // Popup Modal States
  const [previewDoc, setPreviewDoc] = useState<AssignmentSubmission | null>(
    null,
  );
  const [assigningDoc, setAssigningDoc] = useState<AssignmentSubmission | null>(
    null,
  );
  const [markingDoc, setMarkingDoc] = useState<AssignmentSubmission | null>(
    null,
  );

  // Form States
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>("");
  const [gradeInput, setGradeInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");

  // Filter Submissions
  const filteredAssignments = assignments.filter((item) => {
    const matchesSearch =
      item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.assignmentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.course.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ? true : item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Assign Instructor Action
  const handleConfirmAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningDoc || !selectedInstructorId) return;

    setAssignments((prev) =>
      prev.map((item) =>
        item.id === assigningDoc.id
          ? {
              ...item,
              assignedInstructorId: selectedInstructorId,
              status: "assigned",
            }
          : item,
      ),
    );

    setAssigningDoc(null);
    setSelectedInstructorId("");
  };

  // Submit Grade & Mark Action
  const handleConfirmGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!markingDoc) return;

    setAssignments((prev) =>
      prev.map((item) =>
        item.id === markingDoc.id
          ? {
              ...item,
              status: "graded",
              grade: gradeInput || "Passed",
              feedback: feedbackInput,
            }
          : item,
      ),
    );

    setMarkingDoc(null);
    setGradeInput("");
    setFeedbackInput("");
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Assignment Approvals & Marking
              </h1>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Assign instructors to mark student coursework, inspect submissions
              in a pop-up, and record grades.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-semibold">
              {assignments.filter((a) => a.status === "unassigned").length}{" "}
              Unassigned Submissions
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search student, course, assignment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2 pl-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>

          <div className="flex gap-1 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 w-full sm:w-auto">
            {(["all", "unassigned", "assigned", "graded"] as const).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 capitalize rounded-lg transition-all ${
                    statusFilter === tab
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold shadow-sm"
                      : "hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  {tab}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Row Style Table */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm dark:shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/70 text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  <th className="py-4 px-6">Student Details</th>
                  <th className="py-4 px-6">Assignment & Course</th>
                  <th className="py-4 px-6">Attachment (Click to View)</th>
                  <th className="py-4 px-6">Assigned Instructor</th>
                  <th className="py-4 px-6">Grade / Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-sm">
                {filteredAssignments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-zinc-500 text-sm"
                    >
                      No assignment submissions found.
                    </td>
                  </tr>
                ) : (
                  filteredAssignments.map((item) => {
                    const instructor = INSTRUCTORS.find(
                      (i) => i.id === item.assignedInstructorId,
                    );

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                      >
                        {/* Column 1: Student Details */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/20">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-zinc-900 dark:text-zinc-100">
                                {item.studentName}
                              </div>
                              <span className="inline-block text-[10px] font-mono text-zinc-400">
                                {item.studentId}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Column 2: Course & Title */}
                        <td className="py-4 px-6">
                          <div className="font-semibold text-zinc-900 dark:text-zinc-200 text-xs flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                            {item.assignmentTitle}
                          </div>
                          <div className="text-[11px] text-zinc-500 mt-0.5">
                            {item.course}
                          </div>
                        </td>

                        {/* Column 3: Attachment Button (Pop-up Launcher) */}
                        <td className="py-4 px-6">
                          <button
                            onClick={() => setPreviewDoc(item)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-amber-500/10 hover:border-amber-500/40 text-xs text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-all group"
                          >
                            <Paperclip className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                            <span className="truncate max-w-[140px] font-medium">
                              {item.fileName}
                            </span>
                            <Eye className="w-3.5 h-3.5 text-zinc-400 ml-1 group-hover:text-amber-500" />
                          </button>
                        </td>

                        {/* Column 4: Assigned Instructor */}
                        <td className="py-4 px-6">
                          {instructor ? (
                            <div className="flex items-center gap-1.5 text-xs text-zinc-800 dark:text-zinc-200 font-medium">
                              <UserCheck className="w-4 h-4 text-emerald-500" />
                              <span>{instructor.name}</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setAssigningDoc(item);
                                setSelectedInstructorId(INSTRUCTORS[0].id);
                              }}
                              className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold"
                            >
                              + Assign Instructor
                            </button>
                          )}
                        </td>

                        {/* Column 5: Status / Grade */}
                        <td className="py-4 px-6">
                          {item.status === "unassigned" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold border border-amber-500/20">
                              Unassigned
                            </span>
                          )}
                          {item.status === "assigned" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-semibold border border-blue-500/20">
                              Pending Grading
                            </span>
                          )}
                          {item.status === "graded" && (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                                <Award className="w-3.5 h-3.5" />
                                {item.grade}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Column 6: Action Buttons */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Re-assign button */}
                            <button
                              onClick={() => {
                                setAssigningDoc(item);
                                setSelectedInstructorId(
                                  item.assignedInstructorId ||
                                    INSTRUCTORS[0].id,
                                );
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-all"
                              title="Assign/Change Instructor"
                            >
                              Assign
                            </button>

                            {/* Mark/Grade Button */}
                            <button
                              onClick={() => {
                                setMarkingDoc(item);
                                setGradeInput(item.grade || "");
                                setFeedbackInput(item.feedback || "");
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-purple-600 dark:bg-purple-500 hover:bg-purple-500 dark:hover:bg-purple-400 text-white dark:text-zinc-950 font-bold text-xs shadow-md transition-all flex items-center gap-1"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>
                                {item.status === "graded"
                                  ? "Edit Grade"
                                  : "Grade"}
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* POPUP 1: ATTACHMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 dark:bg-zinc-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/50">
              <div>
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 block">
                  {previewDoc.assignmentTitle}
                </span>
                <span className="text-xs text-zinc-500">
                  Submitted by {previewDoc.studentName} ({previewDoc.studentId})
                </span>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Content View */}
            <div className="p-6 overflow-y-auto flex-1 flex items-center justify-center bg-zinc-100 dark:bg-zinc-950/60 min-h-[300px]">
              {previewDoc.fileType === "image" ? (
                <img
                  src={previewDoc.fileUrl}
                  alt={previewDoc.fileName}
                  className="max-h-[480px] w-auto object-contain rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-md"
                />
              ) : (
                <div className="text-center py-10 space-y-3 bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 max-w-sm shadow-sm">
                  <FileText className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto" />
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                    {previewDoc.fileName}
                  </div>
                  <p className="text-xs text-zinc-500">
                    PDF Submission file is available for inspection or offline
                    grading.
                  </p>
                  <a
                    href={previewDoc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download File</span>
                  </a>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
              >
                Close Preview
              </button>

              <button
                onClick={() => {
                  const doc = previewDoc;
                  setPreviewDoc(null);
                  setMarkingDoc(doc);
                  setGradeInput(doc.grade || "");
                  setFeedbackInput(doc.feedback || "");
                }}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-purple-600 dark:bg-purple-500 text-white dark:text-zinc-950 font-bold text-xs shadow-md transition-all"
              >
                <Award className="w-4 h-4" /> Grade Submission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP 2: ASSIGN INSTRUCTOR MODAL */}
      {assigningDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 dark:bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                <UserCheck className="w-5 h-5" />
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                  Assign Instructor to Mark
                </h2>
              </div>
              <button
                onClick={() => setAssigningDoc(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleConfirmAssign}
              className="p-6 space-y-4 text-sm"
            >
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <div className="text-xs text-zinc-500">Student Submission:</div>
                <div className="font-bold text-zinc-900 dark:text-zinc-100">
                  {assigningDoc.assignmentTitle}
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  {assigningDoc.studentName} ({assigningDoc.course})
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                  Select Instructor
                </label>
                <div className="space-y-2">
                  {INSTRUCTORS.map((ins) => (
                    <label
                      key={ins.id}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedInstructorId === ins.id
                          ? "border-purple-500/50 bg-purple-500/10 text-purple-900 dark:text-purple-200 font-semibold"
                          : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="instructor"
                          value={ins.id}
                          checked={selectedInstructorId === ins.id}
                          onChange={() => setSelectedInstructorId(ins.id)}
                          className="accent-purple-500"
                        />
                        <div>
                          <div className="font-bold text-zinc-900 dark:text-zinc-100">
                            {ins.name}
                          </div>
                          <div className="text-[10px] text-zinc-500">
                            {ins.department}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAssigningDoc(null)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 dark:bg-purple-500 text-white dark:text-zinc-950 font-bold text-xs hover:bg-purple-500 transition-all shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP 3: INSTRUCTOR MARKING / GRADING MODAL */}
      {markingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 dark:bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Award className="w-5 h-5" />
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                  Grade & Mark Submission
                </h2>
              </div>
              <button
                onClick={() => setMarkingDoc(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleConfirmGrade}
              className="p-6 space-y-4 text-sm"
            >
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <div className="text-xs text-zinc-500">Student:</div>
                <div className="font-bold text-zinc-900 dark:text-zinc-100">
                  {markingDoc.studentName} ({markingDoc.studentId})
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  {markingDoc.assignmentTitle}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Grade / Score (e.g. "88/100", "A", "Pass")
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter grade..."
                  value={gradeInput}
                  onChange={(e) => setGradeInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Instructor Remarks / Feedback
                </label>
                <textarea
                  rows={3}
                  placeholder="Write feedback for the student..."
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                />
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setMarkingDoc(null)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white dark:text-zinc-950 font-bold text-xs hover:bg-emerald-500 transition-all shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Save Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
