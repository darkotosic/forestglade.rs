import { apiPath } from "./api";
let csrfToken: string | null = null;
async function ensureCsrf() { if (csrfToken) return csrfToken; const r = await fetch(apiPath("/admin/auth/csrf"), { credentials: "include" }); const d = await r.json(); csrfToken = String(d.token); return csrfToken; }
export async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers: HeadersInit = { ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }), ...(init.headers ?? {}) };
  if (["POST", "PATCH", "DELETE"].includes(method)) (headers as Record<string,string>)["x-csrf-token"] = await ensureCsrf();
  const r=await fetch(apiPath(`/admin${path}`),{...init,credentials:"include",headers}); const d=await r.json().catch(()=>null); if(!r.ok||!d?.ok) throw new Error(d?.message??"Admin zahtev nije uspeo."); return d as T;
}
export const statusLabels: Record<string,string>={AVAILABLE:"Slobodan",RESERVED:"Rezervisan",SOLD:"Prodat",HIDDEN:"Sakriven",NEW:"Nov",CONTACTED:"Kontaktiran",QUALIFIED:"Kvalifikovan",NOT_INTERESTED:"Nije zainteresovan",CLOSED:"Zatvoren",ARCHIVED:"Arhiviran"};
