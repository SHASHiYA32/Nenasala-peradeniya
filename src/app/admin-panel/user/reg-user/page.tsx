"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Mail,
  Calendar,
  X,
  Sparkles,
  Key,
  Loader2,
  Phone,
  Trash2,
  ShieldCheck,
  UserCog,
  Power,
  AlertTriangle,
  MoreVertical,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useCurrentUser } from "@/lib/hooks/current-user";
import { UserProfile } from "@/app/types/types";

type ConfirmActionType = "delete" | "toggle-status" | "toggle-role" | null;

interface ConfirmDialogState {
  isOpen: boolean;
  type: ConfirmActionType;
  user: UserProfile | null;
}

export default function StaffManagement() {
  const supabase = createClient();
  const { profile, loading: userLoading } = useCurrentUser();

  const isSuperAdmin = profile?.role === "superadmin";
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("admin");

  // Password Generator States (Register Modal)
  const [tempPsw, setTempPsw] = useState("");
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  // Re-generate Password Modal States
  const [regenUser, setRegenUser] = useState<UserProfile | null>(null);
  const [newTempPsw, setNewTempPsw] = useState("");
  const [isRegenGenerating, setIsRegenGenerating] = useState(false);
  const [regenProgress, setRegenProgress] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  // Confirmation Modal State
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    type: null,
    user: null,
  });

  // Superadmin Password Verification State
  const [adminPassword, setAdminPassword] = useState("");

  // Fetch Users from Database
  const fetchUsers = async () => {
    setFetching(true);
    try {
      const { data, error } = await supabase
        .from("user_profile")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err: any) {
      toast.error(err.message || "Error fetching users");
    } finally {
      setFetching(false);
    }
  };

  // Realtime Database Subscription & Initial Fetch
  useEffect(() => {
    fetchUsers();

    const channel = supabase
      .channel("realtime_user_profile")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_profile" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newUser = payload.new as UserProfile;
            setUsers((prev) => [
              newUser,
              ...prev.filter((u) => u.id !== newUser.id),
            ]);
          } else if (payload.eventType === "UPDATE") {
            const updatedUser = payload.new as UserProfile;
            setUsers((prev) =>
              prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
            );
          } else if (payload.eventType === "DELETE") {
            const deletedId = payload.old.id;
            setUsers((prev) => prev.filter((u) => u.id !== deletedId));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Generate Sequential EMP ID
  const generateEmpId = async () => {
    try {
      const { data, error } = await supabase
        .from("user_profile")
        .select("emp_id")
        .not("emp_id", "is", null);

      if (error) throw error;

      let nextNum = 1;
      if (data && data.length > 0) {
        const numbers = data
          .map((u) => {
            const match = u.emp_id?.match(/NPU-2026(\d+)/);
            return match ? parseInt(match[1], 10) : 0;
          })
          .filter((n) => !isNaN(n));

        if (numbers.length > 0) {
          nextNum = Math.max(...numbers) + 1;
        }
      }

      return `NPU-2026${String(nextNum).padStart(6, "0")}`;
    } catch (err) {
      return `NPU-2026${String(Date.now()).slice(-6)}`;
    }
  };

  // Utility String Generator
  const createRandomPassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let result = "";
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Password Generation (Register Modal)
  const handleGeneratePassword = () => {
    setIsGenerating(true);
    setProgress(0);
    setTempPsw("");

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setTempPsw(createRandomPassword());
        setIsGenerating(false);
        toast.success("Temporary password generated!");
      }
    }, 50);
  };

  // Create User
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tempPsw) {
      toast.warning("Please generate a temporary password first.");
      return;
    }

    setSubmitting(true);

    try {
      const generatedEmpId = await generateEmpId();

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: tempPsw,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (authError) throw authError;

      const newUserId = authData.user?.id;

      const { data: insertedData, error: profileError } = await supabase
        .from("user_profile")
        .insert([
          {
            full_name: fullName,
            email: email,
            phone: phone,
            role: role,
            emp_id: generatedEmpId,
            temp_psw: tempPsw,
            user_id: newUserId,
            status: "ACTIVE",
          },
        ])
        .select()
        .single();

      if (profileError) throw profileError;

      // Optimistic state update
      if (insertedData) {
        setUsers((prev) => [
          insertedData,
          ...prev.filter((u) => u.id !== insertedData.id),
        ]);
      }

      setFullName("");
      setEmail("");
      setPhone("");
      setRole("admin");
      setTempPsw("");
      setProgress(0);
      setIsModalOpen(false);

      toast.success(`User created successfully with ID ${generatedEmpId}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  // Re-generate Password Flow
  const handleGenerateNewPassword = async () => {
    if (!regenUser) return;

    setIsRegenGenerating(true);
    setRegenProgress(0);
    setNewTempPsw("");
    setIsCopied(false);

    let currentProgress = 0;
    const interval = setInterval(async () => {
      currentProgress += 10;
      setRegenProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        const password = createRandomPassword();

        try {
          // Optimistic local state update
          setUsers((prev) =>
            prev.map((u) =>
              u.id === regenUser.id ? { ...u, temp_psw: password } : u,
            ),
          );

          // Update temp_psw in user_profile table
          const { error } = await supabase
            .from("user_profile")
            .update({ temp_psw: password })
            .eq("id", regenUser.id);

          if (error) throw error;

          setNewTempPsw(password);
          toast.success("Password re-generated and table updated!");
        } catch (err: any) {
          fetchUsers(); // Revert back on failure
          toast.error(err.message || "Failed to update temporary password");
        } finally {
          setIsRegenGenerating(false);
        }
      }
    }, 50);
  };

  const handleCopyPassword = () => {
    if (!newTempPsw) return;
    navigator.clipboard.writeText(newTempPsw);
    setIsCopied(true);
    toast.success("Password copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Actions execution
  const handleConfirmAction = async () => {
    const { type, user } = confirmDialog;
    if (!type || !user) return;

    setActionLoading(true);

    try {
      if (type === "delete") {
        // Optimistic delete update
        setUsers((prev) => prev.filter((u) => u.id !== user.id));

        const { error } = await supabase
          .from("user_profile")
          .delete()
          .eq("id", user.id);

        if (error) throw error;
        toast.success(`User ${user.full_name || ""} deleted successfully`);
      } else if (type === "toggle-status") {
        const newStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

        // Optimistic status update
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)),
        );

        const { error } = await supabase
          .from("user_profile")
          .update({ status: newStatus })
          .eq("id", user.id);

        if (error) throw error;
        toast.success(`User status changed to ${newStatus}`);
      } else if (type === "toggle-role") {
        if (!adminPassword) {
          toast.warning("Please enter your password to confirm role change.");
          setActionLoading(false);
          return;
        }

        // 1. Get current logged-in superadmin details
        const {
          data: { user: superadminUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !superadminUser?.email) {
          throw new Error("Unable to retrieve superadmin account email.");
        }

        // 2. Validate password via Supabase Auth
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: superadminUser.email,
          password: adminPassword,
        });

        if (authError) {
          toast.error("Invalid password authentication.");
          setActionLoading(false);
          return;
        }

        // 3. Update target user role upon successful password check
        const newRole = user.role === "superadmin" ? "admin" : "superadmin";

        // Optimistic role update
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)),
        );

        const { error } = await supabase
          .from("user_profile")
          .update({ role: newRole })
          .eq("id", user.id);

        if (error) throw error;
        toast.success(`User role updated to ${newRole}`);
      }

      setConfirmDialog({ isOpen: false, type: null, user: null });
      setAdminPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to execute action");
      fetchUsers(); // Rollback local state on error
    } finally {
      setActionLoading(false);
    }
  };

  // Metrics
  const totalStaff = users.length;
  const activeStaff = users.filter((u) => u.status === "ACTIVE").length;
  const inactiveStaff = users.filter((u) => u.status !== "ACTIVE").length;

  // Search
  const filteredStaff = useMemo(() => {
    return users.filter(
      (member) =>
        (member.full_name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (member.email || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (member.emp_id || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (member.role || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.phone || "").toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [users, searchQuery]);

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage) || 1;
  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStaff.slice(start, start + itemsPerPage);
  }, [filteredStaff, currentPage]);

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 min-h-screen transition-colors duration-300 font-sans p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/5">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Staff Directory
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Manage employee profiles, authentication, and system roles
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-[0.98] transition-all duration-200"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Register User</span>
          </button>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity text-amber-500">
              <Users className="w-20 h-20 -mr-4 -mt-4" />
            </div>
            <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-2">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                <Users className="w-4 h-4" />
              </div>
              Total Users
            </div>
            <div className="text-3xl font-extrabold tracking-tight">
              {totalStaff}
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
              Database user records
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity text-emerald-500">
              <UserCheck className="w-20 h-20 -mr-4 -mt-4" />
            </div>
            <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <UserCheck className="w-4 h-4" />
              </div>
              Active Users
            </div>
            <div className="text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
              {activeStaff}
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
              Active accounts
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity text-rose-500">
              <UserX className="w-20 h-20 -mr-4 -mt-4" />
            </div>
            <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-2">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
                <UserX className="w-4 h-4" />
              </div>
              Inactive Users
            </div>
            <div className="text-3xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400">
              {inactiveStaff}
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
              Disabled accounts
            </p>
          </div>
        </div>

        {/* User Table Card */}
        <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden backdrop-blur-md">
          <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search name, EMP ID, role..."
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
                {filteredStaff.length}
              </span>{" "}
              staff members
            </div>
          </div>

          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
                  <th className="py-3.5 px-6">EMP ID</th>
                  <th className="py-3.5 px-6">Staff Member</th>
                  <th className="py-3.5 px-6">Phone</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6">Created At</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                {fetching ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-500">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                        Fetching database records...
                      </div>
                    </td>
                  </tr>
                ) : paginatedStaff.length > 0 ? (
                  paginatedStaff.map((member) => (
                    <tr
                      key={member.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors duration-150 group"
                    >
                      <td className="py-4 px-6 font-mono text-xs font-semibold text-amber-600 dark:text-amber-400">
                        {member.emp_id || "N/A"}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-zinc-950 font-bold flex items-center justify-center shadow-sm text-sm uppercase">
                            {member.full_name
                              ? member.full_name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)
                              : "U"}
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-500 transition-colors">
                              {member.full_name || "N/A"}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                              <Mail className="w-3 h-3" />
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-xs text-zinc-600 dark:text-zinc-400 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-zinc-400" />
                          {member.phone || "N/A"}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold capitalize border ${
                            member.role === "superadmin"
                              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {member.role === "superadmin" ? (
                            <ShieldCheck className="w-3.5 h-3.5" />
                          ) : (
                            <UserCog className="w-3.5 h-3.5" />
                          )}
                          {member.role || "admin"}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-zinc-500 dark:text-zinc-400 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                          {new Date(member.created_at).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        {member.status === "ACTIVE" ? (
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

                      {/* Hamburger Actions Menu */}
                      <td className="py-4 px-6 text-right relative">
                        <button
                          disabled={!isSuperAdmin}
                          onClick={() =>
                            setActiveMenuId(
                              activeMenuId === member.id ? null : member.id,
                            )
                          }
                          className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                          title={
                            !isSuperAdmin
                              ? "Only superadmins can manage user accounts"
                              : "Actions"
                          }
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {isSuperAdmin && activeMenuId === member.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setActiveMenuId(null)}
                            />
                            <div className="absolute right-6 top-12 z-20 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl py-1 text-xs text-left animate-in fade-in zoom-in-95 duration-100">
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  setRegenUser(member);
                                  setNewTempPsw("");
                                }}
                                className="w-full flex items-center text-start gap-2 px-3.5 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                              >
                                <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
                                Re-generate Temp Password
                              </button>

                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  setConfirmDialog({
                                    isOpen: true,
                                    type: "toggle-role",
                                    user: member,
                                  });
                                }}
                                className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                              >
                                <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
                                {member.role === "superadmin"
                                  ? "Make Admin"
                                  : "Make Superadmin"}
                              </button>

                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  setConfirmDialog({
                                    isOpen: true,
                                    type: "toggle-status",
                                    user: member,
                                  });
                                }}
                                className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                              >
                                <Power
                                  className={`w-3.5 h-3.5 ${
                                    member.status === "ACTIVE"
                                      ? "text-amber-500"
                                      : "text-emerald-500"
                                  }`}
                                />
                                {member.status === "ACTIVE"
                                  ? "Deactivate Account"
                                  : "Activate Account"}
                              </button>

                              <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  setConfirmDialog({
                                    isOpen: true,
                                    type: "delete",
                                    user: member,
                                  });
                                }}
                                className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-medium"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete Account
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-zinc-500 dark:text-zinc-400"
                    >
                      No matching records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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

      {/* Re-generate Temp Password Modal */}
      {regenUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold">Re-generate Password</h2>
              </div>
              <button
                onClick={() => setRegenUser(null)}
                className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Generate a new temporary password for{" "}
              <strong className="text-zinc-900 dark:text-zinc-100">
                {regenUser.full_name}
              </strong>
              . This will overwrite the existing password in the database.
            </p>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  placeholder="Click generate to create..."
                  value={newTempPsw}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-amber-600 dark:text-amber-400 font-bold tracking-wider focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  disabled={!newTempPsw}
                  className="px-3 py-2.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {isCopied ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {isCopied ? "Copied" : "Copy"}
                </button>
              </div>

              {isRegenGenerating && (
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full transition-all duration-75 ease-out"
                    style={{ width: `${regenProgress}%` }}
                  />
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRegenUser(null)}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleGenerateNewPassword}
                disabled={isRegenGenerating}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/20 disabled:opacity-50 transition-all"
              >
                {isRegenGenerating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Key className="w-3.5 h-3.5" />
                )}
                <span>
                  {isRegenGenerating ? "Updating..." : "Generate New"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold">Create User Account</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Vance"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. alex@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                  User Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all capitalize"
                >
                  <option value="superadmin">superadmin</option>
                  <option value="admin">admin</option>
                </select>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Temporary Password
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    disabled={isGenerating}
                    className="text-xs font-semibold text-amber-500 hover:text-amber-400 flex items-center gap-1 disabled:opacity-50"
                  >
                    <Key className="w-3.5 h-3.5" />
                    Generate
                  </button>
                </div>

                <input
                  type="text"
                  readOnly
                  placeholder="Click generate password..."
                  value={tempPsw}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 font-mono text-xs focus:outline-none text-amber-600 dark:text-amber-400 font-bold tracking-wider"
                />

                {isGenerating && (
                  <div className="w-full mt-2 bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full transition-all duration-75 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
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
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{submitting ? "Creating..." : "Create User"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {confirmDialog.isOpen && confirmDialog.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  confirmDialog.type === "delete"
                    ? "bg-rose-500/10 text-rose-500"
                    : "bg-amber-500/10 text-amber-500"
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">
                {confirmDialog.type === "delete" && "Delete User Account"}
                {confirmDialog.type === "toggle-status" &&
                  "Change Account Status"}
                {confirmDialog.type === "toggle-role" && "Update User Role"}
              </h3>
            </div>

            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {confirmDialog.type === "delete" && (
                <>
                  Are you sure you want to delete profile for{" "}
                  <strong className="text-zinc-900 dark:text-zinc-100">
                    {confirmDialog.user.full_name}
                  </strong>
                  ? This action cannot be undone.
                </>
              )}
              {confirmDialog.type === "toggle-status" && (
                <>
                  Set status for{" "}
                  <strong className="text-zinc-900 dark:text-zinc-100">
                    {confirmDialog.user.full_name}
                  </strong>{" "}
                  to{" "}
                  <span className="font-semibold text-amber-500">
                    {confirmDialog.user.status === "ACTIVE"
                      ? "INACTIVE"
                      : "ACTIVE"}
                  </span>
                  ?
                </>
              )}
              {confirmDialog.type === "toggle-role" && (
                <>
                  Change role of{" "}
                  <strong className="text-zinc-900 dark:text-zinc-100">
                    {confirmDialog.user.full_name}
                  </strong>{" "}
                  to{" "}
                  <span className="font-semibold text-purple-500">
                    {confirmDialog.user.role === "superadmin"
                      ? "admin"
                      : "superadmin"}
                  </span>
                  ?
                </>
              )}
            </p>

            {confirmDialog.type === "toggle-role" && (
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                  Enter Superadmin Password to Confirm
                </label>
                <input
                  type="password"
                  placeholder="Enter your current password..."
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>
            )}

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setConfirmDialog({ isOpen: false, type: null, user: null });
                  setAdminPassword("");
                }}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={actionLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 ${
                  confirmDialog.type === "delete"
                    ? "bg-rose-500 hover:bg-rose-600 text-white"
                    : "bg-amber-500 hover:bg-amber-400 text-zinc-950"
                }`}
              >
                {actionLoading && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
