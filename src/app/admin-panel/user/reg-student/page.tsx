"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Eye,
  Edit,
  Loader2,
  MoreVertical,
  CheckCircle,
  XCircle,
  Calendar,
  User2,
} from "lucide-react";
import AddStudentModal from "@/components/admin-panel/user/reg-student/AddStudentModal";
import StudentDetailsDrawer from "@/components/admin-panel/user/reg-student/StudentDetailsDrawer";
import { updateStudentStatus } from "@/app/actions/studentActions";
import { createClient } from "@/lib/supabase/client";

interface StudentDisplayItem {
  id: string;
  name: string;
  email: string;
  department: string;
  enrollmentDate: string;
  status: "active" | "inactive";
  phone?: string;
  gender?: string;
  address?: string;
  gardian_name?: string;
  gardian_phone?: string;
  reg_amount?: string;
}

export default function StudentManagement() {
  const [students, setStudents] = useState<StudentDisplayItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [editingStudent, setEditingStudent] =
    useState<StudentDisplayItem | null>(null);
  const [viewingStudentId, setViewingStudentId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Hamburger dropdown state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const itemsPerPage = 10;
  const supabase = createClient();

  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch real student data from Supabase
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("student_profile")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedStudents: StudentDisplayItem[] = (data || []).map(
        (s: any) => ({
          id: s.id,
          name: s.full_name || "N/A",
          email: s.email || "N/A",
          department: s.stu_register_id || "N/A",
          enrollmentDate: s.created_at
            ? new Date(s.created_at).toLocaleDateString()
            : "N/A",
          status: s.status === "active" ? "active" : "inactive",
          phone: s.phone,
          gender: s.gender,
          address: s.address,
          gardian_name: s.gardian_name,
          gardian_phone: s.gardian_phone,
          reg_amount: s.reg_amount,
        }),
      );

      setStudents(formattedStudents);
    } catch (err: any) {
      console.error("Error loading students:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleToggleStatus = async (student: StudentDisplayItem) => {
    const nextStatus = student.status === "active" ? "inactive" : "active";
    setUpdatingId(student.id);

    setStudents((prev) =>
      prev.map((s) => (s.id === student.id ? { ...s, status: nextStatus } : s)),
    );

    try {
      await updateStudentStatus(student.id, nextStatus);
    } catch (err) {
      console.error("Failed to update status in DB:", err);
      setStudents((prev) =>
        prev.map((s) =>
          s.id === student.id ? { ...s, status: student.status } : s,
        ),
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    return students.filter(
      (student) =>
        (student.name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (student.email || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (student.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.department || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
    );
  }, [students, searchQuery]);

  const totalStudents = students?.length || 0;
  const activeStudents =
    students?.filter((s) => s.status === "active").length || 0;
  const inactiveStudents =
    students?.filter((s) => s.status === "inactive").length || 0;

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(start, start + itemsPerPage);
  }, [filteredStudents, currentPage]);

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 min-h-screen transition-colors duration-300 font-sans p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
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

          <button
            onClick={() => {
              setEditingStudent(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-[0.98] transition-all duration-200"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Register Student</span>
          </button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
            <div className="flex items-center gap-3 text-zinc-500 text-sm font-medium mb-2">
              <Users className="w-4 h-4 text-amber-500" /> Total Students
            </div>
            <div className="text-3xl font-extrabold">{totalStudents}</div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
            <div className="flex items-center gap-3 text-zinc-500 text-sm font-medium mb-2">
              <UserCheck className="w-4 h-4 text-emerald-500" /> Active Students
            </div>
            <div className="text-3xl font-extrabold text-emerald-500">
              {activeStudents}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
            <div className="flex items-center gap-3 text-zinc-500 text-sm font-medium mb-2">
              <UserX className="w-4 h-4 text-rose-500" /> Inactive Students
            </div>
            <div className="text-3xl font-extrabold text-rose-500">
              {inactiveStudents}
            </div>
          </div>
        </div>

        {/* Main Table Content */}
        <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search student, ID, or Reg ID ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-xs uppercase text-zinc-500">
                  <th className="py-3.5 px-6">Student</th>
                  <th className="py-3.5 px-6">Reg ID</th>
                  <th className="py-3.5 px-6">Enrollment Date</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-zinc-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                      Loading student records...
                    </td>
                  </tr>
                ) : paginatedStudents.length > 0 ? (
                  paginatedStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                    >
                      <td className="py-4 px-6 flex flex-row items-center gap-2">
                        <User2 className="h-9 w-9 text-amber-500 bg-amber-700/20 p-2 rounded-full"/>
                        <div>
                          <div className="font-semibold">{student.name}</div>
                          <div className="text-xs text-zinc-500">
                            {student.email}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-amber-500">
                        {student.department}
                      </td>
                      <td className="py-4 px-6 flex flex-row items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        {student.enrollmentDate}
                      </td>

                      {/* Status Column Indicator */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                            student.status === "active"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                          }`}
                        >
                          {updatingId === student.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                student.status === "active"
                                  ? "bg-emerald-500 animate-pulse"
                                  : "bg-rose-500"
                              }`}
                            />
                          )}
                          {student.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Actions Column (Fixed Positioning Menu) */}
                      <td className="py-4 px-6 text-right relative">
                        <div className="inline-block text-left">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (openMenuId === student.id) {
                                setOpenMenuId(null);
                              } else {
                                const rect =
                                  e.currentTarget.getBoundingClientRect();
                                setMenuPosition({
                                  top: rect.bottom + window.scrollY + 4,
                                  left: rect.right - 192, // 192px matches w-48 width
                                });
                                setOpenMenuId(student.id);
                              }
                            }}
                            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Actions"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>

                          {openMenuId === student.id && (
                            <div
                              ref={menuRef}
                              style={{
                                position: "fixed",
                                top: `${menuPosition.top - window.scrollY}px`,
                                left: `${menuPosition.left}px`,
                              }}
                              className="w-48 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl z-50 py-1 text-left"
                            >
                              <button
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleToggleStatus(student);
                                }}
                                disabled={updatingId === student.id}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                              >
                                {student.status === "active" ? (
                                  <>
                                    <XCircle className="w-4 h-4 text-rose-500" />
                                    <span>Mark as Inactive</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                    <span>Mark as Active</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setViewingStudentId(student.id);
                                }}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                              >
                                <Eye className="w-4 h-4 text-amber-500" />
                                <span>Details</span>
                              </button>

                              <button
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setEditingStudent(student);
                                  setIsModalOpen(true);
                                }}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                              >
                                <Edit className="w-4 h-4 text-zinc-400" />
                                <span>Edit</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-zinc-500">
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AddStudentModal
        isOpen={isModalOpen}
        initialData={editingStudent}
        onClose={() => {
          setIsModalOpen(false);
          setEditingStudent(null);
        }}
        onSuccess={() => {
          fetchStudents();
        }}
      />

      <StudentDetailsDrawer
        studentId={viewingStudentId}
        onClose={() => setViewingStudentId(null)}
      />
    </div>
  );
}
