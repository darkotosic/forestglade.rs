"use client";

import { FormEvent, useState } from "react";
import { createLead } from "@/lib/api";

const options = ["Kupovina apartmana", "Investicija", "Zakazivanje prezentacije", "Opšti upit"];

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const leadMessage = String(data.get("message") ?? "").trim();
    const interestedIn = String(data.get("interestedIn") ?? "").trim();
    const consentAccepted = data.get("consentAccepted") === "on";
    const companyWebsite = String(data.get("companyWebsite") ?? "").trim();

    if (!name || !phone) {
      setStatus("error");
      setMessage("Ime i telefon su obavezni.");
      return;
    }
    if (!consentAccepted) {
      setStatus("error");
      setMessage("Saglasnost za kontakt je obavezna.");
      return;
    }

    try {
      setStatus("loading");
      setMessage("");
      await createLead({ name, phone, email: email || undefined, message: leadMessage || undefined, interestedIn: interestedIn || undefined, consentAccepted, companyWebsite });
      setStatus("success");
      setMessage("Hvala. Vaš upit je poslat i prodajni tim će vas kontaktirati.");
      form.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Došlo je do greške pri slanju upita.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-[2rem] bg-white p-6 shadow-xl md:p-8">
      <div className="grid gap-5">
        <label className="grid gap-2 text-sm font-semibold text-forest-950">Ime i prezime<input name="name" required className="rounded-2xl border border-stone-200 px-4 py-3 font-normal outline-none focus:border-gold-300" /></label>
        <label className="grid gap-2 text-sm font-semibold text-forest-950">Telefon<input name="phone" required className="rounded-2xl border border-stone-200 px-4 py-3 font-normal outline-none focus:border-gold-300" /></label>
        <label className="grid gap-2 text-sm font-semibold text-forest-950">Email<input name="email" type="email" className="rounded-2xl border border-stone-200 px-4 py-3 font-normal outline-none focus:border-gold-300" /></label>
        <label className="grid gap-2 text-sm font-semibold text-forest-950">Interesovanje<select name="interestedIn" defaultValue="Kupovina apartmana" className="rounded-2xl border border-stone-200 px-4 py-3 font-normal outline-none focus:border-gold-300">{options.map((option) => <option key={option}>{option}</option>)}</select></label>
        <label className="hidden">Website<input name="companyWebsite" tabIndex={-1} autoComplete="off" /></label>
        <label className="grid gap-2 text-sm font-semibold text-forest-950">Poruka<textarea name="message" rows={5} className="rounded-2xl border border-stone-200 px-4 py-3 font-normal outline-none focus:border-gold-300" /></label>
        <label className="flex gap-3 text-sm font-semibold text-forest-950"><input name="consentAccepted" type="checkbox" required className="mt-1" />Saglasan/saglasna sam da me Forest Glade kontaktira povodom upita.</label>
      </div>
      <button disabled={status === "loading"} className="mt-6 w-full rounded-full bg-forest-900 px-6 py-4 font-semibold text-white transition hover:bg-forest-700 disabled:cursor-not-allowed disabled:opacity-60">{status === "loading" ? "Slanje..." : "Pošaljite upit"}</button>
      {message ? <p className={`mt-4 rounded-2xl px-4 py-3 text-sm ${status === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>{message}</p> : null}
    </form>
  );
}
