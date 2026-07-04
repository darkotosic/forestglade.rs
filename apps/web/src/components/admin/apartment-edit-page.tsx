"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { adminFetch } from "@/lib/admin-api";

type Apartment = {
  code: string;
  slug: string;
  floor: string;
  officialType: string;
  marketArea: string;
  sourceLocked: boolean;
  status: string;
  price: string | null;
  priceNote: string | null;
  shortDescription: string | null;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  isPublished: boolean;
  media?: Array<{ id: string; title: string; secureUrl: string; placement: string; isPublished: boolean }>;
};

export function ApartmentEditPage({ slug }: { slug: string }) {
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>( {} );
  const [message, setMessage] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminFetch<{ apartment: Apartment }>(`/apartments/${slug}`).then((data) => {
      setApartment(data.apartment);
      setForm({
        status: data.apartment.status,
        price: data.apartment.price ?? "",
        priceNote: data.apartment.priceNote ?? "",
        shortDescription: data.apartment.shortDescription ?? "",
        description: data.apartment.description ?? "",
        seoTitle: data.apartment.seoTitle ?? "",
        seoDescription: data.apartment.seoDescription ?? "",
        isPublished: data.apartment.isPublished,
        overrideOfficialFields: false,
        auditReason: "",
      });
    }).catch((error) => setMessage(error.message));
  }, [slug]);

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const payload = { ...form, price: form.price ? form.price : null };
      const data = await adminFetch<{ apartment: Apartment }>(`/apartments/${slug}`, { method: "PATCH", body: JSON.stringify(payload) });
      setApartment(data.apartment);
      setMessage("Apartman je uspešno sačuvan.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Čuvanje nije uspelo.");
    } finally {
      setSaving(false);
    }
  }

  if (!apartment) return <AdminShell><p>Učitavanje apartmana...</p>{message ? <p className="mt-4 text-red-700">{message}</p> : null}</AdminShell>;

  return <AdminShell>
    <div className="mb-6 flex items-center justify-between gap-4">
      <div><Link className="text-sm text-forest-700" href="/admin/apartmani">← Nazad na apartmane</Link><h1 className="mt-2 text-3xl font-semibold">Uredi apartman {apartment.code}</h1></div>
      <button disabled={saving} onClick={save} className="rounded-xl bg-forest-900 px-5 py-3 font-semibold text-white disabled:opacity-60">{saving ? "Čuvanje..." : "Sačuvaj"}</button>
    </div>
    {message ? <p className="mb-6 rounded-xl bg-white p-4 shadow-sm">{message}</p> : null}
    <section className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm md:grid-cols-2">
      <h2 className="md:col-span-2 text-xl font-semibold">Zaključana zvanična polja</h2>
      {[['Šifra', apartment.code], ['Sprat', apartment.floor], ['Tip', apartment.officialType], ['Površina', `${apartment.marketArea} m²`], ['Source locked', apartment.sourceLocked ? 'Da' : 'Ne']].map(([label, value]) => <label className="grid gap-2" key={label}><span className="text-sm font-medium text-stone-600">{label}</span><input disabled className="rounded-xl border bg-stone-100 p-3" value={value} /></label>)}
    </section>
    <section className="mt-6 grid gap-4 rounded-2xl bg-white p-6 shadow-sm md:grid-cols-2">
      <h2 className="md:col-span-2 text-xl font-semibold">Prodajni podaci</h2>
      <label className="grid gap-2"><span>Status</span><select className="rounded-xl border p-3" value={String(form.status)} onChange={(e) => setForm({ ...form, status: e.target.value })}>{['AVAILABLE','RESERVED','SOLD','HIDDEN'].map((s) => <option key={s}>{s}</option>)}</select></label>
      <label className="grid gap-2"><span>Cena</span><input className="rounded-xl border p-3" value={String(form.price)} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="POTREBNA PROVERA" /></label>
      {['priceNote','shortDescription','seoTitle','seoDescription'].map((key) => <label className="grid gap-2" key={key}><span>{key}</span><input className="rounded-xl border p-3" value={String(form[key])} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></label>)}
      <label className="grid gap-2 md:col-span-2"><span>Opis</span><textarea className="min-h-36 rounded-xl border p-3" value={String(form.description)} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
      <label className="flex items-center gap-3"><input type="checkbox" checked={Boolean(form.isPublished)} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} /> Objavljeno</label>
    </section>
    <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Advanced override za OWNER rolu</h2>
      <p className="mt-2 text-sm text-stone-600">Zvanična polja su zaključana. Izmene zahtevaju backend OWNER autorizaciju i obavezan audit razlog.</p>
      <label className="mt-4 flex items-center gap-3"><input type="checkbox" checked={Boolean(form.overrideOfficialFields)} onChange={(e) => setForm({ ...form, overrideOfficialFields: e.target.checked })} /> overrideOfficialFields</label>
      <label className="mt-4 grid gap-2"><span>Audit razlog</span><input className="rounded-xl border p-3" value={String(form.auditReason)} onChange={(e) => setForm({ ...form, auditReason: e.target.value })} placeholder="Obavezno za izmenu zvaničnih polja" /></label>
    </section>
    <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Media i prostorije</h2>
      <div className="mt-4 grid gap-3">{apartment.media?.length ? apartment.media.map((m) => <a className="rounded-xl border p-3" href={m.secureUrl} key={m.id} target="_blank">{m.title} · {m.placement} · {m.isPublished ? 'objavljeno' : 'draft'}</a>) : <p>Media za apartman: POTREBNA PROVERA.</p>}</div>
      <p className="mt-4 text-sm text-stone-600">Tabela prostorija će biti prikazana nakon unosa proverene PDF/PGD specifikacije.</p>
    </section>
  </AdminShell>;
}
