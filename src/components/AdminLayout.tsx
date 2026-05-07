import { Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { LayoutDashboard, Users, DollarSign, Activity, ArrowLeft, FileBarChart, Receipt, Settings as SettingsIcon, ShieldAlert, Plug } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const items = [
  { url: "/admin", label: "Resumen", icon: LayoutDashboard, end: true },
  { url: "/admin/clientes", label: "Clientes", icon: Users },
  { url: "/admin/facturacion", label: "Facturación", icon: Receipt },
  { url: "/admin/finanzas", label: "Finanzas", icon: DollarSign },
  { url: "/admin/actividad", label: "Actividad", icon: Activity },
  { url: "/admin/reportes", label: "Reportes", icon: FileBarChart },
  { url: "/admin/integraciones", label: "Integraciones", icon: Plug },
  { url: "/admin/configuracion", label: "Configuración", icon: SettingsIcon },
];

export function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const { pathname } = useLocation();

  if (loading) return (
    <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center">
      <div className="h-6 w-6 rounded-full border-2 border-[#5B3EFF] border-t-transparent animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/admin/login" replace />;

  // Autenticado pero sin rol admin — mostrar pantalla de error en lugar de redirigir silenciosamente
  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="size-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <ShieldAlert className="h-6 w-6 text-red-400" />
          </div>
          <h1 className="text-xl font-semibold text-white">Acceso denegado</h1>
          <p className="text-sm text-white/40">
            Tu cuenta <span className="text-white/60">{user.email}</span> no tiene permisos de administrador.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="outline"
              className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"
              onClick={async () => { await logout(); }}
            >
              Cerrar sesión e intentar con otra cuenta
            </Button>
            <a href="/app" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              Volver al workspace de cliente
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full bg-background">
      <aside className="w-60 border-r flex flex-col">
        <div className="h-14 px-4 flex items-center gap-2 border-b">
          <div className="size-7 rounded-md bg-foreground text-background grid place-items-center font-bold text-xs">A</div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">SomaOS Admin</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Control central</div>
          </div>
        </div>
        <nav className="p-2 space-y-0.5 flex-1">
          {items.map((it) => {
            const active = it.end ? pathname === it.url : pathname.startsWith(it.url);
            return (
              <NavLink
                key={it.url}
                to={it.url}
                className={cn(
                  "flex items-center gap-3 px-3 h-9 rounded-md text-sm transition-colors",
                  active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <it.icon className="h-4 w-4" />
                {it.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="p-3 border-t">
          <NavLink to="/app" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
            <ArrowLeft className="h-3 w-3" />Volver al workspace
          </NavLink>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b bg-background/80 backdrop-blur sticky top-0 z-30 flex items-center px-6">
          <div className="text-xs text-muted-foreground mono">admin · {user.email}</div>
          <button
            onClick={logout}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground"
          >
            Cerrar sesión
          </button>
        </header>
        <main className="flex-1 p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
