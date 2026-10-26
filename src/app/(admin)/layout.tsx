import Sidebar from "../../components/admin/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-[#F5F0E8] text-slate-800 font-sans overflow-hidden">
      {/* Container Sidebar - sticky */}
      <div className="w-[216px] shrink-0 h-screen sticky top-0">
        <Sidebar />
      </div>

      {/* Main Content - scrollable */}
      <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}