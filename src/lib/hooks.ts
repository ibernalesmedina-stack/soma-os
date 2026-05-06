import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./auth-context";
import {
  listAutomations, listBloqueos, listFichas, listNotas,
  listPagos, listProgreso, listRegistros, listReservas, listServicios,
} from "./storage";
import type { Automation, Bloqueo, ClienteFicha, Pago, ProgresoEntry, Registro, Reserva, Servicio, SesionNota } from "./types";

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
export const usePagos = () => useData<Pago>(listPagos);
export const useServicios = () => useData<Servicio>(listServicios);
export const useFichas = () => useData<ClienteFicha>(listFichas);
export const useAutomations = () => useData<Automation>(listAutomations);
export const useRegistros = () => useData<Registro>(listRegistros);
export const useBloqueos = () => useData<Bloqueo>(listBloqueos);
export const useProgreso = () => useData<ProgresoEntry>(listProgreso);
export const useNotas = () => useData<SesionNota>(listNotas);
