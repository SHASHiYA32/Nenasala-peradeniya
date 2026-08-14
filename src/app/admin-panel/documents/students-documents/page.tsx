"use client";

import React, { useState } from "react";
import {
  FileCheck,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Clock,
  ExternalLink,
  Download,
  AlertCircle,
  Send,
  User,
  Check,
  X,
  RotateCcw,
  Paperclip,
} from "lucide-react";

interface UploadedDocument {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  program: string;
  docType: string;
  fileName: string;
  fileType: "pdf" | "image";
  fileUrl: string;
  uploadedAt: string;
  status: "pending" | "approved" | "rejected";
  rejectReason?: string;
}

const INITIAL_DOCUMENTS: UploadedDocument[] = [
  {
    id: "DOC-801",
    studentId: "STU-2026-041",
    studentName: "Sahan Jayasinghe",
    studentEmail: "sahan.j@gmail.com",
    program: "BSc in Software Engineering",
    docType: "National Identity Card (NIC)",
    fileName: "NIC_Front_Back_Sahan.pdf",
    fileType: "pdf",
    fileUrl: "#",
    uploadedAt: "2026-08-14 09:30 AM",
    status: "pending",
  },
  {
    id: "DOC-802",
    studentId: "STU-2026-042",
    studentName: "bhajbg Perera",
    studentEmail: "bhajbg.p@outlook.com",
    program: "Diploma in Information Technology",
    docType: "Advanced Level Certificate",
    fileName: "AL_Results_Certified.jpg",
    fileType: "image",
    fileUrl:
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800",
    uploadedAt: "2026-08-14 11:15 AM",
    status: "pending",
  },
  {
    id: "DOC-803",
    studentId: "STU-2026-043",
    studentName: "Tariq Ahamad",
    studentEmail: "tariq.a@yahoo.com",
    program: "MSc in Cyber Security",
    docType: "Degree Transcript",
    fileName: "BSc_Transcript_Official.pdf",
    fileType: "pdf",
    fileUrl: "#",
    uploadedAt: "2026-08-13 04:50 PM",
    status: "approved",
  },
];

const PRESET_REJECTION_REASONS = [
  "Document image is blurry / illegible",
  "Edges/corners cut off in scan",
  "Expired identification document",
  "Incorrect document uploaded for this slot",
  "Official seal/signature missing",
];

