import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useServicios } from "@/lib/hooks";
import { deleteServicio, uid, upsertServicio } from "@/lib/storage";
import type { Servicio } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCLP } from "@/lib/format";
import { Clock, Globe, MapPin, MonitorSmartphone, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const MODALITY_CONFIG = {
  presencial: { label: "Presencial", icon: MapPin, color: "text-amber-600 bg-amber-50 border-amber-200" },
  online:     { label: "Online",     icon: Globe,  color: "text-sky-600 bg-sky-50 border-sky-200" },
  ambos:      { label: "Presencial + Online", icon: MonitorSmartphone, color: "text-violet-600 bg-violet-50 border-violet-200" },
};

export default function Servicios() {
  const { user } = useAuth();
  const { data: items, refetch } = useServicios();
  const [editing, setEditing] = useState<Servicio | null>(null);
  const [open, setOpen] = useState(false);

  const onNew  = () => { setEditing(null); setOpen(true); };
  const onEdit = (s: Servicio) => { setEditing(s); setOpen(true); };
  const onDelete = async (id: string) => {
    await deleteServicio(id);
    refetch();
    toast({ title: "Servicio eliminado" });
  };

  const active  = items.filter(s => s.active);
  const paused  = items.filter(s => !s.active);

  return (
    <>
      <PageHeader
        title="Servicios"
        description="Define lo que ofreces, su precio, modalidad y duración."
        actions={<Button onClick={onNew}><Plus className="h-4 w-4 mr-1.5" />Nuevo servicio</Button>}
      />

      {items.length === 0 ? (
        <div className="surface-card p-16 text-center">
          <div className="size-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <Star className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">Aún no tienes servicios</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">Crea tu primer servicio para que aparezca en tu sitio web.</p>
          <Button onClick={onNew}><Plus className="h-4 w-4 mr-1.5" />Crear servicio</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {active.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Activos ({active.length})</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {active.map(s => <ServicioCard key={s.id} s={s} onEdit={onEdit} onDelete={onDelete} />)}
              </div>
            </div>
          )}
          {paused.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Pausados ({paused.length})</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
                {paused.map(s => <ServicioCard key={s.id} s={s} onEdit={onEdit} onDelete={onDelete} />)}
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <ServicioForm
            initial={editing}
            onSave={async (data) => {
              if (!user) return;
              await upsertServicio({ id: editing?.id ?? uid(), user_id: user.id, ...data });
              setOpen(false);
              refetch();
              toast({ title: editing ? "Servicio actualizado ✓" : "Servicio creado ✓" });
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

function ServicioCard({ s, onEdit, onDelete }: { s: Servicio; onEdit: (s: Servicio) => void; onDelete: (id: string) => void }) {
  const mod = MODALITY_CONFIG[s.modality];
  const ModIcon = mod.icon;
  return (
    <div className="surface-card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold tracking-tight truncate">{s.name}</h3>
            {s.featured && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> {s.durationMin} min
            </span>
            <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border", mod.color)}>
              <ModIcon className="h-2.5 w-2.5" /> {mod.label}
            </span>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      </div>

      {s.description && <p className="text-sm text-muted-foreground flex-1 line-clamp-2">{s.description}</p>}

      <div className="pt-3 border-t space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />Presencial</span>
          <span className="text-base font-semibold mono">{formatCLP(s.price)}</span>
        </div>
        {(s.modality === "online" || s.modality === "ambos") && s.priceOnline > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-1"><Globe className="h-3 w-3" />Online</span>
            <span className="text-base font-semibold mono">{formatCLP(s.priceOnline)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ServicioForm({ initial, onSave }: {
  initial: Servicio | null;
  onSave: (s: Omit<Servicio, "id" | "user_id">) => void;
}) {
  const [name, setName]           = useState(initial?.name ?? "");
  const [description, setDesc]    = useState(initial?.description ?? "");
  const [price, setPrice]         = useState(initial?.price ?? 0);
  const [priceOnline, setPriceO]  = useState(initial?.priceOnline ?? 0);
  const [durationMin, setDur]     = useState(initial?.durationMin ?? 60);
  const [modality, setModality]   = useState<Servicio["modality"]>(initial?.modality ?? "ambos");
  const [featured, setFeatured]   = useState(initial?.featured ?? false);
  const [active, setActive]       = useState(initial?.active ?? true);

  const showOnlinePrice = modality === "online" || modality === "ambos";

  return (
    <>
      <DialogHeader>
        <DialogTitle>{initial ? "Editar servicio" : "Nuevo servicio"}</DialogTitle>
      </DialogHeader>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSave({ name, description, price, priceOnline, durationMin, modality, featured, active });
        }}
      >
        {/* Nombre */}
        <div className="space-y-1.5">
          <Label>Nombre del servicio</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Consulta Inicial" required />
        </div>

        {/* Descripción */}
        <div className="space-y-1.5">
          <Label>Descripción</Label>
          <Textarea value={description} onChange={e => setDesc(e.target.value)} rows={2} placeholder="¿Qué incluye este servicio?" />
        </div>

        {/* Modalidad */}
        <div className="space-y-1.5">
          <Label>Modalidad</Label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(MODALITY_CONFIG) as [Servicio["modality"], typeof MODALITY_CONFIG[keyof typeof MODALITY_CONFIG]][]).map(([key, cfg]) => {
              const Icon = cfg.icon;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setModality(key)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-lg border text-xs font-medium transition-colors",
                    modality === key ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Precios */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Precio presencial (CLP)</Label>
            <Input type="number" value={price} onChange={e => setPrice(+e.target.value)} required min={0} />
          </div>
          {showOnlinePrice && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1"><Globe className="h-3 w-3" /> Precio online (CLP)</Label>
              <Input type="number" value={priceOnline} onChange={e => setPriceO(+e.target.value)} min={0} placeholder="0 = mismo precio" />
            </div>
          )}
        </div>

        {/* Duración */}
        <div className="space-y-1.5">
          <Label>Duración (minutos)</Label>
          <div className="flex gap-2 flex-wrap">
            {[30, 45, 60, 90, 120].map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setDur(d)}
                className={cn(
                  "px-3 py-1.5 rounded-md border text-xs font-medium transition-colors",
                  durationMin === d ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted"
                )}
              >{d} min</button>
            ))}
            <Input
              type="number"
              value={durationMin}
              onChange={e => setDur(+e.target.value)}
              className="w-24 h-8 text-xs"
              min={1}
            />
          </div>
        </div>

        {/* Opciones */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <div className="text-sm font-medium flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-amber-500" />Destacado</div>
              <div className="text-xs text-muted-foreground">Aparece primero en tu sitio web</div>
            </div>
            <Switch checked={featured} onCheckedChange={setFeatured} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <div className="text-sm font-medium">Activo</div>
              <div className="text-xs text-muted-foreground">Visible en tu sitio web</div>
            </div>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>
        </div>

        <DialogFooter>
          <Button type="submit">Guardar servicio</Button>
        </DialogFooter>
      </form>
    </>
  );
}
