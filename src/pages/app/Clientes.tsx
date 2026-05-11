import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useFichas, usePagos, useReservas } from "@/lib/hooks";
import { getOrCreateFicha, importFichasCSV, registerConsent } from "@/lib/storage";
import { BUSINESS_CONFIG } from "@/lib/business";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatCLP, formatDate, slugify } from "@/lib/format";
import { Search, ChevronRight, Download, Upload, Plus, ShieldCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";

function NuevoPacienteDialog({ open, onClose, onCreated, clientLabel, userId }: {
  open: boolean; onClose: () => void; onCreated: (key: string) => void;
  clientLabel: string; userId: string;
}) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [occupation, setOccupation] = useState("");
  const [notas, setNotas] = useState("");
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);

  const reset = () => { setNombre(""); setEmail(""); setPhone(""); setBirthDate(""); setOccupation(""); setNotas(""); setConsent(false); };

  const handleSubmit = async () => {
    if (!nombre.trim()) return toast({ title: "Ingresa el nombre del paciente", variant: "destructive" });
    setSaving(true);
    try {
      const ficha = await getOrCreateFicha(userId, nombre.trim());
      if (email || phone || birthDate || occupation || notas) {
        const { updateFicha } = await import("@/lib/storage");
        await updateFicha(ficha.id, {
          email: email || undefined, phone: phone || undefined,
          birthDate: birthDate || undefined, occupation: occupation || undefined,
          notasGenerales: notas || undefined,
        });
      }
      if (consent) await registerConsent(userId, ficha.clientKey, nombre.trim());
      toast({ title: `${clientLabel} creado ✓`, description: consent ? "Consentimiento registrado." : undefined });
      onCreated(ficha.clientKey);
      onClose();
      reset();
    } catch {
      toast({ title: "Error al crear el paciente", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo {clientLabel}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label>Nombre completo <span className="text-destructive">*</span></Label>
            <Input autoFocus placeholder="Ej: Ana García" value={nombre} onChange={(e) => setNombre(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Email <span className="text-muted-foreground font-normal text-xs">(opcional)</span></Label>
              <Input type="email" placeholder="ana@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Teléfono <span className="text-muted-foreground font-normal text-xs">(opcional)</span></Label>
              <Input placeholder="+56 9 …" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Fecha de nacimiento</Label>
              <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Ocupación</Label>
              <Input placeholder="Ej: Profesora" value={occupation} onChange={(e) => setOccupation(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Notas iniciales <span className="text-muted-foreground font-normal text-xs">(opcional)</span></Label>
            <textarea
              rows={3}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              placeholder="Motivo de consulta, observaciones…"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </div>
          <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${consent ? "border-success bg-success/5" : "border-input hover:bg-muted/30"}`}>
            <input type="checkbox" className="mt-0.5 accent-primary" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <div>
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <ShieldCheck className={`h-4 w-4 ${consent ? "text-success" : "text-muted-foreground"}`} />
                Registrar consentimiento informado
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                El/la paciente autorizó el tratamiento de sus datos personales y clínicos conforme a la normativa vigente (Ley 20.584 / GDPR).
              </p>
            </div>
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { onClose(); reset(); }}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Creando…" : `Crear ${clientLabel}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ClienteRow {
  clientKey: string;
  clientName: string;
  totalSesiones: number;
  ultimaVisita?: string;
  proximaCita?: string;
  totalPagado: number;
  estados: { confirmadas: number; pendientes: number; completadas: number };
}

export default function Clientes() {
  const { user } = useAuth();
  const cfg = user ? BUSINESS_CONFIG[user.tipoNegocio] : null;
  const [q, setQ] = useState("");
  const [showNew, setShowNew] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { data: reservas } = useReservas();
  const { data: pagos } = usePagos();
  const { data: fichas, refetch: refetchFichas } = useFichas();

  const clientes = useMemo<ClienteRow[]>(() => {
    const map = new Map<string, ClienteRow>();
    const now = Date.now();

    // Seed from fichas first so patients without reservas still appear
    for (const f of fichas) {
      if (!map.has(f.clientKey)) {
        map.set(f.clientKey, {
          clientKey: f.clientKey, clientName: f.clientName, totalSesiones: 0,
          totalPagado: 0, estados: { confirmadas: 0, pendientes: 0, completadas: 0 },
        });
      }
    }

    for (const r of reservas) {
      const key = slugify(r.clientName);
      const row = map.get(key) ?? {
        clientKey: key, clientName: r.clientName, totalSesiones: 0,
        totalPagado: 0, estados: { confirmadas: 0, pendientes: 0, completadas: 0 },
      };
      row.totalSesiones += 1;
      const t = new Date(r.date).getTime();
      if (r.status === "completada") {
        row.estados.completadas++;
        if (!row.ultimaVisita || t > new Date(row.ultimaVisita).getTime()) row.ultimaVisita = r.date;
      } else if (r.status === "confirmada") row.estados.confirmadas++;
      else if (r.status === "pendiente") row.estados.pendientes++;
      if ((r.status === "confirmada" || r.status === "pendiente") && t > now) {
        if (!row.proximaCita || t < new Date(row.proximaCita).getTime()) row.proximaCita = r.date;
      }
      map.set(key, row);
    }
    for (const p of pagos) {
      const key = slugify(p.clientName);
      const row = map.get(key);
      if (row && p.status === "pagado") row.totalPagado += p.amount;
    }
    return Array.from(map.values()).sort((a, b) => a.clientName.localeCompare(b.clientName));
  }, [reservas, pagos, fichas]);

  const filtered = clientes.filter((c) => !q || c.clientName.toLowerCase().includes(q.toLowerCase()));

  const exportCSV = () => {
    const fichaByKey = new Map(fichas.map((f) => [f.clientKey, f]));
    const headers = ["clientName", "email", "phone", "birthDate", "address", "totalSesiones", "ultimaVisita", "proximaCita", "totalPagado", "notasGenerales"];
    const rows = clientes.map((c) => {
      const f = fichaByKey.get(c.clientKey);
      return [c.clientName, f?.email ?? "", f?.phone ?? "", f?.birthDate ?? "", f?.address ?? "", c.totalSesiones, c.ultimaVisita ?? "", c.proximaCita ?? "", c.totalPagado, (f?.notasGenerales ?? "").replace(/\n/g, " ")];
    });
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${cfg?.clientLabelPlural.toLowerCase() ?? "clientes"}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const importCSV = async (file: File) => {
    if (!user) return;
    const text = await file.text();
    const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) { toast({ title: "Archivo vacío" }); return; }
    const parseLine = (l: string) => {
      const out: string[] = []; let cur = ""; let inQ = false;
      for (let i = 0; i < l.length; i++) {
        const c = l[i];
        if (c === '"') { if (inQ && l[i + 1] === '"') { cur += '"'; i++; } else inQ = !inQ; }
        else if (c === "," && !inQ) { out.push(cur); cur = ""; }
        else cur += c;
      }
      out.push(cur); return out;
    };
    const headers = parseLine(lines[0]).map((h) => h.trim());
    const rows = lines.slice(1).map((l) => {
      const vals = parseLine(l);
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => { obj[h] = vals[i] ?? ""; });
      return obj;
    });
    const { added, updated } = await importFichasCSV(user.id, rows);
    toast({ title: "Importación completa", description: `${added} nuevos, ${updated} actualizados` });
    refetchFichas();
  };

  return (
    <>
      <NuevoPacienteDialog
        open={showNew}
        onClose={() => setShowNew(false)}
        onCreated={(key) => { refetchFichas(); navigate(`/app/clientes/${key}`); }}
        clientLabel={cfg?.clientLabel ?? "paciente"}
        userId={user?.id ?? ""}
      />
      <PageHeader
        title={cfg?.clientLabelPlural ?? "Clientes"}
        description={`Ficha e historial de cada ${cfg?.clientLabel.toLowerCase() ?? "cliente"}.`}
        actions={
          <div className="flex items-center gap-2">
            <input ref={fileRef} type="file" accept=".csv" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) importCSV(f); e.target.value = ""; }} />
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload className="h-3.5 w-3.5 mr-1.5" /> Importar CSV
            </Button>
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <Download className="h-3.5 w-3.5 mr-1.5" /> Exportar CSV
            </Button>
            <Button size="sm" onClick={() => setShowNew(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> Nuevo {cfg?.clientLabel ?? "paciente"}
            </Button>
          </div>
        }
      />
      <div className="surface-card overflow-hidden">
        <div className="p-3 border-b">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Buscar ${cfg?.clientLabel.toLowerCase() ?? "cliente"}…`} className="pl-8 h-9" />
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-sm font-medium">Sin {cfg?.clientLabelPlural.toLowerCase() ?? "clientes"}</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">Crea tu primer {cfg?.clientLabel.toLowerCase() ?? "paciente"} o registra una reserva.</p>
            <Button size="sm" onClick={() => setShowNew(true)}><Plus className="h-4 w-4 mr-1.5" />Nuevo {cfg?.clientLabel ?? "paciente"}</Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-2.5">{cfg?.clientLabel ?? "Cliente"}</th>
                <th className="text-left font-medium px-4 py-2.5">Sesiones</th>
                <th className="text-left font-medium px-4 py-2.5">Última visita</th>
                <th className="text-left font-medium px-4 py-2.5">Próxima cita</th>
                <th className="text-right font-medium px-4 py-2.5">Total pagado</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.clientKey} className="border-t hover:bg-muted/30 cursor-pointer group">
                  <td className="px-4 py-3">
                    <Link to={`/app/clientes/${c.clientKey}`} className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-primary/10 text-primary text-xs font-semibold grid place-items-center">
                        {c.clientName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                      </div>
                      <span className="font-medium group-hover:text-primary transition-colors">{c.clientName}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 mono text-xs">{c.totalSesiones}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{c.ultimaVisita ? formatDate(c.ultimaVisita) : "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{c.proximaCita ? formatDate(c.proximaCita) : "—"}</td>
                  <td className="px-4 py-3 text-right mono">{formatCLP(c.totalPagado)}</td>
                  <td className="px-4 py-3 text-muted-foreground"><ChevronRight className="h-4 w-4" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
