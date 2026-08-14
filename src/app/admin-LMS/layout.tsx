'use client';

import { useNav } from "@/components/context/NavContext";
import SidebarLMS from "@/components/layout/side-panel-admin-LMS";


export default function LMSDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isMobileOpen, closeMobile } = useNav();

  return (
    <div className="min-h-screen flex text-slate-100 bg-transparent">
      <SidebarLMS 
        isOpen={isMobileOpen} 
        onClose={closeMobile} 
      />
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <main className="flex-1 pt-16">
          {children}
        </main>
      </div>
    </div>
  );
}