// Inicio del panel para odontólogas: lo que importa en la clínica hoy.
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowUpRight, CalendarClock, CalendarDays, ClipboardList, Plus, Stethoscope, Wallet } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useFichas, useRegistros, useReservas } from "@/lib/hooks";
import { formatCLP, formatDate, slugify } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { CONDICIONES, normalizarDental } from "./modelo";

const DIA = 86_400_000;
const hoyISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const mismoDia = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const hora = (iso: string) => new Date(iso).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
const iniciales = (n: string) => n.split(" ").filter(Boolean).map((s) => s[0]).slice(0, 2).join("").toUpperCase();

export default function DashboardOdontologa() {
  const { user } = useAuth();
  const { data: reservas, loading: lR } = useReservas();
  const { data: fichas, loading: lF } = useFichas();
  const { data: registros, loading: lG } = useRegistros();
  const loading = lR || lF || lG;

  const d = useMemo(() => {
    const ahora = new Date();
    const activas = reservas.filter((r) => r.status !== "cancelada");
    const citasHoy = activas.filter((r) => mismoDia(new Date(r.date), ahora))
      .sort((a, b) => +new Date(a.date) - +new Date(b.date));
    const proximas = activas.filter((r) => new Date(r.date) > ahora && !mismoDia(new Date(r.date), ahora))
      .sort((a, b) => +new Date(a.date) - +new Date(b.date));
    const semana = activas.filter((r) => { const t = +new Date(r.date) - +ahora; return t >= 0 && t < 7 * DIA; }).length;

    // Fichas: alertas médicas y presupuestos
    const porKey = new Map(fichas.map((f) => [f.clientKey, f]));
    const alertasDe = (key: string) => {
      const f = porKey.get(key);
      if (!f) return [] as string[];
      const dental = normalizarDental(f.dental);
      const a = CONDICIONES.filter((c) => c.alerta && dental.anamnesis[c.id]).map((c) => c.label);
      if (f.alergias?.trim()) a.unshift(`Alergia: ${f.alergias.trim()}`);
      return a;
    };
    const pacientesAlerta = fichas
      .map((f) => ({ f, alertas: alertasDe(f.clientKey) }))
      .filter((x) => x.alertas.length > 0)
      .sort((a, b) => a.f.clientName.localeCompare(b.f.clientName));

    const presupuestos = fichas.map((f) => {
      const plan = normalizarDental(f.dental).plan;
      const pendiente = plan.filter((i) => i.estado !== "realizado").reduce((s, i) => s + (Number(i.valor) || 0), 0);
      const realizado = plan.filter((i) => i.estado === "realizado").reduce((s, i) => s + (Number(i.valor) || 0), 0);
      const items = plan.filter((i) => i.estado !== "realizado").length;
      return { f, pendiente, realizado, items };
    }).filter((x) => x.pendiente > 0).sort((a, b) => b.pendiente - a.pendiente);
    const porCobrar = presupuestos.reduce((s, x) => s + x.pendiente, 0);

    // Próximos controles (de evoluciones y registros estéticos); se queda el más reciente por paciente
    const hoy = hoyISO();
    const ultimoControl = new Map<string, { key: string; nombre: string; fecha: string; motivo: string; registrado: string }>();
    for (const r of registros) {
      if (r.tipo !== "evolucion" && r.tipo !== "estetica") continue;
      const pc = String(r.data?.proximoControl ?? "").slice(0, 10);
      if (!pc) continue;
      const prev = ultimoControl.get(r.client_id);
      if (!prev || r.fecha > prev.registrado) {
        ultimoControl.set(r.client_id, { key: r.client_id, nombre: r.clientName, fecha: pc, motivo: r.titulo, registrado: r.fecha });
      }
    }
    // ¿Ya tiene cita agendada desde la fecha de control (o desde 7 días antes)?
    const tieneCita = (key: string, nombre: string, fecha: string) => activas.some((r) =>
      (r.client_id === key || slugify(r.clientName) === key || r.clientName === nombre) &&
      +new Date(r.date) >= +new Date(`${fecha}T00:00:00`) - 7 * DIA && new Date(r.date) >= ahora);
    const controles = [...ultimoControl.values()]
      .map((c) => ({ ...c, vencido: c.fecha < hoy, agendado: tieneCita(c.key, c.nombre, c.fecha) }))
      .filter((c) => +new Date(`${c.fecha}T12:00:00`) - +ahora < 45 * DIA && !(c.vencido && c.agendado))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));

    // Tratamientos más realizados (últimos 12 meses): evoluciones, estética y citas atendidas
    const desde = +ahora - 365 * DIA;
    const conteo = new Map<string, number>();
    const sumar = (n: string) => { const k = n.trim(); if (k) conteo.set(k, (conteo.get(k) ?? 0) + 1); };
    for (const r of registros) {
      if ((r.tipo === "evolucion" || r.tipo === "estetica") && +new Date(r.fecha) >= desde) sumar(r.titulo);
    }
    for (const r of reservas) {
      if (r.status === "completada" && +new Date(r.date) >= desde) sumar(r.serviceName);
    }
    const top = [...conteo.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);

    return { citasHoy, proximas, semana, pacientesAlerta, alertasDe, presupuestos, porCobrar, controles, top, porKey };
  }, [reservas, fichas, registros]);

  const keyDeReserva = (clientId: string, nombre: string) => (d.porKey.has(clientId) ? clientId : slugify(nombre));
  const maxTop = d.top[0]?.[1] ?? 1;
  const fechaLarga = new Date().toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" });

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mono">{fechaLarga}</p>
          <h1 className="text-2xl font-semibold tracking-tight mt-1">Hola, {user?.name?.split(" ")[0]}</h1>
          <p className="text-sm text-muted-foreground">Así está tu consulta hoy.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link to="/app/clientes"><Plus className="h-4 w-4 mr-1.5" />Nuevo paciente</Link></Button>
          <Button asChild><Link to="/app/reservas"><Plus className="h-4 w-4 mr-1.5" />Nueva cita</Link></Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="stat-tile animate-pulse h-[104px]" />) : <>
          <Indicador icon={CalendarDays} label="Citas hoy" value={String(d.citasHoy.length)} extra={`${d.semana} en los próximos 7 días`} />
          <Indicador icon={Wallet} label="Presupuestos por cobrar" value={formatCLP(d.porCobrar)} extra={`${d.presupuestos.length} paciente${d.presupuestos.length === 1 ? "" : "s"}`} />
          <Indicador icon={CalendarClock} label="Controles próximos" value={String(d.controles.length)} extra={`${d.controles.filter((c) => c.vencido).length} atrasados`} />
          <Indicador icon={AlertTriangle} label="Pacientes con alertas" value={String(d.pacientesAlerta.length)} extra={`de ${fichas.length} fichas`} alerta={d.pacientesAlerta.length > 0} />
        </>}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Agenda de hoy */}
        <Tarjeta titulo="Agenda de hoy" link={{ to: "/app/reservas", label: "Ver agenda" }} className="lg:col-span-2">
          {loading ? <Cargando /> : d.citasHoy.length === 0 ? (
            <Vacio texto={d.proximas[0] ? `Sin citas hoy. Próxima: ${d.proximas[0].clientName}, ${formatDate(d.proximas[0].date)} a las ${hora(d.proximas[0].date)}` : "Sin citas hoy."} />
          ) : (
            <ul className="divide-y">
              {d.citasHoy.map((r) => {
                const key = keyDeReserva(r.client_id, r.clientName);
                const alertas = d.alertasDe(key);
                const pasada = new Date(r.date) < new Date();
                return (
                  <li key={r.id} className={`py-3 flex items-center gap-3 ${pasada ? "opacity-60" : ""}`}>
                    <div className="mono text-sm font-semibold w-12 shrink-0">{hora(r.date)}</div>
                    <div className="flex-1 min-w-0">
                      <Link to={`/app/clientes/${key}`} className="text-sm font-medium hover:text-primary hover:underline truncate block">{r.clientName}</Link>
                      <div className="text-xs text-muted-foreground truncate">{r.serviceName}{r.esControl ? " · Control" : ""}</div>
                      {alertas.length > 0 && (
                        <div className="text-[11px] text-destructive mt-0.5 flex items-center gap-1 truncate">
                          <AlertTriangle className="h-3 w-3 shrink-0" />{alertas.join(" · ")}
                        </div>
                      )}
                    </div>
                    <StatusBadge status={r.status} />
                  </li>
                );
              })}
            </ul>
          )}
          {!loading && d.proximas.length > 0 && d.citasHoy.length > 0 && (
            <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
              Próxima cita después de hoy: <span className="text-foreground">{d.proximas[0].clientName}</span> · {formatDate(d.proximas[0].date)} {hora(d.proximas[0].date)}
            </p>
          )}
        </Tarjeta>

        {/* Alertas médicas */}
        <Tarjeta titulo="Alertas médicas" icono={AlertTriangle}>
          {loading ? <Cargando /> : d.pacientesAlerta.length === 0 ? (
            <Vacio texto="Ningún paciente con alertas registradas en la anamnesis." />
          ) : (
            <ul className="space-y-3">
              {d.pacientesAlerta.slice(0, 6).map(({ f, alertas }) => (
                <li key={f.id}>
                  <Link to={`/app/clientes/${f.clientKey}`} className="flex items-start gap-3 rounded-md -mx-2 px-2 py-1 hover:bg-muted">
                    <div className="size-8 rounded-full bg-destructive/10 text-destructive text-[11px] font-semibold grid place-items-center shrink-0">{iniciales(f.clientName)}</div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{f.clientName}</div>
                      <div className="text-xs text-destructive/90 line-clamp-2">{alertas.join(" · ")}</div>
                    </div>
                  </Link>
                </li>
              ))}
              {d.pacientesAlerta.length > 6 && <li className="text-xs text-muted-foreground">y {d.pacientesAlerta.length - 6} más</li>}
            </ul>
          )}
        </Tarjeta>

        {/* Presupuestos pendientes */}
        <Tarjeta titulo="Presupuestos pendientes" icono={ClipboardList}>
          {loading ? <Cargando /> : d.presupuestos.length === 0 ? (
            <Vacio texto="No hay planes de tratamiento con saldo pendiente." />
          ) : (
            <ul className="divide-y">
              {d.presupuestos.slice(0, 6).map(({ f, pendiente, realizado, items }) => {
                const total = pendiente + realizado;
                return (
                  <li key={f.id} className="py-2.5">
                    <Link to={`/app/clientes/${f.clientKey}`} className="block hover:text-primary">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-medium truncate">{f.clientName}</span>
                        <span className="mono text-sm font-semibold shrink-0">{formatCLP(pendiente)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{items} pendiente{items === 1 ? "" : "s"} · {Math.round((realizado / total) * 100)}% realizado</div>
                      <div className="h-1 rounded-full bg-muted mt-1.5 overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${(realizado / total) * 100}%` }} />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Tarjeta>

        {/* Próximos controles */}
        <Tarjeta titulo="Próximos controles" icono={CalendarClock}>
          {loading ? <Cargando /> : d.controles.length === 0 ? (
            <Vacio texto="Sin controles en los próximos 45 días. Se agregan al registrar una evolución o tratamiento estético con fecha de control." />
          ) : (
            <ul className="space-y-2.5">
              {d.controles.slice(0, 7).map((c) => (
                <li key={c.key}>
                  <Link to={`/app/clientes/${c.key}`} className="flex items-center gap-3 rounded-md -mx-2 px-2 py-1 hover:bg-muted">
                    <div className={`text-center w-10 shrink-0 ${c.vencido ? "text-destructive" : ""}`}>
                      <div className="text-[10px] uppercase">{new Date(`${c.fecha}T12:00:00`).toLocaleString("es-CL", { month: "short" })}</div>
                      <div className="text-lg font-semibold leading-none">{new Date(`${c.fecha}T12:00:00`).getDate()}</div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{c.nombre}</div>
                      <div className="text-xs text-muted-foreground truncate">{c.motivo}</div>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${c.agendado ? "bg-success/10 text-success" : c.vencido ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>
                      {c.agendado ? "Agendado" : c.vencido ? "Atrasado" : "Por agendar"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>

        {/* Tratamientos más realizados */}
        <Tarjeta titulo="Más realizados" icono={Stethoscope} subtitulo="Últimos 12 meses">
          {loading ? <Cargando /> : d.top.length === 0 ? (
            <Vacio texto="Aún no hay evoluciones ni citas atendidas para contar." />
          ) : (
            <ul className="space-y-2.5">
              {d.top.map(([nombre, n]) => (
                <li key={nombre}>
                  <div className="flex justify-between text-sm gap-2"><span className="truncate">{nombre}</span><span className="mono text-muted-foreground">{n}</span></div>
                  <div className="h-1.5 rounded-full bg-muted mt-1 overflow-hidden"><div className="h-full rounded-full bg-primary/70" style={{ width: `${(n / maxTop) * 100}%` }} /></div>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>
      </div>
    </>
  );
}

function Indicador({ icon: Icon, label, value, extra, alerta }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; extra: string; alerta?: boolean }) {
  return (
    <div className="stat-tile">
      <div className={`size-8 rounded-md grid place-items-center ${alerta ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}><Icon className="h-4 w-4" /></div>
      <div className="mt-3 text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold tracking-tight mt-0.5">{value}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{extra}</div>
    </div>
  );
}

function Tarjeta({ titulo, subtitulo, icono: Icono, link, className = "", children }: {
  titulo: string; subtitulo?: string; icono?: React.ComponentType<{ className?: string }>;
  link?: { to: string; label: string }; className?: string; children: React.ReactNode;
}) {
  return (
    <div className={`surface-card p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4 gap-2">
        <h3 className="text-sm font-semibold flex items-center gap-1.5">
          {Icono && <Icono className="h-4 w-4 text-muted-foreground" />}{titulo}
        </h3>
        {subtitulo && !link && <span className="text-[11px] text-muted-foreground shrink-0">{subtitulo}</span>}
        {link && <Link to={link.to} className="text-xs text-primary hover:underline inline-flex items-center">{link.label}<ArrowUpRight className="h-3 w-3 ml-0.5" /></Link>}
      </div>
      {children}
    </div>
  );
}

function Cargando() {
  return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-9 rounded bg-muted animate-pulse" />)}</div>;
}

function Vacio({ texto }: { texto: string }) {
  return <div className="text-center py-8 text-sm text-muted-foreground">{texto}</div>;
}
