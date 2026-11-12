import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Eye, EyeOff, Globe, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { deleteServicio, uid, upsertServicio } from "@/lib/storage";
import type { Servicio } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  CATEGORIAS_SITIO, escribirTratamiento, leerTratamiento, precioANumero, resumenPrecios,
  type MetaTratamiento, type PrecioTratamiento,
} from "@/lib/tratamientos";
import { CATEGORIAS, TRATAMIENTOS } from "@/pages/paola/datos";

const selectCls = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

type Trat = { s: Servicio; texto: string; meta: MetaTratamiento };

export default function TratamientosEditor({ items, userId, refetch }: { items: Servicio[]; userId: string; refetch: () => void }) {
  const trats: Trat[] = useMemo(() => items
    .map((s) => ({ s, ...leerTratamiento(s.description) }))
    .filter((t): t is Trat => !!t.meta)
    .sort((a, b) => (a.meta.orden ?? 999) - (b.meta.orden ?? 999) || a.s.name.localeCompare(b.s.name)), [items]);
  const [editing, setEditing] = useState<Trat | null>(null);
  const [nuevo, setNuevo] = useState(false);
  const [importando, setImportando] = useState(false);

  const importar = async () => {
    setImportando(true);
    try {
      let orden = 0;
      for (const c of CATEGORIAS) {
        for (const slug of c.slugs) {
          const t = TRATAMIENTOS[slug];
          if (!t) continue;
          orden += 1;
          const precios = t.precios.map((p) => ({ label: p.label, price: p.price, ...(p.desde ? { desde: true } : {}), ...(p.antes ? { antes: p.antes } : {}) }));
          const nums = precios.map((p) => precioANumero(p.price)).filter((n) => n > 0);
          await upsertServicio({
            id: uid(), user_id: userId, name: t.name,
            description: escribirTratamiento(t.desc, { cat: c.title, slug, sub: t.sub, precios, nota: t.nota || undefined, orden }),
            price: nums.length ? Math.min(...nums) : 0, priceOnline: 0, durationMin: 60,
            active: true, modality: "presencial", featured: false,
          });
        }
      }
      toast({ title: "Tratamientos importados ✓", description: "Ya puedes editarlos; los cambios se ven en el sitio web." });
      refetch();
    } catch {
      toast({ title: "No se pudieron importar los tratamientos", variant: "destructive" });
    } finally { setImportando(false); }
  };

  const toggleVisible = async (t: Trat) => {
    await upsertServicio({ ...t.s, active: !t.s.active });
    refetch();
  };

  const borrar = async (t: Trat) => {
    if (!window.confirm(`¿Eliminar "${t.s.name}"? Dejará de aparecer en el sitio web.`)) return;
    await deleteServicio(t.s.id);
    refetch();
    toast({ title: "Tratamiento eliminado" });
  };

  const cats = [...CATEGORIAS_SITIO, ...[...new Set(trats.map((t) => t.meta.cat))].filter((c) => !CATEGORIAS_SITIO.includes(c))];

  return (
    <section className="space-y-4">
      <div className="surface-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold flex items-center gap-2"><Globe className="h-4 w-4" />Tratamientos del sitio web</h2>
          <p className="text-xs text-muted-foreground mt-1">Lo que edites aquí (nombres, valores, ofertas y qué se muestra) se actualiza en tu sitio web al guardar.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          {trats.length === 0 && (
            <Button variant="outline" onClick={importar} disabled={importando}>
              {importando ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Download className="h-4 w-4 mr-1.5" />}Importar tratamientos del sitio
            </Button>
          )}
          <Button onClick={() => { setEditing(null); setNuevo(true); }}><Plus className="h-4 w-4 mr-1.5" />Nuevo tratamiento</Button>
        </div>
      </div>

      {trats.length === 0 ? (
        <div className="surface-card p-10 text-center text-sm text-muted-foreground">
          Aún no tienes tratamientos configurados. Usa <strong>Importar tratamientos del sitio</strong> para cargar los que hoy aparecen en tu página, y luego edítalos.
        </div>
      ) : cats.map((cat) => {
        const lista = trats.filter((t) => t.meta.cat === cat);
        if (!lista.length) return null;
        return (
          <div key={cat}>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">{cat} ({lista.length})</h3>
            <div className="surface-card divide-y">
              {lista.map((t) => (
                <div key={t.s.id} className={cn("flex items-center gap-3 px-4 py-3", !t.s.active && "opacity-55")}>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{t.s.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {resumenPrecios(t.meta.precios)}{t.meta.precios.length > 1 ? ` · ${t.meta.precios.length} valores` : ""}
                      {t.meta.precios.some((p) => p.antes) ? " · con oferta" : ""}
                    </p>
                  </div>
                  <button onClick={() => toggleVisible(t)} title={t.s.active ? "Visible en el sitio — clic para ocultar" : "Oculto — clic para mostrar"}
                    className={cn("inline-flex items-center gap-1.5 text-xs rounded-full border px-2.5 py-1", t.s.active ? "text-success border-success/30 bg-success/5" : "text-muted-foreground")}>
                    {t.s.active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}{t.s.active ? "Visible" : "Oculto"}
                  </button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setNuevo(false); setEditing(t); }}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => borrar(t)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <Dialog open={!!editing || nuevo} onOpenChange={(o) => { if (!o) { setEditing(null); setNuevo(false); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {(editing || nuevo) && (
            <TratamientoForm
              key={editing?.s.id ?? "nuevo"}
              initial={editing}
              ordenNuevo={(trats.reduce((m, t) => Math.max(m, t.meta.orden ?? 0), 0) || 0) + 1}
              onSave={async (s) => {
                await upsertServicio({ ...s, user_id: userId });
                setEditing(null); setNuevo(false);
                refetch();
                toast({ title: "Tratamiento guardado ✓", description: "El cambio ya se ve en el sitio web." });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function TratamientoForm({ initial, ordenNuevo, onSave }: {
  initial: Trat | null; ordenNuevo: number;
  onSave: (s: Omit<Servicio, "user_id">) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.s.name ?? "");
  const [cat, setCat] = useState(initial?.meta.cat ?? CATEGORIAS_SITIO[0]);
  const [sub, setSub] = useState(initial?.meta.sub ?? "");
  const [texto, setTexto] = useState(initial?.texto ?? "");
  const [precios, setPrecios] = useState<PrecioTratamiento[]>(initial?.meta.precios.length ? initial.meta.precios : [{ label: "", price: "" }]);
  const [nota, setNota] = useState(initial?.meta.nota ?? "");
  const [dur, setDur] = useState(initial?.s.durationMin ?? 60);
  const [active, setActive] = useState(initial?.s.active ?? true);
  const [saving, setSaving] = useState(false);

  const upd = (i: number, patch: Partial<PrecioTratamiento>) => setPrecios((ps) => ps.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  // Escribir "90000" o "$90.000" deja el precio como "$90.000"
  const fmt = (v: string) => { const n = precioANumero(v); return n ? "$" + n.toLocaleString("es-CL") : ""; };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const limpios = precios
      .filter((p) => p.label.trim() || p.price.trim())
      .map((p) => ({ label: p.label.trim() || name.trim(), price: fmt(p.price) || p.price.trim(), ...(p.desde ? { desde: true } : {}), ...(p.antes && fmt(p.antes) ? { antes: fmt(p.antes) } : {}) }));
    const nums = limpios.map((p) => precioANumero(p.price)).filter((n) => n > 0);
    const meta: MetaTratamiento = {
      cat, slug: initial?.meta.slug, sub: sub.trim() || undefined, precios: limpios,
      nota: nota.trim() || undefined, orden: initial?.meta.orden ?? ordenNuevo,
    };
    try {
      await onSave({
        id: initial?.s.id ?? uid(), name: name.trim(), description: escribirTratamiento(texto, meta),
        price: nums.length ? Math.min(...nums) : 0, priceOnline: initial?.s.priceOnline ?? 0, durationMin: dur,
        active, modality: initial?.s.modality ?? "presencial", featured: initial?.s.featured ?? false,
      });
    } catch {
      toast({ title: "No se pudo guardar", variant: "destructive" });
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={guardar} className="space-y-4">
      <DialogHeader><DialogTitle>{initial ? "Editar tratamiento" : "Nuevo tratamiento"}</DialogTitle></DialogHeader>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label>Nombre</Label><Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ej: Toxina botulínica" /></div>
        <div className="space-y-1.5"><Label>Categoría</Label>
          <select className={selectCls} value={cat} onChange={(e) => setCat(e.target.value)}>{CATEGORIAS_SITIO.map((c) => <option key={c}>{c}</option>)}</select>
        </div>
        <div className="space-y-1.5 sm:col-span-2"><Label>Frase corta (bajo el nombre en la tarjeta)</Label><Input value={sub} onChange={(e) => setSub(e.target.value)} placeholder="Ej: Expresión relajada y natural" /></div>
        <div className="space-y-1.5 sm:col-span-2"><Label>Descripción corta</Label><Textarea rows={2} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Qué es y para qué sirve, en una o dos frases." /></div>
      </div>

      <div className="space-y-2">
        <Label>Valores</Label>
        <p className="text-xs text-muted-foreground">Sin valores, el sitio muestra "Consultar". Para una oferta, escribe el precio anterior.</p>
        <div className="space-y-2">
          {precios.map((p, i) => (
            <div key={i} className="grid grid-cols-[1fr_120px] sm:grid-cols-[1fr_120px_120px_auto_auto] gap-2 items-center rounded-md border p-2">
              <Input value={p.label} onChange={(e) => upd(i, { label: e.target.value })} placeholder="Ej: 1 zona · NCTF 135 · 1 sesión" />
              <Input value={p.price} onChange={(e) => upd(i, { price: e.target.value })} onBlur={(e) => upd(i, { price: fmt(e.target.value) || e.target.value })} placeholder="Precio" inputMode="numeric" />
              <Input value={p.antes ?? ""} onChange={(e) => upd(i, { antes: e.target.value || undefined })} onBlur={(e) => upd(i, { antes: fmt(e.target.value) || undefined })} placeholder="Antes (oferta)" inputMode="numeric" />
              <label className="flex items-center gap-1.5 text-xs whitespace-nowrap"><input type="checkbox" checked={!!p.desde} onChange={(e) => upd(i, { desde: e.target.checked || undefined })} />desde</label>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => setPrecios((ps) => ps.filter((_, j) => j !== i))}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setPrecios((ps) => [...ps, { label: "", price: "" }])}><Plus className="h-3.5 w-3.5 mr-1" />Agregar valor</Button>
      </div>

      <div className="space-y-1.5"><Label>Nota (aparece bajo los valores)</Label><Input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Ej: Trabajamos con Dysport®. Valor por tratamiento realizado." /></div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label>Duración para la agenda (min)</Label><Input type="number" min={5} value={dur} onChange={(e) => setDur(+e.target.value)} /></div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div><p className="text-sm font-medium">Visible en el sitio</p><p className="text-xs text-muted-foreground">Si lo apagas, se oculta de la página</p></div>
          <Switch checked={active} onCheckedChange={setActive} />
        </div>
      </div>
      {initial && !initial.meta.slug && <p className="text-xs text-muted-foreground">Este tratamiento no tiene página propia: en el sitio se muestra solo como tarjeta.</p>}

      <DialogFooter><Button type="submit" disabled={saving}>{saving ? "Guardando…" : "Guardar"}</Button></DialogFooter>
    </form>
  );
}
