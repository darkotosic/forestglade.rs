"use client";
import type { AuditLogDto } from "@/lib/types";
import{useEffect,useState}from"react";import{AdminShell}from"@/components/admin/admin-shell";import{adminFetch}from"@/lib/admin-api";
export default function Page(){const[logs,setLogs]=useState<AuditLogDto[]>([]);useEffect(()=>{adminFetch<{ok:true;logs:AuditLogDto[]}>('/audit').then(d=>setLogs(d.logs))},[]);return <AdminShell><h1 className="text-3xl font-semibold">Audit log</h1><div className="mt-6 rounded-2xl bg-white"><table className="w-full text-sm"><tbody>{logs.map(x=><tr className="border-t" key={x.id}><td className="p-3">{new Date(x.createdAt).toLocaleString('sr-RS')}</td><td>{x.admin?.name??'Sistem'}</td><td>{x.action}</td><td>{x.entity}</td><td>{x.message}</td></tr>)}</tbody></table></div></AdminShell>}
