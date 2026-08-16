"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  BookOpen,
  Users,
  BarChart3,
  ArrowRight,
  Lock,
  KeyRound,
  UserCheck,
  LogOut,
  User,
  BadgeCheck,
  Mail,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
  first_name?: string;
  last_name?: string;
  full_name?: string;
  emp_id?: string;
  temp_psw?: string;
}

export default function AdminLandingPage() {
  const supabase = createClient();
  const router = useRouter();

  // Credentials & Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // User Profile & Session States
  const [loggedInUser, setLoggedInUser] = useState<{
    email: string;
    name: string;
    emp_id: string;
  } | null>(null);

  // UI Flow States
  const [isMustUpdatePsw, setIsMustUpdatePsw] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Check active session on initial component load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const user = session.user;
          setUserId(user.id);

          // Fetch profile details
          const { data: profile } = await supabase
            .from("user_profile")
            .select("*")
            .eq("user_id", user.id)
            .single();

          if (profile?.temp_psw && profile.temp_psw.trim() !== "") {
            setIsMustUpdatePsw(true);
          } else {
            const displayName =
              profile?.full_name ||
              `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() ||
              user.email?.split("@")[0] ||
              "Admin User";

            setLoggedInUser({
              email: user.email || "",
              name: displayName,
              emp_id: profile?.emp_id || "N/A",
            });
          }
        }
      } catch (err) {
        console.error("Session check error:", err);
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [supabase]);

  // 1. Handle Initial Sign In & Check temp_psw
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) throw authError;

      const user = authData.user;
      setUserId(user.id);

      const { data: profile, error: profileError } = await supabase
        .from("user_profile")
        .select("full_name, emp_id, temp_psw")
        .eq("user_id", user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        throw profileError;
      }

      if (profile?.temp_psw && profile.temp_psw.trim() !== "") {
        setIsMustUpdatePsw(true);
      } else {
        const displayName =
          profile?.full_name.trim() ||
          user.email?.split("@")[0] ||
          "Admin User";

        setLoggedInUser({
          email: user.email || "",
          name: displayName,
          emp_id: profile?.emp_id || "N/A",
        });
      }
    } catch (err) {
      const error = err as Error;
      setErrorMsg(error.message || "Failed to sign in.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Updating Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      if (!userId) {
        throw new Error("User session invalid. Please sign in again.");
      }

      const { error: updateAuthErr } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateAuthErr) throw updateAuthErr;

      const { error: updateProfileErr } = await supabase
        .from("user_profile")
        .update({ temp_psw: null })
        .eq("user_id", userId);

      if (updateProfileErr) throw updateProfileErr;

      router.push("/admin");
    } catch (err) {
      const error = err as Error;
      setErrorMsg(error.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Sign Out
  const handleSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoggedInUser(null);
    setIsMustUpdatePsw(false);
    setUserId(null);
    setEmail("");
    setPassword("");
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-4 sm:pt-10 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-white transition-colors duration-300 overflow-x-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[300px] bg-amber-500/10 dark:bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

      <main className="flex-1 flex items-center justify-center px-4 py-6 sm:py-12 relative z-10">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-medium tracking-wide uppercase max-w-full">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="truncate">
                Restricted Access • Secure Gateway
              </span>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                Nanasala Peradeniya{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-700 dark:from-amber-400 dark:to-amber-500">
                  Campus LMS
                </span>
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-lg leading-relaxed max-w-xl">
                Centralized administration portal for managing institutional
                modules, faculty credentials, student progress analytics, and
                campus-wide learning resources.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2 sm:pt-4">
              <div className="p-3.5 sm:p-4 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 shadow-sm backdrop-blur-sm">
                <Users className="w-5 h-5 text-amber-600 dark:text-amber-400 mb-1.5 sm:mb-2" />
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  User Control
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Manage roles and permissions securely.
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 shadow-sm backdrop-blur-sm">
                <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400 mb-1.5 sm:mb-2" />
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Curriculum
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Oversee courses and study materials.
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 shadow-sm backdrop-blur-sm">
                <BarChart3 className="w-5 h-5 text-amber-600 dark:text-amber-400 mb-1.5 sm:mb-2" />
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Analytics
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Monitor campus-wide engagement.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Form / Session Container */}
          <div className="lg:col-span-5 w-full">
            <div className="p-5 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full pointer-events-none" />

              <div className="space-y-5 sm:space-y-6">
                {errorMsg && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
                    {errorMsg}
                  </div>
                )}

                {checkingSession ? (
                  /* Loading State */
                  <div className="py-12 flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-600 dark:text-amber-400" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Checking active session...
                    </p>
                  </div>
                ) : loggedInUser ? (
                  /* Logged-In User Profile Container */
                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                        <UserCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
                          Active Session Detected
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          You are currently signed in to the admin portal.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/60 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          Name
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {loggedInUser.name}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs border-t border-slate-200/50 dark:border-zinc-700/40 pt-2.5">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" />
                          Email
                        </span>
                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                          {loggedInUser.email}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs border-t border-slate-200/50 dark:border-zinc-700/40 pt-2.5">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <BadgeCheck className="w-3.5 h-3.5" />
                          Employee ID
                        </span>
                        <span className="font-mono text-amber-700 dark:text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded">
                          {loggedInUser.emp_id}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => router.push("/admin")}
                        className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-amber-600 hover:bg-amber-500 dark:bg-amber-500 dark:hover:bg-amber-400 text-white font-semibold text-sm transition-all shadow-md shadow-amber-600/20 active:scale-[0.99]"
                      >
                        <span>Continue to Admin Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={handleSignOut}
                        disabled={loading}
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-transparent hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-400 font-medium text-xs transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out / Switch Account</span>
                      </button>
                    </div>
                  </div>
                ) : isMustUpdatePsw ? (
                  /* Update Password Required View */
                  <>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
                        Update Permanent Password
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        A temporary password was detected on your profile.
                        Please set a new permanent password to continue.
                      </p>
                    </div>

                    <form className="space-y-4" onSubmit={handleUpdatePassword}>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300 pl-3">
                          New Password
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                            <KeyRound className="w-4 h-4" />
                          </span>
                          <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 focus:bg-white dark:focus:bg-zinc-800 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300 pl-3">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                            <KeyRound className="w-4 h-4" />
                          </span>
                          <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 focus:bg-white dark:focus:bg-zinc-800 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-amber-600 hover:bg-amber-500 dark:bg-amber-500 dark:hover:bg-amber-400 text-white font-semibold text-sm transition-all shadow-md shadow-amber-600/20 active:scale-[0.99] disabled:opacity-50"
                      >
                        <span>
                          {loading ? "Updating..." : "Save & Proceed"}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  </>
                ) : (
                  /* Standard Admin Sign In Form */
                  <>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
                        Admin Sign In
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Enter your credentials to access the management
                        dashboard.
                      </p>
                    </div>

                    <form className="space-y-4" onSubmit={handleSignIn}>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300 pl-3">
                          Email
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                            <Lock className="w-4 h-4" />
                          </span>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@nanasalaperadeniya.ac.lk"
                            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 focus:bg-white dark:focus:bg-zinc-800 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between px-3">
                          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            Password
                          </label>
                          <a
                            href="#"
                            className="text-xs text-amber-600 dark:text-amber-400 hover:underline"
                          >
                            Forgot password?
                          </a>
                        </div>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                            <KeyRound className="w-4 h-4" />
                          </span>
                          <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 focus:bg-white dark:focus:bg-zinc-800 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-amber-600 hover:bg-amber-500 dark:bg-amber-500 dark:hover:bg-amber-400 text-white font-semibold text-sm transition-all shadow-md shadow-amber-600/20 active:scale-[0.99] disabled:opacity-50"
                      >
                        <span>
                          {loading ? "Authenticating..." : "Access Dashboard"}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  </>
                )}

                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 text-center">
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Protected by multi-factor authentication & institutional
                    security protocols.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 sm:py-6 px-4 text-center text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-zinc-800 relative z-10">
        <p>
          © {new Date().getFullYear()} Nanasala Peradeniya Campus. All rights
          reserved. • LMS Administrative Portal
        </p>
      </footer>
    </div>
  );
}
