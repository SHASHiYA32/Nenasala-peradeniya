"use client";

import React, { useState } from "react";
import {
  Megaphone,
  Plus,
  Image as ImageIcon,
  Smile,
  X,
  Trash2,
  Pin,
  Calendar,
  Users,
  Send,
  AlertCircle,
  Bell,
  Sparkles,
  CheckCircle,
  Clock,
  BookOpen,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Available Lucide Icons to use as Custom Emojis/Badges
const AVAILABLE_ICONS = [
  { name: "Megaphone", icon: Megaphone, label: "Notice" },
  { name: "Alert", icon: AlertCircle, label: "Important" },
  { name: "Sparkles", icon: Sparkles, label: "Event" },
  { name: "Check", icon: CheckCircle, label: "Completed" },
  { name: "Clock", icon: Clock, label: "Deadline" },
  { name: "Book", icon: BookOpen, label: "Academic" },
];

interface Announcement {
  id: number;
  title: string;
  content: string;
  targetGroup: string;
  iconName: string;
  imageUrl?: string;
  date: string;
  isPinned: boolean;
  author: string;
}

export default function ClassAnnouncementsUI() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: 1,
      title: "Mid-Term Examination Schedule & Syllabus Update",
      content:
        "Please review the updated exam schedule for the upcoming Mid-Terms. Syllabus guidelines have been updated in the portal. All assignments must be submitted prior to the exam week.",
      targetGroup: "All Batches",
      iconName: "Alert",
      imageUrl:
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80",
      date: "2026-03-14",
      isPinned: true,
      author: "Academic Office",
    },
    {
      id: 2,
      title: "Annual Hackathon 2026 Registration Open!",
      content:
        "Get ready for 24 hours of innovation, coding, and networking! Form teams of up to 4 students. Prizes worth $5,000 up for grabs.",
      targetGroup: "Computer Science",
      iconName: "Sparkles",
      imageUrl: "",
      date: "2026-03-12",
      isPinned: false,
      author: "Tech Club",
    },
  ]);

  // Modal & Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    targetGroup: "All Batches",
    iconName: "Megaphone",
    imageUrl: "",
    isPinned: false,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Handle local image file selection
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData((prev) => ({ ...prev, imageUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
  };

  // Submit announcement
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;

    const newAnnouncement: Announcement = {
      id: Date.now(),
      ...formData,
      date: new Date().toISOString().split("T")[0],
      author: "Instructor / Admin",
    };

    setAnnouncements([newAnnouncement, ...announcements]);

    // Reset Form
    setFormData({
      title: "",
      content: "",
      targetGroup: "All Batches",
      iconName: "Megaphone",
      imageUrl: "",
      isPinned: false,
    });
    setImagePreview(null);
    setIsModalOpen(false);
  };

  // Toggle pin
  const togglePin = (id: number) => {
    setAnnouncements((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isPinned: !item.isPinned } : item
      )
    );
  };

  // Delete announcement
  const handleDelete = (id: number) => {
    setAnnouncements((prev) => prev.filter((item) => item.id !== id));
  };

  // Helper to render dynamically chosen Lucide Icon
  const renderIcon = (iconName: string, className = "w-5 h-5") => {
    const found = AVAILABLE_ICONS.find((item) => item.name === iconName);
    const IconComp = found ? found.icon : Megaphone;
    return <IconComp className={className} />;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <Bell className="w-8 h-8 text-amber-500" />
              Student Announcements
            </h1>
            <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">
              Broadcast updates, exam alerts, and events directly to your class.
            </p>
          </div>

          {/* Add Announcement Dialog */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger>
              <a className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95">
                <Plus className="w-5 h-5 stroke-[2.5]" />
                New Announcement
              </a>
            </DialogTrigger>

            <DialogContent className="sm:max-w-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-amber-500" />
                  Create Announcement
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                {/* Title & Custom Emoji Selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-zinc-400 mb-2">
                    Title & Custom Icon Tag
                  </label>
                  <div className="flex gap-2">
                    {/* Icon Selection Trigger */}
                    <button
                      type="button"
                      onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                      className="p-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl hover:border-amber-500 transition-colors flex items-center justify-center text-amber-500"
                      title="Select Custom Icon"
                    >
                      {renderIcon(formData.iconName, "w-5 h-5")}
                    </button>

                    <input
                      type="text"
                      required
                      placeholder="e.g. Mid-Term Examination Guidelines"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="flex-1 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 text-sm outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Icon Selector Grid Dialog / Popup */}
                  {isEmojiPickerOpen && (
                    <div className="mt-3 p-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl grid grid-cols-6 gap-2">
                      {AVAILABLE_ICONS.map((item) => {
                        const IconComponent = item.icon;
                        return (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, iconName: item.name });
                              setIsEmojiPickerOpen(false);
                            }}
                            className={`p-2.5 rounded-lg flex flex-col items-center justify-center text-xs transition-all ${
                              formData.iconName === item.name
                                ? "bg-amber-500 text-slate-950 font-bold"
                                : "hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300"
                            }`}
                          >
                            <IconComponent className="w-5 h-5 mb-1" />
                            <span className="text-[10px]">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Target Audience */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-zinc-400 mb-2">
                    Target Students
                  </label>
                  <select
                    value={formData.targetGroup}
                    onChange={(e) =>
                      setFormData({ ...formData, targetGroup: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 text-sm outline-none focus:border-amber-500"
                  >
                    <option value="All Batches">All Batches</option>
                    <option value="Computer Science 2026">
                      Computer Science 2026
                    </option>
                    <option value="UI/UX Engineering">UI/UX Engineering</option>
                    <option value="Data Science Track">
                      Data Science Track
                    </option>
                  </select>
                </div>

                {/* Content Message */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-zinc-400 mb-2">
                    Announcement Body
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Write your notice here..."
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 text-sm outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                {/* Image Upload Area */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-zinc-400 mb-2">
                    Attach Image (Optional)
                  </label>

                  {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 max-h-48">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-1.5 rounded-full backdrop-blur-md transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-slate-200 dark:border-zinc-800 hover:border-amber-500/50 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-zinc-900/50">
                      <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                      <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                        Click to upload image banner
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1">
                        PNG, JPG, or WEBP up to 5MB
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Pin Checkbox */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="pinToggle"
                    checked={formData.isPinned}
                    onChange={(e) =>
                      setFormData({ ...formData, isPinned: e.target.checked })
                    }
                    className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
                  />
                  <label
                    htmlFor="pinToggle"
                    className="text-xs font-medium text-slate-600 dark:text-zinc-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Pin className="w-3.5 h-3.5 text-amber-500" /> Pin this
                    announcement to top
                  </label>
                </div>

                {/* Modal Footer Controls */}
                <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-zinc-800">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl text-sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-xl text-sm font-semibold bg-amber-500 text-slate-950 hover:bg-amber-600 gap-2"
                  >
                    <Send className="w-4 h-4" /> Post Announcement
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Announcements List */}
        <div className="space-y-6">
          {announcements.map((item) => (
            <div
              key={item.id}
              className={`relative bg-white dark:bg-zinc-900/70 border rounded-2xl p-6 transition-all duration-300 space-y-4 ${
                item.isPinned
                  ? "border-amber-500/50 shadow-md shadow-amber-500/5"
                  : "border-slate-200 dark:border-zinc-800"
              }`}
            >
              {/* Header Info */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20">
                    {renderIcon(item.iconName, "w-6 h-6")}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {item.title}
                      </h2>
                      {item.isPinned && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                          <Pin className="w-3 h-3" /> Pinned
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-zinc-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> {item.targetGroup}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {item.date}
                      </span>
                      <span>•</span>
                      <span>By {item.author}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => togglePin(item.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      item.isPinned
                        ? "text-amber-500 hover:bg-amber-500/10"
                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
                    }`}
                    title={
                      item.isPinned ? "Unpin Notice" : "Pin to top"
                    }
                  >
                    <Pin className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Text Body */}
              <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
                {item.content}
              </p>

              {/* Attached Banner Image */}
              {item.imageUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 max-h-80 bg-black/5">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          ))}

          {/* Empty State */}
          {announcements.length === 0 && (
            <div className="text-center py-16 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl">
              <Megaphone className="w-10 h-10 text-slate-400 dark:text-zinc-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-zinc-400 text-sm">
                No announcements posted yet. Click above to broadcast one.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}