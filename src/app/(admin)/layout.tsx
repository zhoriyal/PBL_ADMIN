import Sidebar from "../../components/admin/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-[#F5F0E8] text-slate-800 font-sans">
      {/* Container Sidebar */}
      <div className="w-[216px] shrink-0">
        <Sidebar />
      </div>

      {/* Main Content dengan margin/padding yang aman */}
      <main className="flex-1 w-full min-w-0 overflow-x-auto p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}