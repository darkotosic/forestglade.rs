import Link from "next/link";
import { ArrowRight } from "lucide-react";

type ProjectCardProps = { title: string; status: string; description: string; href?: string; featured?: boolean; facts?: string[] };
export function ProjectCard({ title, status, description, href = "/kontakt", featured = false, facts = [] }: ProjectCardProps) {
  return (
    <article className={`group rounded-[2rem] border p-6 transition ${featured ? "border-gold-300 bg-forest-950 text-white shadow-2xl" : "border-stone-200 bg-white text-forest-950 shadow-sm"}`}>
      <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${featured ? "text-gold-300" : "text-forest-700"}`}>{status}</p>
      <h3 className="mt-5 text-2xl font-semibold">{title}</h3>
      <p className={`mt-4 leading-7 ${featured ? "text-mist-200" : "text-stone-600"}`}>{description}</p>
      {facts.length ? <div className="mt-6 grid gap-2 text-sm">{facts.map((fact) => <span key={fact} className={`rounded-full px-4 py-2 ${featured ? "bg-white/10 text-mist-100" : "bg-ivory-100 text-stone-700"}`}>{fact}</span>)}</div> : null}
      <Link href={href} className={`mt-8 inline-flex items-center gap-2 font-semibold ${featured ? "text-gold-300" : "text-forest-800"}`}>Saznajte više <ArrowRight size={18} className="transition group-hover:translate-x-1" /></Link>
    </article>
  );
}
