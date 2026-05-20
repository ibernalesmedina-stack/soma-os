import { NavLink, useLocation } from "react-router-dom";
import { BarChart3, CalendarDays, ClipboardList, CreditCard, LayoutDashboard, Plug, Settings, Sparkles, Users, Wrench } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth-context";
import { BUSINESS_CONFIG } from "@/lib/business";
import { cn } from "@/lib/utils";
import type { TipoNegocio } from "@/lib/types";

const TIPOS: { value: TipoNegocio; label: string; short: string; icon: string }[] = [
  { value: "nutricionista", label: "Nutricionista", short: "Nut", icon: "🥗" },
  { value: "psicologa",     label: "Psicóloga",     short: "Psi", icon: "🧠" },
  { value: "cosmetologa",   label: "Cosmetóloga",   short: "Cos", icon: "✨" },
  { value: "odontologa",    label: "Odontóloga",    short: "Odo", icon: "🦷" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const { user, update } = useAuth();
  const cfg = user ? BUSINESS_CONFIG[user.tipoNegocio] : null;

  const items = [
    { title: "Dashboard", url: "/app", icon: LayoutDashboard, key: "dashboard" as const },
    { title: "Reservas", url: "/app/reservas", icon: ClipboardList, key: "reservas" as const },
    { title: "Calendario", url: "/app/calendario", icon: CalendarDays, key: "calendario" as const },
    { title: cfg?.clientLabelPlural ?? "Clientes", url: "/app/clientes", icon: Users, key: "clientes" as const },
    { title: cfg?.registrosLabel ?? "Registros", url: "/app/registros", icon: ClipboardList, key: "registros" as const },
    { title: "Pagos", url: "/app/pagos", icon: CreditCard, key: "pagos" as const },
    { title: "Servicios", url: "/app/servicios", icon: Wrench, key: "servicios" as const },
    { title: "Automatizaciones", url: "/app/automatizaciones", icon: Sparkles, key: "automations" as const },
    { title: "Analítica", url: "/app/analitica", icon: BarChart3, key: "analytics" as const },
    { title: "Integraciones", url: "/app/integraciones", icon: Plug, key: "integraciones" as const },
    { title: "Configuración", url: "/app/configuracion", icon: Settings, key: "config" as const },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        <div className={cn("flex items-center gap-2 px-4 h-14 border-b border-sidebar-border", collapsed && "justify-center px-2")}>
          <img src="/logosoma.png" alt="SomaOS" className={cn("h-9 w-auto", collapsed && "h-7")} />
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{cfg?.label ?? "Operations"}</div>
            </div>
          )}
        </div>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Workspace</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = pathname === item.url || (item.url !== "/app" && pathname.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                      <NavLink to={item.url} className="flex items-center gap-3 rounded-md text-sm">
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="flex-1 truncate">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Demo switcher — solo visible para admin */}
        {user?.role === "admin" && <div className={cn("mt-auto border-t border-sidebar-border px-3 py-3", collapsed && "px-1.5")}>
          {!collapsed && (
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 px-1">Vista de profesional</p>
          )}
          <div className={cn("grid gap-1", collapsed ? "grid-cols-1" : "grid-cols-2")}>
            {TIPOS.map((t) => {
              const active = user?.tipoNegocio === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => update({ tipoNegocio: t.value })}
                  title={t.label}
                  className={cn(
                    "rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors text-center truncate",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  {collapsed ? `${t.icon}` : t.label}
                </button>
              );
            })}
          </div>
        </div>}

      </SidebarContent>
    </Sidebar>
  );
}
