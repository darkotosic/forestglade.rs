export function StatCard({ value, label }: { value: string; label: string }) {
  return <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur"><p className="text-3xl font-semibold text-gold-300">{value}</p><p className="mt-2 text-xs font-semibold uppercase tracking-[0.28em] text-mist-200">{label}</p></div>;
}
