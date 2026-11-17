import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { isAuthenticatedAdmin } from "@/lib/server-auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAuthenticatedAdmin())) {
    redirect("/login");
  }

  return <AdminShell>{children}</AdminShell>;
}