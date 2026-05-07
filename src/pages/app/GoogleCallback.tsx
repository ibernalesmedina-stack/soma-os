import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      setStatus("error");
      setErrorMsg("Acceso denegado por Google.");
      return;
    }

    if (!code) {
      setStatus("error");
      setErrorMsg("No se recibió el código de autorización.");
      return;
    }

    if (!user) return; // wait for auth to load

    // Exchange code for tokens via server API
    fetch("/api/google/exchange", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, userId: user.id }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error desconocido");
        setStatus("success");
        setTimeout(() => navigate("/app/calendario?google=connected"), 1500);
      })
      .catch((e) => {
        setStatus("error");
        setErrorMsg(e.message);
      });
  }, [user, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 max-w-sm px-6">
        {status === "loading" && (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            <p className="text-sm font-medium">Conectando Google Calendar…</p>
            <p className="text-xs text-muted-foreground">Guardando tu acceso de forma segura.</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
            <p className="text-sm font-medium">¡Google Calendar conectado!</p>
            <p className="text-xs text-muted-foreground">Redirigiendo al calendario…</p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="h-10 w-10 text-destructive mx-auto" />
            <p className="text-sm font-medium">Error al conectar</p>
            <p className="text-xs text-muted-foreground">{errorMsg}</p>
            <Button onClick={() => navigate("/app/calendario")}>Volver al calendario</Button>
          </>
        )}
      </div>
    </div>
  );
}
