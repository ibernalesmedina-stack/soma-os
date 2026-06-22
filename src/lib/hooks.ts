import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./auth-context";
import { supabase } from "./supabase";
import {
  listAutomations, listBloqueos, listFichas, listNotas,
  listPagos, listProgreso, listRegistros, listReservas, listServicios, getUsers,
} from "./storage";
import type { Automation, Bloqueo, ClienteFicha, Pago, ProgresoEntry, Registro, Reserva, Servicio, SesionNota, User } from "./types";

function useData<T>(fetcher: (userId: string) => Promise<T[]>) {
  const { user } = useAuth();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setData([]); setLoading(false); return; }
    setLoading(true);
    const result = await fetcher(user.id);
    setData(result);
    setLoading(false);
  }, [user]);  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  return { data, loading, refetch: load };
}

export const useReservas = () => useData<Reserva>(listReservas);

export function useAdminUsers() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    const result = await getUsers();
    setData(result);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);
  return { data, loading, refetch: load };
}
export const usePagos = () => useData<Pago>(listPagos);
export const useServicios = () => useData<Servicio>(listServicios);
export const useFichas = () => {
  const { user } = useAuth();
  const [data, setData] = useState<ClienteFicha[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setData([]); setLoading(false); return; }
    setLoading(true);
    const result = await listFichas(user.id);
    setData(result);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
    // Refetch when user returns to tab (e.g. after deleting from Supabase dashboard)
    const onVisible = () => { if (document.visibilityState === "visible") load(); };
    document.addEventListener("visibilitychange", onVisible);

    // Also try realtime if enabled in Supabase
    if (!user) return;
    const channel = supabase
      .channel("fichas_clientes_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "fichas_clientes", filter: `user_id=eq.${user.id}` },
        () => { load(); })
      .subscribe();

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      supabase.removeChannel(channel);
    };
  }, [load, user]);

  return { data, loading, refetch: load };
};
export const useAutomations = () => useData<Automation>(listAutomations);
export const useRegistros = () => useData<Registro>(listRegistros);
export const useBloqueos = () => useData<Bloqueo>(listBloqueos);
export const useProgreso = () => useData<ProgresoEntry>(listProgreso);
export const useNotas = () => useData<SesionNota>(listNotas);
