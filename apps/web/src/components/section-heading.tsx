type SectionHeadingProps = { eyebrow: string; title: string; description?: string; light?: boolean };

export function SectionHeading({ eyebrow, title, description, light = false }: SectionHeadingProps) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold-500">{eyebrow}</p>
      <h2 className={`mt-4 text-3xl font-semibold tracking-tight md:text-5xl ${light ? "text-white" : "text-forest-950"}`}>{title}</h2>
      {description ? <p className={`mt-5 text-lg leading-8 ${light ? "text-mist-200" : "text-stone-600"}`}>{description}</p> : null}
    </div>
  );
}
