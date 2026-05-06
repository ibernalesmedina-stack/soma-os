import { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { addRegistro, deleteRegistro, listRegistros, listReservas } from "@/lib/storage";
import { BUSINESS_CONFIG } from "@/lib/business";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Trash2 } from "lucide-react";
import { formatDate, slugify } from "@/lib/format";
import { toast } from "@/hooks/use-toast";

export default function Registros() {
  const { user } = useAuth();
  const cfg = user ? BUSINESS_CONFIG[user.tipoNegocio] : null;
  const [q, setQ] = useState("");
  const [version, setVersion] = useState(0);

  const registros = useMemo(() => {
    if (!user) return [];
    return listRegistros(user.id)
      .filter((r) => r.tipo === cfg?.registroTipo)
      .sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha));
  }, [user, cfg, version]);

  const reservas = useMemo(() => (user ? listReservas(user.id) : []), [user]);
  const clients = useMemo(() => {
    const map = new Map<string, string>();
    reservas.forEach((r) => map.set(slugify(r.clientName), r.clientName));
    return Array.from(map.entries()).map(([key, name]) => ({ key, name }));
  }, [reservas]);

  if (!user || !cfg) return null;

  const filtered = registros.filter((r) =>
    !q || `${r.clientName} ${r.titulo}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        title={cfg.registrosLabel}
        description={`Registros de ${cfg.registrosLabel.toLowerCase()} por ${cfg.clientLabel.toLowerCase()}.`}
        actions={
          <NuevoRegistroDialog
            clients={clients}
            onSave={(data) => {
              addRegistro({ ...data, user_id: user.id, tipo: cfg.registroTipo });
              setVersion((v) => v + 1);
              toast({ title: `${cfg.registrosLabelSingular} agregado` });
            }}
          />
        }
      />

      <div className="surface-card overflow-hidden">
        <div className="p-3 border-b">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Buscar ${cfg.clientLabel.toLowerCase()} o título…`} className="pl-8 h-9" />
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-sm font-medium">Sin {cfg.registrosLabel.toLowerCase()}</p>
            <p className="text-xs text-muted-foreground mt-1">Crea tu primer registro para comenzar.</p>
          </div>
        ) : (
          <ul className="divide-y">
            {filtered.map((r) => (
              <li key={r.id} className="p-4 flex items-start gap-4">
                <div className="size-9 rounded-full bg-primary/10 text-primary text-xs font-semibold grid place-items-center shrink-0">
                  {r.clientName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{r.clientName}</span>
                    <span className="text-xs text-muted-foreground mono">{formatDate(r.fecha)}</span>
                  </div>
                  <div className="text-sm font-semibold mt-0.5">{r.titulo}</div>
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 mt-2 text-xs text-muted-foreground">
                    {cfg.registroFields.filter((f) => r.data[f.key]).map((f) => (
                      <div key={f.key}><span className="font-medium text-foreground">{f.label}:</span> {r.data[f.key]}</div>
                    ))}
                  </div>
                  {r.notas && <p className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap">{r.notas}</p>}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { deleteRegistro(r.id); setVersion((v) => v + 1); }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function NuevoRegistroDialog({
  clients,
  onSave,
}: {
  clients: { key: string; name: string }[];
  onSave: (data: { client_id: string; clientName: string; titulo: string; fecha: string; data: Record<string, string>; notas?: string }) => void;
}) {
  const { user } = useAuth();
  const cfg = user ? BUSINESS_CONFIG[user.tipoNegocio] : null;
  const [open, setOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [titulo, setTitulo] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<Record<string, string>>({});
  const [notas, setNotas] = useState("");
  if (!cfg) return null;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-1.5" />Nuevo {cfg.registrosLabelSingular.toLowerCase()}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Nuevo {cfg.registrosLabelSingular.toLowerCase()}</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label className="text-xs">{cfg.clientLabel}</Label>
            {clients.length > 0 ? (
              <Select value={clientName} onValueChange={setClientName}>
                <SelectTrigger><SelectValue placeholder={`Selecciona ${cfg.clientLabel.toLowerCase()}…`} /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => <SelectItem key={c.key} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : (
              <Input placeholder={`Nombre del ${cfg.clientLabel.toLowerCase()}`} value={clientName} onChange={(e) => setClientName(e.target.value)} />
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label className="text-xs">Título</Label>
              <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Fecha</Label>
              <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </div>
          </div>
          {cfg.registroFields.map((f) => (
            <div key={f.key} className="grid gap-1.5">
              <Label className="text-xs">{f.label}</Label>
              {f.type === "textarea" ? (
                <Textarea rows={3} value={data[f.key] ?? ""} onChange={(e) => setData({ ...data, [f.key]: e.target.value })} />
              ) : (
                <Input type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"} value={data[f.key] ?? ""} onChange={(e) => setData({ ...data, [f.key]: e.target.value })} />
              )}
            </div>
          ))}
          <div className="grid gap-1.5">
            <Label className="text-xs">Notas adicionales</Label>
            <Textarea rows={2} value={notas} onChange={(e) => setNotas(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={() => {
            if (!clientName.trim() || !titulo.trim()) return;
            onSave({
              client_id: slugify(clientName),
              clientName: clientName.trim(),
              titulo: titulo.trim(),
              fecha: new Date(fecha).toISOString(),
              data,
              notas: notas.trim() || undefined,
            });
            setOpen(false);
            setClientName(""); setTitulo(""); setData({}); setNotas("");
          }}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
