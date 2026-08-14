"use client";

import React, { useState } from "react";
import {
  CalendarX,
  Search,
  User,
  Clock,
  BookOpen,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  Send,
  Eye,
  Check,
} from "lucide-react";

interface CanceledClass {
  id: string;
  instructorName: string;
  instructorEmail: string;
  courseName: string;
  batchCode: string;
  classDate: string;
  classTime: string;
  canceledAt: string;
  reasonCategory: string;
  reasonDetails: string;
  status: "pending" | "acknowledged" | "action_required";
  adminResponse?: string;
}

const INITIAL_CANCELLATIONS: CanceledClass[] = [
  {
    id: "CNC-101",
    instructorName: "Dr. Aruni Bandara",
    instructorEmail: "aruni.b@university.lk",
    courseName: "Database Management Systems",
    batchCode: "CS-2026-FULL",
    classDate: "2026-08-16",
    classTime: "09:00 AM - 11:00 AM",
    canceledAt: "2026-08-14 10:30 AM",
    reasonCategory: "Medical Emergency",
    reasonDetails:
      "Sudden fever and severe throat infection. Doctor advised 2 days of bed rest.",
    status: "pending",
  },
  {
    id: "CNC-102",
    instructorName: "Prof. Kamal Gunaratne",
    instructorEmail: "kamal.g@university.lk",
    courseName: "Advanced Web Development",
    batchCode: "WE-2026-EVE",
    classDate: "2026-08-15",
    classTime: "05:00 PM - 08:00 PM",
    canceledAt: "2026-08-13 04:15 PM",
    reasonCategory: "Academic Conference",
    reasonDetails:
      "Attending the IEEE Regional Tech Summit in Colombo as a keynote speaker.",
    status: "acknowledged",
    adminResponse: "Acknowledged. Makeup lecture approved for August 22nd.",
  },
  {
    id: "CNC-103",
    instructorName: "Ms. Dilini Jayawardena",
    instructorEmail: "dilini.j@university.lk",
    courseName: "UI/UX Design Principles",
    batchCode: "UX-2026-BATCH1",
    classDate: "2026-08-18",
    classTime: "01:00 PM - 03:00 PM",
    canceledAt: "2026-08-14 02:00 PM",
    reasonCategory: "Personal Reasons",
    reasonDetails:
      "Urgent family emergency requiring travel outside Kandy for two days.",
    status: "pending",
  },
];

export default function CanceledClassesUI() {
  const [cancellations, setCancellations] = useState<CanceledClass[]>(
    INITIAL_CANCELLATIONS,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<CanceledClass | null>(
    null,
  );
  const [responseAction, setResponseAction] = useState<
    "acknowledged" | "action_required"
  >("acknowledged");
  const [responseText, setResponseText] = useState("");

  // Filter records
  const filtered = cancellations.filter(
    (c) =>
      c.instructorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.batchCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.reasonCategory.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Open Response Modal
  const handleOpenResponse = (record: CanceledClass) => {
    setSelectedRecord(record);
    setResponseAction("acknowledged");
    setResponseText(record.adminResponse || "");
  };

  // Submit Response
  const handleSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    setCancellations((prev) =>
      prev.map((item) =>
        item.id === selectedRecord.id
          ? {
              ...item,
              status: responseAction,
              adminResponse: responseText.trim(),
            }
          : item,
      ),
    );

    setSelectedRecord(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <CalendarX className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Canceled Class Requests
              </h1>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Review reasons provided by instructors for canceled lectures and
              issue administrative responses.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold">
              {cancellations.filter((c) => c.status === "pending").length}{" "}
              Pending Review
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              {cancellations.filter((c) => c.status === "acknowledged").length}{" "}
              Acknowledged
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search by instructor, course, or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2.5 pl-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm dark:shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/70 text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  <th className="py-4 px-6">Instructor</th>
                  <th className="py-4 px-6">Class Schedule</th>
                  <th className="py-4 px-6">Cancellation Reason</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-sm">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-12 text-center text-zinc-500 text-sm"
                    >
                      No canceled class notices found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      {/* Instructor Details */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 font-bold text-xs border border-zinc-200 dark:border-zinc-700">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-zinc-900 dark:text-zinc-100">
                              {item.instructorName}
                            </div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">
                              {item.instructorEmail}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Course and Schedule */}
                      <td className="py-4 px-6 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-200 text-xs">
                          <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                          {item.courseName}
                        </div>
                        <div className="text-[11px] text-zinc-500 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-zinc-400" />
                          {item.classDate} | {item.classTime}
                        </div>
                        <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                          {item.batchCode}
                        </span>
                      </td>

                      {/* Reason Details */}
                      <td className="py-4 px-6 max-w-xs">
                        <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 mb-1">
                          {item.reasonCategory}
                        </span>
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                          "{item.reasonDetails}"
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        {item.status === "pending" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold border border-amber-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Pending Review
                          </span>
                        )}
                        {item.status === "acknowledged" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Acknowledged
                          </span>
                        )}
                        {item.status === "action_required" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 text-xs font-semibold border border-rose-500/20">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Requires Reschedule
                          </span>
                        )}
                      </td>

                      {/* Action Button */}
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleOpenResponse(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-semibold text-xs transition-all shadow-sm"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>
                            {item.status === "pending"
                              ? "Respond"
                              : "View / Edit"}
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RESPONSE & DETAILS MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 dark:bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarX className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                  Class Cancellation Details
                </h2>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={handleSubmitResponse}
              className="p-6 space-y-4 text-sm"
            >
              {/* Instructor & Class Info Card */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                      {selectedRecord.instructorName}
                    </h3>
                    <p className="text-xs text-zinc-500">
                      {selectedRecord.instructorEmail}
                    </p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono">
                    {selectedRecord.id}
                  </span>
                </div>

                <hr className="border-zinc-200 dark:border-zinc-800 my-2" />

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-zinc-400 block">Course:</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {selectedRecord.courseName}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block">Batch Code:</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {selectedRecord.batchCode}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-zinc-400 block">
                      Scheduled Date & Time:
                    </span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      {selectedRecord.classDate} ({selectedRecord.classTime})
                    </span>
                  </div>
                </div>
              </div>

              {/* Stated Reason */}
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Cancellation Reason Stated by Instructor
                </label>
                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-zinc-800 dark:text-zinc-200 text-xs leading-relaxed">
                  <span className="font-bold text-amber-700 dark:text-amber-400 block mb-0.5">
                    [{selectedRecord.reasonCategory}]
                  </span>
                  {selectedRecord.reasonDetails}
                </div>
              </div>

              {/* Select Response Decision */}
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                  Administrative Action
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setResponseAction("acknowledged")}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      responseAction === "acknowledged"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" /> Acknowledge & Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setResponseAction("action_required")}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      responseAction === "action_required"
                        ? "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" /> Request Makeup Date
                  </button>
                </div>
              </div>

              {/* Response Message Input */}
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Remark / Response Note to Instructor
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Approved. Please arrange a makeup session next week or submit online recording..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
