"use client";
import { useRouter } from "next/navigation"; import { useEffect, useState } from "react"; import { adminFetch } from "@/lib/admin-api";
export function AdminGuard({children}:{children:React.ReactNode}){const r=useRouter();const[ok,setOk]=useState(false);useEffect(()=>{adminFetch('/auth/me').then(()=>setOk(true)).catch(()=>r.push('/admin/login'))},[r]); if(!ok)return <main className="p-10">Provera sesije...</main>; return children;}
