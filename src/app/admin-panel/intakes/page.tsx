"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  CalendarDays,
  Plus,
  Search,
  MoreVertical,
  X,
  Sparkles,
  Calendar,
  Users,
  Edit2,
  Clock,
  BookOpen,
  Loader2,
} from "lucide-react";

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Interfaces
interface Programme {
  id: string;
  duration: number | null; // Duration in months
}

interface Course {
  id: string;
  course_name: string;
  course_code: string;
  programme_id: string | null;
  programmes?: Programme | null;
}

interface Intake {
  id: string;
  name: string;
  code: string;
  course_id: string | null;
  courses?: Course | null;
  start_date: string;
  end_date: string;
  application_deadline: string;
  capacity: number;
  enrolled_count: number;
  status: "upcoming" | "open" | "closed" | "in-progress";
  notes: string;
}

export default function IntakeManagement() {
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIntake, setSelectedIntake] = useState<Intake | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    course_id: "",
    start_date: "",
    end_date: "",
    application_deadline: "",
    capacity: 50,
    enrolled_count: 0,
    status: "open" as Intake["status"],
    notes: "",
  });

  // Fetch Data from Supabase
  const fetchData = async () => {
  setLoading(true);
  try {
    const { data: coursesData, error: coursesError } = await supabase
      .from("courses")
      .select("id, course_name, course_code, programme_id, programmes(id, duration)");

    if (coursesError) throw coursesError;

    // Safely unwrap array response into a single object
    const formattedCourses = (coursesData || []).map((course: any) => ({
      ...course,
      programmes: Array.isArray(course.programmes) 
        ? course.programmes[0] || null 
        : course.programmes,
    }));

    setCourses(formattedCourses);

    const { data: intakesData, error: intakesError } = await supabase
      .from("intakes")
      .select("*, courses(id, course_name, course_code, programmes(id, duration))")
      .order("created_at", { ascending: false });

    if (intakesError) throw intakesError;
    setIntakes(intakesData || []);
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate End Date based on Start Date and Programme Duration
  const calculateEndDate = (startDateStr: string, courseId: string): string => {
    if (!startDateStr || !courseId) return "";

    const selectedCourse = courses.find((c) => c.id === courseId);
    const durationMonths = selectedCourse?.programmes?.duration;

    if (!durationMonths) return "";

    const date = new Date(startDateStr);
    if (isNaN(date.getTime())) return "";

    // Add duration in months
    date.setMonth(date.getMonth() + Number(durationMonths));

    // Format back to YYYY-MM-DD for standard HTML date input
    return date.toISOString().split("T")[0];
  };

  // Handle Start Date Change
  const handleStartDateChange = (startDateValue: string) => {
    const computedEndDate = calculateEndDate(
      startDateValue,
      formData.course_id,
    );
    setFormData((prev) => ({
      ...prev,
      start_date: startDateValue,
      end_date: computedEndDate || prev.end_date, // Auto-sets end date if duration exists
    }));
  };

  // Handle Course Change
  const handleCourseChange = (courseIdValue: string) => {
    const computedEndDate = calculateEndDate(
      formData.start_date,
      courseIdValue,
    );
    setFormData((prev) => ({
      ...prev,
      course_id: courseIdValue,
      end_date: computedEndDate || prev.end_date,
    }));
  };

  // Filtered Intakes
  const filteredIntakes = useMemo(() => {
    return intakes.filter((item) => {
      const courseName = item.courses?.course_name || "";
      return (
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        courseName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [intakes, searchQuery]);

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      course_id: courses.length > 0 ? courses[0].id : "",
      start_date: "",
      end_date: "",
      application_deadline: "",
      capacity: 50,
      enrolled_count: 0,
      status: "open",
      notes: "",
    });
  };

  const handleOpenEdit = (intake: Intake) => {
    setFormData({
      name: intake.name,
      code: intake.code,
      course_id: intake.course_id || "",
      start_date: intake.start_date || "",
      end_date: intake.end_date || "",
      application_deadline: intake.application_deadline || "",
      capacity: intake.capacity,
      enrolled_count: intake.enrolled_count,
      status: intake.status,
      notes: intake.notes || "",
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSaveIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        course_id: formData.course_id || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        application_deadline: formData.application_deadline || null,
        capacity: formData.capacity,
        enrolled_count: formData.enrolled_count,
        status: formData.status,
        notes: formData.notes,
      };

      if (isEditing && selectedIntake) {
        const { error } = await supabase
          .from("intakes")
          .update(payload)
          .eq("id", selectedIntake.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("intakes").insert([payload]);

        if (error) throw error;
      }

      await fetchData();
      setIsModalOpen(false);
      setSelectedIntake(null);
      resetForm();
    } catch (error) {
      console.error("Error saving intake:", error);
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: Intake["status"]) => {
    switch (status) {
      case "open":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Open
          </span>
        );
      case "upcoming":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Upcoming
          </span>
        );
      case "in-progress":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            In Progress
          </span>
        );
      case "closed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
            Closed
          </span>
        );
    }
  };

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 min-h-screen transition-colors duration-300 font-sans p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/5">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Intakes & Admissions
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Manage enrollment windows, academic cohorts, and batch dates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                resetForm();
                setIsEditing(false);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-[0.98] transition-all duration-200"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>Add Intake</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search intake name, code, or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-sm"
            />
          </div>
          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 self-end sm:self-center">
            Showing{" "}
            <span className="text-zinc-900 dark:text-zinc-200 font-semibold">
              {filteredIntakes.length}
            </span>{" "}
            intakes
          </div>
        </div>

        {/* INTAKES TABULAR VIEW */}
        <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  <th className="py-4 px-6">Intake Batch</th>
                  <th className="py-4 px-6">Course</th>
                  <th className="py-4 px-6">Schedule Dates</th>
                  <th className="py-4 px-6">Enrollment Capacity</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                      Loading intakes...
                    </td>
                  </tr>
                ) : filteredIntakes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-500">
                      No intakes found.
                    </td>
                  </tr>
                ) : (
                  filteredIntakes.map((intake) => {
                    const fillPercentage =
                      intake.capacity > 0
                        ? Math.min(
                            Math.round(
                              (intake.enrolled_count / intake.capacity) * 100,
                            ),
                            100,
                          )
                        : 0;

                    return (
                      <tr
                        key={intake.id}
                        onClick={() => setSelectedIntake(intake)}
                        className="group cursor-pointer hover:bg-amber-500/[0.03] dark:hover:bg-amber-500/[0.02] transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-500 transition-colors">
                            {intake.name}
                          </div>
                          <span className="font-mono text-xs text-amber-600 dark:text-amber-400 font-medium">
                            {intake.code}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-xs text-zinc-600 dark:text-zinc-300 font-medium max-w-[220px] truncate">
                          {intake.courses?.course_name || "N/A"}
                        </td>

                        <td className="py-4 px-6 text-xs text-zinc-500 dark:text-zinc-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-amber-500" />
                            <span>
                              {intake.start_date || "TBD"} to{" "}
                              {intake.end_date || "TBD"}
                            </span>
                          </div>
                          <span className="text-[11px] text-zinc-400 block mt-0.5">
                            Deadline: {intake.application_deadline || "N/A"}
                          </span>
                        </td>

                        <td className="py-4 px-6 w-48">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                              {intake.enrolled_count} / {intake.capacity}
                            </span>
                            <span className="text-[11px] text-zinc-400 font-mono">
                              {fillPercentage}%
                            </span>
                          </div>
                          <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                fillPercentage >= 100
                                  ? "bg-rose-500"
                                  : fillPercentage >= 75
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                              }`}
                              style={{ width: `${fillPercentage}%` }}
                            />
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          {getStatusBadge(intake.status)}
                        </td>

                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedIntake(intake);
                            }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
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

      {/* Slide-Over Sheet Component */}
      {selectedIntake && (
        <div className="fixed inset-0 z-50 flex justify-end bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            <div>
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest">
                  Intake Details
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(selectedIntake)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold text-xs transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setSelectedIntake(null)}
                    className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                    {selectedIntake.code}
                  </span>
                  <h2 className="text-xl font-bold mt-2">
                    {selectedIntake.name}
                  </h2>
                  <div className="mt-2">
                    {getStatusBadge(selectedIntake.status)}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
                    Batch Notes
                  </span>
                  {selectedIntake.notes ||
                    "No additional notes provided for this intake."}
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/60">
                    <span className="text-zinc-500 text-xs flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-amber-500" /> Associated
                      Course
                    </span>
                    <span className="font-medium text-xs">
                      {selectedIntake.courses?.course_name || "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/60">
                    <span className="text-zinc-500 text-xs flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-500" /> Start -
                      End Date
                    </span>
                    <span className="font-medium text-xs">
                      {selectedIntake.start_date || "TBD"} to{" "}
                      {selectedIntake.end_date || "TBD"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/60">
                    <span className="text-zinc-500 text-xs flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-500" /> Application
                      Deadline
                    </span>
                    <span className="font-medium text-xs">
                      {selectedIntake.application_deadline || "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/60">
                    <span className="text-zinc-500 text-xs flex items-center gap-2">
                      <Users className="w-4 h-4 text-amber-500" /> Enrolled /
                      Seats
                    </span>
                    <span className="font-medium text-xs">
                      {selectedIntake.enrolled_count} /{" "}
                      {selectedIntake.capacity} Seats
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setSelectedIntake(null)}
                className="w-full py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 font-semibold text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                Close Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Intake Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold">
                  {isEditing ? "Edit Intake Window" : "Add New Intake Batch"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveIntake} className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Intake Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fall 2026 Batch A"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Intake Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. INT-2026-FA"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Associated Course
                </label>
                <select
                  value={formData.course_id}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                >
                  <option value="">Select a Course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.course_name} ({course.course_code})
                      {course.programmes?.duration
                        ? ` - ${course.programmes.duration} mos`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Application Deadline Date
                  </label>
                  <input
                    type="date"
                    value={formData.application_deadline}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        application_deadline: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Total Seat Capacity
                  </label>
                  <input
                    type="number"
                    placeholder="60"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        capacity: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as Intake["status"],
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                >
                  <option value="open">Open</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="in-progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Additional context or requirements..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 shadow-md shadow-amber-500/20 transition-all flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isEditing ? "Update Intake" : "Save Intake"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