export default function DocumentApprovalRowsUI() {
  const [documents, setDocuments] = useState<UploadedDocument[]>(INITIAL_DOCUMENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  // Popup Modal States
  const [previewDoc, setPreviewDoc] = useState<UploadedDocument | null>(null);
  const [rejectingDoc, setRejectingDoc] = useState<UploadedDocument | null>(null);

  // Rejection Form State
  const [selectedReasonPreset, setSelectedReasonPreset] = useState(PRESET_REJECTION_REASONS[0]);
  const [customRemark, setCustomRemark] = useState("");

  // Filter queue
  const filteredDocs = documents.filter((d) => {
    const matchesSearch =
      d.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.docType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.studentId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" ? true : d.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Actions
  const handleApprove = (id: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "approved" } : d))
    );
  };

  const handleOpenRejectModal = (doc: UploadedDocument) => {
    setRejectingDoc(doc);
    setSelectedReasonPreset(PRESET_REJECTION_REASONS[0]);
    setCustomRemark("");
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingDoc) return;

    const finalReason = customRemark.trim() ? customRemark : selectedReasonPreset;

    setDocuments((prev) =>
      prev.map((d) =>
        d.id === rejectingDoc.id
          ? { ...d, status: "rejected", rejectReason: finalReason }
          : d
      )
    );

    setRejectingDoc(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <FileCheck className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Student Document Approvals
              </h1>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Verify student attachments, inspect documents in a pop-up viewer, and approve or reject entries.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-semibold">
              {documents.filter((d) => d.status === "pending").length} Pending Review
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search student, document name, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2 pl-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>

          <div className="flex gap-1 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 w-full sm:w-auto">
            {(["all", "pending", "approved", "rejected"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 capitalize rounded-lg transition-all ${
                  statusFilter === tab
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold shadow-sm"
                    : "hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Row View / Main Table */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm dark:shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/70 text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  <th className="py-4 px-6">Student Info</th>
                  <th className="py-4 px-6">Document Required</th>
                  <th className="py-4 px-6">Attachment (Click to View)</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-sm">
                {filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-zinc-500 text-sm">
                      No document records found.
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc) => (
                    <tr
                      key={doc.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      {/* Column 1: Student Details */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/20">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-zinc-900 dark:text-zinc-100">
                              {doc.studentName}
                            </div>
                            <div className="text-xs text-zinc-500">{doc.studentEmail}</div>
                            <span className="inline-block text-[10px] font-mono font-medium text-zinc-400 mt-0.5">
                              {doc.studentId}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Document Type */}
                      <td className="py-4 px-6">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-200 text-xs">
                          {doc.docType}
                        </div>
                        <div className="text-[11px] text-zinc-500">{doc.program}</div>
                      </td>

                      {/* Column 3: Attachment (Click to View Popup) */}
                      <td className="py-4 px-6">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-500/10 hover:border-blue-500/40 text-xs text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-all group"
                        >
                          <Paperclip className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                          <span className="truncate max-w-[150px] font-medium">{doc.fileName}</span>
                          <Eye className="w-3.5 h-3.5 text-zinc-400 ml-1 group-hover:text-blue-500" />
                        </button>
                      </td>

                      {/* Column 4: Status */}
                      <td className="py-4 px-6">
                        {doc.status === "pending" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold border border-amber-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Pending Review
                          </span>
                        )}
                        {doc.status === "approved" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approved
                          </span>
                        )}
                        {doc.status === "rejected" && (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 text-xs font-semibold border border-rose-500/20">
                              <XCircle className="w-3.5 h-3.5" />
                              Rejected
                            </span>
                            {doc.rejectReason && (
                              <p className="text-[11px] text-rose-600 dark:text-rose-300/80 max-w-[160px] truncate" title={doc.rejectReason}>
                                {doc.rejectReason}
                              </p>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Column 5: Actions */}
                      <td className="py-4 px-6 text-right">
                        {doc.status === "pending" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenRejectModal(doc)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-semibold transition-all"
                            >
                              <X className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                            <button
                              onClick={() => handleApprove(doc.id)}
                              className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-zinc-950 font-bold text-xs shadow-md transition-all"
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                              <span>Approve</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              setDocuments((prev) =>
                                prev.map((d) =>
                                  d.id === doc.id ? { ...d, status: "pending" } : d
                                )
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

      {/* POPUP 1: ATTACHMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 dark:bg-zinc-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/50">
              <div>
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 block">
                  {previewDoc.docType}
                </span>
                <span className="text-xs text-zinc-500">
                  Uploaded by {previewDoc.studentName} ({previewDoc.studentId})
                </span>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Document Body */}
            <div className="p-6 overflow-y-auto flex-1 flex items-center justify-center bg-zinc-100 dark:bg-zinc-950/60 min-h-[300px]">
              {previewDoc.fileType === "image" ? (
                <img
                  src={previewDoc.fileUrl}
                  alt={previewDoc.fileName}
                  className="max-h-[480px] w-auto object-contain rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-md"
                />
              ) : (
                <div className="text-center py-10 space-y-3 bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 max-w-sm shadow-sm">
                  <FileText className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto" />
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                    {previewDoc.fileName}
                  </div>
                  <p className="text-xs text-zinc-500">
                    PDF Document file is ready for download or external viewing.
                  </p>
                  <a
                    href={previewDoc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF File</span>
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer with Actions */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all font-semibold"
              >
                Close Preview
              </button>

              {previewDoc.status === "pending" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const doc = previewDoc;
                      setPreviewDoc(null);
                      handleOpenRejectModal(doc);
                    }}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-semibold transition-all"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                  <button
                    onClick={() => {
                      handleApprove(previewDoc.id);
                      setPreviewDoc(null);
                    }}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white dark:text-zinc-950 text-xs font-bold shadow-md transition-all"
                  >
                    <Check className="w-4 h-4 stroke-[3]" /> Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* POPUP 2: REJECTION REASON MODAL */}
      {rejectingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 dark:bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-5 h-5" />
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                  Reject Document
                </h2>
              </div>
              <button
                onClick={() => setRejectingDoc(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="p-6 space-y-4 text-sm">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <div className="text-xs text-zinc-500">Student:</div>
                <div className="font-bold text-zinc-900 dark:text-zinc-100">{rejectingDoc.studentName}</div>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">{rejectingDoc.docType}</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                  Select Reason for Rejection
                </label>
                <div className="space-y-1.5">
                  {PRESET_REJECTION_REASONS.map((reason, idx) => (
                    <label
                      key={idx}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedReasonPreset === reason && !customRemark
                          ? "border-rose-500/50 bg-rose-500/10 text-rose-800 dark:text-rose-200 font-semibold"
                          : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <input
                        type="radio"
                        name="rejectReason"
                        checked={selectedReasonPreset === reason && !customRemark}
                        onChange={() => {
                          setSelectedReasonPreset(reason);
                          setCustomRemark("");
                        }}
                        className="accent-rose-500"
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Custom Remark (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Additional details for student..."
                  value={customRemark}
                  onChange={(e) => setCustomRemark(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                />
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRejectingDoc(null)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 dark:bg-rose-500 text-white dark:text-zinc-950 font-bold text-xs hover:bg-rose-500 transition-all shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}