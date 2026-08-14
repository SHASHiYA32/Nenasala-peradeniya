"use client";

import React, { useState } from "react";
import {
  Video,
  Plus,
  Filter,
  Play,
  Clock,
  Calendar,
  MoreVertical,
  Pencil,
  Trash2,
  PauseCircle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface Recording {
  id: number;
  title: string;
  type: "youtube" | "zoom";
  url: string;
  date: string;
  duration: string;
  instructor: string;
  isOnHold?: boolean;
}

export default function ClassRecordingsUI() {
  // Sample Data State
  const [recordings, setRecordings] = useState<Recording[]>([
    {
      id: 1,
      title: "Advanced React Hooks Masterclass",
      type: "youtube",
      url: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Embed URL for iframe popup
      date: "2026-03-10",
      duration: "45 mins",
      instructor: "Sarah Jenkins",
      isOnHold: false,
    },
    {
      id: 2,
      title: "UI/UX Weekly Design Critique",
      type: "zoom",
      url: "https://zoom.us/rec/example2",
      date: "2026-03-12",
      duration: "1 hr 15 mins",
      instructor: "Alex Rivera",
      isOnHold: false,
    },
  ]);

  // UI States
  const [activeTab, setActiveTab] = useState<"all" | "youtube" | "zoom">("all");
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingRecording, setEditingRecording] = useState<Recording | null>(
    null,
  );

  // Watch Popup State
  const [selectedVideo, setSelectedVideo] = useState<Recording | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    type: "youtube" as "youtube" | "zoom",
    url: "",
    instructor: "",
    duration: "",
  });

  const filteredRecordings = recordings.filter((item) => {
    if (activeTab === "youtube") return item.type === "youtube";
    if (activeTab === "zoom") return item.type === "zoom";
    return true;
  });

  // Helper to open Add modal
  const handleOpenAddModal = () => {
    setEditingRecording(null);
    setFormData({
      title: "",
      type: "youtube",
      url: "",
      instructor: "",
      duration: "",
    });
    setShowAddEditModal(true);
  };

  // Helper to open Edit modal
  const handleOpenEditModal = (recording: Recording) => {
    setEditingRecording(recording);
    setFormData({
      title: recording.title,
      type: recording.type,
      url: recording.url,
      instructor: recording.instructor,
      duration: recording.duration,
    });
    setShowAddEditModal(true);
  };

  // Submit Add / Edit
  const handleSaveRecording = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.title || !formData.url) return;

    if (editingRecording) {
      // Edit existing
      setRecordings((prev) =>
        prev.map((item) =>
          item.id === editingRecording.id ? { ...item, ...formData } : item,
        ),
      );
    } else {
      // Add new
      const newEntry: Recording = {
        id: Date.now(),
        ...formData,
        date: new Date().toISOString().split("T")[0],
        isOnHold: false,
      };
      setRecordings([newEntry, ...recordings]);
    }

    setShowAddEditModal(false);
  };

  // Delete Recording
  const handleDelete = (id: number) => {
    setRecordings((prev) => prev.filter((item) => item.id !== id));
  };

  // Toggle Hold / Publish
  const handleToggleHold = (id: number) => {
    setRecordings((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isOnHold: !item.isOnHold } : item,
      ),
    );
  };

  // Helper to convert standard YouTube links to embed links if needed
  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/watch?v=")) {
      return url.replace("watch?v=", "embed/");
    }
    if (url.includes("youtu.be/")) {
      return url.replace("youtu.be/", "youtube.com/embed/");
    }
    return url;
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 transition-colors duration-200 dark:bg-black dark:text-slate-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header & Add Button */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Class Recordings
            </h1>
            <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">
              Publish and access your YouTube streams and Zoom online classes.
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-200 cursor-pointer active:scale-95"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            Add Class Recording
          </button>
        </header>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-slate-400 dark:text-zinc-500 mr-2" />

          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "all"
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                : "bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800"
            }`}
          >
            All Recordings
          </button>

          <button
            onClick={() => setActiveTab("youtube")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "youtube"
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                : "bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800"
            }`}
          >
            <Video className="w-4 h-4 text-red-500" />
            YouTube
          </button>

          <button
            onClick={() => setActiveTab("zoom")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "zoom"
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                : "bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800"
            }`}
          >
            <Video className="w-4 h-4 text-blue-500" />
            Zoom
          </button>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecordings.map((item) => (
            <div
              key={item.id}
              className={`group relative bg-slate-50 dark:bg-zinc-900/60 border rounded-2xl p-5 hover:border-amber-500/50 dark:hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between ${
                item.isOnHold
                  ? "border-amber-500/40 opacity-80"
                  : "border-slate-200 dark:border-zinc-800/80"
              }`}
            >
              <div>
                {/* Platform Badge Header & Actions Menu */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {item.type === "youtube" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                        <Video className="w-3.5 h-3.5" />
                        YouTube
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        <Video className="w-3.5 h-3.5" />
                        Zoom Class
                      </span>
                    )}

                    {item.isOnHold && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        <PauseCircle className="w-3 h-3" />
                        On Hold
                      </span>
                    )}
                  </div>

                  {/* Actions Dropdown Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={() => handleOpenEditModal(item)}
                        className="cursor-pointer"
                      >
                        <Pencil className="w-4 h-4 mr-2 text-slate-500" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleToggleHold(item.id)}
                        className="cursor-pointer"
                      >
                        {item.isOnHold ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                            Publish
                          </>
                        ) : (
                          <>
                            <PauseCircle className="w-4 h-4 mr-2 text-amber-500" />
                            Hold
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(item.id)}
                        className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 group-hover:text-amber-500 transition-colors line-clamp-2">
                  {item.title}
                </h3>

                {/* Metadata */}
                <div className="mt-3 text-xs text-slate-500 dark:text-zinc-400 space-y-1">
                  <p className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {item.date}
                  </p>
                  {item.instructor && (
                    <p>
                      Instructor:{" "}
                      <span className="text-slate-700 dark:text-zinc-300 font-medium">
                        {item.instructor}
                      </span>
                    </p>
                  )}
                  {item.duration && (
                    <p className="flex items-center gap-1 mt-2">
                      <Clock className="w-3 h-3" /> {item.duration}
                    </p>
                  )}
                </div>
              </div>

              {/* Watch Recording Trigger */}
              <button
                onClick={() => setSelectedVideo(item)}
                className="mt-6 flex items-center justify-center gap-2 w-full bg-slate-200 dark:bg-zinc-800 hover:bg-amber-500 hover:text-slate-950 dark:hover:bg-amber-500 dark:hover:text-slate-950 text-slate-800 dark:text-zinc-200 font-medium py-2 rounded-xl transition-all duration-200 text-sm cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" /> Watch Recording
              </button>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredRecordings.length === 0 && (
          <div className="text-center py-16 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl">
            <p className="text-slate-400 dark:text-zinc-500">
              No recordings found for this platform.
            </p>
          </div>
        )}

        {/* --- SHADCN DIALOG: Watch Recording Modal --- */}
        <Dialog
          open={!!selectedVideo}
          onOpenChange={(open) => !open && setSelectedVideo(null)}
        >
          <DialogContent className="sm:max-w-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
            {selectedVideo && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    {selectedVideo.type === "youtube" ? (
                      <Video className="w-5 h-5 text-red-500" />
                    ) : (
                      <Video className="w-5 h-5 text-blue-500" />
                    )}
                    {selectedVideo.title}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-slate-500 dark:text-zinc-400">
                    Recorded on {selectedVideo.date}
                    {selectedVideo.instructor
                      ? ` • ${selectedVideo.instructor}`
                      : ""}
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-4">
                  {selectedVideo.type === "youtube" ? (
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black">
                      <iframe
                        src={getEmbedUrl(selectedVideo.url)}
                        title={selectedVideo.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-4">
                      <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-md">
                        Zoom class recordings are best viewed directly on the
                        Zoom platform. Click below to open in a new tab.
                      </p>
                      <a
                        href={selectedVideo.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all"
                      >
                        <ExternalLink className="w-4 h-4" /> Open Zoom Recording
                      </a>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* --- SHADCN DIALOG: Add / Edit Recording Modal --- */}
        <Dialog
          open={showAddEditModal}
          onOpenChange={(open) => setShowAddEditModal(open)}
        >
          <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {editingRecording
                  ? "Edit Class Recording"
                  : "Add Class Recording"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSaveRecording} className="space-y-4 mt-2">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-zinc-400 mb-1">
                  Platform Source
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() =>
                      setFormData({ ...formData, type: "youtube" })
                    }
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-sm font-medium ${
                      formData.type === "youtube"
                        ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "border-slate-200 dark:border-zinc-800"
                    }`}
                  >
                    <Video className="w-4 h-4 text-red-500" /> YouTube
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, type: "zoom" })}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-sm font-medium ${
                      formData.type === "zoom"
                        ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "border-slate-200 dark:border-zinc-800"
                    }`}
                  >
                    <Video className="w-4 h-4 text-blue-500" /> Zoom
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-zinc-400 mb-1">
                  Class Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Structures & Algorithms"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 text-sm outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-zinc-400 mb-1">
                  Recording URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={formData.url}
                  onChange={(e) =>
                    setFormData({ ...formData, url: e.target.value })
                  }
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 text-sm outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-zinc-400 mb-1">
                    Instructor
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Prof. Smith"
                    value={formData.instructor}
                    onChange={(e) =>
                      setFormData({ ...formData, instructor: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 text-sm outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-zinc-400 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1h 30m"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 text-sm outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setShowAddEditModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-amber-500 text-slate-950 hover:bg-amber-600"
                >
                  {editingRecording ? "Update" : "Publish"}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
