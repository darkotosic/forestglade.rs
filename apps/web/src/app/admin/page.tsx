"use client";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { adminFetch } from "@/lib/admin-api";

type DashboardDto = { newLeads:number; totalLeads:number; totalMedia:number; publishedMedia:number; apartmentsByStatus:{status:string; _count:number}[] };
export default function AdminHome(){
  const [d,setD]=useState<DashboardDto>();
  useEffect(()=>{adminFetch<DashboardDto & {ok:true}>("/dashboard").then(setD)},[]);
  const count=(status:string)=>d?.apartmentsByStatus?.find((x)=>x.status===status)?._count;
  const cards=[['Novi leadovi',d?.newLeads],['Ukupno leadova',d?.totalLeads],['Upload media',d?.totalMedia],['Objavljeno media',d?.publishedMedia],['Slobodni apartmani',count('AVAILABLE')],['Prodati',count('SOLD')]];
  return <AdminShell><h1 className="text-3xl font-semibold">Dashboard</h1><div className="mt-8 grid gap-4 md:grid-cols-3">{cards.map(([k,v])=><div className="rounded-2xl bg-white p-6" key={String(k)}><p className="text-sm text-stone-500">{k}</p><p className="mt-3 text-3xl font-bold">{v??'—'}</p></div>)}</div><h2 className="mt-10 text-xl font-semibold">Poslednje aktivnosti</h2></AdminShell>
}
