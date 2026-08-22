"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  User,
  BookOpen,
  UploadCloud,
  FileText,
  Trash2,
  ImageIcon,
  Copy,
  Mail,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Course, Intake, SuccessDetails } from "@/app/types/types";
import { toast } from "@/components/ui/toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: any;
}

export default function AddStudentModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: AddStudentModalProps) {
  const supabase = createClient();

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingIntakes, setLoadingIntakes] = useState(false);

  const [slipFiles, setSlipFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [registeredData, setRegisteredData] = useState<SuccessDetails | null>(
    null,
  );
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    gender: "Male",
    address: "",
    gardian_name: "",
    gardian_phone: "",
    reg_amount: "",
    status: "active",
    course_id: "",
    intake_id: "",
    paid_amount: "",
  });

  // Extract ID reliably across various API object structures
  const extractId = (obj: any, keys: string[]): string => {
    if (!obj) return "";
    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
        return String(obj[key]);
      }
    }
    return "";
  };

  useEffect(() => {
    if (isOpen) {
      const initModal = async () => {
        setLoadingCourses(true);

        // 1. Fetch courses
        const { data: coursesData, error } = await supabase
          .from("courses")
          .select("*, programmes(*)");

        let loadedCourses: Course[] = [];
        if (!error && coursesData) {
          setCourses(coursesData);
          loadedCourses = coursesData;
        }
        setLoadingCourses(false);

        // 2. Extract courseId and intakeId from initialData with robust fallback
        if (initialData) {
          const rawCourseId =
            extractId(initialData, ["course_id", "courseId", "courses_id"]) ||
            extractId(initialData.courses, ["id"]) ||
            extractId(initialData.course, ["id"]);

          const rawIntakeId =
            extractId(initialData, ["intake_id", "intakeId", "intakes_id"]) ||
            extractId(initialData.intakes, ["id"]) ||
            extractId(initialData.intake, ["id"]);

          setFormData({
            full_name: initialData.name || initialData.full_name || "",
            email: initialData.email || "",
            phone: initialData.phone || "",
            gender: initialData.gender || "Male",
            address: initialData.address || "",
            gardian_name: initialData.gardian_name || "",
            gardian_phone: initialData.gardian_phone || "",
            reg_amount: String(initialData.reg_amount || ""),
            status: initialData.status || "active",
            course_id: rawCourseId,
            intake_id: rawIntakeId,
            paid_amount: String(initialData.paid_amount || ""),
          });

          // 3. Hydrate Selected Course & Intakes
          if (rawCourseId) {
            const course =
              loadedCourses.find((c) => String(c.id) === rawCourseId) || null;
            setSelectedCourse(course);

            setLoadingIntakes(true);
            const { data: intakeData } = await supabase
              .from("intakes")
              .select("*")
              .eq("course_id", rawCourseId);

            if (intakeData) {
              const priorityOrder: Record<string, number> = {
                active: 1,
                "in-progress": 1,
                inprogress: 1,
                open: 1,
                upcoming: 2,
              };

              const sorted = [...intakeData].sort((a, b) => {
                const rankA =
                  priorityOrder[(a.status ?? "").toLowerCase()] || 3;
                const rankB =
                  priorityOrder[(b.status ?? "").toLowerCase()] || 3;
                return rankA - rankB;
              });

              setIntakes(sorted);
            }
            setLoadingIntakes(false);
          }
        }
      };

      initModal();
    }
  }, [isOpen, initialData]);

  const fetchCourses = async () => {
    setLoadingCourses(true);
    const { data, error } = await supabase
      .from("courses")
      .select("*, programmes(*)");

    if (!error && data) {
      setCourses(data);
    }
    setLoadingCourses(false);
  };

  const fetchIntakes = async (courseId: string) => {
    setLoadingIntakes(true);
    const { data, error } = await supabase
      .from("intakes")
      .select("*")
      .eq("course_id", courseId);

    if (!error && data) {
      const priorityOrder: Record<string, number> = {
        active: 1,
        "in-progress": 1,
        inprogress: 1,
        open: 1,
        upcoming: 2,
      };

      const sorted = [...data].sort((a, b) => {
        const rankA = priorityOrder[(a.status ?? "").toLowerCase()] || 3;
        const rankB = priorityOrder[(b.status ?? "").toLowerCase()] || 3;
        return rankA - rankB;
      });

      setIntakes(sorted);
    }
    setLoadingIntakes(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "reg_amount") {
      setFormData((prev) => {
        const currentPaid = parseFloat(prev.paid_amount) || 0;
        const newReg = parseFloat(value) || 0;
        return {
          ...prev,
          reg_amount: value,
          paid_amount: currentPaid < newReg ? value : prev.paid_amount,
        };
      });
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "course_id") {
      const course =
        courses.find((c) => String(c.id) === String(value)) || null;
      setSelectedCourse(course);
      setFormData((prev) => ({ ...prev, course_id: value, intake_id: "" }));
      if (value) fetchIntakes(value);
      else setIntakes([]);
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSlipFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSlipFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setSlipFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadSlips = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const file of slipFiles) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;
      const filePath = `slips/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("slips")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("slips").getPublicUrl(filePath);
      if (data?.publicUrl) {
        uploadedUrls.push(data.publicUrl);
      }
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const slipUrls = await uploadSlips();

      const endpoint = initialData
        ? `/api/students/${initialData.id}`
        : "/api/students";
      const method = initialData ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formData,
          slipUrls,
          program_title: selectedCourse?.programmes?.programme_title || "N/A",
          course_name: selectedCourse?.course_name || "N/A",
        }),
      });

      const resData = await response.json();

      if (!resData.success) {
        throw new Error(resData.error);
      }

      toast.add({
        type: "success",
        description: `Student ${initialData ? "updated" : "registered"} successfully!`,
      });

      if (!initialData) {
        setRegisteredData(resData.data);
      } else {
        handleClose();
      }

      onSuccess?.();
    } catch (err: any) {
      console.error("Error submitting record:", err.message);
      toast.add({
        type: "error",
        description: "Failed: " + err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleClose = () => {
    setStep(1);
    setSelectedCourse(null);
    setIntakes([]);
    setSlipFiles([]);
    setRegisteredData(null);
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      gender: "Male",
      address: "",
      gardian_name: "",
      gardian_phone: "",
      reg_amount: "",
      status: "active",
      course_id: "",
      intake_id: "",
      paid_amount: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  const minPaidRequired = parseFloat(formData.reg_amount) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {registeredData ? (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b pb-4 border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    Student Registered
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Student account generated successfully.
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 bg-zinc-50 dark:bg-zinc-950/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-xs font-semibold text-zinc-500">
                  Student Register ID
                </span>
                <span className="font-mono font-bold text-amber-500">
                  {registeredData.stu_register_id}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-xs font-semibold text-zinc-500">
                  Program & Course
                </span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200 text-right">
                  {registeredData.program_title} - {registeredData.course_name}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-xs font-semibold text-zinc-500">
                  Email
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs">
                    {registeredData.email}
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(registeredData.email, "email")
                    }
                    className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"
                  >
                    {copiedField === "email" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-zinc-500">
                  Temp Password
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    {registeredData.temp_psw}
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(registeredData.temp_psw, "psw")
                    }
                    className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"
                  >
                    {copiedField === "psw" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-medium">
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span>Student credentials sent via email</span>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-xl transition-all"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {initialData
                    ? "Edit Student Details"
                    : step === 1
                      ? "Step 1: Student Personal Details"
                      : "Step 2: Academic & Enrollment Details"}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {initialData
                    ? "Update existing student profile details."
                    : "Fill in the required information to add a student to the system."}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="grid grid-cols-2 bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold">
              <div
                className={`p-3 flex items-center justify-center gap-2 border-r border-zinc-200 dark:border-zinc-800 ${
                  step === 1
                    ? "text-amber-500 bg-amber-500/10"
                    : "text-emerald-500"
                }`}
              >
                <User className="w-4 h-4" />
                <span>1. Student Profile</span>
                {step > 1 && (
                  <Check className="w-3.5 h-3.5 ml-auto text-emerald-500" />
                )}
              </div>
              <div
                className={`p-3 flex items-center justify-center gap-2 ${
                  step === 2
                    ? "text-amber-500 bg-amber-500/10"
                    : "text-zinc-400"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>2. Academic & Enrollment</span>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {step === 1 ? (
                <form
                  id="step1-form"
                  onSubmit={handleNextStep}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                        Full Name *
                      </label>
                      <input
                        required
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        placeholder="e.g. John Doe"
                        className="w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                        Email *
                      </label>
                      <input
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        className="w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                        Phone
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 234 567 890"
                        className="w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                        Gender
                      </label>
                      <Select
                        value={formData.gender || "Male"}
                        onValueChange={(val) =>
                          handleSelectChange("gender", val ?? "")
                        }
                      >
                        <SelectTrigger className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800">
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                        Guardian Name
                      </label>
                      <input
                        type="text"
                        name="gardian_name"
                        value={formData.gardian_name}
                        onChange={handleInputChange}
                        placeholder="Guardian full name"
                        className="w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                        Guardian Phone
                      </label>
                      <input
                        type="text"
                        name="gardian_phone"
                        value={formData.gardian_phone}
                        onChange={handleInputChange}
                        placeholder="Guardian phone number"
                        className="w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                        Registration Amount (LKR)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="reg_amount"
                        value={formData.reg_amount}
                        onChange={handleInputChange}
                        placeholder="100.00"
                        className="w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                        Profile Status
                      </label>
                      <Select
                        value={formData.status || "active"}
                        onValueChange={(val) =>
                          handleSelectChange("status", val ?? "")
                        }
                      >
                        <SelectTrigger className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                      Address
                    </label>
                    <textarea
                      rows={2}
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Street address details..."
                      className="w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </form>
              ) : (
                <form
                  id="step2-form"
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  {/* Course Selection */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                      Select Course *
                    </label>
                    {loadingCourses ? (
                      <div className="flex items-center gap-2 text-xs text-amber-500 py-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Loading
                        courses...
                      </div>
                    ) : (
                      <Select
                        key={formData.course_id || "no-course"}
                        value={formData.course_id || undefined}
                        onValueChange={(val) =>
                          handleSelectChange("course_id", val ?? "")
                        }
                      >
                        <SelectTrigger className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800">
                          <SelectValue placeholder="-- Choose a Course --" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem
                              key={course.id}
                              value={String(course.id)}
                            >
                              {course.course_name} ({course.course_code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Course Banner */}
                  {selectedCourse && (
                    <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-3">
                      <div className="flex gap-4 items-start">
                        {selectedCourse.cover_image ? (
                          <img
                            src={selectedCourse.cover_image}
                            alt={selectedCourse.course_name || "Course Cover"}
                            className="w-20 h-20 object-cover rounded-lg border border-zinc-200 dark:border-zinc-800 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ImageIcon className="w-6 h-6 text-zinc-400" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h4 className="font-bold text-amber-500 text-sm truncate">
                                {selectedCourse.course_name}
                              </h4>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                                Code: {selectedCourse.course_code || "N/A"}
                              </p>
                            </div>
                            {selectedCourse.course_amount && (
                              <span className="font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg text-xs whitespace-nowrap">
                                LKR {selectedCourse.course_amount}
                              </span>
                            )}
                          </div>

                          {selectedCourse.programmes?.programme_title && (
                            <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                              Programme:{" "}
                              {selectedCourse.programmes.programme_title}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Select Intake */}
                  {formData.course_id && (
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                        Select Intake *
                      </label>
                      {loadingIntakes ? (
                        <div className="flex items-center gap-2 text-xs text-amber-500 py-2">
                          <Loader2 className="w-4 h-4 animate-spin" /> Loading
                          intakes...
                        </div>
                      ) : intakes.length === 0 ? (
                        <div className="p-3 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl font-medium">
                          No intake at this moment
                        </div>
                      ) : (
                        <Select
                          key={formData.intake_id || "no-intake"}
                          value={formData.intake_id || undefined}
                          onValueChange={(val) =>
                            handleSelectChange("intake_id", val ?? "")
                          }
                        >
                          <SelectTrigger className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800">
                            <SelectValue placeholder="-- Choose an Intake --" />
                          </SelectTrigger>
                          <SelectContent>
                            {intakes.map((intake) => (
                              <SelectItem
                                key={intake.id}
                                value={String(intake.id)}
                              >
                                {intake.name} ({intake.code}) - [
                                {(intake.status ?? "").toUpperCase()}]
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )}

                  {/* Paid Amount */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                      Paid Amount (LKR)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min={minPaidRequired}
                      name="paid_amount"
                      value={formData.paid_amount}
                      onChange={handleInputChange}
                      placeholder={`Min: LKR ${minPaidRequired}`}
                      className="w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  {/* Slips Upload */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                      Upload Payment Slips
                    </label>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                        isDragging
                          ? "border-amber-500 bg-amber-500/10"
                          : "border-zinc-300 dark:border-zinc-800 hover:border-amber-500/50"
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,application/pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <UploadCloud className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium">
                        Drag and drop slips here, or{" "}
                        <span className="text-amber-500 underline">browse</span>
                      </p>
                    </div>

                    {slipFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {slipFiles.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 text-xs bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="w-4 h-4 text-amber-500 flex-shrink-0" />
                              <span className="truncate">{file.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(idx)}
                              className="text-red-400 hover:text-red-500 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </form>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
              {step === 2 ? (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>

                {step === 1 ? (
                  <button
                    type="submit"
                    form="step1-form"
                    className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold px-5 py-2 rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    form="step2-form"
                    disabled={loading}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold px-5 py-2 rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 stroke-[3]" />
                    )}
                    {initialData ? "Update Record" : "Save Record"}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
