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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatCLP } from "@/lib/format";
import { Clock, Pencil, Plus, Trash2 } from "lucide-react";

export default function Servicios() {
  const { user } = useAuth();
  const { data: items, refetch } = useServicios();
  const [editing, setEditing] = useState<Servicio | null>(null);
  const [open, setOpen] = useState(false);

  const onNew = () => { setEditing(null); setOpen(true); };
  const onEdit = (s: Servicio) => { setEditing(s); setOpen(true); };
  const onDelete = async (id: string) => { await deleteServicio(id); refetch(); };

  return (
    <>
      <PageHeader
        title="Servicios"
        description="Define lo que ofreces, su precio y duración."
        actions={<Button onClick={onNew}><Plus className="h-4 w-4 mr-1.5" />Nuevo servicio</Button>}
      />
      {items.length === 0 ? (
        <div className="surface-card p-16 text-center">
          <p className="text-sm font-medium">Aún no has creado servicios</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">Crea tu primer servicio para empezar a recibir reservas.</p>
          <Button onClick={onNew}><Plus className="h-4 w-4 mr-1.5" />Crear servicio</Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((s) => (
            <div key={s.id} className="surface-card p-5 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold tracking-tight">{s.name}</h3>
                  <div className="text-xs text-muted-foreground inline-flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" /> {s.durationMin} min
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${s.active ? "border-success/20 text-success bg-success/10" : "border-border text-muted-foreground"}`}>
                  {s.active ? "Activo" : "Pausado"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-3 flex-1">{s.description}</p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-lg font-semibold mono">{formatCLP(s.price)}</div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <ServicioForm
            initial={editing}
            onSave={async (data) => {
              if (!user) return;
              await upsertServicio({ id: editing?.id ?? uid(), user_id: user.id, ...data });
              setOpen(false);
              refetch();
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

function ServicioForm({ initial, onSave }: { initial: Servicio | null; onSave: (s: Omit<Servicio, "id" | "user_id">) => void }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [durationMin, setDurationMin] = useState(initial?.durationMin ?? 60);
  const [active, setActive] = useState(initial?.active ?? true);
  return (
    <>
      <DialogHeader><DialogTitle>{initial ? "Editar servicio" : "Nuevo servicio"}</DialogTitle></DialogHeader>
      <form
        className="space-y-3"
        onSubmit={(e) => { e.preventDefault(); onSave({ name, description, price, durationMin, active }); }}
      >
        <div className="space-y-1.5"><Label>Nombre</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
        <div className="space-y-1.5"><Label>Descripción</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Precio (CLP)</Label><Input type="number" value={price} onChange={(e) => setPrice(+e.target.value)} required /></div>
          <div className="space-y-1.5"><Label>Duración (min)</Label><Input type="number" value={durationMin} onChange={(e) => setDurationMin(+e.target.value)} required /></div>
        </div>
        <div className="flex items-center justify-between">
          <Label>Servicio activo</Label>
          <Switch checked={active} onCheckedChange={setActive} />
        </div>
        <DialogFooter><Button type="submit">Guardar</Button></DialogFooter>
      </form>
    </>
  );
}
