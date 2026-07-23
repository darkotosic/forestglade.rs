"use client";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { adminFetch } from "@/lib/admin-api";
import type { AdminUserDto } from "@/lib/types";
export default function Page() {
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  useEffect(() => {
    adminFetch<{ ok: true; users: AdminUserDto[] }>("/users").then((d) => setUsers(d.users));
  }, []);
  return (
    <AdminShell>
      <h1 className="text-3xl font-semibold">Korisnici</h1>
      <div className="mt-6 rounded-2xl bg-white">
        <table className="w-full text-sm">
          <tbody>
            {users.map((u) => (
              <tr className="border-t" key={u.id}>
                <td className="p-3">{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.isActive ? "Aktivan" : "Neaktivan"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
