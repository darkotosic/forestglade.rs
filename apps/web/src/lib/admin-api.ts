import { apiPath } from "./api";
let csrfToken: string | null = null;
async function ensureCsrf() { if (csrfToken) return csrfToken; const r = await fetch(apiPath("/admin/auth/csrf"), { credentials: "include" }); const d = await r.json(); csrfToken = String(d.token); return csrfToken; }
export async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers: HeadersInit = { ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }), ...(init.headers ?? {}) };
  if (["POST", "PATCH", "DELETE"].includes(method)) (headers as Record<string, string>)["x-csrf-token"] = await ensureCsrf();
  const response = await fetch(apiPath(`/admin${path}`), { ...init, credentials: "include", headers });
  const text = await response.text();
  let data: unknown = null;
  try { data = text ? JSON.parse(text) : null; } catch { throw new Error(`API je vratio neispravan odgovor (${response.status}).`); }
  if (!response.ok || typeof data !== "object" || data === null || !("ok" in data) || !(data as { ok: boolean }).ok) throw new Error((data as { message?: string })?.message ?? `Admin zahtev nije uspeo (${response.status}).`);
  return data as T;
}
export const statusLabels: Record<string,string>={AVAILABLE:"Slobodan",RESERVED:"Rezervisan",SOLD:"Prodat",HIDDEN:"Sakriven",NEW:"Nov",CONTACTED:"Kontaktiran",QUALIFIED:"Kvalifikovan",NOT_INTERESTED:"Nije zainteresovan",CLOSED:"Zatvoren",ARCHIVED:"Arhiviran"};
