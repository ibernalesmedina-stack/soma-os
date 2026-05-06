import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  pagado: "bg-success/10 text-success border-success/20",
  confirmada: "bg-success/10 text-success border-success/20",
  completada: "bg-primary/10 text-primary border-primary/20",
  pendiente: "bg-warning/10 text-[hsl(var(--warning))] border-warning/20",
  cancelada: "bg-destructive/10 text-destructive border-destructive/20",
  fallido: "bg-destructive/10 text-destructive border-destructive/20",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize",
      styles[status] ?? "bg-muted text-muted-foreground border-border",
    )}>
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
