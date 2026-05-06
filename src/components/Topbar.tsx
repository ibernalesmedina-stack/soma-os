import { Bell, LogOut, Search, Settings as Cog } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";

export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = (user?.name ?? "U").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  return (
    <header className="h-14 border-b bg-background/80 backdrop-blur sticky top-0 z-30 flex items-center gap-3 px-4">
      <SidebarTrigger className="text-muted-foreground" />
      <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
        <span className="mono">{user?.businessName ?? "Workspace"}</span>
        <span>·</span>
        <span>Producción</span>
      </div>
      <div className="flex-1 max-w-sm ml-2 hidden lg:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Buscar reservas, clientes…" className="pl-8 h-9 bg-secondary/60 border-transparent" />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 mono text-[10px] text-muted-foreground border rounded px-1.5 py-0.5">⌘K</kbd>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-9 w-9"><Bell className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate("/app/configuracion")}>
          <Cog className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 size-8 rounded-full bg-primary/10 text-primary text-xs font-semibold grid place-items-center hover:bg-primary/15">
              {initials}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="text-sm font-medium">{user?.name}</div>
              <div className="text-xs text-muted-foreground font-normal">{user?.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/app/configuracion")}>Configuración</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { logout(); navigate("/login"); }}>
              <LogOut className="h-4 w-4 mr-2" />Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
