export type LeadInput = {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  interestedIn?: string;
};

export async function createLead(input: LeadInput): Promise<{ ok: true; leadId: string }> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) throw new Error("API adresa nije podešena. Pokušajte ponovo kasnije.");

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.ok) {
    throw new Error(data?.message ?? "Slanje upita nije uspelo. Pokušajte ponovo.");
  }
  return data;
}
