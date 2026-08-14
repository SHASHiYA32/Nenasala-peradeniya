"use client";

import React, { useState } from "react";
import {
  Check,
  X,
  FileText,
  Eye,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Paperclip,
} from "lucide-react";

// Types
interface DocumentAttachment {
  id: string;
  name: string;
  type: "pdf" | "image";
  url: string;
}

interface PaidStudent {
  id: string;
  name: string;
  email: string;
  phone: string;
  program: string;
  paymentReceiptNo: string;
  paidAmount: string;
  paidAt: string;
  receiptAttachment: DocumentAttachment;
  studentDocuments: DocumentAttachment[];
  status: "pending" | "approved" | "rejected";
  rejectReason?: string;
}

// Initial Mock Data
const INITIAL_STUDENTS: PaidStudent[] = [
  {
    id: "STU-2026-001",
    name: "Kasun Perera",
    email: "kasun.p@gmail.com",
    phone: "+94 77 123 4567",
    program: "BSc in Computer Science",
    paymentReceiptNo: "REC-8890123",
    paidAmount: "$1,200",
    paidAt: "2026-08-14 14:20",
    receiptAttachment: {
      id: "rc-1",
      name: "Bank_Transfer_Slip.png",
      type: "image",
      url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800",
    },
    studentDocuments: [
      { id: "doc-1", name: "National_ID.pdf", type: "pdf", url: "#" },
      { id: "doc-2", name: "AL_Certificate.pdf", type: "pdf", url: "#" },
    ],
    status: "pending",
  },
  {
    id: "STU-2026-002",
    name: "Amaya Silva",
    email: "amaya.silva@outlook.com",
    phone: "+94 71 987 6543",
    program: "MSc in Data Analytics",
    paymentReceiptNo: "TXN-9981042",
    paidAmount: "$2,500",
    paidAt: "2026-08-14 11:05",
    receiptAttachment: {
      id: "rc-2",
      name: "Online_Payment_Receipt.pdf",
      type: "pdf",
      url: "#",
    },
    studentDocuments: [
      { id: "doc-3", name: "Passport_Copy.pdf", type: "pdf", url: "#" },
      { id: "doc-4", name: "Degree_Transcript.pdf", type: "pdf", url: "#" },
    ],
    status: "pending",
  },
  {
    id: "STU-2026-003",
    name: "Nimali Fernando",
    email: "nimali.f@yahoo.com",
    phone: "+94 76 555 8901",
    program: "Diploma in Web Engineering",
    paymentReceiptNo: "REC-4410928",
    paidAmount: "$850",
    paidAt: "2026-08-13 16:45",
    receiptAttachment: {
      id: "rc-3",
      name: "Deposit_Slip_Bank.jpg",
      type: "image",
      url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800",
    },
    studentDocuments: [
      { id: "doc-5", name: "NIC_Front_Back.pdf", type: "pdf", url: "#" },
    ],
    status: "pending",
  },
];

const PRESET_REJECT_REASONS = [
  "Payment slip is unreadable/blurry",
  "Incorrect payment amount deposited",
  "Transaction reference number mismatch",
  "Missing required qualification document(s)",
  "Duplicate registration attempt",
];

