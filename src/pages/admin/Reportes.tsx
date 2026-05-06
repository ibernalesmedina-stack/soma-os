import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAdminUsers } from "@/lib/hooks";
import { FREQUENCY_LABEL, ReportFormat, ReportFrequency, ScheduledReport, deleteReport, generateReportCSV, listReports, markSent, upsertReport } from "@/lib/reports";
import { formatDateTime } from "@/lib/format";
import { Calendar, Download, Plus, Send, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const FREQS: ReportFrequency[] = ["mensual_28", "trimestral", "anual_28dic"];

export default function AdminReportes() {
  const [v, setV] = useState(0);
  const reports = useMemo(() => listReports(), [v]);
  const { data: allUsers } = useAdminUsers();
  const users = allUsers.filter(u => u.role !== "admin");
  const userById = (id: string) => users.find(u => u.id === id);

  const enviarAhora = (r: ScheduledReport) => {
    const csv = generateReportCSV(r.user_id, FREQUENCY_LABEL[r.frequency]);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `reporte-${userById(r.user_id)?.businessName.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.csv`;
    a.click(); URL.revokeObjectURL(url);
    markSent(r.id); setV(v + 1);
    toast({ title: "Reporte generado", description: `Enviado a ${r.recipientEmail} (mock)` });
  };

  return (
    <>
      <PageHeader
        title="Reportes programados"
        description="Programa reportes automáticos por clienta. Se ejecutan según la frecuencia configurada."
        actions={<NuevoReporteDialog onSaved={() => setV(v + 1)} />}
      />

      <div className="surface-card overflow-hidden">
        {reports.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-medium">Sin reportes programados</p>
            <p className="text-xs text-muted-foreground mt-1">Crea el primero para enviar resúmenes automáticos.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-2.5">Clienta</th>
                <th className="text-left font-medium px-4 py-2.5">Frecuencia</th>
                <th className="text-left font-medium px-4 py-2.5">Formato</th>
                <th className="text-left font-medium px-4 py-2.5">Destinatario</th>
                <th className="text-left font-medium px-4 py-2.5">Próximo envío</th>
                <th className="text-left font-medium px-4 py-2.5">Último envío</th>
                <th className="text-left font-medium px-4 py-2.5">Estado</th>
                <th className="text-right font-medium px-4 py-2.5">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => {
                const u = userById(r.user_id);
                return (
                  <tr key={r.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="font-medium">{u?.businessName || "—"}</div>
                      <div className="text-[11px] text-muted-foreground">{u?.tipoNegocio} · plan {u?.plan}</div>
                    </td>
                    <td className="px-4 py-3 text-xs">{FREQUENCY_LABEL[r.frequency]}</td>
                    <td className="px-4 py-3 text-xs uppercase mono">{r.format}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{r.recipientEmail}</td>
                    <td className="px-4 py-3 text-xs mono">{formatDateTime(r.nextRunAt)}</td>
                    <td className="px-4 py-3 text-xs mono text-muted-foreground">{r.lastSentAt ? formatDateTime(r.lastSentAt) : "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] uppercase mono px-2 py-0.5 rounded-full ${r.enabled ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                        {r.enabled ? "Activo" : "Pausado"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => enviarAhora(r)} title="Enviar ahora"><Send className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => { upsertReport({ ...r, enabled: !r.enabled }); setV(v + 1); }}>
                          {r.enabled ? "Pausar" : "Activar"}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { deleteReport(r.id); setV(v + 1); toast({ title: "Eliminado" }); }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground mt-4 mono">
        Nota: la programación queda registrada y puedes generar/descargar manualmente. El envío automático real requiere activar Lovable Cloud.
      </p>
    </>
  );
}

function NuevoReporteDialog({ onSaved }: { onSaved: () => void }) {
  const users = useMemo(() => getUsers().filter(u => u.role !== "admin"), []);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    user_id: users[0]?.id || "",
    frequency: "mensual_28" as ReportFrequency,
    format: "csv" as ReportFormat,
    recipientEmail: users[0]?.email || "",
    enabled: true,
  });

  const onUserChange = (id: string) => {
    const u = users.find(x => x.id === id);
    setForm(f => ({ ...f, user_id: id, recipientEmail: u?.email || "" }));
  };

  const save = () => {
    if (!form.user_id) return toast({ title: "Selecciona una clienta" });
    if (!form.recipientEmail.includes("@")) return toast({ title: "Email inválido" });
    upsertReport(form);
    toast({ title: "Reporte programado" });
    setOpen(false); onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1.5" />Programar reporte</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Programar reporte automático</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label className="text-xs">Clienta</Label>
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.user_id} onChange={e => onUserChange(e.target.value)}>
              {users.map(u => <option key={u.id} value={u.id}>{u.businessName} · {u.tipoNegocio}</option>)}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Frecuencia</Label>
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value as ReportFrequency })}>
              {FREQS.map(f => <option key={f} value={f}>{FREQUENCY_LABEL[f]}</option>)}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Formato</Label>
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.format} onChange={e => setForm({ ...form, format: e.target.value as ReportFormat })}>
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Email destinatario</Label>
            <Input type="email" value={form.recipientEmail} onChange={e => setForm({ ...form, recipientEmail: e.target.value })} />
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <div className="text-sm font-medium">Activar envíos</div>
              <div className="text-[11px] text-muted-foreground">Si está pausado no se generará automáticamente.</div>
            </div>
            <Switch checked={form.enabled} onCheckedChange={(v) => setForm({ ...form, enabled: v })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={save}><Download className="h-4 w-4 mr-1.5" />Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
