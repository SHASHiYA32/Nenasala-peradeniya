"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  User,
  LogOut,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useNav } from "../context/NavContext";
import { useCurrentUser } from "@/lib/hooks/current-user";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const { isMobileOpen, toggleMobile } = useNav();
  const { profile, loading } = useCurrentUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const isRoot = pathname === "/";
  const isAdmin = pathname === "/admin";
  const hideHamburger = isRoot || isAdmin;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setDropdownOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <div className="fixed w-full h-16 bg-white dark:bg-black border-b-2 border-amber-700/20 backdrop-blur-2xl px-4 md:px-52 z-50">
      <div className="w-full h-full flex flex-row items-center justify-between">
        {/* Mobile Toggle & Logo */}
        <div className="flex items-center gap-3">
          {!hideHamburger && (
            <button
              onClick={toggleMobile}
              className="p-2 text-slate-600 dark:text-slate-300 md:hidden focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isMobileOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          )}

          <a href="/">
            <span className="text-black dark:text-white font-semibold">
              Nenasala
            </span>{" "}
            <span className="text-amber-600 font-semibold">Peradeniya</span>
          </a>
        </div>

        {/* Right Section */}
        <div className="flex flex-row items-center gap-4">
          <ThemeToggle />

          {/* Render controls when profile fetching finishes */}
          {!loading && (
            <>
              {/* Show Dashboard Button ONLY if logged in AND on the root route ("/") */}
              {profile && isRoot && (
                <Link
                  href="/admin"
                  className="h-9 px-3 md:px-4 flex items-center justify-center bg-amber-600 text-white rounded-full hover:scale-105 transition-all cursor-pointer text-sm font-medium"
                  aria-label="Dashboard"
                >
                  <LayoutDashboard className="h-5 w-5 md:hidden" />
                  <span className="hidden md:inline">Dashboard</span>
                </Link>
              )}

              {profile ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center focus:outline-none"
                  >
                    <div className="bg-amber-700/20 w-8 h-8 rounded-full overflow-hidden cursor-pointer ring-2 ring-amber-600/30 hover:ring-amber-600 transition-all flex items-center justify-center text-amber-600 font-bold">
                      {profile.full_name
                        ? profile.full_name.charAt(0).toUpperCase()
                        : "U"}
                    </div>
                  </button>

                  {/* Profile Dropdown Popup */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-mist-950 text-white border border-amber-400 dark:border-amber-950 rounded-2xl shadow-2xl p-4 z-50">
                      {/* User Info Header */}
                      <div className="pb-3 border-b border-slate-800/80">
                        <h4 className="font-semibold text-base text-black dark:text-white">
                          {profile.full_name || "User"}
                        </h4>
                        <p className="text-xs text-slate-400 font-mono truncate">
                          {profile.email}
                        </p>

                        {/* Employee ID / Role Badge */}
                        <div className="flex flex-col items-center gap-2 mt-2">
                          <span className="inline-flex w-full items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-600/30 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-400 border border-emerald-800/50">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {profile.role || "User"}
                          </span>
                          {profile.emp_id && (
                            <span className="inline-flex w-full items-center gap-1 px-2 py-1 rounded-md text-xs font-mono bg-muted text-gray-800 dark:text-slate-300">
                              <BadgeCheck className="w-3 h-3 text-amber-500" />
                              {profile.emp_id}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Dropdown Options */}
                      <div className="py-2 space-y-1">
                        <Link
                          href="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-black dark:text-white bg-muted hover:bg-slate-800/60 rounded-xl transition-colors"
                        >
                          <User className="w-4 h-4 text-black dark:text-white" />
                          Profile
                        </Link>
                      </div>

                      {/* Logout Button */}
                      <button
                        onClick={handleLogout}
                        className="w-full mt-1 flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-red-800 dark:text-red-300 bg-red-600/40 dark:bg-red-700/40 dark:hover:bg-red-700 hover:bg-red-400 border cursor-pointer border-red-900/40 rounded-xl transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Show Sign In button if no profile/session is found */
                <Link
                  href="/"
                  className="h-9 px-5 flex items-center justify-center bg-amber-600 text-white rounded-full hover:scale-105 transition-all cursor-pointer text-sm font-medium"
                >
                  Sign In
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}