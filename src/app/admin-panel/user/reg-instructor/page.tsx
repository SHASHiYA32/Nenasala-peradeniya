"use client";

import React, { useState, useMemo } from "react";
import {
  GraduationCap,
  Plus,
  Search,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  X,
  Sparkles,
  BookOpen,
  DollarSign,
  Edit2,
  CheckCircle2,
  XCircle,
  Building2,
  Award,
  UserCheck,
  Users,
} from "lucide-react";

// Types
interface Instructor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  department: string;
  assignedCourses: string[];
  hourlyRate: string;
  joiningDate: string;
  status: "active" | "inactive";
  bio: string;
}

// Initial Mock Data
const INITIAL_INSTRUCTORS: Instructor[] = [
  {
    id: "INS-3001",
    name: "Dr. Marcus Vance",
    email: "m.vance@campus.edu",
    phone: "+1 (555) 345-8890",
    specialization: "Neural Networks & Deep Learning",
    department: "Artificial Intelligence",
    assignedCourses: ["AI-401 Advanced Deep Learning", "CS-101 Python Basics"],
    hourlyRate: "$85/hr",
    joiningDate: "2021-08-15",
    status: "active",
    bio: "Former AI researcher with over a decade of experience in machine learning algorithms and computational neuroscience.",
  },
  {
    id: "INS-3002",
    name: "Prof. Sarah Jenkins",
    email: "s.jenkins@campus.edu",
    phone: "+1 (555) 789-2233",
    specialization: "Offensive Security & Cryptography",
    department: "Cybersecurity",
    assignedCourses: ["SEC-502 Ethical Hacking", "SEC-201 Cryptography"],
    hourlyRate: "$90/hr",
    joiningDate: "2019-01-10",
    status: "active",
    bio: "Certified Information Systems Security Professional (CISSP) consulting for global cloud enterprise platforms.",
  },
  {
    id: "INS-3003",
    name: "Alan Turing-Reyes",
    email: "a.reyes@campus.edu",
    phone: "+1 (555) 654-1122",
    specialization: "Full Stack Architecture & Microservices",
    department: "Software Engineering",
    assignedCourses: ["SE-302 Cloud Native Dev", "SE-102 Web Systems"],
    hourlyRate: "$75/hr",
    joiningDate: "2023-05-20",
    status: "inactive",
    bio: "Full stack systems architect specializing in scalable distributed Web3 microservices and modern React frameworks.",
  },
  {
    id: "INS-3004",
    name: "Dr. Elena Rostova",
    email: "e.rostova@campus.edu",
    phone: "+1 (555) 456-9988",
    specialization: "Data Mining & Statistical Modeling",
    department: "Data Science",
    assignedCourses: ["DS-301 Big Data Analytics"],
    hourlyRate: "$80/hr",
    joiningDate: "2022-09-01",
    status: "active",
    bio: "Data scientist focus on statistical machine learning models for predictive health diagnostic systems.",
  },
];

