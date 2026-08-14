"use client";

import React, { useState, useMemo } from "react";
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
  Users,
  Edit2,
  CheckCircle2,
  XCircle,
  Building2,
  BookMarked,
  GraduationCap,
  Image as ImageIcon,
} from "lucide-react";

// Types
interface Course {
  id: string;
  code: string;
  title: string;
  program: string;
  department: string;
  instructor: string;
  duration: string;
  credits: number;
  fee: string;
  status: "active" | "inactive";
  description: string;
  image?: string; // Added image property
}

interface Programme {
  id: string;
  code: string;
  title: string;
  degreeLevel: "BSc" | "MSc" | "Diploma" | "Certificate";
  department: string;
  durationYears: string;
  totalCredits: number;
  totalStudents: number;
  includedCourses: string[];
  status: "active" | "inactive";
  overview: string;
}

// Initial Mock Data
const INITIAL_COURSES: Course[] = [
  {
    id: "CRS-101",
    code: "CS-401",
    title: "Advanced Deep Learning",
    program: "BSc in Artificial Intelligence",
    department: "Artificial Intelligence",
    instructor: "Dr. Marcus Vance",
    duration: "14 Weeks",
    credits: 4,
    fee: "$1,200",
    status: "active",
    description:
      "Deep dive into convolutional networks, transformers, and generative adversarial networks (GANs).",
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "CRS-102",
    code: "SEC-502",
    title: "Ethical Hacking & Cryptography",
    program: "BSc in Cybersecurity",
    department: "Cybersecurity",
    instructor: "Prof. Sarah Jenkins",
    duration: "12 Weeks",
    credits: 3,
    fee: "$1,100",
    status: "active",
    description:
      "Hands-on penetration testing methodologies, network defense, and modern cryptographic protocols.",
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "CRS-103",
    code: "SE-302",
    title: "Cloud Native Microservices",
    program: "BSc in Software Engineering",
    department: "Software Engineering",
    instructor: "Alan Turing-Reyes",
    duration: "16 Weeks",
    credits: 4,
    fee: "$1,350",
    status: "active",
    description:
      "Building scalable distributed architectures using Docker, Kubernetes, and serverless computing.",
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "CRS-104",
    code: "DS-301",
    title: "Big Data & Predictive Analytics",
    program: "MSc in Data Science",
    department: "Data Science",
    instructor: "Dr. Elena Rostova",
    duration: "10 Weeks",
    credits: 3,
    fee: "$950",
    status: "inactive",
    description:
      "Statistical modeling and high-throughput data processing using Apache Spark and Hadoop ecosystem.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
  },
];

const INITIAL_PROGRAMMES: Programme[] = [
  {
    id: "PRG-201",
    code: "BS-AI",
    title: "BSc in Artificial Intelligence",
    degreeLevel: "BSc",
    department: "Artificial Intelligence",
    durationYears: "4 Years",
    totalCredits: 120,
    totalStudents: 145,
    includedCourses: [
      "CS-401 Deep Learning",
      "AI-101 Python for AI",
      "CS-202 Neural Networks",
    ],
    status: "active",
    overview:
      "Comprehensive undergraduate program covering artificial neural systems, robotics, and machine learning foundation.",
  },
  {
    id: "PRG-202",
    code: "BS-CYBER",
    title: "BSc in Cybersecurity & Defense",
    degreeLevel: "BSc",
    department: "Cybersecurity",
    durationYears: "4 Years",
    totalCredits: 124,
    totalStudents: 190,
    includedCourses: [
      "SEC-502 Ethical Hacking",
      "SEC-201 Network Defense",
      "SEC-303 Digital Forensics",
    ],
    status: "active",
    overview:
      "Specialized defense curriculum tailored to counter advanced cyber threats and secure cloud infrastructure.",
  },
  {
    id: "PRG-203",
    code: "MS-DS",
    title: "MSc in Data Science & Machine Learning",
    degreeLevel: "MSc",
    department: "Data Science",
    durationYears: "2 Years",
    totalCredits: 60,
    totalStudents: 85,
    includedCourses: [
      "DS-301 Big Data Analytics",
      "MATH-501 Advanced Statistics",
    ],
    status: "active",
    overview:
      "Postgraduate degree focusing on big data infrastructure, deep learning algorithms, and enterprise analytics.",
  },
  {
    id: "PRG-204",
    code: "CERT-DEV",
    title: "Certificate in Cloud Native Architecture",
    degreeLevel: "Certificate",
    department: "Software Engineering",
    durationYears: "6 Months",
    totalCredits: 18,
    totalStudents: 60,
    includedCourses: ["SE-302 Cloud Native Microservices"],
    status: "inactive",
    overview:
      "Accelerated professional program designed for software engineers transitioning to cloud DevOps architecture.",
  },
];