export default function EnrollmentApprovals() {
  const [students, setStudents] = useState<PaidStudent[]>(INITIAL_STUDENTS);
  const [searchQuery, setSearchQuery] = useState("");

  // Rejection Modal State
  const [rejectingStudent, setRejectingStudent] = useState<PaidStudent | null>(
    null,
  );
  const [selectedPresetReason, setSelectedPresetReason] = useState<string>("");
  const [customReason, setCustomReason] = useState("");

  // Preview Modal State for Receipts/Files
  const [previewDoc, setPreviewDoc] = useState<{
    title: string;
    doc: DocumentAttachment;
  } | null>(null);

  // Filter students
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.paymentReceiptNo.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Approve Handler
  const handleApprove = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status: "approved" } : s)),
    );
  };

  // Reject Trigger Handler
  const handleOpenRejectModal = (student: PaidStudent) => {
    setRejectingStudent(student);
    setSelectedPresetReason(PRESET_REJECT_REASONS[0]);
    setCustomReason("");
  };

  // Save Rejection Reason
  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingStudent) return;

    const finalReason = customReason.trim()
      ? customReason
      : selectedPresetReason;

    setStudents((prev) =>
      prev.map((s) =>
        s.id === rejectingStudent.id
          ? { ...s, status: "rejected", rejectReason: finalReason }
          : s,
      ),
    );

    setRejectingStudent(null);
  };

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Pending Enrollment Approvals
              </h1>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Verify payment receipts and uploaded qualification documents to
              grant student access.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-medium">
              {students.filter((s) => s.status === "pending").length} Pending
              Audits
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search student, email, or receipt no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2.5 pl-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
          </div>
        </div>

        {/* Main Enrollment Table */}
        <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm dark:shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/70 text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  <th className="py-4 px-6">Student Details</th>
                  <th className="py-4 px-6">Receipt / Payment Slip</th>
                  <th className="py-4 px-6">Student Documents</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-sm">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-12 text-center text-zinc-500 text-sm"
                    >
                      No matching student enrollment records found.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group"
                    >
                      {/* Column 1: Student Details */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                          {student.name}
                        </div>
                        <div className="text-xs text-zinc-600 dark:text-zinc-400">
                          {student.email}
                        </div>
                        <div className="text-xs text-zinc-500 font-mono mt-0.5">
                          {student.phone}
                        </div>
                        <span className="inline-block mt-2 text-[11px] font-medium px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60">
                          {student.program}
                        </span>
                      </td>

                      {/* Column 2: Payment Receipt & Attachment */}
                      <td className="py-4 px-6">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              {student.paymentReceiptNo}
                            </span>
                            <span className="font-bold text-zinc-900 dark:text-zinc-200 text-xs">
                              {student.paidAmount}
                            </span>
                          </div>

                          <div className="text-[11px] text-zinc-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-zinc-400" />
                            {student.paidAt}
                          </div>

                          {/* Slip attachment viewer button */}
                          <button
                            onClick={() =>
                              setPreviewDoc({
                                title: `Receipt: ${student.paymentReceiptNo}`,
                                doc: student.receiptAttachment,
                              })
                            }
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-all mt-1"
                          >
                            <Paperclip className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="truncate max-w-[140px]">
                              {student.receiptAttachment.name}
                            </span>
                            <Eye className="w-3.5 h-3.5 text-zinc-400 ml-auto" />
                          </button>
                        </div>
                      </td>

                      {/* Column 3: Student Documents */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1.5">
                          {student.studentDocuments.map((doc) => (
                            <button
                              key={doc.id}
                              onClick={() =>
                                setPreviewDoc({
                                  title: `${student.name} - ${doc.name}`,
                                  doc,
                                })
                              }
                              className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-950 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all w-fit"
                            >
                              <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              <span>{doc.name}</span>
                              <ExternalLink className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
                            </button>
                          ))}
                        </div>
                      </td>

                      {/* Column 4: Status */}
                      <td className="py-4 px-6">
                        {student.status === "pending" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold border border-amber-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse"></span>
                            Pending Approval
                          </span>
                        )}
                        {student.status === "approved" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approved
                          </span>
                        )}
                        {student.status === "rejected" && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 text-xs font-semibold border border-rose-500/20">
                              <XCircle className="w-3.5 h-3.5" />
                              Rejected
                            </span>
                            {student.rejectReason && (
                              <p
                                className="text-[11px] text-rose-600 dark:text-rose-300/80 max-w-[180px] truncate"
                                title={student.rejectReason}
                              >
                                Reason: {student.rejectReason}
                              </p>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Column 5: Action Buttons */}
                      <td className="py-4 px-6 text-right">
                        {student.status === "pending" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenRejectModal(student)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-semibold transition-all"
                            >
                              <X className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                            <button
                              onClick={() => handleApprove(student.id)}
                              className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-zinc-950 font-bold text-xs shadow-md transition-all"
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                              <span>Approve</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              setStudents((prev) =>
                                prev.map((s) =>
                                  s.id === student.id
                                    ? { ...s, status: "pending" }
                                    : s,
                                ),
                              )
                            }
                            className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 underline"
                          >
                            Reset Decision
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* REJECT REASON MODAL */}
      {rejectingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 dark:bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-5 h-5" />
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                  Reject Enrollment
                </h2>
              </div>
              <button
                onClick={() => setRejectingStudent(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleConfirmReject}
              className="p-6 space-y-4 text-sm"
            >
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80">
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  Rejecting student:
                </div>
                <div className="font-bold text-zinc-900 dark:text-zinc-100">
                  {rejectingStudent.name}
                </div>
                <div className="text-xs text-zinc-500">
                  {rejectingStudent.email}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                  Select Reason for Rejection
                </label>
                <div className="space-y-2">
                  {PRESET_REJECT_REASONS.map((reason, idx) => (
                    <label
                      key={idx}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedPresetReason === reason && !customReason
                          ? "border-rose-500/50 bg-rose-500/10 text-rose-800 dark:text-rose-200"
                          : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="rejectReason"
                        checked={
                          selectedPresetReason === reason && !customReason
                        }
                        onChange={() => {
                          setSelectedPresetReason(reason);
                          setCustomReason("");
                        }}
                        className="mt-0.5 accent-rose-500"
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Custom / Additional Remarks (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Specify further details regarding the rejection..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                />
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRejectingStudent(null)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 dark:bg-rose-500 text-white dark:text-zinc-950 font-bold text-xs hover:bg-rose-500 dark:hover:bg-rose-400 shadow-md transition-all"
                >
                  Save & Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT & RECEIPT PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 dark:bg-zinc-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                {previewDoc.title}
              </span>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950/60">
              {previewDoc.doc.type === "image" ? (
                <img
                  src={previewDoc.doc.url}
                  alt={previewDoc.doc.name}
                  className="max-h-[500px] w-auto object-contain rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-md"
                />
              ) : (
                <div className="text-center py-12 space-y-3">
                  <FileText className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto" />
                  <p className="text-zinc-800 dark:text-zinc-300 font-semibold text-sm">
                    {previewDoc.doc.name}
                  </p>
                  <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                    PDF Document previews are ready for download or external
                    viewing.
                  </p>
                  <a
                    href={previewDoc.doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF File</span>
                  </a>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all font-medium"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}