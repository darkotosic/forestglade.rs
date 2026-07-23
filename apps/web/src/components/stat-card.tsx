import { AnimatedNumber } from "./animated-number";

type StatCardProps = { value: string | number; label: string; variant?: "dark" | "light" };

export function StatCard({ value, label, variant = "dark" }: StatCardProps) {
  const light = variant === "light";
  return (
    <div
      className={`rounded-3xl border p-5 backdrop-blur ${light ? "border-forest-950/10 bg-white text-forest-950 shadow-sm" : "border-white/10 bg-white/10 text-white"}`}
    >
      <p className={`text-3xl font-semibold ${light ? "text-forest-950" : "text-gold-300"}`}>
        <AnimatedNumber value={value} />
      </p>
      <p
        className={`mt-2 text-xs font-semibold uppercase tracking-[0.28em] ${light ? "text-forest-700" : "text-mist-200"}`}
      >
        {label}
      </p>
    </div>
  );
}