export default function InstructorManagement() {
  const [instructors, setInstructors] =
    useState<Instructor[]>(INITIAL_INSTRUCTORS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] =
    useState<Instructor | null>(null);

  // Form State for Registration / Edit
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    department: "Computer Science",
    assignedCourses: "",
    hourlyRate: "",
    bio: "",
    status: "active" as "active" | "inactive",
  });

  const [isEditing, setIsEditing] = useState(false);

  // Filtered Instructors
  const filteredInstructors = useMemo(() => {
    return instructors.filter(
      (ins) =>
        ins.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ins.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ins.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ins.department.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [instructors, searchQuery]);

  // Metrics
  const totalInstructors = instructors.length;
  const activeInstructors = instructors.filter(
    (s) => s.status === "active",
  ).length;

  // Handle Form Submission (Add / Edit)
  const handleSaveInstructor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    if (isEditing && selectedInstructor) {
      // Update existing
      const updated = instructors.map((item) =>
        item.id === selectedInstructor.id
          ? {
              ...item,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              specialization: formData.specialization,
              department: formData.department,
              assignedCourses: formData.assignedCourses
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean),
              hourlyRate: formData.hourlyRate,
              bio: formData.bio,
              status: formData.status,
            }
          : item,
      );
      setInstructors(updated);
      setSelectedInstructor({
        ...selectedInstructor,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        specialization: formData.specialization,
        department: formData.department,
        assignedCourses: formData.assignedCourses
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        hourlyRate: formData.hourlyRate,
        bio: formData.bio,
        status: formData.status,
      });
      setIsEditing(false);
    } else {
      // Create new
      const newInstructor: Instructor = {
        id: `INS-${3000 + instructors.length + 1}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || "+1 (555) 000-0000",
        specialization: formData.specialization || "General Education",
        department: formData.department,
        assignedCourses: formData.assignedCourses
          ? formData.assignedCourses.split(",").map((c) => c.trim())
          : ["Introductory Module"],
        hourlyRate: formData.hourlyRate
          ? `$${formData.hourlyRate}/hr`
          : "$60/hr",
        joiningDate: new Date().toISOString().split("T")[0],
        status: formData.status,
        bio: formData.bio || "No detailed biography provided yet.",
      };

      setInstructors([newInstructor, ...instructors]);
      setIsRegisterModalOpen(false);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      specialization: "",
      department: "Computer Science",
      assignedCourses: "",
      hourlyRate: "",
      bio: "",
      status: "active",
    });
  };

  const handleOpenEdit = (ins: Instructor) => {
    setFormData({
      name: ins.name,
      email: ins.email,
      phone: ins.phone,
      specialization: ins.specialization,
      department: ins.department,
      assignedCourses: ins.assignedCourses.join(", "),
      hourlyRate: ins.hourlyRate.replace("$", "").replace("/hr", ""),
      bio: ins.bio,
      status: ins.status,
    });
    setIsEditing(true);
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

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                resetForm();
                setIsEditing(false);
                setIsRegisterModalOpen(true);
              }}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-[0.98] transition-all duration-200"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>Register Instructor</span>
            </button>
          </div>
        </div>

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-2">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                <Users className="w-4 h-4" />
              </div>
              Total Instructors
            </div>
            <div className="text-3xl font-extrabold tracking-tight">
              {totalInstructors}
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
              Registered academic staff
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <UserCheck className="w-4 h-4" />
              </div>
              Active Faculty
            </div>
            <div className="text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
              {activeInstructors}
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
              Active module leads
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-2">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                <Award className="w-4 h-4" />
              </div>
              Departments Covered
            </div>
            <div className="text-3xl font-extrabold tracking-tight">5</div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
              Cross-disciplinary faculties
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search instructor, discipline, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-sm"
            />
          </div>
          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 self-end sm:self-center">
            Showing{" "}
            <span className="text-zinc-900 dark:text-zinc-200 font-semibold">
              {filteredInstructors.length}
            </span>{" "}
            instructors
          </div>
        </div>

        {/* Instructors Card Grid View */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstructors.map((ins) => (
            <div
              key={ins.id}
              onClick={() => setSelectedInstructor(ins)}
              className="group cursor-pointer bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800/80 hover:border-amber-500/50 dark:hover:border-amber-500/40 rounded-2xl p-6 transition-all duration-200 shadow-sm hover:shadow-xl hover:-translate-y-1 relative flex flex-col justify-between"
            >
              <div>
                {/* Card Header Top */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-zinc-950 font-bold flex items-center justify-center text-base shadow-md">
                      {ins.name
                        .replace("Dr. ", "")
                        .replace("Prof. ", "")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-500 transition-colors">
                        {ins.name}
                      </h3>
                      <span className="font-mono text-xs text-amber-600 dark:text-amber-400 font-medium">
                        {ins.id}
                      </span>
                    </div>
                  </div>

                  {/* Hamburger / Action trigger */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedInstructor(ins);
                    }}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                {/* Specialization & Department */}
                <div className="space-y-2 mb-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium">
                    <Building2 className="w-3.5 h-3.5 text-amber-500" />
                    {ins.department}
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      Focus:
                    </span>{" "}
                    {ins.specialization}
                  </p>
                </div>

                {/* Assigned Courses List */}
                <div className="space-y-1.5 mb-6">
                  <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold">
                    Assigned Courses
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {ins.assignedCourses.map((course, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {ins.hourlyRate}
                </span>

                {ins.status === "active" ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    Inactive
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide-Over Sheet Component for Instructor Details */}
      {selectedInstructor && (
        <div className="fixed inset-0 z-50 flex justify-end bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            {/* Sheet Header */}
            <div>
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest">
                  Instructor Profile
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      handleOpenEdit(selectedInstructor);
                      setIsRegisterModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold text-xs transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setSelectedInstructor(null)}
                    className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Sheet Body Info */}
              <div className="p-6 space-y-6">
                {/* Profile Hero */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-zinc-950 font-bold flex items-center justify-center text-xl shadow-lg">
                    {selectedInstructor.name
                      .replace("Dr. ", "")
                      .replace("Prof. ", "")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {selectedInstructor.name}
                    </h2>
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-mono font-medium">
                      {selectedInstructor.id}
                    </p>
                    <div className="mt-1">
                      {selectedInstructor.status === "active" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium">
                          <CheckCircle2 className="w-3 h-3" /> Active Faculty
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-xs font-medium">
                          <XCircle className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Biography */}
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
                    Biography
                  </span>
                  {selectedInstructor.bio}
                </div>

                {/* Contact & Meta Details */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/60">
                    <span className="text-zinc-500 text-xs flex items-center gap-2">
                      <Mail className="w-4 h-4 text-amber-500" /> Email
                    </span>
                    <span className="font-medium text-xs">
                      {selectedInstructor.email}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/60">
                    <span className="text-zinc-500 text-xs flex items-center gap-2">
                      <Phone className="w-4 h-4 text-amber-500" /> Phone
                    </span>
                    <span className="font-medium text-xs">
                      {selectedInstructor.phone}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/60">
                    <span className="text-zinc-500 text-xs flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-amber-500" />{" "}
                      Department
                    </span>
                    <span className="font-medium text-xs">
                      {selectedInstructor.department}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/60">
                    <span className="text-zinc-500 text-xs flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-amber-500" /> Hourly
                      Rate
                    </span>
                    <span className="font-medium text-xs">
                      {selectedInstructor.hourlyRate}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/60">
                    <span className="text-zinc-500 text-xs flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-500" /> Joined
                      Date
                    </span>
                    <span className="font-medium text-xs">
                      {selectedInstructor.joiningDate}
                    </span>
                  </div>
                </div>

                {/* Assigned Courses Section */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-500" /> Currently
                    Teaching Modules
                  </span>
                  <div className="space-y-1.5">
                    {selectedInstructor.assignedCourses.map((course, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200"
                      >
                        {course}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sheet Footer Close Button */}
            <div className="p-6 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setSelectedInstructor(null)}
                className="w-full py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 font-semibold text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                Close Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register / Edit Instructor Dialog */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold">
                  {isEditing ? "Edit Instructor" : "Register New Instructor"}
                </h2>
              </div>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveInstructor}
              className="p-6 space-y-4 text-sm"
            >
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Full Name & Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Marcus Vance"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  >
                    <option>Computer Science</option>
                    <option>Data Science</option>
                    <option>Cybersecurity</option>
                    <option>Software Engineering</option>
                    <option>Artificial Intelligence</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Hourly Rate ($)
                  </label>
                  <input
                    type="text"
                    placeholder="85"
                    value={formData.hourlyRate}
                    onChange={(e) =>
                      setFormData({ ...formData, hourlyRate: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Assigned Courses (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="CS-101, SEC-502 Ethical Hacking"
                  value={formData.assignedCourses}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      assignedCourses: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Bio / Specialization Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Summary of research or teaching background..."
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 shadow-md shadow-amber-500/20 transition-all"
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
