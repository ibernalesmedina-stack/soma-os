import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useFichas, usePagos, useReservas } from "@/lib/hooks";
import { importFichasCSV } from "@/lib/storage";
import { BUSINESS_CONFIG } from "@/lib/business";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCLP, formatDate, slugify } from "@/lib/format";
import { Search, ChevronRight, Download, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: reservas } = useReservas();
  const { data: pagos } = usePagos();
  const { data: fichas, refetch: refetchFichas } = useFichas();

  const clientes = useMemo<ClienteRow[]>(() => {
    const map = new Map<string, ClienteRow>();
    const now = Date.now();
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
  }, [reservas, pagos]);

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
            <p className="text-xs text-muted-foreground mt-1">Cuando registres reservas aparecerán aquí.</p>
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
