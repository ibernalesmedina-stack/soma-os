import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { updateUserById } from "@/lib/storage";
import { useAdminUsers } from "@/lib/hooks";
import { allPagos } from "@/lib/admin";
import { listFacturas, listNotasInternas, addNotaInterna, deleteNotaInterna } from "@/lib/admin-store";
import { formatCLP, formatDate, formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Trash2, ArrowRightLeft } from "lucide-react";
import type { Plan } from "@/lib/types";
import { PLAN_LABEL } from "@/lib/plans";
import { toast } from "@/hooks/use-toast";

const PLANES: Plan[] = ["basic", "clinic"];

export default function AdminClienteDetalle() {
  const { id = "" } = useParams();
  const [v, setV] = useState(0);
  const [nota, setNota] = useState("");
  const [edit, setEdit] = useState(false);

  const { data: allUsers } = useAdminUsers();
  const user = allUsers.find(u => u.id === id);
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "", businessName: user?.businessName || "" });
  useEffect(() => { if (user) setForm({ name: user.name, email: user.email, phone: user.phone || "", businessName: user.businessName }); }, [user?.id]);

  if (!user) return <div className="text-center py-16"><p className="text-sm">Cliente no encontrado</p><Link to="/admin/clientes" className="text-primary text-xs">Volver</Link></div>;

  const pagosCli = allPagos().filter(p => p.user_id === user.id).sort((a, b) => b.date.localeCompare(a.date));
  const facturas = listFacturas().filter(f => f.clientUserId === user.id).sort((a, b) => b.date.localeCompare(a.date));
  const notas = listNotasInternas(user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const proximaFactura = facturas.find(f => f.status === "pendiente");

  const guardar = () => { updateUserById(user.id, form); setEdit(false); setV(v + 1); toast({ title: "Datos actualizados" }); };
  const cambiarPlan = (p: Plan) => { updateUserById(user.id, { plan: p }); setV(v + 1); toast({ title: `Plan: ${PLAN_LABEL[p]}` }); };
  const addNota = () => { if (!nota.trim()) return; addNotaInterna(user.id, nota.trim()); setNota(""); setV(v + 1); };

  return (
    <>
      <Link to="/admin/clientes" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3"><ArrowLeft className="h-3.5 w-3.5" />Volver</Link>
      <PageHeader
        title={user.businessName}
        description={`${user.name} · ${user.email}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { impersonate(user.id); window.location.href = "/app"; }}>Entrar como cliente</Button>
            <Button onClick={() => setEdit(!edit)}>{edit ? "Cancelar" : "Editar"}</Button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <section className="surface-card p-5 lg:col-span-1 space-y-4">
          <h3 className="text-sm font-semibold">Información</h3>
          {edit ? (
            <div className="space-y-3">
              <div className="grid gap-1.5"><Label className="text-xs">Negocio</Label><Input value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label className="text-xs">Nombre</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label className="text-xs">Email</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label className="text-xs">Teléfono</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <Button onClick={guardar} className="w-full">Guardar</Button>
            </div>
          ) : (
            <dl className="text-sm space-y-2">
              <Row label="Nombre" value={user.name} />
              <Row label="Email" value={user.email} />
              <Row label="Teléfono" value={user.phone || "—"} />
              <Row label="Plan actual" value={PLAN_LABEL[user.plan]} />
              <Row label="Fecha inicio" value={formatDate(user.createdAt)} />
              <Row label="Próximo pago" value={proximaFactura ? `${formatDate(proximaFactura.date)} · ${formatCLP(proximaFactura.amount)}` : "—"} />
            </dl>
          )}

          <div className="pt-3 border-t">
            <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5"><ArrowRightLeft className="h-3.5 w-3.5" />Cambiar plan</div>
            <div className="flex gap-1.5">
              {PLANES.map(p => (
                <button key={p} onClick={() => cambiarPlan(p)}
                  className={`text-xs px-3 py-1.5 rounded-md border flex-1 ${user.plan === p ? "border-primary bg-primary/10 text-primary font-medium" : "hover:border-foreground/20"}`}>
                  {PLAN_LABEL[p]}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="surface-card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-3">Historial de pagos</h3>
          {pagosCli.length === 0 ? <p className="text-sm text-muted-foreground py-6 text-center">Sin pagos registrados.</p> : (
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="text-left py-2">Fecha</th><th className="text-left py-2">Método</th><th className="text-left py-2">Estado</th><th className="text-right py-2">Monto</th></tr>
              </thead>
              <tbody>
                {pagosCli.map(p => (
                  <tr key={p.id} className="border-t">
                    <td className="py-2 mono text-xs">{formatDateTime(p.date)}</td>
                    <td className="py-2 text-xs text-muted-foreground">{p.method}</td>
                    <td className="py-2 text-xs capitalize">{p.status}</td>
                    <td className="py-2 text-right mono">{formatCLP(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="surface-card p-5 lg:col-span-3">
          <h3 className="text-sm font-semibold mb-3">Notas internas</h3>
          <div className="flex gap-2 mb-4">
            <Textarea value={nota} onChange={e => setNota(e.target.value)} placeholder="Agregar una nota interna sobre el cliente…" className="min-h-[60px]" />
            <Button onClick={addNota} className="self-end">Agregar</Button>
          </div>
          {notas.length === 0 ? <p className="text-sm text-muted-foreground py-4 text-center">Sin notas.</p> : (
            <ul className="space-y-2">
              {notas.map(n => (
                <li key={n.id} className="border rounded-md p-3 text-sm flex items-start gap-3">
                  <div className="flex-1">
                    <p className="whitespace-pre-wrap">{n.text}</p>
                    <p className="text-[11px] mono text-muted-foreground mt-1">{formatDateTime(n.createdAt)}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { deleteNotaInterna(n.id); setV(v + 1); }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="text-xs text-right">{value}</dd>
    </div>
  );
}
