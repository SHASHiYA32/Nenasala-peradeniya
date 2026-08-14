"use client";

import {
  BookUser,
  ChartNoAxesCombined,
  GraduationCap,
  ShieldUser,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Admin() {
  const router = useRouter();

  return (
    <div className="pt-24 w-full text-black dark:text-white mb-14 px-8 sm:px-12 xl:px-20">
      <div className="px-8 sm:px-32 flex flex-col gap-2 mb-12">
        <span className="text-3xl font-black">Dashboard</span>
        <p className="text-muted-foreground text-sm">
          Welcome back, Nimsara Perera! Select a portal to get started.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-4 xl:gap-8 px-8 sm:px-32">
        <button
          className="relative border border-amber-600/30 hover:border-amber-600 backdrop-blur-2xl rounded-3xl px-8 py-6 h-52 overflow-hidden cursor-pointer"
          onClick={() => router.push("/admin-panel/user/reg-student")}
        >
          <div className="absolute rounded-full bg-amber-600/25 h-52 w-52 -top-16 -right-16 blur-2xl" />
          <ShieldUser className="absolute h-42 w-42 -bottom-7 -right-7 rotate-12 -z-10 opacity-10" />
          <div className="w-full h-full flex flex-row items-start gap-5">
            <div className="h-full w-3 rounded-full bg-amber-600 shrink-0"></div>
            <div className="flex flex-col justify-center text-left gap-2">
              <span className="text-2xl font-bold">Admin Panel</span>
              <p className="text-sm">
                Manage users, students, permissions, and administrative access
                from one place.
              </p>
            </div>
          </div>
        </button>

        <button className="relative border border-amber-600/30 hover:border-amber-600 backdrop-blur-2xl rounded-3xl px-8 py-6 h-52 overflow-hidden cursor-pointer">
          <div className="absolute rounded-full bg-amber-600/25 h-52 w-52 -top-16 -right-16 blur-2xl" />
          <GraduationCap className="absolute h-42 w-42 -bottom-7 -right-7 rotate-12 -z-10 opacity-10" />
          <div className="w-full h-full flex flex-row items-start gap-5">
            <div className="h-full w-3 rounded-full bg-amber-600 shrink-0"></div>
            <div className="flex flex-col justify-center text-left gap-2">
              <span className="text-2xl font-bold">LMS</span>
              <p className="text-sm">
                Access course materials, assignments, learning modules, and
                track educational progress seamlessly.
              </p>
            </div>
          </div>
        </button>

        <button className="relative border border-amber-600/30 hover:border-amber-600 backdrop-blur-2xl rounded-3xl px-8 py-6 h-52 overflow-hidden cursor-pointer">
          <div className="absolute rounded-full bg-amber-600/25 h-52 w-52 -top-16 -right-16 blur-2xl" />
          <ChartNoAxesCombined className="absolute h-42 w-42 -bottom-7 -right-7 rotate-12 -z-10 opacity-10" />
          <div className="w-full h-full flex flex-row items-start gap-5">
            <div className="h-full w-3 rounded-full bg-amber-600 shrink-0"></div>
            <div className="flex flex-col justify-center text-left gap-2">
              <span className="text-2xl font-bold">Analytics & Reports</span>
              <p className="text-sm">
                View performance metrics, generate detailed insights, and
                analyze institutional data reports.
              </p>
            </div>
          </div>
        </button>

        <button className="relative border border-amber-600/30 hover:border-amber-600 backdrop-blur-2xl rounded-3xl px-8 py-6 h-52 overflow-hidden cursor-pointer">
          <div className="absolute rounded-full bg-amber-600/25 h-52 w-52 -top-16 -right-16 blur-2xl" />
          <BookUser className="absolute h-42 w-42 -bottom-7 -right-7 rotate-12 -z-10 opacity-10" />
          <div className="w-full h-full flex flex-row items-start gap-5">
            <div className="h-full w-3 rounded-full bg-amber-600 shrink-0"></div>
            <div className="flex flex-col justify-center text-left gap-2">
              <span className="text-2xl font-bold">Instructor Portal</span>
              <p className="text-sm">
                Create courses, grade student submissions, manage classes, and
                monitor learner engagement.
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
