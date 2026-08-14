"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  FileText,
  HelpCircle,
  Plus,
  Search,
  MoreVertical,
  X,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Users,
  Filter,
  History,
  Activity,
  UploadCloud,
  Trash2,
  PlusCircle,
  File,
  Pause,
  Play,
  Eye,
  User,
} from "lucide-react";

// Types
interface StudentSubmission {
  id: string;
  name: string;
  status: "submitted" | "pending";
  submittedAt?: string;
}

interface Task {
  id: string;
  title: string;
  type: "assignment" | "quiz";
  course: string;
  dueDate: string;
  submissions: number;
  totalAssigned: number;
  status:
    | "live"
    | "draft"
    | "cancelled"
    | "completed"
    | "expired"
    | "paused"
    | "deleted";
  students: StudentSubmission[];
}

interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
}

// Initial Mock Data
const MOCK_STUDENTS: StudentSubmission[] = [
  {
    id: "STU-01",
    name: "Sahan Jayasinghe",
    status: "submitted",
    submittedAt: "2026-08-14T10:30:00",
  },
  {
    id: "STU-02",
    name: "Kavindi Perera",
    status: "submitted",
    submittedAt: "2026-08-14T14:45:00",
  },
  { id: "STU-03", name: "Tariq Ahamad", status: "pending" },
  { id: "STU-04", name: "Nipuni Silva", status: "pending" },
];

const INITIAL_TASKS: Task[] = [
  {
    id: "TSK-001",
    title: "React Component Lifecycle Assignment",
    type: "assignment",
    course: "CS-401 Advanced Deep Learning",
    dueDate: "2026-08-20T23:59:00",
    submissions: 2,
    totalAssigned: 4,
    status: "live",
    students: MOCK_STUDENTS,
  },
  {
    id: "TSK-002",
    title: "Mid-Term Cyber Threat Analysis",
    type: "quiz",
    course: "SEC-502 Ethical Hacking & Cryptography",
    dueDate: "2026-08-25T12:00:00",
    submissions: 0,
    totalAssigned: 4,
    status: "draft",
    students: MOCK_STUDENTS.map((s) => ({
      ...s,
      status: "pending",
      submittedAt: undefined,
    })),
  },
  {
    id: "TSK-003",
    title: "Database Normalization Case Study",
    type: "assignment",
    course: "DS-301 Big Data & Predictive Analytics",
    dueDate: "2026-07-15T23:59:00",
    submissions: 4,
    totalAssigned: 4,
    status: "completed",
    students: MOCK_STUDENTS.map((s) => ({
      ...s,
      status: "submitted",
      submittedAt: "2026-07-14T09:00:00",
    })),
  },
  {
    id: "TSK-004",
    title: "AWS Cloud Infrastructure Quiz 1",
    type: "quiz",
    course: "SE-302 Cloud Native Microservices",
    dueDate: "2026-08-30T10:00:00",
    submissions: 2,
    totalAssigned: 4,
    status: "paused",
    students: MOCK_STUDENTS,
  },
];

