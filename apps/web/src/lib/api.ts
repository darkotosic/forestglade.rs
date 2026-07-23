export type LeadInput = {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  interestedIn?: string;
  consentAccepted: boolean;
  companyWebsite?: string;
};
export const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "/api").replace(/\/$/, "");
export function apiPath(path: string) {
  return apiBaseUrl === "/api" ? `/api${path}` : `${apiBaseUrl}${path}`;
}
export async function createLead(input: LeadInput): Promise<{ ok: true; leadId: string }> {
  const response = await fetch(apiPath("/leads"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.ok)
    throw new Error(data?.message ?? "Slanje upita nije uspelo. Pokušajte ponovo.");
  return data;
}
export async function publicFetch<T>(path: string): Promise<T> {
  const response = await fetch(apiPath(`/public${path}`));
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.ok) throw new Error(data?.message ?? "Public zahtev nije uspeo.");
  return data as T;
}
