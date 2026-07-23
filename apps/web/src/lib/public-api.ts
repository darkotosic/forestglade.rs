import { apiPath } from "./api";
export async function publicFetch<T>(path: string): Promise<T | null> {
  try {
    const r = await fetch(apiPath(`/public${path}`));
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}
