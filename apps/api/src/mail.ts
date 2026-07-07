import nodemailer from "nodemailer";
import { env } from "./env.js";

type LeadMail = { name:string; phone:string; email?:string|null; interestedIn?:string|null; message?:string|null; source:string; createdAt:Date; ipAddress?:string|null };
export async function sendLeadNotification(lead: LeadMail) {
  const { host, port, user, pass, from, salesTo } = env.smtp;
  if (!host || !user || !pass || !from || !salesTo) { console.log("Mail skipped: SMTP not configured"); return; }
  const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
  await transporter.sendMail({ from, to: salesTo, subject: `Novi Forest Glade upit: ${lead.name}`, text: [`Ime: ${lead.name}`,`Telefon: ${lead.phone}`,`Email: ${lead.email ?? "—"}`,`Interesovanje: ${lead.interestedIn ?? "—"}`,`Poruka: ${lead.message ?? "—"}`,`Source: ${lead.source}`,`Datum: ${lead.createdAt.toISOString()}`,`IP: ${lead.ipAddress ?? "—"}`].join("\n") });
}
