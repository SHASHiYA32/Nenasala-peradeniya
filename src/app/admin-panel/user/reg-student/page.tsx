"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  GraduationCap,
  Mail,
  Calendar,
  X,
  Sparkles,
} from "lucide-react";

// Types
interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  enrollmentDate: string;
  status: "active" | "inactive";
  avatarUrl?: string;
}

// Initial Mock Data
const INITIAL_STUDENTS: Student[] = [
  {
    id: "STU-1001",
    name: "Alexander Wright",
    email: "a.wright@campus.edu",
    phone: "+1 (555) 234-5678",
    department: "Computer Science",
    enrollmentDate: "2024-09-01",
    status: "active",
  },
  {
    id: "STU-1002",
    name: "Elena Rostova",
    email: "e.rostova@campus.edu",
    phone: "+1 (555) 876-5432",
    department: "Data Science",
    enrollmentDate: "2024-09-01",
    status: "active",
  },
  {
    id: "STU-1003",
    name: "Marcus Chen",
    email: "m.chen@campus.edu",
    phone: "+1 (555) 345-6789",
    department: "Cybersecurity",
    enrollmentDate: "2024-01-15",
    status: "inactive",
  },
  {
    id: "STU-1004",
    name: "Sophia Martinez",
    email: "s.martinez@campus.edu",
    phone: "+1 (555) 987-6543",
    department: "Software Engineering",
    enrollmentDate: "2024-09-01",
    status: "active",
  },
  {
    id: "STU-1005",
    name: "David Kim",
    email: "d.kim@campus.edu",
    phone: "+1 (555) 456-7890",
    department: "Artificial Intelligence",
    enrollmentDate: "2023-09-01",
    status: "active",
  },
  {
    id: "STU-1006",
    name: "Amara Okezie",
    email: "a.okezie@campus.edu",
    phone: "+1 (555) 654-3210",
    department: "Information Systems",
    enrollmentDate: "2024-01-15",
    status: "inactive",
  },
  {
    id: "STU-1007",
    name: "Liam O'Connor",
    email: "l.oconnor@campus.edu",
    phone: "+1 (555) 567-8901",
    department: "Computer Science",
    enrollmentDate: "2024-09-01",
    status: "active",
  },
  {
    id: "STU-1008",
    name: "Isabella Silva",
    email: "i.silva@campus.edu",
    phone: "+1 (555) 789-0123",
    department: "Data Science",
    enrollmentDate: "2023-09-01",
    status: "active",
  },
  {
    id: "STU-1009",
    name: "Tariq Al-Mansoor",
    email: "t.almansoor@campus.edu",
    phone: "+1 (555) 890-1234",
    department: "Software Engineering",
    enrollmentDate: "2024-09-01",
    status: "active",
  },
  {
    id: "STU-1010",
    name: "Chloe Bennett",
    email: "c.bennett@campus.edu",
    phone: "+1 (555) 901-2345",
    department: "Cybersecurity",
    enrollmentDate: "2024-01-15",
    status: "inactive",
  },
  {
    id: "STU-1011",
    name: "Lucas Vance",
    email: "l.vance@campus.edu",
    phone: "+1 (555) 012-3456",
    department: "Artificial Intelligence",
    enrollmentDate: "2024-09-01",
    status: "active",
  },
  {
    id: "STU-1012",
    name: "Aria Thorne",
    email: "a.thorne@campus.edu",
    phone: "+1 (555) 123-4567",
    department: "Computer Science",
    enrollmentDate: "2024-09-01",
    status: "active",
  },
];

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "Computer Science",
    status: "active" as "active" | "inactive",
  });

  const itemsPerPage = 10;

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.department.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [students, searchQuery]);

  // Metrics
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === "active").length;
  const inactiveStudents = students.filter(
    (s) => s.status === "inactive",
  ).length;

  // Pagination Logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(start, start + itemsPerPage);
  }, [filteredStudents, currentPage]);

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    const newStudent: Student = {
      id: `STU-${1000 + students.length + 1}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || "+1 (555) 000-0000",
      department: formData.department,
      enrollmentDate: new Date().toISOString().split("T")[0],
      status: formData.status,
    };

    setStudents([newStudent, ...students]);
    setIsModalOpen(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      department: "Computer Science",
      status: "active",
    });
  };

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 min-h-screen transition-colors duration-300 font-sans p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Bar Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/5">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Campus Directory
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Manage student enrollments and academic status
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-[0.98] transition-all duration-200"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>Register Student</span>
            </button>
          </div>
        </div>

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Total Registered */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 shadow-sm hover:border-amber-500/30 transition-all duration-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity text-amber-500">
              <Users className="w-20 h-20 -mr-4 -mt-4" />
            </div>
            <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-2">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                <Users className="w-4 h-4" />
              </div>
              Total Registered Students
            </div>
            <div className="text-3xl font-extrabold tracking-tight">
              {totalStudents}
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
              Active database count
            </p>
          </div>

          {/* Active Students */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 shadow-sm hover:border-emerald-500/30 transition-all duration-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity text-emerald-500">
              <UserCheck className="w-20 h-20 -mr-4 -mt-4" />
            </div>
            <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <UserCheck className="w-4 h-4" />
              </div>
              Active Students
            </div>
            <div className="text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
              {activeStudents}
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
              Currently enrolled & attending
            </p>
          </div>

          {/* Inactive Students */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 shadow-sm hover:border-rose-500/30 transition-all duration-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity text-rose-500">
              <UserX className="w-20 h-20 -mr-4 -mt-4" />
            </div>
            <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-2">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
                <UserX className="w-4 h-4" />
              </div>
              Inactive Students
            </div>
            <div className="text-3xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400">
              {inactiveStudents}
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
              Suspended or dropped out
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden backdrop-blur-md">
          {/* Table Header Controls */}
          <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search student, ID, or dept..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 self-end sm:self-center">
              Showing{" "}
              <span className="text-zinc-900 dark:text-zinc-200 font-semibold">
                {filteredStudents.length}
              </span>{" "}
              students
            </div>
          </div>

          {/* Student Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
                  <th className="py-3.5 px-6">Student</th>
                  <th className="py-3.5 px-6">ID</th>
                  <th className="py-3.5 px-6">Department</th>
                  <th className="py-3.5 px-6">Enrollment Date</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                {paginatedStudents.length > 0 ? (
                  paginatedStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors duration-150 group"
                    >
                      {/* Name & Contact */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-zinc-950 font-bold flex items-center justify-center shadow-sm text-sm">
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-500 transition-colors">
                              {student.name}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {student.email}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* ID */}
                      <td className="py-4 px-6 font-mono text-xs font-medium text-amber-600 dark:text-amber-400">
                        {student.id}
                      </td>

                      {/* Department */}
                      <td className="py-4 px-6 text-zinc-600 dark:text-zinc-300">
                        {student.department}
                      </td>

                      {/* Enrollment Date */}
                      <td className="py-4 px-6 text-zinc-500 dark:text-zinc-400 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                          {student.enrollmentDate}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-6">
                        {student.status === "active" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-right">
                        <button className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-zinc-500 dark:text-zinc-400"
                    >
                      No students found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="text-zinc-500 dark:text-zinc-400">
              Page{" "}
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {currentPage}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {totalPages}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed hover:border-amber-500/50 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      currentPage === page
                        ? "bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed hover:border-amber-500/50 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Student Modal / Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold">Register New Student</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddStudent} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Smith"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Campus Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. j.smith@campus.edu"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Phone Number
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
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as "active" | "inactive",
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
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
                  Save & Enroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
