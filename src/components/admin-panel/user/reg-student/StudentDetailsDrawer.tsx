"use client";

import React from "react";
import {
  X,
  User,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  CreditCard,
  ShieldCheck,
  Building,
} from "lucide-react";
import { useStudentDetails } from "@/lib/hooks/useStudentDetails";

interface StudentDetailsDrawerProps {
  studentId: string | null;
  onClose: () => void;
}

export default function StudentDetailsDrawer({
  studentId,
  onClose,
}: StudentDetailsDrawerProps) {
  const { data, loading, error } = useStudentDetails(studentId);

  if (!studentId) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 h-full p-6 space-y-6 overflow-y-auto border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col justify-between">
        
        {/* Header */}
        <div>
          <div className="flex items-center justify-between border-b pb-4 border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight">Student Details</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Full profile & academic record
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading student details...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-xs text-rose-500 bg-rose-500/10 rounded-xl p-4 my-6 border border-rose-500/20">
              {error}
            </div>
          ) : (
            <div className="space-y-6 mt-6">
              {/* Profile Card */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {data?.student?.full_name || "N/A"}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      data?.student?.status === "active"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                    }`}
                  >
                    {data?.student?.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{data?.student?.email || "No email provided"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{data?.student?.phone || "No phone provided"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Address: {data?.student?.address || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Guardian Info */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Guardian Information
                </h4>
                <div className="text-xs space-y-1">
                  <p className="font-medium text-zinc-800 dark:text-zinc-200">
                    Name: {data?.student?.gardian_name || "N/A"}
                  </p>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    Phone: {data?.student?.gardian_phone || "N/A"}
                  </p>
                </div>
              </div>

              {/* Enrollment History */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> Enrolled Courses
                </h4>

                {!data?.enrollments || data.enrollments.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic">No enrollment records found.</p>
                ) : (
                  data.enrollments.map((e: any) => (
                    <div
                      key={e.enrollment_id}
                      className="p-4 bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {e.course?.title || "N/A"}
                          </p>
                          <p className="text-xs text-zinc-500">
                            Code: {e.course?.code || "N/A"}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          {e.status}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/80 grid grid-cols-2 gap-2 text-xs text-zinc-500">
                        <div>
                          <span className="text-[10px] text-zinc-400 block">Intake</span>
                          <span className="font-medium text-zinc-700 dark:text-zinc-300">
                            {e.intake?.name || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-400 block">Paid Amount</span>
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            LKR {e.paid_amount || "0.00"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 font-semibold rounded-xl text-xs transition-colors"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
}