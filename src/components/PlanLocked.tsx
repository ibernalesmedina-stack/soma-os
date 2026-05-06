import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function PlanLocked({ plan, feature }: { plan: "Pro" | "Premium"; feature: string }) {
  const navigate = useNavigate();
  return (
    <div className="surface-card p-12 text-center max-w-xl mx-auto mt-12">
      <div className="size-12 rounded-full bg-primary/10 text-primary grid place-items-center mx-auto mb-4">
        <Lock className="h-5 w-5" />
      </div>
      <h2 className="text-lg font-semibold">{feature} es parte del plan {plan}</h2>
      <p className="text-sm text-muted-foreground mt-2">
        Mejora tu plan para desbloquear esta sección y todas sus funcionalidades.
      </p>
      <Button className="mt-5" onClick={() => navigate("/app/configuracion")}>Ver planes</Button>
    </div>
  );
}
