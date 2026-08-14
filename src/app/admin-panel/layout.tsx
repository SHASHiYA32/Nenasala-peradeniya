import SidebarAdmin from "@/components/layout/side-panel-admin";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex text-slate-100 bg-transparent">
      <SidebarAdmin />
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <main className="flex-1 pt-16">
          {children}
        </main>
      </div>
    </div>
  );
}
