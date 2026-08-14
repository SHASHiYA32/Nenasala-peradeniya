"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ChevronDown,
  GraduationCap,
  ShieldAlert,
  User,
  Users,
  User2,
  BookUser,
  Book,
  BookCheck,
  Percent,
  GraduationCapIcon,
  CalendarDays,
  CreditCard,
  UserCheck,
  Mail,
  CalendarX,
  FolderKanban,
  FileCheck2,
  ShieldCheck,
} from "lucide-react";

interface SubItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface MenuItem {
  name: string;
  href?: string;
  icon: React.ElementType;
  subItems?: SubItem[];
}

const menuItems: MenuItem[] = [
  {
    name: "User",
    icon: Users,
    subItems: [
      {
        name: "Register Student",
        href: "/admin-panel/user/reg-student",
        icon: GraduationCap,
      },
      {
        name: "Register User",
        href: "/admin-panel/user/reg-user",
        icon: User2,
      },
      {
        name: "Register Instructor",
        href: "/admin-panel/user/reg-instructor",
        icon: BookUser,
      },
    ],
  },
  {
    name: "Program & Courses",
    icon: GraduationCapIcon,
    href: "/admin-panel/courses",
  },
  {
    name: "Intakes",
    icon: CalendarDays,
    href: "/admin-panel/intakes",
  },
  {
    name: "Payments",
    icon: CreditCard,
    subItems: [
      {
        name: "Enrollments",
        href: "/admin-panel/payments/enrollments",
        icon: UserCheck,
      },
      {
        name: "Discounts",
        href: "/admin-panel/payments/discounts",
        icon: Percent,
      },
    ],
  },
  {
    name: "Emails",
    icon: Mail,
    href: "/admin-panel/emails",
  },
  {
    name: "Class Cancellation Requests",
    icon: CalendarX,
    href: "/admin-panel/classes",
  },
  {
    name: "Documents",
    icon: FolderKanban,
    subItems: [
      {
        name: "Document Verifications",
        href: "/admin-panel/documents/students-documents",
        icon: ShieldCheck,
      },
      {
        name: "Assignment Verifications",
        href: "/admin-panel/documents/assignments",
        icon: FileCheck2,
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  // Track open state for each dropdown menu by its name
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({
    User: true, // Default "User" dropdown to open
  });

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <aside className="w-64 h-screen bg-white dark:bg-black fixed left-0 top-0 hidden md:flex flex-col p-4 pt-20 z-40 border-r border-slate-100 dark:border-neutral-900">
      <div className="h-full w-full flex flex-col justify-between p-1">
        <div>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isChildActive =
                hasSubItems &&
                item.subItems?.some((sub) => pathname === sub.href);
              const isActive = pathname === item.href || isChildActive;
              const isMenuOpen = openMenus[item.name] ?? false;

              return (
                <div key={item.name} className="space-y-1">
                  {hasSubItems ? (
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-medium transition-all duration-200 relative overflow-hidden group ${
                        isActive
                          ? "text-amber-600 bg-amber-600/10 border border-amber-500/20"
                          : "text-black dark:text-white hover:text-amber-500 hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                            isActive
                              ? "text-amber-600"
                              : "text-slate-400 group-hover:text-amber-600"
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isMenuOpen ? "rotate-180" : ""
                        } text-slate-400`}
                      />
                    </button>
                  ) : (
                    <Link
                      href={item.href || "#"}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition-all duration-200 relative overflow-hidden group ${
                        isActive
                          ? "text-amber-600 bg-amber-600/10 border border-amber-500/20"
                          : "text-black dark:text-white hover:text-amber-500 hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                          isActive
                            ? "text-amber-600"
                            : "text-slate-400 group-hover:text-amber-600"
                        }`}
                      />
                      <span>{item.name}</span>
                    </Link>
                  )}

                  {hasSubItems && (
                    <AnimatePresence>
                      {isMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden pl-4 space-y-1 mt-1"
                        >
                          {item.subItems?.map((subItem) => {
                            const SubIcon = subItem.icon;
                            const isSubActive = pathname === subItem.href;

                            return (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                                  isSubActive
                                    ? "text-amber-600 bg-amber-600/10 font-semibold"
                                    : "text-slate-500 dark:text-slate-400 hover:text-amber-500 hover:bg-white/5"
                                }`}
                              >
                                <SubIcon
                                  className={`h-4 w-4 ${
                                    isSubActive
                                      ? "text-amber-600"
                                      : "text-slate-400"
                                  }`}
                                />
                                <span>{subItem.name}</span>
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}