export default function AcademicProgramsCourses() {
  const [activeTab, setActiveTab] = useState<"courses" | "programmes">(
    "courses",
  );
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [programmes, setProgrammes] = useState<Programme[]>(INITIAL_PROGRAMMES);
  const [searchQuery, setSearchQuery] = useState("");

  // Slide-Over Sheet details
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedProgramme, setSelectedProgramme] = useState<Programme | null>(
    null,
  );

  // Modal Dialogs
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form States
  const [courseFormData, setCourseFormData] = useState({
    code: "",
    title: "",
    program: "",
    department: "Computer Science",
    instructor: "",
    duration: "",
    credits: 3,
    fee: "",
    description: "",
    image: "",
    status: "active" as "active" | "inactive",
  });

  const [programmeFormData, setProgrammeFormData] = useState({
    code: "",
    title: "",
    degreeLevel: "BSc" as "BSc" | "MSc" | "Diploma" | "Certificate",
    department: "Computer Science",
    durationYears: "4 Years",
    totalCredits: 120,
    includedCourses: "",
    overview: "",
    status: "active" as "active" | "inactive",
  });

  // Filtered Lists
  const filteredCourses = useMemo(() => {
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.program.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [courses, searchQuery]);

  const filteredProgrammes = useMemo(() => {
    return programmes.filter(
      (p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.degreeLevel.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [programmes, searchQuery]);

  // Form Resetters
  const resetCourseForm = () => {
    setCourseFormData({
      code: "",
      title: "",
      program: "",
      department: "Computer Science",
      instructor: "",
      duration: "",
      credits: 3,
      fee: "",
      description: "",
      image: "",
      status: "active",
    });
  };

  const resetProgrammeForm = () => {
    setProgrammeFormData({
      code: "",
      title: "",
      degreeLevel: "BSc",
      department: "Computer Science",
      durationYears: "4 Years",
      totalCredits: 120,
      includedCourses: "",
      overview: "",
      status: "active",
    });
  };

  // Submit Handlers
  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseFormData.title || !courseFormData.code) return;

    if (isEditing && selectedCourse) {
      const updated = courses.map((item) =>
        item.id === selectedCourse.id ? { ...item, ...courseFormData } : item,
      );
      setCourses(updated);
      setSelectedCourse({ ...selectedCourse, ...courseFormData });
    } else {
      const newCourse: Course = {
        id: `CRS-${100 + courses.length + 1}`,
        ...courseFormData,
      };
      setCourses([newCourse, ...courses]);
    }
    setIsModalOpen(false);
  };

  const handleSaveProgramme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!programmeFormData.title || !programmeFormData.code) return;

    const formattedCourses = programmeFormData.includedCourses
      ? programmeFormData.includedCourses.split(",").map((c) => c.trim())
      : [];

    if (isEditing && selectedProgramme) {
      const updated = programmes.map((item) =>
        item.id === selectedProgramme.id
          ? { ...item, ...programmeFormData, includedCourses: formattedCourses }
          : item,
      );
      setProgrammes(updated);
      setSelectedProgramme({
        ...selectedProgramme,
        ...programmeFormData,
        includedCourses: formattedCourses,
      });
    } else {
      const newProgramme: Programme = {
        id: `PRG-${200 + programmes.length + 1}`,
        totalStudents: 0,
        ...programmeFormData,
        includedCourses: formattedCourses,
      };
      setProgrammes([newProgramme, ...programmes]);
    }
    setIsModalOpen(false);
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
                Manage degree programmes, course modules, and credit allocations
              </p>
            </div>
          </div>

          {/* Action & Toggle Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Segmented Button Group */}
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

            {/* Contextual Register Button */}
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

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-2">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                <BookMarked className="w-4 h-4" />
              </div>
              Total Active Courses
            </div>
            <div className="text-3xl font-extrabold tracking-tight">
              {courses.filter((c) => c.status === "active").length}
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
              Across all academic faculties
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <Layers className="w-4 h-4" />
              </div>
              Degree Programmes
            </div>
            <div className="text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
              {programmes.filter((p) => p.status === "active").length}
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
              Undergraduate & Master degrees
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-2">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                <Users className="w-4 h-4" />
              </div>
              Total Enrolled Students
            </div>
            <div className="text-3xl font-extrabold tracking-tight">
              {programmes.reduce((acc, curr) => acc + curr.totalStudents, 0)}
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
              Enrolled across all degree paths
            </p>
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
                  ? "Search course title, code, dept..."
                  : "Search programme degree, code, dept..."
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

        {/* ==================== COURSES VIEW ==================== */}
        {activeTab === "courses" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((crs) => (
              <div
                key={crs.id}
                onClick={() => setSelectedCourse(crs)}
                className="group cursor-pointer bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800/80 hover:border-amber-500/50 dark:hover:border-amber-500/40 rounded-2xl overflow-hidden transition-all duration-200 shadow-sm hover:shadow-xl hover:-translate-y-1 relative flex flex-col justify-between"
              >
                <div>
                  {/* Banner Image Container */}
                  <div className="h-44 w-full bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
                    {crs.image ? (
                      <img
                        src={crs.image}
                        alt={crs.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
                        <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                        <span className="text-xs font-medium">No Image</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-zinc-950/70 backdrop-blur-md text-amber-400 font-bold border border-amber-500/30">
                        {crs.code}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-500 transition-colors text-base line-clamp-1">
                        {crs.title}
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
                      {crs.description}
                    </p>

                    <div className="space-y-2 mb-2 text-xs text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="truncate">{crs.program}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>
                          {crs.duration} ({crs.credits} Credits)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-0">
                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {crs.fee}
                    </span>

                    {crs.status === "active" ? (
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
              </div>
            ))}
          </div>
        )}

        {/* ==================== PROGRAMMES VIEW ==================== */}
        {activeTab === "programmes" && (
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
                        {prg.degreeLevel} - {prg.code}
                      </span>
                      <h3 className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-500 transition-colors mt-2 text-base">
                        {prg.title}
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

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4">
                    {prg.overview}
                  </p>

                  <div className="space-y-1.5 mb-6">
                    <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold">
                      Included Modules
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {prg.includedCourses.map((c, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {prg.durationYears} ({prg.totalCredits} Credits)
                  </span>

                  {prg.status === "active" ? (
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
        )}
      </div>

      {/* ==================== SLIDE-OVER SHEET DETAILS ==================== */}
      {(selectedCourse || selectedProgramme) && (
        <div className="fixed inset-0 z-50 flex justify-end bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            <div>
              {/* Sheet Header */}
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
                          code: selectedCourse.code,
                          title: selectedCourse.title,
                          program: selectedCourse.program,
                          department: selectedCourse.department,
                          instructor: selectedCourse.instructor,
                          duration: selectedCourse.duration,
                          credits: selectedCourse.credits,
                          fee: selectedCourse.fee,
                          description: selectedCourse.description,
                          image: selectedCourse.image || "",
                          status: selectedCourse.status,
                        });
                      } else if (selectedProgramme) {
                        setProgrammeFormData({
                          code: selectedProgramme.code,
                          title: selectedProgramme.title,
                          degreeLevel: selectedProgramme.degreeLevel,
                          department: selectedProgramme.department,
                          durationYears: selectedProgramme.durationYears,
                          totalCredits: selectedProgramme.totalCredits,
                          includedCourses:
                            selectedProgramme.includedCourses.join(", "),
                          overview: selectedProgramme.overview,
                          status: selectedProgramme.status,
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

              {/* Sheet Body: Course View */}
              {selectedCourse && (
                <div>
                  {selectedCourse.image && (
                    <div className="h-48 w-full bg-zinc-100 dark:bg-zinc-800">
                      <img
                        src={selectedCourse.image}
                        alt={selectedCourse.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6 space-y-6">
                    <div>
                      <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                        {selectedCourse.code}
                      </span>
                      <h2 className="text-xl font-bold mt-2">
                        {selectedCourse.title}
                      </h2>
                      <div className="mt-2">
                        {selectedCourse.status === "active" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium">
                            <CheckCircle2 className="w-3 h-3" /> Active Module
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-xs font-medium">
                            <XCircle className="w-3 h-3" /> Inactive
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
                        Module Syllabus Overview
                      </span>
                      {selectedCourse.description}
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/60">
                        <span className="text-zinc-500 text-xs flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-amber-500" />{" "}
                          Parent Degree
                        </span>
                        <span className="font-medium text-xs">
                          {selectedCourse.program}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/60">
                        <span className="text-zinc-500 text-xs flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-amber-500" />{" "}
                          Department
                        </span>
                        <span className="font-medium text-xs">
                          {selectedCourse.department}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/60">
                        <span className="text-zinc-500 text-xs flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-500" /> Duration
                          & Credits
                        </span>
                        <span className="font-medium text-xs">
                          {selectedCourse.duration} ({selectedCourse.credits}{" "}
                          Credits)
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/60">
                        <span className="text-zinc-500 text-xs flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-amber-500" />{" "}
                          Module Fee
                        </span>
                        <span className="font-medium text-xs">
                          {selectedCourse.fee}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sheet Body: Programme View */}
              {selectedProgramme && (
                <div className="p-6 space-y-6">
                  <div>
                    <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                      {selectedProgramme.degreeLevel} - {selectedProgramme.code}
                    </span>
                    <h2 className="text-xl font-bold mt-2">
                      {selectedProgramme.title}
                    </h2>
                    <div className="mt-2">
                      {selectedProgramme.status === "active" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium">
                          <CheckCircle2 className="w-3 h-3" /> Active Programme
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-xs font-medium">
                          <XCircle className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
                      Programme Summary
                    </span>
                    {selectedProgramme.overview}
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/60">
                      <span className="text-zinc-500 text-xs flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-500" /> Degree
                        Award
                      </span>
                      <span className="font-medium text-xs">
                        {selectedProgramme.degreeLevel}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/60">
                      <span className="text-zinc-500 text-xs flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500" /> Duration /
                        Credits
                      </span>
                      <span className="font-medium text-xs">
                        {selectedProgramme.durationYears} (
                        {selectedProgramme.totalCredits} Credits)
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/60">
                      <span className="text-zinc-500 text-xs flex items-center gap-2">
                        <Users className="w-4 h-4 text-amber-500" /> Enrolled
                        Students
                      </span>
                      <span className="font-medium text-xs">
                        {selectedProgramme.totalStudents} Active Students
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
                      value={courseFormData.code}
                      onChange={(e) =>
                        setCourseFormData({
                          ...courseFormData,
                          code: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                      Course Fee ($)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. $1,200"
                      value={courseFormData.fee}
                      onChange={(e) =>
                        setCourseFormData({
                          ...courseFormData,
                          fee: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Course Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Advanced Deep Learning"
                    value={courseFormData.title}
                    onChange={(e) =>
                      setCourseFormData({
                        ...courseFormData,
                        title: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="e.g. https://images.unsplash.com/photo-..."
                    value={courseFormData.image}
                    onChange={(e) =>
                      setCourseFormData({
                        ...courseFormData,
                        image: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                      Parent Programme
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BSc in AI"
                      value={courseFormData.program}
                      onChange={(e) =>
                        setCourseFormData({
                          ...courseFormData,
                          program: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                      Duration
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 14 Weeks"
                      value={courseFormData.duration}
                      onChange={(e) =>
                        setCourseFormData({
                          ...courseFormData,
                          duration: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Syllabus Overview
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of the course content..."
                    value={courseFormData.description}
                    onChange={(e) =>
                      setCourseFormData({
                        ...courseFormData,
                        description: e.target.value,
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
                    className="px-5 py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 shadow-md shadow-amber-500/20 transition-all"
                  >
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
                      value={programmeFormData.code}
                      onChange={(e) =>
                        setProgrammeFormData({
                          ...programmeFormData,
                          code: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                      Degree Award Level
                    </label>
                    <select
                      value={programmeFormData.degreeLevel}
                      onChange={(e) =>
                        setProgrammeFormData({
                          ...programmeFormData,
                          degreeLevel: e.target.value as
                            | "BSc"
                            | "MSc"
                            | "Diploma"
                            | "Certificate",
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    >
                      <option value="BSc">BSc</option>
                      <option value="MSc">MSc</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Certificate">Certificate</option>
                    </select>
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
                    value={programmeFormData.title}
                    onChange={(e) =>
                      setProgrammeFormData({
                        ...programmeFormData,
                        title: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                      Duration
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 4 Years"
                      value={programmeFormData.durationYears}
                      onChange={(e) =>
                        setProgrammeFormData({
                          ...programmeFormData,
                          durationYears: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                      Total Credits
                    </label>
                    <input
                      type="number"
                      placeholder="120"
                      value={programmeFormData.totalCredits}
                      onChange={(e) =>
                        setProgrammeFormData({
                          ...programmeFormData,
                          totalCredits: Number(e.target.value),
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Included Modules (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="CS-401 Deep Learning, SEC-502 Ethical Hacking"
                    value={programmeFormData.includedCourses}
                    onChange={(e) =>
                      setProgrammeFormData({
                        ...programmeFormData,
                        includedCourses: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Programme Overview
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Degree path overview..."
                    value={programmeFormData.overview}
                    onChange={(e) =>
                      setProgrammeFormData({
                        ...programmeFormData,
                        overview: e.target.value,
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
                    className="px-5 py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 shadow-md shadow-amber-500/20 transition-all"
                  >
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
