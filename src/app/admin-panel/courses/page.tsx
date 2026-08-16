"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  BookOpen,
  Layers,
  Plus,
  Search,
  MoreVertical,
  X,
  Sparkles,
  Clock,
  Award,
  DollarSign,
  Edit2,
  BookMarked,
  GraduationCap,
  Image as ImageIcon,
  Loader2,
  Upload,
} from "lucide-react";

// Initialize Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

interface Programme {
  id: string;
  created_at?: string;
  programme_title: string;
  programme_code: string;
  duration: number | null;
  programme_overview: string;
  awrding_body: string;
}

interface Course {
  id: string;
  created_at?: string;
  course_code: string;
  course_name: string;
  course_amount: string;
  cover_image: string;
  programme_id: string | null;
  course_desc: string;
  programmes?: Programme | null;
}

export default function AcademicProgramsCourses() {
  const [activeTab, setActiveTab] = useState<"courses" | "programmes">(
    "courses",
  );
  const [courses, setCourses] = useState<Course[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Slide-Over Sheet details
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedProgramme, setSelectedProgramme] = useState<Programme | null>(
    null,
  );

  // Modal Dialogs
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form States mapped to database schema
  const [courseFormData, setCourseFormData] = useState({
    course_code: "",
    course_name: "",
    course_amount: "",
    cover_image: "",
    programme_id: "",
    course_desc: "",
  });

  const [programmeFormData, setProgrammeFormData] = useState<{
    programme_code: string;
    programme_title: string;
    duration: number | null;
    awrding_body: string;
    programme_overview: string;
  }>({
    programme_code: "",
    programme_title: "",
    duration: 1,
    awrding_body: "",
    programme_overview: "",
  });

  // Fetch Data from DB
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Programmes
      const { data: progData, error: progErr } = await supabase
        .from("programmes")
        .select("*")
        .order("created_at", { ascending: false });

      if (progErr) throw progErr;
      setProgrammes(progData || []);

      // Fetch Courses joined with Programme details
      const { data: crsData, error: crsErr } = await supabase
        .from("courses")
        .select("*, programmes(*)")
        .order("created_at", { ascending: false });

      if (crsErr) throw crsErr;
      setCourses(crsData || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Image Upload Handler for Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploadingImage(true);

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("course-covers")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("course-covers")
        .getPublicUrl(filePath);

      setCourseFormData((prev) => ({
        ...prev,
        cover_image: data.publicUrl,
      }));
    } catch (err) {
      console.error("Error uploading image:", err);
      alert(
        "Failed to upload image. Make sure 'course-covers' storage bucket exists and is public.",
      );
    } finally {
      setUploadingImage(false);
    }
  };

  // Filtered Lists
  const filteredCourses = useMemo(() => {
    return courses.filter(
      (c) =>
        (c.course_name?.toLowerCase() || "").includes(
          searchQuery.toLowerCase(),
        ) ||
        (c.course_code?.toLowerCase() || "").includes(
          searchQuery.toLowerCase(),
        ) ||
        (c.programmes?.programme_title?.toLowerCase() || "").includes(
          searchQuery.toLowerCase(),
        ),
    );
  }, [courses, searchQuery]);

  const filteredProgrammes = useMemo(() => {
    return programmes.filter(
      (p) =>
        (p.programme_title?.toLowerCase() || "").includes(
          searchQuery.toLowerCase(),
        ) ||
        (p.programme_code?.toLowerCase() || "").includes(
          searchQuery.toLowerCase(),
        ) ||
        (p.awrding_body?.toLowerCase() || "").includes(
          searchQuery.toLowerCase(),
        ),
    );
  }, [programmes, searchQuery]);

  // Form Resetters
  const resetCourseForm = () => {
    setCourseFormData({
      course_code: "",
      course_name: "",
      course_amount: "",
      cover_image: "",
      programme_id: programmes.length > 0 ? programmes[0].id : "",
      course_desc: "",
    });
  };

  const resetProgrammeForm = () => {
    setProgrammeFormData({
      programme_code: "",
      programme_title: "",
      duration: 1,
      awrding_body: "",
      programme_overview: "",
    });
  };

  // Submit Handlers
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseFormData.course_name || !courseFormData.course_code) return;

    setSubmitting(true);
    const payload = {
      ...courseFormData,
      programme_id: courseFormData.programme_id || null,
    };

    if (isEditing && selectedCourse) {
      const { data, error } = await supabase
        .from("courses")
        .update(payload)
        .eq("id", selectedCourse.id)
        .select("*, programmes(*)")
        .single();

      if (!error && data) {
        setSelectedCourse(data);
      }
    } else {
      await supabase.from("courses").insert([payload]);
    }

    setSubmitting(false);
    setIsModalOpen(false);
    fetchData();
  };

  const handleSaveProgramme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programmeFormData.programme_title || !programmeFormData.programme_code)
      return;

    setSubmitting(true);
    if (isEditing && selectedProgramme) {
      const { data, error } = await supabase
        .from("programmes")
        .update(programmeFormData)
        .eq("id", selectedProgramme.id)
        .select()
        .single();

      if (!error && data) {
        setSelectedProgramme(data);
      }
    } else {
      await supabase.from("programmes").insert([programmeFormData]);
    }

    setSubmitting(false);
    setIsModalOpen(false);
    fetchData();
  };

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 min-h-screen transition-colors duration-300 font-sans p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/5">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Academic Curriculum
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Manage degree programmes and course modules
              </p>
            </div>
          </div>

          {/* Action & Toggle Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-1 rounded-xl bg-zinc-200/80 dark:bg-zinc-900 border border-zinc-300/60 dark:border-zinc-800 flex items-center shadow-inner">
              <button
                onClick={() => {
                  setActiveTab("courses");
                  setSearchQuery("");
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "courses"
                    ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <BookMarked className="w-4 h-4" />
                <span>Courses</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("programmes");
                  setSearchQuery("");
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "programmes"
                    ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Programmes</span>
              </button>
            </div>

            <button
              onClick={() => {
                setIsEditing(false);
                if (activeTab === "courses") resetCourseForm();
                else resetProgrammeForm();
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-[0.98] transition-all duration-200"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>
                {activeTab === "courses" ? "Add Course" : "Add Programme"}
              </span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder={
                activeTab === "courses"
                  ? "Search course title, code..."
                  : "Search programme title, code, awarding body..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-sm"
            />
          </div>
          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 self-end sm:self-center">
            Showing{" "}
            <span className="text-zinc-900 dark:text-zinc-200 font-semibold">
              {activeTab === "courses"
                ? filteredCourses.length
                : filteredProgrammes.length}
            </span>{" "}
            {activeTab}
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center items-center py-20 text-amber-500">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        )}

        {/* ==================== COURSES VIEW ==================== */}
        {!loading && activeTab === "courses" && (
          <>
            {filteredCourses.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800">
                <BookMarked className="w-12 h-12 mx-auto text-zinc-400 mb-3 opacity-50" />
                <p className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
                  No courses in here
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Click on "Add Course" to create your first entry.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((crs) => (
                  <div
                    key={crs.id}
                    onClick={() => setSelectedCourse(crs)}
                    className="group cursor-pointer bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800/80 hover:border-amber-500/50 dark:hover:border-amber-500/40 rounded-2xl overflow-hidden transition-all duration-200 shadow-sm hover:shadow-xl hover:-translate-y-1 relative flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-44 w-full bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
                        {crs.cover_image ? (
                          <img
                            src={crs.cover_image}
                            alt={crs.course_name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
                            <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                            <span className="text-xs font-medium">
                              No Image
                            </span>
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-zinc-950/70 backdrop-blur-md text-amber-400 font-bold border border-amber-500/30">
                            {crs.course_code}
                          </span>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-500 transition-colors text-base line-clamp-1">
                            {crs.course_name}
                          </h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCourse(crs);
                            }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all -mr-1 -mt-1"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>

                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4">
                          {crs.course_desc || "No description provided."}
                        </p>

                        <div className="space-y-2 mb-2 text-xs text-zinc-600 dark:text-zinc-400">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-amber-500 shrink-0" />
                            <span className="truncate font-semibold">
                              {crs.programmes?.programme_title ||
                                "Unassigned Programme"}
                            </span>
                          </div>
                          {crs.programmes?.awrding_body && (
                            <div className="flex items-center gap-2">
                              <Award className="w-4 h-4 text-amber-500 shrink-0" />
                              <span className="truncate">
                                {crs.programmes.awrding_body}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="px-6 pb-6 pt-0">
                      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-end">
                        <span className="font-bold text-amber-500 dark:text-amber-500">
                          LKR{" "} {crs.course_amount || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ==================== PROGRAMMES VIEW ==================== */}
        {!loading && activeTab === "programmes" && (
          <>
            {filteredProgrammes.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800">
                <Layers className="w-12 h-12 mx-auto text-zinc-400 mb-3 opacity-50" />
                <p className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
                  No programmes in there
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Click on "Add Programme" to create your first entry.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProgrammes.map((prg) => (
                  <div
                    key={prg.id}
                    onClick={() => setSelectedProgramme(prg)}
                    className="group cursor-pointer bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800/80 hover:border-amber-500/50 dark:hover:border-amber-500/40 rounded-2xl p-6 transition-all duration-200 shadow-sm hover:shadow-xl hover:-translate-y-1 relative flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                            {prg.programme_code}
                          </span>
                          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-500 transition-colors mt-2 text-base">
                            {prg.programme_title}
                          </h3>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProgramme(prg);
                          }}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>

                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 mb-4">
                        {prg.programme_overview || "No overview provided."}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        {prg.duration ? `${prg.duration} Year(s)` : "N/A"}
                      </span>
                      {prg.awrding_body && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-semibold border border-amber-500/20">
                          {prg.awrding_body}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ==================== SLIDE-OVER SHEET DETAILS ==================== */}
      {(selectedCourse || selectedProgramme) && (
        <div className="fixed inset-0 z-50 flex justify-end bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            <div>
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest">
                  {selectedCourse ? "Course Details" : "Programme Overview"}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      if (selectedCourse) {
                        setCourseFormData({
                          course_code: selectedCourse.course_code,
                          course_name: selectedCourse.course_name,
                          course_amount: selectedCourse.course_amount || "",
                          cover_image: selectedCourse.cover_image || "",
                          programme_id: selectedCourse.programme_id || "",
                          course_desc: selectedCourse.course_desc || "",
                        });
                      } else if (selectedProgramme) {
                        setProgrammeFormData({
                          programme_code: selectedProgramme.programme_code,
                          programme_title: selectedProgramme.programme_title,
                          duration: selectedProgramme.duration || 1,
                          awrding_body: selectedProgramme.awrding_body || "",
                          programme_overview:
                            selectedProgramme.programme_overview || "",
                        });
                      }
                      setIsModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold text-xs transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCourse(null);
                      setSelectedProgramme(null);
                    }}
                    className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Course Detail View */}
              {selectedCourse && (
                <div>
                  {selectedCourse.cover_image && (
                    <div className="h-48 w-full bg-zinc-100 dark:bg-zinc-800">
                      <img
                        src={selectedCourse.cover_image}
                        alt={selectedCourse.course_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6 space-y-6">
                    <div>
                      <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                        {selectedCourse.course_code}
                      </span>
                      <h2 className="text-xl font-bold mt-2">
                        {selectedCourse.course_name}
                      </h2>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
                        Course Description
                      </span>
                      {selectedCourse.course_desc || "N/A"}
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/60">
                        <span className="text-zinc-500 text-xs flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-amber-500" />{" "}
                          Programme
                        </span>
                        <span className="font-medium text-xs">
                          {selectedCourse.programmes?.programme_title ||
                            "Unassigned"}
                        </span>
                      </div>

                      {selectedCourse.programmes?.awrding_body && (
                        <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/60">
                          <span className="text-zinc-500 text-xs flex items-center gap-2">
                            <Award className="w-4 h-4 text-amber-500" />{" "}
                            Awarding Body
                          </span>
                          <span className="font-medium text-xs">
                            {selectedCourse.programmes.awrding_body}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/60">
                        <span className="text-zinc-500 text-xs flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-amber-500" />{" "}
                          Amount
                        </span>
                        <span className="font-medium text-xs">
                          LKR{" "}{selectedCourse.course_amount || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Programme Detail View */}
              {selectedProgramme && (
                <div className="p-6 space-y-6">
                  <div>
                    <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                      {selectedProgramme.programme_code}
                    </span>
                    <h2 className="text-xl font-bold mt-2">
                      {selectedProgramme.programme_title}
                    </h2>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
                      Programme Overview
                    </span>
                    {selectedProgramme.programme_overview || "N/A"}
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/60">
                      <span className="text-zinc-500 text-xs flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-500" /> Awarding
                        Body
                      </span>
                      <span className="font-medium text-xs">
                        {selectedProgramme.awrding_body || "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/60">
                      <span className="text-zinc-500 text-xs flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500" /> Duration
                      </span>
                      <span className="font-medium text-xs">
                        {selectedProgramme.duration
                          ? `${selectedProgramme.duration} Months`
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => {
                  setSelectedCourse(null);
                  setSelectedProgramme(null);
                }}
                className="w-full py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 font-semibold text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                Close Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CREATE / EDIT MODAL ==================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold">
                  {isEditing
                    ? `Edit ${activeTab === "courses" ? "Course" : "Programme"}`
                    : `Register New ${activeTab === "courses" ? "Course" : "Programme"}`}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* COURSE FORM */}
            {activeTab === "courses" ? (
              <form
                onSubmit={handleSaveCourse}
                className="p-6 space-y-4 text-sm max-h-[80vh] overflow-y-auto"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                      Course Code
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CS-401"
                      value={courseFormData.course_code}
                      onChange={(e) =>
                        setCourseFormData({
                          ...courseFormData,
                          course_code: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                      Course Amount
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. $1,200"
                      value={courseFormData.course_amount}
                      onChange={(e) =>
                        setCourseFormData({
                          ...courseFormData,
                          course_amount: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Course Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Advanced Deep Learning"
                    value={courseFormData.course_name}
                    onChange={(e) =>
                      setCourseFormData({
                        ...courseFormData,
                        course_name: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Programme
                  </label>
                  <select
                    value={courseFormData.programme_id}
                    onChange={(e) =>
                      setCourseFormData({
                        ...courseFormData,
                        programme_id: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  >
                    <option value="">Select Programme</option>
                    {programmes.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.programme_title}{" "}
                        {p.awrding_body ? `(${p.awrding_body})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cover Image Upload Control */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Cover Image
                  </label>

                  {courseFormData.cover_image && (
                    <div className="relative mb-3 h-36 w-full rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 group">
                      <img
                        src={courseFormData.cover_image}
                        alt="Cover Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setCourseFormData({
                            ...courseFormData,
                            cover_image: "",
                          })
                        }
                        className="absolute top-2 right-2 p-1.5 bg-zinc-950/70 hover:bg-zinc-950 text-white rounded-full transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-xs font-semibold text-zinc-600 dark:text-zinc-300 cursor-pointer transition-all">
                      <Upload className="w-4 h-4 text-amber-500" />
                      <span>
                        {uploadingImage ? "Uploading..." : "Upload File"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingImage}
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    {uploadingImage && (
                      <Loader2 className="w-5 h-5 animate-spin text-amber-500 shrink-0" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Course Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Course summary..."
                    value={courseFormData.course_desc}
                    onChange={(e) =>
                      setCourseFormData({
                        ...courseFormData,
                        course_desc: e.target.value,
                      })
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
                    disabled={submitting || uploadingImage}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isEditing ? "Update Course" : "Save Course"}
                  </button>
                </div>
              </form>
            ) : (
              /* PROGRAMME FORM */
              <form
                onSubmit={handleSaveProgramme}
                className="p-6 space-y-4 text-sm max-h-[80vh] overflow-y-auto"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                      Programme Code
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BS-AI"
                      value={programmeFormData.programme_code}
                      onChange={(e) =>
                        setProgrammeFormData({
                          ...programmeFormData,
                          programme_code: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                      Duration (Months)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 4"
                      value={programmeFormData.duration || ""}
                      onChange={(e) =>
                        setProgrammeFormData({
                          ...programmeFormData,
                          duration: e.target.value
                            ? Number(e.target.value)
                            : null,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Programme Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BSc in Artificial Intelligence"
                    value={programmeFormData.programme_title}
                    onChange={(e) =>
                      setProgrammeFormData({
                        ...programmeFormData,
                        programme_title: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Awarding Body
                  </label>
                  <select
                    value={programmeFormData.awrding_body}
                    onChange={(e) =>
                      setProgrammeFormData({
                        ...programmeFormData,
                        awrding_body: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  >
                    <option value="">Select Awarding Body</option>
                    <option value="University of Plymouth">
                      University of Plymouth
                    </option>
                    <option value="Victoria University">
                      Victoria University
                    </option>
                    <option value="Pearson BTEC">Pearson BTEC</option>
                    <option value="Internal University">
                      Internal University
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Programme Overview
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Degree path overview..."
                    value={programmeFormData.programme_overview}
                    onChange={(e) =>
                      setProgrammeFormData({
                        ...programmeFormData,
                        programme_overview: e.target.value,
                      })
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
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 shadow-md shadow-amber-500/20 transition-all flex items-center gap-2"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isEditing ? "Update Programme" : "Save Programme"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
