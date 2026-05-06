import { Monitor, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TipoAtencion } from "@/lib/types";

export function AtencionBadge({ tipo, className }: { tipo?: TipoAtencion; className?: string }) {
  const isOnline = tipo === "online";
  const Icon = isOnline ? Monitor : MapPin;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize",
        isOnline
          ? "bg-primary/10 text-primary border-primary/20"
          : "bg-muted text-muted-foreground border-border",
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {tipo ?? "presencial"}
    </span>
  );
}
