import { Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { LayoutDashboard, Users, DollarSign, Activity, ArrowLeft, FileBarChart, Receipt, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { url: "/admin", label: "Resumen", icon: LayoutDashboard, end: true },
  { url: "/admin/clientes", label: "Clientes", icon: Users },
  { url: "/admin/facturacion", label: "Facturación", icon: Receipt },
  { url: "/admin/finanzas", label: "Finanzas", icon: DollarSign },
  { url: "/admin/actividad", label: "Actividad", icon: Activity },
  { url: "/admin/reportes", label: "Reportes", icon: FileBarChart },
  { url: "/admin/configuracion", label: "Configuración", icon: SettingsIcon },
];

export function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const { pathname } = useLocation();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/app" replace />;

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
          >Cerrar sesión</button>
        </header>
        <main className="flex-1 p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
