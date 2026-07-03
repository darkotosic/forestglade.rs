"use client";
import { AdminGuard } from "./admin-guard"; import { AdminSidebar } from "./admin-sidebar";
export function AdminShell({children}:{children:React.ReactNode}){return <AdminGuard><div className="grid min-h-screen md:grid-cols-[280px_1fr]"><AdminSidebar/><main className="bg-stone-50 p-6 md:p-10">{children}</main></div></AdminGuard>}
