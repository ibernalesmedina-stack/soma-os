import { createClient } from "@supabase/supabase-js";

// Enlaces de recuperación de contraseña: Supabase puede enviarlos a la raíz del sitio
// (según "Site URL"). Antes de crear el cliente — que consume el token del hash —
// se lleva al usuario a /reset-password conservando el hash, y se recuerda que viene a recuperar.
if (typeof window !== "undefined") {
  const h = window.location.hash;
  const esRecuperacion = /type=recovery/.test(h);
  const esErrorEnlace = /error_code=otp_expired|error=access_denied/.test(h);
  if (esRecuperacion || esErrorEnlace) {
    try { sessionStorage.setItem("soma_recovery", esRecuperacion ? "1" : "expired"); } catch { /* sin storage */ }
    if (window.location.pathname !== "/reset-password") {
      window.history.replaceState(null, "", "/reset-password" + h);
    }
  }
}

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string,
);
