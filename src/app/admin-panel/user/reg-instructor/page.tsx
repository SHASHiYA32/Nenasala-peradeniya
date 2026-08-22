"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  GraduationCap,
  Plus,
  Search,
  MoreVertical,
  Mail,
  Phone,
  X,
  BookOpen,
  Edit2,
  CheckCircle2,
  XCircle,
  Building2,
  UserCheck,
  Users,
  Minus,
  Loader2,
} from "lucide-react";

// Shadcn UI Component Imports
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Initialize Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// Types matching database schemas
interface Programme {
  id: string;
  programme_title: string;
  programme_code: string;
}

interface Course {
  id: string;
  course_code: string;
  course_name: string;
  programme_id: string;
}

interface InstructorDB {
  id: number;
  created_at: string;
  full_name: string;
  email: string;
  phone: string;
  bio: string;
  status: boolean;
  programs_id: string;
  assign_courses_ids: string[];
}

interface InstructorFormData {
  full_name: string;
  email: string;
  phone: string;
  programs_id: string;
  assign_courses_ids: string[];
  bio: string;
  programme_title: string;
  status: boolean;
}

export default function InstructorManagement() {
  const [instructors, setInstructors] = useState<InstructorDB[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] =
    useState<InstructorDB | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formData, setFormData] = useState<InstructorFormData>({
    full_name: "",
    email: "",
    phone: "",
    programs_id: "",
    assign_courses_ids: [],
    bio: "",
    status: true,
    programme_title: "",
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    const [instRes, progRes, courseRes] = await Promise.all([
      supabase
        .from("instructors")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("programmes").select("id, programme_title, programme_code"),
      supabase
        .from("courses")
        .select("id, course_code, course_name, programme_id"),
    ]);

    if (instRes.data) setInstructors(instRes.data);
    if (progRes.data) {
      setProgrammes(progRes.data);
      if (progRes.data.length > 0 && !formData.programs_id) {
        setFormData((prev) => ({ ...prev, programs_id: progRes.data[0].id }));
      }
    }
    if (courseRes.data) setCourses(courseRes.data);
    setLoading(false);
  };

  // Maps for efficient ID-to-Name Lookups
  const courseMap = useMemo(() => {
    return new Map(
      courses.map((c) => [
        c.id,
        `${c.course_code || ""} ${c.course_name}`.trim(),
      ]),
    );
  }, [courses]);

  const programmeMap = useMemo(() => {
    return new Map(programmes.map((p) => [p.id, p.programme_title]));
  }, [programmes]);

  // Available courses filtered by selected programme in the form
  const availableCoursesForSelectedProgram = useMemo(() => {
    if (!formData.programs_id) return [];
    return courses.filter((c) => c.programme_id === formData.programs_id);
  }, [courses, formData.programs_id]);

  // Filtered Instructors Search
  const filteredInstructors = useMemo(() => {
    return instructors.filter(
      (ins) =>
        ins.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ins.email?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [instructors, searchQuery]);

  const toggleCourseSelection = (courseId: string) => {
    setFormData((prev) => {
      const exists = prev.assign_courses_ids.includes(courseId);
      return {
        ...prev,
        assign_courses_ids: exists
          ? prev.assign_courses_ids.filter((id) => id !== courseId)
          : [...prev.assign_courses_ids, courseId],
      };
    });
  };

  const handleSaveInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email || !formData.programs_id) return;

    const payload = {
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      programs_id: formData.programs_id,
      assign_courses_ids: formData.assign_courses_ids, 
      bio: formData.bio,
      status: formData.status,
    };

    if (isEditing && selectedInstructor) {
      const { data, error } = await supabase
        .from("instructors")
        .update(payload)
        .eq("id", selectedInstructor.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating instructor:", error.message);
        alert(`Update failed: ${error.message}`);
        return;
      }

      if (data) {
        setInstructors((prev) =>
          prev.map((item) => (item.id === data.id ? data : item)),
        );
        setSelectedInstructor(data);
      }
    } else {
      const { data, error } = await supabase
        .from("instructors")
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error("Error inserting instructor:", error.message);
        alert(`Insert failed: ${error.message}`);
        return;
      }

      if (data) {
        setInstructors((prev) => [data, ...prev]);
      }
    }

    setIsRegisterModalOpen(false);
    resetForm();
  };

  const handleOpenEdit = (ins: InstructorDB) => {
    const currentProgTitle = programmeMap.get(ins.programs_id) || "";

    setFormData({
      full_name: ins.full_name || "",
      email: ins.email || "",
      phone: ins.phone || "",
      programs_id: ins.programs_id || programmes[0]?.id || "",
      assign_courses_ids: ins.assign_courses_ids || [],
      bio: ins.bio || "",
      status: ins.status ?? true,
      programme_title: currentProgTitle,
    });
    setIsEditing(true);
    setIsRegisterModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      programs_id: programmes[0]?.id || "",
      assign_courses_ids: [],
      bio: "",
      status: true,
      programme_title: "",
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 min-h-screen transition-colors duration-300 font-sans p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/5">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Instructor Hub
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Register academic faculty and view instructor assignments
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              resetForm();
              setIsRegisterModalOpen(true);
            }}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-[0.98] transition-all duration-200"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Register Instructor</span>
          </button>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
            <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-2">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                <Users className="w-4 h-4" />
              </div>
              Total Instructors
            </div>
            <div className="text-3xl font-extrabold tracking-tight">
              {instructors.length}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
            <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <UserCheck className="w-4 h-4" />
              </div>
              Active Faculty
            </div>
            <div className="text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
              {instructors.filter((i) => i.status).length}
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search instructor or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20 text-amber-500">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInstructors.map((ins) => (
              <div
                key={ins.id}
                onClick={() => setSelectedInstructor(ins)}
                className="group cursor-pointer bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800/80 hover:border-amber-500/50 rounded-2xl p-6 transition-all duration-200 shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-500 text-zinc-950 font-bold flex items-center justify-center text-base shadow-md">
                        {ins.full_name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("") || "U"}
                      </div>
                      <div>
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-500 transition-colors">
                          {ins.full_name}
                        </h3>
                        <span className="font-mono text-xs text-amber-600 dark:text-amber-400 font-medium">
                          ID: {ins.id}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInstructor(ins);
                      }}
                      className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium">
                      <Building2 className="w-3.5 h-3.5 text-amber-500" />
                      {programmeMap.get(ins.programs_id) || "No Programme"}
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-6">
                    <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold">
                      Assigned Courses
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {ins.assign_courses_ids &&
                      ins.assign_courses_ids.length > 0 ? (
                        ins.assign_courses_ids.map((id) => (
                          <span
                            key={id}
                            className="text-xs px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                          >
                            {courseMap.get(id) || "Unknown Course"}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-zinc-400 italic">
                          No courses assigned
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-xs">
                  {ins.status ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{" "}
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>{" "}
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slide-Over Details */}
      {selectedInstructor && (
        <div className="fixed inset-0 z-50 flex justify-end bg-zinc-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest">
                  Instructor Profile
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(selectedInstructor)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-xs"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setSelectedInstructor(null)}
                    className="p-1.5 rounded-xl text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500 text-zinc-950 font-bold flex items-center justify-center text-xl">
                    {selectedInstructor.full_name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {selectedInstructor.full_name}
                    </h2>
                    <div className="mt-1">
                      {selectedInstructor.status ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-xs font-medium">
                          <XCircle className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {selectedInstructor.bio && (
                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
                      Bio
                    </span>
                    {selectedInstructor.bio}
                  </div>
                )}

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-zinc-500 text-xs flex items-center gap-2">
                      <Mail className="w-4 h-4 text-amber-500" /> Email
                    </span>
                    <span className="font-medium text-xs">
                      {selectedInstructor.email}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-zinc-500 text-xs flex items-center gap-2">
                      <Phone className="w-4 h-4 text-amber-500" /> Phone
                    </span>
                    <span className="font-medium text-xs">
                      {selectedInstructor.phone || "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-zinc-500 text-xs flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-amber-500" /> Programme
                    </span>
                    <span className="font-medium text-xs">
                      {programmeMap.get(selectedInstructor.programs_id) ||
                        "N/A"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-500" /> Assigned
                    Courses
                  </span>
                  <div className="space-y-1.5">
                    {selectedInstructor.assign_courses_ids?.map((id) => (
                      <div
                        key={id}
                        className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-medium"
                      >
                        {courseMap.get(id) || id}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setSelectedInstructor(null)}
                className="w-full py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 font-semibold text-xs"
              >
                Close Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between sticky top-0 bg-white dark:bg-zinc-900 z-10">
              <h2 className="text-lg font-bold">
                {isEditing ? "Edit Instructor" : "Register New Instructor"}
              </h2>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveInstructor}
              className="p-6 space-y-4 text-sm"
            >
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Marcus Vance"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. m.vance@campus.edu"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1.5">
                    Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5">
                  Programme
                </label>
                <Select
                  value={formData.programs_id}
                  onValueChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      programs_id: value ?? "",
                      assign_courses_ids: [],
                    }));
                  }}
                >
                  <SelectTrigger className="w-full h-11 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-amber-500 focus:border-amber-500">
                    <SelectValue placeholder="Select a programme">
                      {(() => {
                        const prog = programmes.find(
                          (p) => p.id === formData.programs_id,
                        );
                        return prog
                          ? `${prog.programme_title} (${prog.programme_code})`
                          : "Select a programme";
                      })()}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                    {programmes.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.programme_title} ({p.programme_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tile-Based Course Selector */}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-2">
                  Select Courses for Programme
                </label>
                {availableCoursesForSelectedProgram.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic">
                    No courses found for this programme.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                    {availableCoursesForSelectedProgram.map((course) => {
                      const isSelected = formData.assign_courses_ids.includes(
                        course.id,
                      );
                      return (
                        <div
                          key={course.id}
                          onClick={() => toggleCourseSelection(course.id)}
                          className={`cursor-pointer p-3 rounded-xl border flex items-center justify-between transition-all ${
                            isSelected
                              ? "bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400"
                              : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          <div className="text-xs font-medium truncate pr-2">
                            <span className="block font-bold">
                              {course.course_code}
                            </span>
                            <span className="truncate block text-[11px] opacity-80">
                              {course.course_name}
                            </span>
                          </div>
                          <div
                            className={`p-1 rounded-md ${
                              isSelected
                                ? "bg-amber-500 text-zinc-950"
                                : "bg-zinc-200 dark:bg-zinc-800"
                            }`}
                          >
                            {isSelected ? (
                              <Minus className="w-3.5 h-3.5" />
                            ) : (
                              <Plus className="w-3.5 h-3.5" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5">
                  Bio
                </label>
                <textarea
                  rows={3}
                  placeholder="Summary..."
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Shadcn Switch Component */}
              <div className="flex items-center gap-3 pt-2">
                <Switch
                  id="status"
                  checked={formData.status}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, status: checked })
                  }
                  className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-red-500"
                />
                <Label
                  htmlFor="status"
                  className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer"
                >
                  Active Status{" "}
                  <a
                    className={`italic font-light ${
                      formData.status ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    ({formData.status ? "active" : "inactive"})
                  </a>
                </Label>
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 shadow-md shadow-amber-500/20"
                >
                  {isEditing ? "Update Instructor" : "Save Instructor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
