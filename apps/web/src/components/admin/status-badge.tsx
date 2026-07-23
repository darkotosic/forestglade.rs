import { statusLabels } from "@/lib/admin-api";
export function StatusBadge({ status }: { status: string }) {
  return (
    <span className="rounded-full bg-forest-100 px-3 py-1 text-xs font-semibold text-forest-900">
      {statusLabels[status] ?? status}
    </span>
  );
}