export default function AssignmentsAndQuizzes() {
  // Navigation & Tabs
  const [activeType, setActiveType] = useState<"assignment" | "quiz">(
    "assignment",
  );
  const [listTab, setListTab] = useState<"active" | "history">("active");

  // Filters & State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  // Modals & Popups
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Form State (Shared)
  const [formData, setFormData] = useState({
    title: "",
    course: "",
    intake: "",
    startDate: "",
    dueDate: "",
    closeDate: "",
    status: "draft" as Task["status"],
  });

  // Quiz Builder State
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([
    {
      id: "q-1",
      text: "",
      options: [
        { id: "o-1", text: "" },
        { id: "o-2", text: "" },
        { id: "o-3", text: "" },
        { id: "o-4", text: "" },
      ],
    },
  ]);

  // Document Upload State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Click outside listener to close dropdowns
  const dropdownRef = useRef<HTMLTableDataCellElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter Logic
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (task.type !== activeType) return false;

      const isHistorical = [
        "expired",
        "cancelled",
        "completed",
        "deleted",
      ].includes(task.status);
      if (listTab === "active" && isHistorical) return false;
      if (listTab === "history" && !isHistorical) return false;

      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.course.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (statusFilter !== "All" && task.status !== statusFilter.toLowerCase())
        return false;

      return true;
    });
  }, [tasks, activeType, listTab, searchQuery, statusFilter]);

  const availableFilters = useMemo(() => {
    if (listTab === "active") return ["All", "Live", "Draft", "Paused"];
    return ["All", "Completed", "Expired", "Cancelled", "Deleted"];
  }, [listTab]);

  const getStatusBadge = (status: Task["status"]) => {
    switch (status) {
      case "live":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>{" "}
            Live
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-bold tracking-wide uppercase">
            <Clock className="w-3 h-3" /> Draft
          </span>
        );
      case "paused":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[11px] font-bold tracking-wide uppercase">
            <Pause className="w-3 h-3" /> Paused
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-bold tracking-wide uppercase">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-bold tracking-wide uppercase">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 text-[11px] font-bold tracking-wide uppercase">
            <History className="w-3 h-3" /> Expired
          </span>
        );
      case "deleted":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-600/10 text-red-600 dark:text-red-400 text-[11px] font-bold tracking-wide uppercase">
            <Trash2 className="w-3 h-3" /> Deleted
          </span>
        );
    }
  };

  const handleUpdateTaskStatus = (
    taskId: string,
    newStatus: Task["status"],
  ) => {
    setTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );
    setActiveDropdown(null);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.course) return;

    const newTask: Task = {
      id: `TSK-${Math.floor(Math.random() * 1000)}`,
      title: formData.title,
      type: activeType,
      course: formData.course,
      dueDate: formData.dueDate || new Date().toISOString(),
      submissions: 0,
      totalAssigned: 0,
      status: formData.status,
      students: [],
    };

    setTasks([newTask, ...tasks]);
    setIsModalOpen(false);
    setFormData({
      title: "",
      course: "",
      intake: "",
      startDate: "",
      dueDate: "",
      closeDate: "",
      status: "draft",
    });
    setUploadedFile(null);
  };

  // Quiz Builder Functions
  const addQuizQuestion = () => {
    setQuizQuestions([
      ...quizQuestions,
      {
        id: `q-${Date.now()}`,
        text: "",
        options: [
          { id: `o-${Date.now()}-1`, text: "" },
          { id: `o-${Date.now()}-2`, text: "" },
          { id: `o-${Date.now()}-3`, text: "" },
          { id: `o-${Date.now()}-4`, text: "" },
        ],
      },
    ]);
  };
  const removeQuizQuestion = (qId: string) =>
    setQuizQuestions(quizQuestions.filter((q) => q.id !== qId));
  const updateQuestionText = (qId: string, text: string) =>
    setQuizQuestions(
      quizQuestions.map((q) => (q.id === qId ? { ...q, text } : q)),
    );
  const addOption = (qId: string) =>
    setQuizQuestions(
      quizQuestions.map((q) =>
        q.id === qId
          ? {
              ...q,
              options: [...q.options, { id: `o-${Date.now()}`, text: "" }],
            }
          : q,
      ),
    );
  const removeOption = (qId: string, oId: string) =>
    setQuizQuestions(
      quizQuestions.map((q) =>
        q.id === qId
          ? { ...q, options: q.options.filter((o) => o.id !== oId) }
          : q,
      ),
    );
  const updateOptionText = (qId: string, oId: string, text: string) =>
    setQuizQuestions(
      quizQuestions.map((q) =>
        q.id === qId
          ? {
              ...q,
              options: q.options.map((o) =>
                o.id === oId ? { ...o, text } : o,
              ),
            }
          : q,
      ),
    );

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 min-h-screen transition-colors duration-300 font-sans p-6 md:p-10 relative">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ================= TOP HEADER ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/5">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Assignments & Quizzes
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Create, distribute, and track student assessments
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="p-1 rounded-xl bg-zinc-200/80 dark:bg-zinc-900 border border-zinc-300/60 dark:border-zinc-800 flex items-center shadow-inner">
              <button
                onClick={() => {
                  setActiveType("assignment");
                  setSearchQuery("");
                  setStatusFilter("All");
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeType === "assignment" ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"}`}
              >
                <FileText className="w-4 h-4" /> Assignments
              </button>
              <button
                onClick={() => {
                  setActiveType("quiz");
                  setSearchQuery("");
                  setStatusFilter("All");
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeType === "quiz" ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"}`}
              >
                <HelpCircle className="w-4 h-4" /> Quizzes
              </button>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-[0.98] transition-all duration-200"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>
                New {activeType === "assignment" ? "Assignment" : "Quiz"}
              </span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900/70 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder={`Search ${activeType}s by title or course...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
            <div className="flex items-center gap-1.5 px-3 border-r border-zinc-200 dark:border-zinc-800">
              <Filter className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-semibold text-zinc-500">
                Filter:
              </span>
            </div>
            <div className="flex items-center gap-2">
              {availableFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${statusFilter === filter ? "bg-zinc-800 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 shadow-sm" : "bg-zinc-100 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"}`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ================= LIST SECTION ================= */}
        <div className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <h2 className="text-lg font-bold capitalize">
              {listTab === "active"
                ? `Active ${activeType}s`
                : `${activeType} History`}
            </h2>
            <div className="flex items-center bg-zinc-200/80 dark:bg-zinc-950 p-1 rounded-lg border border-zinc-300/60 dark:border-zinc-800">
              <button
                onClick={() => {
                  setListTab("active");
                  setStatusFilter("All");
                }}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${listTab === "active" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
              >
                Current Tasks
              </button>
              <button
                onClick={() => {
                  setListTab("history");
                  setStatusFilter("All");
                }}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${listTab === "history" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
              >
                <History className="w-3.5 h-3.5" /> History
              </button>
            </div>
          </div>

          {/* Table Container - added padding-bottom and removed strict overflow-y clipping */}
          <div className="overflow-x-auto min-h-[350px] pb-16">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider whitespace-nowrap">
                    Task Name
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider whitespace-nowrap">
                    Target Course
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider whitespace-nowrap">
                    Due Date
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider whitespace-nowrap">
                    Submissions
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider whitespace-nowrap text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <Filter className="w-8 h-8 mb-3 opacity-20" />
                        <p className="text-sm font-medium">
                          No {activeType}s found.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task, index) => {
                    // Logic to automatically open menu upwards if it's near the bottom
                    const isNearBottom =
                      index >= filteredTasks.length - 2 &&
                      filteredTasks.length > 2;

                    return (
                      <tr
                        key={task.id}
                        onClick={() =>
                          task.status !== "deleted"
                            ? setSelectedTask(task)
                            : null
                        }
                        className={`transition-colors group ${task.status !== "deleted" ? "hover:bg-zinc-50 dark:hover:bg-zinc-800/40 cursor-pointer" : "opacity-60 bg-zinc-50/50 dark:bg-zinc-950/50"}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-0.5 p-2 rounded-lg border ${task.type === "assignment" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" : "bg-purple-500/10 text-purple-600 border-purple-500/20"}`}
                            >
                              {task.type === "assignment" ? (
                                <FileText className="w-4 h-4" />
                              ) : (
                                <HelpCircle className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <div
                                className={`text-sm font-bold transition-colors ${task.status !== "deleted" ? "text-zinc-900 dark:text-zinc-100 group-hover:text-amber-500" : "text-zinc-500 line-through decoration-zinc-400"}`}
                              >
                                {task.title}
                              </div>
                              <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                                {task.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            {task.course}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                            <span>
                              {new Date(task.dueDate).toLocaleDateString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          {["draft", "cancelled", "deleted"].includes(
                            task.status,
                          ) ? (
                            <span className="text-zinc-400 dark:text-zinc-500 italic text-[11px]">
                              N/A
                            </span>
                          ) : (
                            <div className="w-32 space-y-1.5">
                              <div className="flex items-center justify-between text-[11px] font-medium">
                                <span className="text-zinc-900 dark:text-zinc-100">
                                  {task.submissions}
                                </span>
                                <span className="text-zinc-500">
                                  / {task.totalAssigned}
                                </span>
                              </div>
                              <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-500 ${task.submissions === task.totalAssigned && task.totalAssigned > 0 ? "bg-emerald-500" : "bg-amber-500"}`}
                                  style={{
                                    width: `${task.totalAssigned > 0 ? (task.submissions / task.totalAssigned) * 100 : 0}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {getStatusBadge(task.status)}
                        </td>

                        <td
                          className="px-6 py-4 text-right relative"
                          ref={activeDropdown === task.id ? dropdownRef : null}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(
                                activeDropdown === task.id ? null : task.id,
                              );
                            }}
                            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all focus:outline-none"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Dynamic Dropdown Fix */}
                          {activeDropdown === task.id && (
                            <div
                              className={`absolute right-6 w-40 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 ${
                                isNearBottom ? "bottom-12" : "top-12"
                              }`}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateTaskStatus(task.id, "paused");
                                }}
                                disabled={task.status !== "live"}
                                className="w-full text-left px-4 py-2 text-xs font-semibold flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-zinc-800 dark:text-zinc-200"
                              >
                                <Pause className="w-3.5 h-3.5" /> Pause
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateTaskStatus(task.id, "live");
                                }}
                                disabled={
                                  task.status === "live" ||
                                  task.status === "deleted" ||
                                  task.status === "cancelled"
                                }
                                className="w-full text-left px-4 py-2 text-xs font-semibold flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-zinc-800 dark:text-zinc-200"
                              >
                                <Play className="w-3.5 h-3.5" /> Resume
                              </button>
                              <div className="h-px w-full bg-zinc-100 dark:bg-zinc-800 my-1"></div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateTaskStatus(task.id, "cancelled");
                                }}
                                className="w-full text-left px-4 py-2 text-xs font-semibold flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-zinc-800 dark:text-zinc-200"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Cancel
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateTaskStatus(task.id, "deleted");
                                }}
                                className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                          )}
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

      {/* ==================== SLIDE-OVER SHEET DETAILS ==================== */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex justify-end bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 w-full max-w-lg h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            <div>
              {/* Sheet Header */}
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur z-10">
                <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                  {selectedTask.type === "assignment" ? (
                    <FileText className="w-3.5 h-3.5" />
                  ) : (
                    <HelpCircle className="w-3.5 h-3.5" />
                  )}
                  {selectedTask.type} Details
                </span>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sheet Body */}
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold mt-2 text-zinc-900 dark:text-zinc-100">
                    {selectedTask.title}
                  </h2>
                  <div className="mt-2.5 flex items-center gap-2">
                    {getStatusBadge(selectedTask.status)}
                    <span className="text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                      {selectedTask.id}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/60">
                    <span className="text-zinc-500 text-xs flex items-center gap-2 font-medium">
                      Target Course
                    </span>
                    <span className="font-semibold text-xs text-right max-w-[200px] truncate">
                      {selectedTask.course}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/60">
                    <span className="text-zinc-500 text-xs flex items-center gap-2 font-medium">
                      Due Date
                    </span>
                    <span className="font-semibold text-xs">
                      {new Date(selectedTask.dueDate).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Students Section */}
                <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      Student Submissions
                    </h3>
                    <div className="text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-md">
                      {selectedTask.submissions} / {selectedTask.totalAssigned}{" "}
                      Submitted
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Submitted List */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                        Submitted
                      </h4>
                      {selectedTask.students
                        ?.filter((s) => s.status === "submitted")
                        .map((student) => (
                          <div
                            key={student.id}
                            className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                  {student.name}
                                </p>
                                <p className="text-[10px] text-zinc-500 mt-0.5">
                                  Submitted:{" "}
                                  {student.submittedAt
                                    ? new Date(
                                        student.submittedAt,
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </p>
                              </div>
                            </div>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-colors">
                              {selectedTask.type === "assignment" ? (
                                <Eye className="w-3.5 h-3.5" />
                              ) : (
                                <HelpCircle className="w-3.5 h-3.5" />
                              )}
                              View{" "}
                              {selectedTask.type === "assignment"
                                ? "Doc"
                                : "Answers"}
                            </button>
                          </div>
                        ))}
                      {selectedTask.students?.filter(
                        (s) => s.status === "submitted",
                      ).length === 0 && (
                        <div className="text-xs text-zinc-500 italic p-3 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                          No submissions yet.
                        </div>
                      )}
                    </div>

                    {/* Pending List */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                        Pending
                      </h4>
                      {selectedTask.students
                        ?.filter((s) => s.status === "pending")
                        .map((student) => (
                          <div
                            key={student.id}
                            className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                                <User className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                  {student.name}
                                </p>
                                <p className="text-[10px] text-zinc-500 mt-0.5">
                                  Awaiting Submission
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md">
                              Pending
                            </span>
                          </div>
                        ))}
                      {selectedTask.students?.filter(
                        (s) => s.status === "pending",
                      ).length === 0 && (
                        <div className="text-xs text-zinc-500 italic p-3 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                          All assigned students have submitted.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <button
                onClick={() => setSelectedTask(null)}
                className="w-full py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 font-semibold text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CREATE TASK MODAL ==================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold capitalize">
                  New {activeType}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveTask}
              className="flex-1 overflow-y-auto p-6 space-y-6 text-sm custom-scrollbar"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 capitalize">
                    {activeType} Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={`e.g. Mid-term ${activeType}`}
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Target Course
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS-401 Advanced Deep Learning"
                    value={formData.course}
                    onChange={(e) =>
                      setFormData({ ...formData, course: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Intake / Batch
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fall 2026"
                    value={formData.intake}
                    onChange={(e) =>
                      setFormData({ ...formData, intake: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-xs [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-xs [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Close Date
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.closeDate}
                    onChange={(e) =>
                      setFormData({ ...formData, closeDate: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-xs [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
              </div>

              {activeType === "assignment" && (
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
                    Upload Assignment Document
                  </label>
                  <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors relative">
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setUploadedFile(e.target.files[0]);
                        }
                      }}
                    />

                    {uploadedFile ? (
                      <div className="flex flex-col items-center gap-2">
                        <File className="w-10 h-10 text-amber-500" />
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                            {uploadedFile.name}
                          </p>
                          <p className="text-xs text-zinc-500 mt-1">
                            {(uploadedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-10 h-10 text-zinc-400 mb-3" />
                        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-500 mt-2 font-medium bg-amber-500/10 px-3 py-1 rounded-full">
                          Allowed formats: .pdf, .docx only
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {activeType === "quiz" && (
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      Quiz Questions Builder
                    </h3>
                    <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                      {quizQuestions.length} Question
                      {quizQuestions.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {quizQuestions.map((q, qIndex) => (
                    <div
                      key={q.id}
                      className="bg-zinc-50 dark:bg-zinc-900/50 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4 relative group"
                    >
                      {quizQuestions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuizQuestion(q.id)}
                          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-colors"
                          title="Remove Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                          Question {qIndex + 1}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Enter your question here..."
                          value={q.text}
                          onChange={(e) =>
                            updateQuestionText(q.id, e.target.value)
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm font-medium pr-10"
                        />
                      </div>

                      <div className="space-y-2.5 pl-4 border-l-2 border-zinc-200 dark:border-zinc-800">
                        {q.options.map((opt, oIndex) => (
                          <div key={opt.id} className="flex items-center gap-2">
                            <div className="w-6 h-6 shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                              {String.fromCharCode(65 + oIndex)}
                            </div>
                            <input
                              type="text"
                              required
                              placeholder={`Option ${oIndex + 1}`}
                              value={opt.text}
                              onChange={(e) =>
                                updateOptionText(q.id, opt.id, e.target.value)
                              }
                              className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-xs"
                            />
                            {q.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeOption(q.id, opt.id)}
                                className="p-1.5 text-zinc-400 hover:text-rose-500 transition-colors"
                                title="Remove Option"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => addOption(q.id)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 mt-2 ml-8 transition-colors"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          Add Option
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addQuizQuestion}
                    className="w-full py-3 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-400 dark:hover:border-zinc-600 font-bold text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add a New Question
                  </button>
                </div>
              )}
            </form>

            <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 shrink-0">
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as Task["status"],
                  })
                }
                className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm font-semibold"
              >
                <option value="draft">Save as Draft</option>
                <option value="live">Publish Immediately</option>
              </select>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTask}
                  type="button"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 shadow-md shadow-amber-500/20 transition-all capitalize"
                >
                  Create {activeType}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
